from __future__ import annotations

import argparse
import hashlib
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

from node import build_node_envelope

WORK_SCHEMA = "othrys.mycelium.work.v0.1"
RESULT_SCHEMA = "othrys.mycelium.work-result.v0.1"
CAPABILITY = "verification.sha256@1"
MAX_TEXT_BYTES = 1_000_000
def execute_work(node_id: str, raw: dict[str, Any]) -> dict[str, Any]:
    if set(raw) != {"schema", "work_id", "capability", "payload"}:
        raise ValueError("INVALID_WORK_FIELDS")
    if raw["schema"] != WORK_SCHEMA or raw["capability"] != CAPABILITY:
        raise ValueError("UNSUPPORTED_WORK")
    work_id = raw["work_id"]
    payload = raw["payload"]
    if not isinstance(work_id, str) or not work_id.strip():
        raise ValueError("INVALID_WORK_ID")
    if not isinstance(payload, dict) or set(payload) != {"text"}:
        raise ValueError("INVALID_PAYLOAD")
    text = payload["text"]
    if not isinstance(text, str):
        raise ValueError("INVALID_TEXT")
    data = text.encode("utf-8")
    if len(data) > MAX_TEXT_BYTES:
        raise ValueError("PAYLOAD_TOO_LARGE")
    return {"schema": RESULT_SCHEMA, "work_id": work_id, "node_id": node_id,
            "capability": CAPABILITY, "authorityGranted": False, "ok": True,
            "artifact": {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}}
def make_handler(node_id: str, root: Path):
    class Handler(BaseHTTPRequestHandler):
        def _json(self, code: int, payload: dict[str, Any]) -> None:
            body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self) -> None:
            if self.path != "/health":
                self._json(404, {"ok": False, "error": "NOT_FOUND"}); return
            envelope = build_node_envelope(node_id, root, Path("__no_engineering_worker__"))
            self._json(200, {"ok": True, "node": envelope,
                             "transport": "mycelium.http.v0.1", "authorityGranted": False})

        def do_POST(self) -> None:
            if self.path != "/work":
                self._json(404, {"ok": False, "error": "NOT_FOUND"}); return
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if size <= 0 or size > MAX_TEXT_BYTES + 4096: raise ValueError("INVALID_BODY_SIZE")
                raw = json.loads(self.rfile.read(size).decode("utf-8"))
                self._json(200, execute_work(node_id, raw))
            except (ValueError, json.JSONDecodeError, UnicodeDecodeError) as exc:
                self._json(400, {"ok": False, "error": str(exc)})

        def log_message(self, fmt: str, *args: Any) -> None:
            return
    return Handler
def invoke_remote(base_url: str, work: dict[str, Any], timeout: float = 5.0) -> dict[str, Any]:
    body = json.dumps(work, separators=(",", ":")).encode("utf-8")
    request = Request(base_url.rstrip("/") + "/work", data=body,
                      headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("serve", nargs="?")
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--node-id", required=True)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), make_handler(args.node_id, Path.home()))
    print(json.dumps({"ready": True, "node_id": args.node_id, "bind": args.bind, "port": args.port}), flush=True)
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
