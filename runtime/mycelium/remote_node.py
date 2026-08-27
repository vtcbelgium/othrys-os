from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from math import isfinite
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

from node import build_node_envelope

WORK_SCHEMA = "othrys.mycelium.work.v0.1"
RESULT_SCHEMA = "othrys.mycelium.work-result.v0.1"
SHA_CAPABILITY = "verification.sha256@1"
CAPABILITY = SHA_CAPABILITY
V2_CAPABILITY = "verification.v2-suite@1"
ADVISORY_CAPABILITY = "advisory.product-critique@1"
TELEMETRY_CAPABILITY = "telemetry.node-status@1"
MAX_TEXT_BYTES = 1_000_000
def _run_fixed(repo: Path, args: list[str], timeout: int = 90) -> dict[str, Any]:
    started=time.perf_counter()
    env=os.environ.copy()
    for key in ("OTHRYS_CPU_THREADS","OTHRYS_RAM_MB","OTHRYS_GPU_COUNT","OTHRYS_VRAM_MB","OTHRYS_OWNER_POLICY"): env.pop(key,None)
    proc=subprocess.run(args,cwd=repo,text=True,encoding="utf-8",errors="replace",capture_output=True,timeout=timeout,env=env)
    return {"ok":proc.returncode==0,"exit":proc.returncode,"duration_ms":round((time.perf_counter()-started)*1000,2),"tail":(proc.stdout+proc.stderr)[-4000:]}


