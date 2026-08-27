from __future__ import annotations

import argparse
import ctypes
import hashlib
import json
import os
import platform
import re
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

def _recover_malformed_write_args(raw: Any, field: str) -> dict[str, str]:
    if not isinstance(raw, str) or field not in {"content", "text"}:
        return {}
    pattern = rf'^\s*\{{\s*"path"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"{field}"\s*:\s*"'
    match = re.match(pattern, raw, re.DOTALL)
    if not match:
        return {}
    try:
        path = json.loads('"' + match.group(1) + '"')
    except Exception:
        return {}
    body = raw[match.end():]
    if body.endswith('"}'):
        body = body[:-2]
    body = body.replace('\\r\\n', '\n').replace('\\n', '\n').replace('\\r', '\n').replace('\\t', '\t')
    body = body.replace('\\"', '"').replace('\\\\', '\\')
    return {"path": path, field: body}


def _repair_single_path_tool_calls(response: dict[str, Any], allowed: list[str]) -> dict[str, Any]:
    if len(allowed) != 1:
        return response
    for call in response.get("tool_calls") or []:
        fn = call.get("function") or {}
        if fn.get("name") not in {"write_file", "append_file"}:
            continue
        args = fn.get("arguments")
        try:
            from hub import engineering as hub_engineering
            obj = hub_engineering._parse_arguments(args)
        except Exception:
            try:
                obj = json.loads(args) if isinstance(args, str) else dict(args or {})
            except (json.JSONDecodeError, TypeError, ValueError):
                obj = {}
        field = "text" if fn.get("name") == "append_file" else "content"
        if not obj:
            recovered = _recover_malformed_write_args(args, field)
            if recovered.get("path") == allowed[0] and isinstance(recovered.get(field), str) and recovered.get(field):
                obj = recovered
        if not obj.get("path") and isinstance(obj.get(field), str) and obj.get(field):
            obj["path"] = allowed[0]
        if obj.get("path") == allowed[0] and isinstance(obj.get(field), str) and obj.get(field):
            fn["arguments"] = json.dumps(obj, ensure_ascii=False)
    return response



def _gate_finish_tool(tools: list[dict[str, Any]], allow_finish: bool) -> list[dict[str, Any]]:
    if allow_finish:
        return tools
    return [tool for tool in tools if (tool.get("function") or {}).get("name") != "finish"]


def _tool_call_diagnostics(response: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for call in response.get("tool_calls") or []:
        fn = call.get("function") or {}
        raw = fn.get("arguments", call.get("arguments"))
        try:
            from hub import engineering as hub_engineering
            parsed = hub_engineering._parse_arguments(raw)
        except Exception:
            parsed = {}
        raw_text = raw if isinstance(raw, str) else json.dumps(raw, ensure_ascii=False, default=str)
        rows.append({
            "name": fn.get("name") or call.get("name"),
            "argument_type": type(raw).__name__,
            "raw_prefix": raw_text[:240],
            "raw_length": len(raw_text),
            "parsed_keys": sorted(parsed.keys()) if isinstance(parsed, dict) else [],
            "has_path": bool(parsed.get("path")) if isinstance(parsed, dict) else False,
            "content_length": len(parsed.get("content", "")) if isinstance(parsed, dict) and isinstance(parsed.get("content"), str) else 0,
        })
    return rows

def _dirty_snapshot(workspace: Path) -> dict[str, str]:
    raw = subprocess.check_output(
        ["git", "-C", str(workspace), "status", "--porcelain", "--untracked-files=all"],
        text=True, encoding="utf-8", errors="replace", timeout=10,
    )
    snapshot: dict[str, str] = {}
    for line in raw.splitlines():
        if len(line) < 4:
            continue
        path = line[3:].strip()
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        rel = path.replace("\\", "/")
        target = workspace / Path(rel)
        if not target.exists():
            snapshot[rel] = "missing"
        elif target.is_file():
            snapshot[rel] = hashlib.sha256(target.read_bytes()).hexdigest()
        else:
            snapshot[rel] = "non-file"
    return snapshot


def _changed_since(before: dict[str, str], after: dict[str, str]) -> list[str]:
    return sorted(path for path in set(before) | set(after) if before.get(path) != after.get(path))


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
    from hub import engineering as hub_engineering

    builder = Qwen3BuilderMind()
    tool_call_diagnostics: list[dict[str, Any]] = []
    dirty_before = _dirty_snapshot(workspace)
    if len(allowed) == 1:
        original_chat_turn = builder.chat_turn
        def traced_chat_turn(messages, tools):
            mutated = bool(_changed_since(dirty_before, _dirty_snapshot(workspace)))
            effective_tools = _gate_finish_tool(tools, mutated)
            response = original_chat_turn(messages, effective_tools)
            tool_call_diagnostics.extend(_tool_call_diagnostics(response))
            return _repair_single_path_tool_calls(response, allowed)
        builder.chat_turn = traced_chat_turn
    if builder.status() != "ready":
        raise RuntimeError(f"qwen3-builder not ready: {builder.status()}")

    for path in allowed:
        if any(path == d or path.startswith(d.rstrip("/") + "/") for d in deny):
            raise ValueError(f"allowed path conflicts with deny path: {path}")

    started = time.time()
    before = _node_snapshot()
    eng = hub_engineering.run_engineering_loop(
        task=req["task"], workspace=workspace, chat_turn=builder.chat_turn,
        touch_allow=allowed,
    )
    dirty_after = _dirty_snapshot(workspace)
    changed = _changed_since(dirty_before, dirty_after)
    outside = sorted(set(changed) - set(allowed))
    completed = time.time()
    return {
        "schema_version": "othrys.worker-result.v0.1",
        "job_id": req["job_id"], "node_id": "legion", "capability": CAPABILITY,
        "worker_id": WORKER_ID, "builder_id": "qwen3-builder",
        "ok": bool(eng.ok) and not outside and bool(changed),
        "reason": (f"out_of_scope_changes: {outside}" if outside else (eng.reason or "" if changed else "NO_ATTEMPT_MUTATION")),
        "started_at": started, "completed_at": completed, "duration_sec": completed - started,
        "allowed_paths": allowed, "changed_files": changed, "out_of_scope_changes": outside,
        "diff": eng.diff, "git_status": eng.git_status, "summary": eng.summary,
        "runtime_evidence": {"observed_diff": eng.observed_diff, "git_status": eng.git_status, "tool_trace": list(eng.tool_trace or [])[:40], "tool_call_diagnostics": tool_call_diagnostics[:20]},
        "capability_selection": {"policy": "v2_direct_low_level_loop", "selected_builder": "qwen3-builder", "cost_model": "local"},
        "node_before": before, "node_after": _node_snapshot(),
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