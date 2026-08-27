from __future__ import annotations

import argparse
import ctypes
import json
import os
import platform
import subprocess
import sys
import time
import traceback
from pathlib import Path
from typing import Any

HUB_ROOT = Path(r"C:\Users\othry\Projects\othrys-hub-main")
WORKER_ID = "worker.legion.qwen3-builder.v0.1"
CAPABILITY = "engineering.patch"
ES_CONTINUOUS = 0x80000000
ES_SYSTEM_REQUIRED = 0x00000001


def _utf8_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="backslashreplace")


def _keep_awake(active: bool) -> None:
    if os.name != "nt":
        return
    flags = ES_CONTINUOUS | (ES_SYSTEM_REQUIRED if active else 0)
    ctypes.windll.kernel32.SetThreadExecutionState(flags)

def _run_text(*args: str) -> str:
    try:
        return subprocess.check_output(args, text=True, encoding="utf-8", errors="replace", timeout=10).strip()
    except Exception:
        return ""


def _gpu_snapshot() -> dict[str, Any]:
    raw = _run_text(
        "nvidia-smi",
        "--query-gpu=name,memory.total,memory.used,utilization.gpu,temperature.gpu,power.draw",
        "--format=csv,noheader,nounits",
    )
    if not raw:
        return {"available": False}
    parts = [x.strip() for x in raw.splitlines()[0].split(",")]
    keys = ["name", "memory_total_mb", "memory_used_mb", "utilization_pct", "temperature_c", "power_w"]
    return {"available": True, **dict(zip(keys, parts))}


def _node_snapshot() -> dict[str, Any]:
    return {
        "node_id": "legion",
        "hostname": platform.node(),
        "platform": platform.platform(),
        "logical_cpus": os.cpu_count(),
        "gpu": _gpu_snapshot(),
        "ollama_ps": _run_text("ollama", "ps"),
    }


def _safe_rel_paths(values: list[str]) -> list[str]:
    out: list[str] = []
    for value in values:
        p = Path(value)
        if p.is_absolute() or ".." in p.parts:
            raise ValueError(f"unsafe path: {value}")
        out.append(p.as_posix())
    return out

def _changed_files(workspace: Path) -> list[str]:
    raw = subprocess.check_output(
        ["git", "-C", str(workspace), "status", "--porcelain"],
        text=True, encoding="utf-8", errors="replace", timeout=10,
    )
    files: list[str] = []
    for line in raw.splitlines():
        if len(line) < 4:
            continue
        path = line[3:].strip()
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        files.append(path.replace("\\", "/"))
    return files


def _atomic_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False, default=str) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def _validate_request(req: dict[str, Any]) -> tuple[Path, list[str], list[str]]:
    if req.get("schema_version") != "othrys.worker-request.v0.1":
        raise ValueError("unsupported worker request schema")
    if req.get("node_id") != "legion":
        raise ValueError("wrong node_id for Legion adapter")
    if req.get("capability") != CAPABILITY:
        raise ValueError(f"unsupported capability: {req.get('capability')}")
    workspace = Path(req["workspace"]).resolve()
    if not workspace.is_dir():
        raise ValueError("workspace does not exist")
    allowed = _safe_rel_paths(list(req.get("allowed_paths") or []))
    if not allowed:
        raise ValueError("allowed_paths must be non-empty")
    deny = _safe_rel_paths(list(req.get("deny_paths") or []))
    return workspace, allowed, deny

def run_job(req: dict[str, Any]) -> dict[str, Any]:
    workspace, allowed, deny = _validate_request(req)
    sys.path.insert(0, str(HUB_ROOT))
    from hub.builders import Qwen3BuilderMind
    from hub.engineering_platform import PlatformRequest, run_engineering_mission

    builder = Qwen3BuilderMind()
    if builder.status() != "ready":
        raise RuntimeError(f"qwen3-builder not ready: {builder.status()}")

    started = time.time()
    before = _node_snapshot()
    request = PlatformRequest(
        mission_id=req["job_id"],
        task=req["task"],
        workspace=str(workspace),
        repo_dir=str(workspace),
        roster=[builder],
        builder=builder,
        operator_touch_allow=allowed,
        policy="direct",
        emit_events=False,
        allow_engine_fallback=False,
        timeout_sec=float(req.get("timeout_sec") or 300),
        operator_constraints={"deny": deny},
    )
    result = run_engineering_mission(request)
    changed = _changed_files(workspace)
    outside = sorted(set(changed) - set(allowed))
    completed = time.time()
    payload = result.as_dict()
    return {
        "schema_version": "othrys.worker-result.v0.1",
        "job_id": req["job_id"],
        "node_id": "legion",
        "capability": CAPABILITY,
        "worker_id": WORKER_ID,
        "builder_id": "qwen3-builder",
        "ok": bool(result.ok) and not outside,
        "reason": (result.reason or "") if not outside else f"out_of_scope_changes: {outside}",
        "started_at": started,
        "completed_at": completed,
        "duration_sec": completed - started,
        "allowed_paths": allowed,
        "changed_files": changed,
        "out_of_scope_changes": outside,
        "diff": result.diff,
        "git_status": result.git_status,
        "summary": result.summary,
        "runtime_evidence": payload.get("runtime_evidence", {}),
        "capability_selection": payload.get("capability_selection", {}),
        "node_before": before,
        "node_after": _node_snapshot(),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--request", required=True)
    parser.add_argument("--result", required=True)
    args = parser.parse_args()
    _utf8_stdio()
    req_path = Path(args.request)
    result_path = Path(args.result)
    req: dict[str, Any] = {}
    _keep_awake(True)
    try:
        req = json.loads(req_path.read_text(encoding="utf-8-sig"))
        payload = run_job(req)
        _atomic_json(result_path, payload)
        return 0 if payload.get("ok") else 2
    except Exception as exc:
        payload = {
            "schema_version": "othrys.worker-result.v0.1",
            "job_id": req.get("job_id", "UNKNOWN"),
            "node_id": req.get("node_id", "legion"),
            "capability": req.get("capability", "UNKNOWN"),
            "worker_id": WORKER_ID,
            "builder_id": "qwen3-builder",
            "ok": False,
            "reason": repr(exc),
            "traceback": traceback.format_exc(),
            "completed_at": time.time(),
            "node_after": _node_snapshot(),
        }
        _atomic_json(result_path, payload)
        return 1
    finally:
        _keep_awake(False)


if __name__ == "__main__":
    raise SystemExit(main())