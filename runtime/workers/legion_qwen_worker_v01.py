from __future__ import annotations

import argparse
import ctypes
import difflib
import hashlib
import json
import os
import platform
import re
import subprocess
import sys
import time
import traceback
import urllib.request
from pathlib import Path
from typing import Any

WORKER_ID = "worker.legion.qwen3-builder.v0.1"
CAPABILITY = "engineering.patch"
ES_CONTINUOUS = 0x80000000
ES_SYSTEM_REQUIRED = 0x00000001
FORGE_LOCAL_MODELS = {
    "local.qwen3-8b": "qwen3:8b",
    "local.qwen3.5-9b": "qwen3.5:9b",
    "local.qwen3-coder-30b": "qwen3-coder:30b",
    "local.qwen3.8-27b": "qwen3.8:27b",
    "local.ornith-1.5-9b": "ornith-1.5:9b",
    "local.qwen2.5-coder-7b": "qwen2.5-coder:7b",
    "local.granite4.2-8b": "granite4.2:8b",
}


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


def _ollama_model_ready(model: str) -> bool:
    raw = _run_text("ollama", "list")
    if not raw:
        return False
    wanted = model.strip().lower()
    return any(line.split()[0].strip().lower() == wanted for line in raw.splitlines()[1:] if line.split())


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
    # A local JSON-protocol model can leak closing outer-envelope tokens after
    # the content string (observed: "}]}). Strip only that structural tail.
    tail = re.search(r'"(?=[\]\}])', body)
    if tail:
        encoded_body = body[:tail.start()]
        try:
            body = json.loads('"' + encoded_body + '"')
            return {"path": path, field: body}
        except Exception:
            body = encoded_body
    elif body.endswith('"'):
        encoded_body = body[:-1]
        try:
            body = json.loads('"' + encoded_body + '"')
            return {"path": path, field: body}
        except Exception:
            body = encoded_body
    # Last-resort recovery for genuinely malformed inner strings. This is less
    # precise; valid JSON-string decoding above is always preferred.
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
            import local_engineering
            obj = local_engineering._parse_arguments(args)
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
        if obj.get("path") == "workspace/" + allowed[0]:
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
            import local_engineering
            parsed = local_engineering._parse_arguments(raw)
        except Exception:
            parsed = {}
        raw_text = raw if isinstance(raw, str) else json.dumps(raw, ensure_ascii=False, default=str)
        rows.append({
            "name": fn.get("name") or call.get("name"),
            "argument_type": type(raw).__name__,
            "raw_prefix": raw_text[:240],
            "raw_suffix": raw_text[-480:],
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



def _scoped_workspace_diff(workspace: Path, allowed: list[str]) -> str:
    chunks: list[str] = []
    for rel in allowed:
        target = workspace / Path(rel)
        current = target.read_text(encoding="utf-8", errors="replace").splitlines(keepends=True) if target.exists() and target.is_file() else []
        try:
            previous_text = subprocess.check_output(
                ["git", "-C", str(workspace), "show", f"HEAD:{rel}"],
                text=True, encoding="utf-8", errors="replace", timeout=10, stderr=subprocess.DEVNULL,
            )
            previous = previous_text.splitlines(keepends=True)
        except Exception:
            previous = []
        if previous == current:
            continue
        chunks.extend(difflib.unified_diff(previous, current, fromfile=f"a/{rel}", tofile=f"b/{rel}"))
    return "".join(chunks)

def _atomic_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False, default=str) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def _forge_execution_allowed(workspace: Path, builder_id: str) -> bool:
    roster_path = workspace / "runtime" / "hephaestus" / "data" / "forge_roster.json"
    try:
        roster = json.loads(roster_path.read_text(encoding="utf-8"))
    except Exception:
        return False
    for row in roster.get("builders") or []:
        if row.get("id") == builder_id:
            return row.get("executionAllowed") is True
    return False


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


def _training_marker_protocol_chat_turn(messages: list, tools: list, model: str = "qwen3:8b") -> dict[str, Any]:
    """Level-1 source transport with no nested JSON escaping."""
    protocol = """Respond using exactly one tool marker and no prose.
For write_file:
TOOL write_file
PATH workspace/relative/path
CONTENT_BEGIN
<raw file content exactly as it must be written>
CONTENT_END
For append_file use TOOL append_file and TEXT_BEGIN/TEXT_END.
For read_file: TOOL read_file then PATH <path>.
For find_files: TOOL find_files then QUERY <text>.
For finish: TOOL finish then SUMMARY <short summary>.
Never wrap file content in JSON or markdown fences. Use only tool names offered by the task.
"""
    adapted=[]
    for message in messages:
        role=message.get("role","user")
        if role=="system": adapted.append({"role":"system","text":(message.get("content") or "")+"\n\n"+protocol})
        elif role=="tool": adapted.append({"role":"user","text":f"TOOL RESULT [{message.get('name','')}]:\n{message.get('content','')}\nReturn the next tool marker now."})
        elif role=="assistant": adapted.append({"role":"assistant","text":message.get("content") or "previous tool call completed"})
        else: adapted.append({"role":role,"text":message.get("content") or message.get("text") or ""})
    chat_messages=[]
    for message in adapted:
        chat_messages.append({"role": message.get("role", "user"), "content": message.get("text") or ""})
    payload=json.dumps({"model":model,"messages":chat_messages,"stream":False,"think":False,"options":{"temperature":0,"num_predict":2048}}).encode("utf-8")
    request=urllib.request.Request("http://127.0.0.1:11434/api/chat",data=payload,headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(request,timeout=300) as response:
        data=json.load(response)
    text=((data.get("message") or {}).get("content") or "").strip()
    m=re.search(r'(?m)^TOOL\s+([a-z_]+)\s*$',text)
    if not m: return {"role":"assistant","content":text,"tool_calls":[]}
    name=m.group(1); args: dict[str, Any]={}
    if name=="write_file":
        pm=re.search(r'(?m)^PATH\s+(.+?)\s*$',text); cm=re.search(r'(?s)CONTENT_BEGIN\r?\n(.*?)\r?\nCONTENT_END',text)
        if pm and cm: args={"path":pm.group(1).strip(),"content":cm.group(1)}
    elif name=="append_file":
        pm=re.search(r'(?m)^PATH\s+(.+?)\s*$',text); cm=re.search(r'(?s)TEXT_BEGIN\r?\n(.*?)\r?\nTEXT_END',text)
        if pm and cm: args={"path":pm.group(1).strip(),"text":cm.group(1)}
    elif name=="read_file":
        pm=re.search(r'(?m)^PATH\s+(.+?)\s*$',text); args={"path":pm.group(1).strip()} if pm else {}
    elif name=="find_files":
        qm=re.search(r'(?m)^QUERY\s+(.+?)\s*$',text); args={"query":qm.group(1).strip()} if qm else {}
    elif name=="finish":
        sm=re.search(r'(?m)^SUMMARY\s+(.+?)\s*$',text); args={"summary":sm.group(1).strip()} if sm else {"summary":"training job complete"}
    return {"role":"assistant","content":None,"tool_calls":[{"id":"training_marker_1","type":"function","function":{"name":name,"arguments":args}}]}


def run_job(req: dict[str, Any]) -> dict[str, Any]:
    workspace, allowed, deny = _validate_request(req)
    # The worker is self-contained inside OTHRYS OS. Legacy Hub was harvested
    # into runtime/workers/local_engineering.py so governed execution no longer
    # depends on a parallel repository being present.
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import local_engineering

    # Bound all engineering evidence to the request allowlist. This prevents
    # dirty unrelated files (including prior worker results) from recursively
    # entering the next result artifact.
    local_engineering.workspace_diff = lambda _workspace: _scoped_workspace_diff(workspace, allowed)
    tool_call_diagnostics: list[dict[str, Any]] = []
    dirty_before = _dirty_snapshot(workspace)
    metadata=req.get("metadata") or {}
    forge_builder_id=str(metadata.get("forge_builder_id") or "local.qwen3-8b")
    if forge_builder_id not in FORGE_LOCAL_MODELS:
        raise ValueError(f"FORGE_LOCAL_BUILDER_UNSUPPORTED:{forge_builder_id}")
    qualification_mode = metadata.get("forge_qualification") is True
    if qualification_mode:
        if any(not path.startswith("training/forge-qualification/") for path in allowed):
            raise ValueError("FORGE_QUALIFICATION_PATH_REQUIRED")
    elif not _forge_execution_allowed(workspace, forge_builder_id):
        raise ValueError("FORGE_BUILDER_NOT_QUALIFIED_FOR_GOVERNED_EXECUTION")
    selected_model=FORGE_LOCAL_MODELS[forge_builder_id]
    # Marker transport avoids nested JSON escaping failures observed during the
    # L1/L2 corpus while preserving the same governed tool executor and allowlist.
    chat_turn = lambda messages, tools: _training_marker_protocol_chat_turn(messages, tools, selected_model)
    if len(allowed) == 1:
        original_chat_turn = chat_turn
        def traced_chat_turn(messages, tools):
            mutated = bool(_changed_since(dirty_before, _dirty_snapshot(workspace)))
            effective_tools = _gate_finish_tool(tools, mutated)
            response = original_chat_turn(messages, effective_tools)
            tool_call_diagnostics.extend(_tool_call_diagnostics(response))
            if not mutated:
                calls=[]
                for call in response.get("tool_calls") or []:
                    fn=call.get("function") or {}
                    if (fn.get("name") or call.get("name")) == "finish":
                        continue
                    calls.append(call)
                if len(calls) != len(response.get("tool_calls") or []):
                    response={**response,"tool_calls":calls,"content":response.get("content") or "finish refused before mutation"}
            return _repair_single_path_tool_calls(response, allowed)
        chat_turn = traced_chat_turn
    if not _ollama_model_ready(selected_model):
        raise RuntimeError(f"local builder model not ready: {selected_model}")

    for path in allowed:
        if any(path == d or path.startswith(d.rstrip("/") + "/") for d in deny):
            raise ValueError(f"allowed path conflicts with deny path: {path}")

    started = time.time()
    before = _node_snapshot()
    eng = local_engineering.run_engineering_loop(
        task=req["task"], workspace=workspace, chat_turn=chat_turn,
        touch_allow=allowed,
    )
    dirty_after = _dirty_snapshot(workspace)
    changed = _changed_since(dirty_before, dirty_after)
    outside = sorted(set(changed) - set(allowed))
    completed = time.time()
    return {
        "schema_version": "othrys.worker-result.v0.1",
        "job_id": req["job_id"], "node_id": "legion", "capability": CAPABILITY,
        "worker_id": WORKER_ID, "builder_id": forge_builder_id,
        "ok": bool(eng.ok) and not outside and bool(changed),
        "reason": (f"out_of_scope_changes: {outside}" if outside else (eng.reason or "" if changed else "NO_ATTEMPT_MUTATION")),
        "started_at": started, "completed_at": completed, "duration_sec": completed - started,
        "allowed_paths": allowed, "changed_files": changed, "out_of_scope_changes": outside,
        "diff": _scoped_workspace_diff(workspace, allowed), "git_status": "\n".join(changed), "summary": eng.summary,
        "runtime_evidence": {"observed_diff": _scoped_workspace_diff(workspace, allowed), "git_status": "\n".join(changed), "tool_trace": list(eng.tool_trace or [])[:40], "tool_call_diagnostics": tool_call_diagnostics[:20]},
        "capability_selection": {"policy": "hephaestus_forge_local_qualification" if metadata.get("forge_qualification") is True else "v2_direct_low_level_loop", "selected_builder": forge_builder_id, "model": FORGE_LOCAL_MODELS[forge_builder_id], "cost_model": "local"},
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