def _verify_v2(node_id: str, work_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    if set(payload) != {"suite", "expected_sha"} or payload.get("suite") != "core": raise ValueError("INVALID_VERIFY_PAYLOAD")
    repo=Path(os.environ.get("OTHRYS_VERIFY_REPO", "")).expanduser()
    if not repo.is_dir() or not (repo/".git").exists(): raise ValueError("VERIFY_REPO_UNAVAILABLE")
    head=subprocess.check_output(["git","rev-parse","HEAD"],cwd=repo,text=True,encoding="utf-8").strip()
    if head != payload.get("expected_sha"): raise ValueError("VERIFY_HEAD_MISMATCH")
    node_tests=[str(x.relative_to(repo)) for x in sorted((repo/"runtime/talos-kernel").glob("*.test.ts"))]
    node_tests += [str(x.relative_to(repo)) for x in sorted((repo/"runtime/factory").glob("*.test.ts"))]
    node_tests += [str(x.relative_to(repo)) for x in sorted((repo/"qa/trust-canal").glob("*.test.ts"))]
    node_tests += [str(x.relative_to(repo)) for x in sorted((repo/"qa/hephaestus-integration").glob("*.test.ts"))]
    suites=[_run_fixed(repo,["python3","-m","unittest","discover","-s","runtime/mycelium","-p","test_*.py"]),_run_fixed(repo,["python3","-m","unittest","discover","-s","runtime/workers","-p","test_*.py"]),_run_fixed(repo,["node","--test",*node_tests])]
    return {"schema":RESULT_SCHEMA,"work_id":work_id,"node_id":node_id,"capability":V2_CAPABILITY,"authorityGranted":False,"ok":all(x["ok"] for x in suites),"artifact":{"head":head,"suites":suites}}


def _product_critique(node_id: str, work_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    required={"candidateCommit","artifactSha256","sourceText"}
    if set(payload) != required: raise ValueError("INVALID_ADVISORY_PAYLOAD")
    if not isinstance(payload["sourceText"],str) or len(payload["sourceText"].encode("utf-8"))>20000: raise ValueError("INVALID_ADVISORY_SOURCE")
    if not isinstance(payload["candidateCommit"],str) or not isinstance(payload["artifactSha256"],str): raise ValueError("INVALID_ADVISORY_EVIDENCE")
    prompt=("You are an advisory product critic. You have NO authority to change code, policy, acceptance, or release. "
            "Inspect the supplied product source and return JSON only with keys summary, suggestions, risks. "
            "suggestions must be 1-3 short concrete functionality or usability improvements; risks must be 0-3 strings. "
            "Do not suggest duplicating platform Block logic or bypassing governance.\nSOURCE:\n"+payload["sourceText"])
    body=json.dumps({"model":os.environ.get("OTHRYS_ADVISORY_MODEL","llama3.2"),"prompt":prompt,"stream":False,"format":"json","keep_alive":"10m"}).encode("utf-8")
    req=Request("http://127.0.0.1:11434/api/generate",data=body,headers={"Content-Type":"application/json"},method="POST")
    with urlopen(req,timeout=45) as response: raw=json.loads(response.read().decode("utf-8"))
    parsed=json.loads(raw.get("response","{}")); summary=str(parsed.get("summary","")).strip()
    suggestions=[str(x).strip() for x in parsed.get("suggestions",[]) if str(x).strip()][:3]
    risks=[str(x).strip() for x in parsed.get("risks",[]) if str(x).strip()][:3]
    if not summary or not suggestions: raise ValueError("ADVISORY_MODEL_INVALID_OUTPUT")
    return {"schema":RESULT_SCHEMA,"work_id":work_id,"node_id":node_id,"capability":ADVISORY_CAPABILITY,"authorityGranted":False,"ok":True,"artifact":{"candidateCommit":payload["candidateCommit"],"artifactSha256":payload["artifactSha256"],"model":os.environ.get("OTHRYS_ADVISORY_MODEL","llama3.2"),"summary":summary,"suggestions":suggestions,"risks":risks}}



def _telemetry_status(node_id: str, work_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    required={"token","nodeId","capturedAt","cpuPercent","ramAvailableMb","gpuUtilPercent","vramUsedMb","vramTotalMb","gpuTempC","qwenLoaded"}
    if set(payload) != required: raise ValueError("INVALID_TELEMETRY_PAYLOAD")
    expected=os.environ.get("OTHRYS_TELEMETRY_TOKEN","")
    if not expected or payload.get("token") != expected: raise ValueError("TELEMETRY_UNAUTHORIZED")
    if payload.get("nodeId") != "legion" or not isinstance(payload.get("capturedAt"),str): raise ValueError("INVALID_TELEMETRY_IDENTITY")
    try: captured=datetime.fromisoformat(payload["capturedAt"].replace("Z","+00:00"))
    except ValueError: raise ValueError("INVALID_TELEMETRY_TIME")
    if captured.tzinfo is None or abs(datetime.now(timezone.utc).timestamp()-captured.timestamp())>300: raise ValueError("INVALID_TELEMETRY_TIME")
    numeric=("cpuPercent","ramAvailableMb","gpuUtilPercent","vramUsedMb","vramTotalMb","gpuTempC")
    if any(not isinstance(payload[k],(int,float)) or isinstance(payload[k],bool) or not isfinite(payload[k]) for k in numeric): raise ValueError("INVALID_TELEMETRY_METRIC")
    if not (0<=payload["cpuPercent"]<=100 and 0<=payload["gpuUtilPercent"]<=100 and payload["ramAvailableMb"]>=0 and 0<=payload["vramUsedMb"]<=payload["vramTotalMb"] and payload["vramTotalMb"]>0 and 0<=payload["gpuTempC"]<=120): raise ValueError("INVALID_TELEMETRY_METRIC")
    if not isinstance(payload["qwenLoaded"],bool): raise ValueError("INVALID_TELEMETRY_METRIC")
    clean={k:v for k,v in payload.items() if k!="token"}; clean["receivedAt"]=datetime.now(timezone.utc).isoformat()
    directory=Path(os.environ.get("OTHRYS_TELEMETRY_DIR",str(Path.home()/".othrys"/"telemetry"))).expanduser(); directory.mkdir(parents=True,exist_ok=True)
    target=directory/"legion.json"; tmp=directory/f"legion.json.tmp-{os.getpid()}"; tmp.write_text(json.dumps(clean,separators=(",",":"))+"\n",encoding="utf-8"); tmp.replace(target)
    return {"schema":RESULT_SCHEMA,"work_id":work_id,"node_id":node_id,"capability":TELEMETRY_CAPABILITY,"authorityGranted":False,"ok":True,"artifact":{"nodeId":"legion","capturedAt":clean["capturedAt"]}}


def execute_work(node_id: str, raw: dict[str, Any]) -> dict[str, Any]:
    if set(raw) != {"schema", "work_id", "capability", "payload"}: raise ValueError("INVALID_WORK_FIELDS")
    if raw.get("schema") != WORK_SCHEMA: raise ValueError("UNSUPPORTED_WORK")
    work_id=raw.get("work_id"); capability=raw.get("capability"); payload=raw.get("payload")
    if not isinstance(work_id,str) or not work_id.strip(): raise ValueError("INVALID_WORK_ID")
    if not isinstance(payload,dict): raise ValueError("INVALID_PAYLOAD")
    if capability == V2_CAPABILITY: return _verify_v2(node_id, work_id, payload)
    if capability == ADVISORY_CAPABILITY: return _product_critique(node_id, work_id, payload)
    if capability == TELEMETRY_CAPABILITY: return _telemetry_status(node_id, work_id, payload)
    if capability != SHA_CAPABILITY: raise ValueError("UNSUPPORTED_WORK")
    if set(payload) != {"text"} or not isinstance(payload.get("text"),str): raise ValueError("INVALID_PAYLOAD")
    data=payload["text"].encode("utf-8")
    if len(data)>MAX_TEXT_BYTES: raise ValueError("PAYLOAD_TOO_LARGE")
    return {"schema":RESULT_SCHEMA,"work_id":work_id,"node_id":node_id,"capability":SHA_CAPABILITY,"authorityGranted":False,"ok":True,"artifact":{"sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data)}}
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
            repo=Path(os.environ.get("OTHRYS_VERIFY_REPO", "")).expanduser()
            if (repo/".git").exists() and V2_CAPABILITY not in envelope["capabilities"]: envelope["capabilities"].append(V2_CAPABILITY)
            if "llama3.2" in envelope.get("physical",{}).get("ollama_models","") and ADVISORY_CAPABILITY not in envelope["capabilities"]: envelope["capabilities"].append(ADVISORY_CAPABILITY)
            if os.environ.get("OTHRYS_TELEMETRY_TOKEN") and TELEMETRY_CAPABILITY not in envelope["capabilities"]: envelope["capabilities"].append(TELEMETRY_CAPABILITY)
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

