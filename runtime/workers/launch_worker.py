from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--request", required=True)
    parser.add_argument("--result", required=True)
    parser.add_argument("--log", required=True)
    parser.add_argument("--pid-file", required=True)
    args = parser.parse_args()

    worker = Path(__file__).with_name("legion_qwen_worker_v01.py")
    request = Path(args.request).resolve()
    result = Path(args.result).resolve()
    log = Path(args.log).resolve()
    pid_file = Path(args.pid_file).resolve()
    for path in (result, log, pid_file):
        path.parent.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env.setdefault("OTHRYS_OLLAMA_KEEP_ALIVE", "30m")
    flags = 0
    kwargs: dict = {}
    if os.name == "nt":
        flags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
        kwargs["creationflags"] = flags
    else:
        kwargs["start_new_session"] = True

    with log.open("a", encoding="utf-8", buffering=1) as stream:
        proc = subprocess.Popen(
            [sys.executable, str(worker), "--request", str(request), "--result", str(result)],
            stdin=subprocess.DEVNULL,
            stdout=stream,
            stderr=subprocess.STDOUT,
            env=env,
            close_fds=True,
            **kwargs,
        )

    pid_file.write_text(str(proc.pid) + "\n", encoding="utf-8")
    print(json.dumps({
        "launched": True,
        "pid": proc.pid,
        "request": str(request),
        "result": str(result),
        "log": str(log),
        "pid_file": str(pid_file),
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
