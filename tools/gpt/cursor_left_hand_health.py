#!/usr/bin/env python3
"""Health probe and fallback selector for the OTHRYS Cursor/Grok left hand."""
from __future__ import annotations

import json
from pathlib import Path
import socket
import subprocess
import urllib.request


def run(cmd, timeout=12):
    try:
        p = subprocess.run(cmd, text=True, capture_output=True, timeout=timeout,
                           encoding="utf-8", errors="replace")
        return p.returncode, (p.stdout + p.stderr).strip()
    except Exception as exc:
        return 99, f"{type(exc).__name__}: {exc}"


def tcp(host, port, timeout=1.5):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def http_ok(url, timeout=2):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return 200 <= r.status < 500
    except Exception:
        return False
def main():
    agent = Path.home() / "AppData/Local/cursor-agent/agent.cmd"
    rc, out = run([str(agent), "status"]) if agent.exists() else (2, "missing")
    native_cursor = rc == 0 and "Logged in" in out

    rc, wsl_out = run([
        "wsl", "-d", "Ubuntu-24.04", "-u", "othrys", "--",
        "bash", "-lc",
        "test -x ~/.local/bin/agent && ~/.local/bin/agent status; "
        "pgrep -af cursor-agent || true",
    ])
    wsl_cursor = "Logged in" in wsl_out
    wsl_worker = " worker " in wsl_out and "cursor-agent" in wsl_out

    rc, proc_out = run([
        "powershell", "-NoProfile", "-Command",
        "Get-Process -ErrorAction SilentlyContinue | "
        "Where-Object {$_.ProcessName -match 'Grok Bot|QuickDesk'} | "
        "Select-Object -ExpandProperty ProcessName",
    ])
    grok = "Grok Bot" in proc_out
    quickdesk = tcp("127.0.0.1", 18081)
    ollama = http_ok("http://127.0.0.1:11434/api/tags")
    routes = []
    if native_cursor:
        routes.append("cursor_cli_native")
    if wsl_worker:
        routes.append("cursor_my_machine_wsl")
    elif wsl_cursor:
        routes.append("cursor_wsl_cli")
    # Proven independently through GitHub issue #51 on 2026-09-26.
    routes.append("cursor_managed_cloud_via_github")
    if grok and quickdesk:
        routes.append("grok_via_quickdesk")
    if ollama:
        routes.append("local_ollama")
    routes += ["private_github_relay", "operator_break_glass"]

    data = {
        "native_cursor": native_cursor,
        "wsl_cursor": wsl_cursor,
        "wsl_my_machine": wsl_worker,
        "quickdesk_mcp": quickdesk,
        "grok_bot": grok,
        "ollama": ollama,
        "recommended_route": routes[0],
        "fallback_order": routes,
    }
    print(json.dumps(data, indent=2))
    return 0 if routes[0] not in {"private_github_relay", "operator_break_glass"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
