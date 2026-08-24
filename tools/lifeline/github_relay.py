from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path

REPO = "vtcbelgium/othrys-v2"
TITLE_PREFIX = "[LIFELINE-CMD]"
SCHEMA = "othrys.v2.lifeline.command.v1"
ALLOWED_AUTHOR = "vtcbelgium"
ALLOWED_BUILDER = "qwen3-builder"
ALLOWED_ACTION = "scratch_builder_probe"
ALLOWED_TOUCH = ["PROBE.txt"]
EXPECTED = "LOCAL_BUILDER_OK\n"
MUTEX_PORT = 48721
LOG = Path(os.environ.get("LOCALAPPDATA", tempfile.gettempdir())) / "OTHRYS" / "lifeline" / "relay.log"
TASK = (
    "Edit only PROBE.txt. Replace its entire contents with exactly: "
    "LOCAL_BUILDER_OK followed by one newline. Do not create, rename, or modify "
    "any other file. Stop after producing the change."
)


def _log(message: str) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as fh:
        fh.write(time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) + " " + message + "\n")


def _run(args: list[str], *, cwd: str | None = None, input_text: str | None = None, timeout: int = 60) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=cwd, input=input_text, text=True, capture_output=True, timeout=timeout, check=True)


def _gh_json(endpoint: str):
    return json.loads(_run(["gh", "api", endpoint], timeout=30).stdout)


def _gh_write(endpoint: str, payload: dict, method: str) -> None:
    _run(["gh", "api", "--method", method, endpoint, "--input", "-"], input_text=json.dumps(payload), timeout=30)


def validate_issue(issue: dict) -> dict:
    if issue.get("state") != "open":
        raise ValueError("ISSUE_NOT_OPEN")
    if not str(issue.get("title", "")).startswith(TITLE_PREFIX):
        raise ValueError("TITLE_PREFIX_INVALID")
    if (issue.get("user") or {}).get("login") != ALLOWED_AUTHOR:
        raise ValueError("AUTHOR_NOT_ALLOWED")
    try:
        cmd = json.loads(issue.get("body") or "")
    except json.JSONDecodeError as exc:
        raise ValueError("BODY_NOT_JSON") from exc
    if set(cmd) != {"schema", "command_id", "action", "builder", "touch_allow"}:
        raise ValueError("COMMAND_FIELDS_INVALID")
    if cmd["schema"] != SCHEMA:
        raise ValueError("SCHEMA_INVALID")
    if not re.fullmatch(r"[A-Z0-9_.-]{1,80}", str(cmd["command_id"])):
        raise ValueError("COMMAND_ID_INVALID")
    if cmd["action"] != ALLOWED_ACTION:
        raise ValueError("ACTION_NOT_ALLOWED")
    if cmd["builder"] != ALLOWED_BUILDER:
        raise ValueError("BUILDER_NOT_ALLOWED")
    if cmd["touch_allow"] != ALLOWED_TOUCH:
        raise ValueError("TOUCH_ALLOW_INVALID")
    return cmd


def run_probe(command_id: str, hub_path: str) -> dict:
    root = Path(tempfile.mkdtemp(prefix="othrys_lifeline_"))
    try:
        _run(["git", "init", "-q"], cwd=str(root))
        _run(["git", "config", "user.email", "lifeline@othrys.local"], cwd=str(root))
        _run(["git", "config", "user.name", "OTHRYS Lifeline"], cwd=str(root))
        (root / "PROBE.txt").write_text("BEFORE\n", encoding="utf-8", newline="\n")
        _run(["git", "add", "PROBE.txt"], cwd=str(root))
        _run(["git", "commit", "-q", "-m", "seed"], cwd=str(root))
        if hub_path not in sys.path:
            sys.path.insert(0, hub_path)
        from hub.builders import Qwen3BuilderMind
        from hub.engineering_platform import PlatformRequest, run_engineering_mission
        builder = Qwen3BuilderMind()
        status = builder.status()
        if status != "ready":
            raise RuntimeError(f"BUILDER_NOT_READY:{status}")
        result = run_engineering_mission(PlatformRequest(
            mission_id=command_id,
            task=TASK,
            workspace=str(root), repo_dir=str(root), roster=[builder], builder=builder,
            operator_touch_allow=ALLOWED_TOUCH, policy="direct", emit_events=False,
            allow_engine_fallback=False, timeout_sec=120.0,
        ))
        names = [x for x in _run(["git", "diff", "--name-only"], cwd=str(root)).stdout.splitlines() if x]
        diff = _run(["git", "diff", "--", "PROBE.txt"], cwd=str(root)).stdout
        content = (root / "PROBE.txt").read_text(encoding="utf-8")
        evidence = getattr(getattr(result, "structured", None), "evidence", None)
        passed = bool(result.ok) and names == ALLOWED_TOUCH and content == EXPECTED
        return {
            "schema": "othrys.v2.lifeline.result.v1", "command_id": command_id,
            "verdict": "PASS" if passed else "FAIL", "transport": "private_github_relay",
            "builder": ALLOWED_BUILDER, "builder_status": status, "hub_stage": result.stage,
            "hub_verification": getattr(evidence, "verification", "UNKNOWN"),
            "changed_files": names, "content_exact": content == EXPECTED, "diff": diff,
            "workspace": "DISPOSABLE_TEMP_REPO", "live_repo_mutated": False,
        }
    finally:
        shutil.rmtree(root, ignore_errors=True)


def process_issue(number: int, hub_path: str) -> dict:
    endpoint = f"repos/{REPO}/issues/{number}"
    try:
        cmd = validate_issue(_gh_json(endpoint))
        result = run_probe(cmd["command_id"], hub_path)
    except Exception as exc:
        result = {"schema": "othrys.v2.lifeline.result.v1", "verdict": "FAIL", "reason": f"{type(exc).__name__}:{exc}"}
    comment = "LIFELINE_RESULT\n```json\n" + json.dumps(result, indent=2) + "\n```"
    _gh_write(endpoint + "/comments", {"body": comment}, "POST")
    _gh_write(endpoint, {"state": "closed"}, "PATCH")
    _log(f"issue={number} verdict={result.get('verdict')}")
    return result


def open_commands() -> list[int]:
    issues = _gh_json(f"repos/{REPO}/issues?state=open&per_page=30")
    return sorted(int(i["number"]) for i in issues if "pull_request" not in i and str(i.get("title", "")).startswith(TITLE_PREFIX))


def watch(hub_path: str, interval: int) -> int:
    guard = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        guard.bind(("127.0.0.1", MUTEX_PORT))
    except OSError:
        _log("watcher duplicate refused")
        return 3
    _log("watcher started")
    while True:
        try:
            for number in open_commands():
                process_issue(number, hub_path)
        except Exception as exc:
            _log(f"watch_error={type(exc).__name__}:{exc}")
        time.sleep(max(5, interval))


def main() -> int:
    ap = argparse.ArgumentParser()
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--issue", type=int)
    group.add_argument("--watch", action="store_true")
    ap.add_argument("--interval", type=int, default=15)
    ap.add_argument("--hub-path", default=r"C:\Users\othry\Projects\othrys-hub")
    args = ap.parse_args()
    if args.watch:
        return watch(args.hub_path, args.interval)
    result = process_issue(args.issue, args.hub_path)
    print(json.dumps(result, indent=2))
    return 0 if result.get("verdict") == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
