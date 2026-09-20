from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

SERVICE = "othrys-legion-worker-bridge"
MAX_BODY_BYTES = 128_000


class BridgeError(ValueError):
    pass


def _sha(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _load_json(raw: str, code: str) -> dict[str, Any]:
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise BridgeError(code) from exc
    if not isinstance(value, dict):
        raise BridgeError(code)
    return value
def validate_job_payload(payload: dict[str, Any], expected_token: str, expected_workspace: str) -> tuple[dict[str, Any], dict[str, Any], str]:
    if set(payload) != {"token", "dispatchRaw", "requestRaw"}:
        raise BridgeError("JOB_FIELDS_INVALID")
    supplied = str(payload.get("token") or "")
    if not expected_token or not hmac.compare_digest(supplied, expected_token):
        raise BridgeError("JOB_UNAUTHORIZED")

    dispatch_raw = payload.get("dispatchRaw")
    request_raw = payload.get("requestRaw")
    if not isinstance(dispatch_raw, str) or not isinstance(request_raw, str):
        raise BridgeError("JOB_EVIDENCE_INVALID")
    dispatch = _load_json(dispatch_raw, "DISPATCH_INVALID")
    request = _load_json(request_raw, "REQUEST_INVALID")

    if (
        dispatch.get("schema") != "othrys.os.dispatch-ticket.v1"
        or dispatch.get("status") != "DISPATCH_AUTHORIZED"
        or dispatch.get("authorityGranted") is not True
        or dispatch.get("executionStarted") is not False
    ):
        raise BridgeError("DISPATCH_INVALID")
    if request.get("schema_version") != "othrys.worker-request.v0.1":
        raise BridgeError("REQUEST_INVALID")
    if (
        dispatch.get("jobId") != request.get("job_id")
        or dispatch.get("missionId") != (request.get("metadata") or {}).get("mission_id")
        or dispatch.get("builderId") != (request.get("metadata") or {}).get("builder_id")
        or dispatch.get("requestDigest") != _sha(request_raw)
    ):
        raise BridgeError("REQUEST_DISPATCH_MISMATCH")
    if request.get("node_id") != "legion" or request.get("capability") != "engineering.patch":
        raise BridgeError("REQUEST_TARGET_INVALID")
    if (request.get("metadata") or {}).get("status") != "READY_FOR_DISPATCH":
        raise BridgeError("REQUEST_STATE_INVALID")

    configured = Path(expected_workspace).resolve()
    requested = Path(str(request.get("workspace") or "")).resolve()
    if not expected_workspace or os.path.normcase(str(requested)) != os.path.normcase(str(configured)):
        raise BridgeError("WORKSPACE_NOT_AUTHORIZED")
    allowed = request.get("allowed_paths")
    if not isinstance(allowed, list) or not allowed:
        raise BridgeError("REQUEST_SCOPE_INVALID")
    return dispatch, request, request_raw
def run_authorized_job(payload: dict[str, Any], *, expected_token: str, expected_workspace: str, state_dir: Path, launcher: Path) -> dict[str, Any]:
    dispatch, request, request_raw = validate_job_payload(payload, expected_token, expected_workspace)
    job_id = str(request["job_id"])
    if not job_id.startswith("JOB-"):
        raise BridgeError("JOB_ID_INVALID")

    state_dir.mkdir(parents=True, exist_ok=True)
    request_path = state_dir / f"{job_id}.request.json"
    result_path = state_dir / f"{job_id}.result.json"
    log_path = state_dir / f"{job_id}.log"
    pid_path = state_dir / f"{job_id}.pid"
    lock_path = state_dir / f"{job_id}.lock"

    if result_path.exists():
        result = _load_json(result_path.read_text(encoding="utf-8"), "RESULT_INVALID")
        if result.get("job_id") != job_id or result.get("mission_id") != dispatch.get("missionId"):
            raise BridgeError("RESULT_IDENTITY_MISMATCH")
        return result

    if request_path.exists():
        if request_path.read_text(encoding="utf-8") != request_raw:
            raise BridgeError("REQUEST_REPLAY_CONFLICT")
    else:
        request_path.write_text(request_raw, encoding="utf-8")
    try:
        fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.close(fd)
    except FileExistsError as exc:
        raise BridgeError("JOB_ALREADY_RUNNING") from exc

    try:
        timeout = int(request.get("timeout_sec") or 180)
        command = [
            sys.executable,
            str(launcher),
            "--request", str(request_path),
            "--result", str(result_path),
            "--log", str(log_path),
            "--pid-file", str(pid_path),
            "--wait",
        ]
        proc = subprocess.run(
            command,
            cwd=str(launcher.parent.parent.parent),
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            timeout=max(15, timeout + 20),
        )
        if not result_path.exists():
            raise BridgeError(f"WORKER_RESULT_MISSING:{proc.returncode}")
        result = _load_json(result_path.read_text(encoding="utf-8"), "RESULT_INVALID")
        if result.get("job_id") != job_id or result.get("mission_id") != dispatch.get("missionId"):
            raise BridgeError("RESULT_IDENTITY_MISMATCH")
        return result
    finally:
        try:
            lock_path.unlink()
        except FileNotFoundError:
            pass
def make_handler(expected_token: str, expected_workspace: str, state_dir: Path, launcher: Path):
    class Handler(BaseHTTPRequestHandler):
        def _json(self, code: int, body: dict[str, Any]) -> None:
            raw = json.dumps(body, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self) -> None:
            if self.path != "/health":
                self._json(404, {"ok": False, "error": "NOT_FOUND"})
                return
            self._json(200, {
                "ok": True,
                "service": SERVICE,
                "node_id": "legion",
                "capability": "engineering.patch",
                "authorityGranted": False,
            })

        def do_POST(self) -> None:
            if self.path != "/jobs":
                self._json(404, {"ok": False, "error": "NOT_FOUND"})
                return
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if size <= 0 or size > MAX_BODY_BYTES:
                    raise BridgeError("BODY_SIZE_INVALID")
                payload = json.loads(self.rfile.read(size).decode("utf-8"))
                if not isinstance(payload, dict):
                    raise BridgeError("BODY_INVALID")
                result = run_authorized_job(
                    payload,
                    expected_token=expected_token,
                    expected_workspace=expected_workspace,
                    state_dir=state_dir,
                    launcher=launcher,
                )
                self._json(200, {"ok": bool(result.get("ok")), "workerResult": result})
            except (BridgeError, json.JSONDecodeError, UnicodeDecodeError, subprocess.TimeoutExpired) as exc:
                self._json(400, {"ok": False, "error": str(exc)})

        def log_message(self, fmt: str, *args: Any) -> None:
            return

    return Handler


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("serve", nargs="?")
    parser.add_argument("--bind", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    token = os.environ.get("OTHRYS_ENGINEERING_TOKEN", "")
    workspace = os.environ.get("OTHRYS_ENGINEERING_WORKSPACE", "")
    if not token or not workspace:
        raise SystemExit("OTHRYS_ENGINEERING_TOKEN_AND_WORKSPACE_REQUIRED")

    root = Path(__file__).resolve().parents[2]
    launcher = root / "runtime" / "workers" / "launch_worker.py"
    if not launcher.exists():
        raise SystemExit("OTHRYS_WORKER_LAUNCHER_NOT_FOUND")
    state_dir = Path(
        os.environ.get("OTHRYS_ENGINEERING_BRIDGE_DIR", str(Path.home() / ".othrys" / "worker-bridge"))
    ).expanduser()

    server = ThreadingHTTPServer(
        (args.bind, args.port),
        make_handler(token, workspace, state_dir, launcher),
    )
    print(json.dumps({"ready": True, "service": SERVICE, "bind": args.bind, "port": args.port}), flush=True)
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
