#!/usr/bin/env python3
"""Bounded GPT Control -> Cursor delegation wrapper for OTHRYS."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import uuid

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROFILES = {
    "economy": "composer-2.5",
    "hard": "grok-4.7-medium",
}
READ_ONLY = {"ask", "plan", "review", "verify"}


def is_cursor_pool_model(model: str) -> bool:
    """Models that draw from Cursor's included Cursor Models pool."""
    return (
        model == "composer-2.5"
        or model.startswith("grok-4.7-")
        or model.startswith("cursor-grok-4.6-")
        or model.startswith("cursor-grok-4.5-")
    )


def run(cmd, cwd=None, timeout=30):
    return subprocess.run(
        cmd, cwd=cwd, text=True, capture_output=True,
        timeout=timeout, encoding="utf-8", errors="replace",
    )


def agent_path():
    found = shutil.which("agent") or shutil.which("cursor-agent")
    if found:
        return found
    candidate = Path.home() / "AppData/Local/cursor-agent/agent.cmd"
    return str(candidate) if candidate.exists() else None


def git_state(repo: Path):
    branch = run(["git", "branch", "--show-current"], repo).stdout.strip()
    head = run(["git", "rev-parse", "HEAD"], repo).stdout.strip()
    status = run(["git", "status", "--porcelain"], repo).stdout
    return branch or "(detached)", head, bool(status.strip())


def task_packet(args, branch, head):
    return f"""OTHRYS DELEGATED TASK
Objective: {args.task}
Mode: {args.mode}
Repository: {args.repo}
Base branch: {branch}
Base HEAD: {head}
Allowed scope: {args.scope or "inspect relevant files; mutation only where required"}
Forbidden: {args.forbidden or "production, secrets, destructive actions, auth/permission changes"}
Verification: {args.verify or "run directly relevant checks and inspect the final diff"}
Stop condition: {args.stop or "return evidence after this one coherent task; do not start follow-up work"}

Use the OTHRYS left-hand rule and skill. Inspect first. Preserve unrelated work.
Do not silently broaden scope. Return Outcome, Scope, Verification, Risks / unknowns,
and Next small step. Stop after the requested unit of work.
"""
def main():
    ap = argparse.ArgumentParser(description="Delegate one bounded task to Cursor.")
    ap.add_argument("task")
    ap.add_argument("--repo", default=str(Path.cwd()))
    ap.add_argument("--mode", choices=["ask", "plan", "build", "review", "verify"], default="ask")
    ap.add_argument("--profile", choices=PROFILES, default="economy")
    ap.add_argument("--model")
    ap.add_argument("--scope")
    ap.add_argument("--forbidden")
    ap.add_argument("--verify")
    ap.add_argument("--stop")
    ap.add_argument("--label", default="delegated-task")
    ap.add_argument("--allow-dirty-base", action="store_true")
    ap.add_argument("--allow-other-model", action="store_true",
                    help="Explicitly permit a model outside Cursor's included Cursor Models pool")
    ap.add_argument("--allow-fast", action="store_true",
                    help="Explicitly permit a Fast model variant")
    ap.add_argument("--timeout", type=int, default=900)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    repo = Path(args.repo).resolve()
    if not (repo / ".git").exists():
        print("CURSOR_REFUSE: repo is not a git working tree", file=sys.stderr)
        return 2
    agent = agent_path()
    if not agent:
        print("CURSOR_OFFLINE: Cursor Agent CLI not found", file=sys.stderr)
        return 3
    status = run([agent, "status"], timeout=20)
    if status.returncode or "Logged in" not in (status.stdout + status.stderr):
        print("CURSOR_OFFLINE: Cursor Agent is not authenticated", file=sys.stderr)
        return 3
    branch, head, dirty = git_state(repo)
    if args.mode == "build" and dirty and not args.allow_dirty_base:
        print("CURSOR_REFUSE: mutation delegation requires a clean base or --allow-dirty-base", file=sys.stderr)
        return 4

    model = args.model or PROFILES[args.profile]
    if "fast" in model.lower() and not args.allow_fast:
        print("CURSOR_COST_REFUSE: Fast model requires --allow-fast", file=sys.stderr)
        return 6
    if not is_cursor_pool_model(model) and not args.allow_other_model:
        print("CURSOR_COST_REFUSE: model is outside the included Cursor Models pool; use --allow-other-model explicitly", file=sys.stderr)
        return 6
    prompt = task_packet(args, branch, head).replace("\n", "\\n")
    cmd = [agent, "-p", prompt, "--model", model, "--output-format", "text",
           "--workspace", str(repo), "--trust"]
    # Cursor sandbox is currently macOS/Linux only. Windows remains in allowlist mode.
    if os.name != "nt":
        cmd += ["--sandbox", "enabled"]
    if args.mode in READ_ONLY:
        cli_mode = "plan" if args.mode in {"plan", "review", "verify"} else "ask"
        cmd += ["--mode", cli_mode]
    else:
        cmd += ["--worktree"]

    meta_cmd = [x if x != prompt else "<TASK_PACKET>" for x in cmd]
    if args.dry_run:
        print(json.dumps({"command": meta_cmd, "dirty": dirty}, indent=2))
        return 0

    started = dt.datetime.now(dt.timezone.utc)
    try:
        result = run(cmd, timeout=args.timeout)
    except subprocess.TimeoutExpired:
        print("CURSOR_TIMEOUT: bounded delegation exceeded timeout", file=sys.stderr)
        return 5
    finished = dt.datetime.now(dt.timezone.utc)
    task_hash = hashlib.sha256(args.task.encode("utf-8")).hexdigest()
    log = {
        "id": str(uuid.uuid4()),
        "started_at": started.isoformat(),
        "finished_at": finished.isoformat(),
        "label": args.label,
        "mode": args.mode,
        "profile": args.profile,
        "model": model,
        "repo": str(repo),
        "base_branch": branch,
        "base_head": head,
        "base_dirty": dirty,
        "task_sha256": task_hash,
        "returncode": result.returncode,
        "command": meta_cmd,
    }
    if os.name == "nt":
        state_root = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "Othrys"
    else:
        state_root = Path.home() / ".local/state/othrys"
    log_dir = state_root / "cursor-left-hand/runs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / f"{started.strftime('%Y%m%dT%H%M%SZ')}-{args.label}.json"
    log_path.write_text(json.dumps(log, indent=2), encoding="utf-8")

    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    print(f"\n[OTHRYS cursor log: {log_path}]")
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
