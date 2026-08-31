"""OTHRYS OS local engineering execution runtime.

Provider selection decides ONLY provider / endpoint / model / auth / response
adapter. Everything after that â€” tool definitions, tool execution, workspace
mutation, and git evidence â€” runs through this module.

Builders must not invent repository state. They call tools against a real
workspace (normally a buildloop scratch clone); the runtime returns the
actual `git diff` / status from that workspace.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

MAX_TOOL_TURNS = 36
# A builder that cannot act on an error tends to repeat it verbatim. Nudge once
# with concrete guidance, then stop and name the repetition rather than spending
# the whole turn budget on one unchanging sentence.
REPEAT_NUDGE_AT = 3
REPEAT_ABORT_AT = 6
MAX_TOOL_RESULT_CHARS = 40_000
CREATE_NO_WINDOW = 0x08000000 if os.name == "nt" else 0

NO_IMMEDIATE_RETRY = frozenset({"QUOTA_EXCEEDED", "AUTH_FAILED", "DISABLED", "OFFLINE", "MEMORY_SYNC_BLOCKED"})

def classify_transport_failure(error) -> str:
    """Small OTHRYS-OS-owned failure classifier for the local worker transport."""
    text = str(error).lower()
    if "memory_sync_blocked" in text: return "MEMORY_SYNC_BLOCKED"
    if any(x in text for x in ("http 401","http 403","unauthorized","invalid api key","authentication","forbidden","no api key","no key")): return "AUTH_FAILED"
    if any(x in text for x in ("disabled","deactivated","not enabled","has been disabled")): return "DISABLED"
    is429 = "http 429" in text or re.search(r"\b429\b", text) is not None
    if (is429 and any(x in text for x in ("quota","daily limit","tpd","tpm","rate limit","too many requests","exhausted"))) or any(x in text for x in ("quota exceeded","tokens per day","tokens per minute")): return "QUOTA_EXCEEDED"
    if any(x in text for x in ("could not connect","not reachable","connection refused","failed to establish","offline")): return "OFFLINE"
    if "timeout" in text or "timed out" in text: return "TIMEOUT"
    if is429 or any(x in text for x in ("busy","http 503","http 529","overloaded","resourceexhausted")): return "BUSY"
    return "UNKNOWN"

ENGINEERING_SYSTEM_PROMPT = (
    "You are a headless engineering builder inside Othrys Hub. "
    "You MUST use the provided tools to inspect and change the workspace. "
    "Never invent file contents, command output, or git state â€” read them "
    "with tools. Complete every step of the user task before finishing â€” "
    "including any deliberate missing-file read, the real tool error, and "
    "recovery. Never skip ahead. When (and only when) every step is done, "
    "call the finish tool with a short summary. Prefer the smallest change "
    "that completes the task. Always emit a tool call; never end a turn "
    "with empty tool_calls. "
    "When calling write_file or append_file, path MUST be a non-empty "
    "workspace-relative path (example: hub/window.py). Empty paths are rejected."
)

# OpenAI-compatible tool schemas. Every builder provider adapter receives these.
ENGINEERING_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "find_files",
            "description": "Find files under the workspace by glob-like name substring (case-insensitive).",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Substring to match in relative paths, e.g. README.md",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read a text file relative to the workspace root.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Workspace-relative path"},
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "append_file",
            "description": "Append text to an existing file (creates nothing new).",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "text": {"type": "string"},
                },
                "required": ["path", "text"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Create or overwrite a text file with full new content.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": ["path", "content"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_git",
            "description": (
                "Run an allowlisted git command in the workspace "
                "(status, diff, log, rev-parse, ls-files, checkout -- <path>)."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "args": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Git argv after 'git', e.g. [\"diff\"] or [\"status\", \"--porcelain\"]",
                    }
                },
                "required": ["args"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "finish",
            "description": "End the engineering turn after tools have done the real work.",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                },
                "required": ["summary"],
            },
        },
    },
]


def _is_tool_error(result_text: str) -> bool:
    """True when a tool result is a refusal rather than evidence."""
    head = (result_text or "").strip()[:160].casefold()
    if not head:
        return True
    markers = (
        "is required", "not found", "blocked by touch_allow", "path escapes",
        "could not read", "could not write", "could not append", "unknown tool",
        "not allowlisted", "must be a list", "failed (exit",
    )
    return any(marker in head for marker in markers)


def _repeat_guidance(name: str, result_text: str) -> str:
    """One concrete, actionable correction â€” never a restatement of the error."""
    specific = {
        "write_file": (
            'Send BOTH arguments as one JSON string, e.g. '
            '"arguments": "{\\"path\\": \\"hub/example.py\\", \\"content\\": \\"...\\"}". '
            "If the file is large, write a SHORT content first and append the rest."
        ),
        "append_file": (
            'Send both arguments, e.g. '
            '"arguments": "{\\"path\\": \\"hub/example.py\\", \\"text\\": \\"...\\"}". '
            "append_file requires the file to already exist."
        ),
        "read_file": 'Send a workspace-relative path, e.g. "{\\"path\\": \\"hub/builders.py\\"}".',
        "run_git": 'Send args as a list, e.g. "{\\"args\\": [\\"diff\\"]}".',
    }.get(name, "Re-read the tool schema and send every required argument.")
    return (
        f"STOP. The same {name} call has now failed identically several times: "
        f"{(result_text or '').strip()[:160]}\n{specific}\n"
        "Do not resend the identical call. Change the arguments, or use a "
        "different tool, on this turn."
    )


ChatTurnFn = Callable[[list, list], dict]
# chat_turn(messages, tools) -> {"role": "assistant", "content": str|None, "tool_calls": list|None}


@dataclass
class EngineeringResult:
    ok: bool
    stage: str
    reason: str
    summary: str = ""
    diff: str = ""
    observed_diff: str = ""  # last non-empty `git diff` tool evidence (survives restore)
    git_status: str = ""
    turns: int = 0
    tool_trace: list = field(default_factory=list)


class EngineeringError(RuntimeError):
    """Tool or adapter failure inside the shared engineering runtime."""


def _norm_rel(path: str) -> str:
    cleaned = path.replace("\\", "/").lstrip("/")
    if cleaned.startswith("./"):
        cleaned = cleaned[2:]
    return cleaned


def _resolve_in_workspace(workspace: Path, rel: str) -> Path:
    rel_n = _norm_rel(rel)
    if not rel_n or ".." in rel_n.split("/"):
        raise EngineeringError(f"path escapes workspace: {rel!r}")
    resolved = (workspace / rel_n).resolve()
    try:
        resolved.relative_to(workspace.resolve())
    except ValueError as exc:
        raise EngineeringError(f"path escapes workspace: {rel!r}") from exc
    return resolved


def _allowed_by_touch(rel: str, touch_allow: list[str] | None) -> bool:
    if not touch_allow:
        return True
    return any(_norm_rel(rel).startswith(prefix) for prefix in touch_allow)


def _run_git(workspace: Path, args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", *args],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=CREATE_NO_WINDOW,
    )


def _git_args_allowed(args: list[str]) -> bool:
    if not args:
        return False
    head = args[0]
    if head in {"status", "diff", "log", "rev-parse", "ls-files"}:
        return True
    # restore a path: git checkout -- PATH
    if head == "checkout" and len(args) >= 3 and args[1] == "--":
        return True
    return False


def execute_tool(
    name: str,
    arguments: dict,
    workspace: Path,
    touch_allow: list[str] | None = None,
) -> str:
    """Execute one engineering tool against `workspace`. Returns text evidence."""
    if name == "find_files":
        query = str(arguments.get("query", "")).casefold()
        if not query:
            return "query is required"
        hits = []
        for root, dirs, files in os.walk(workspace):
            dirs[:] = [d for d in dirs if d not in {".git", "__pycache__", "node_modules"}]
            for filename in files:
                full = Path(root) / filename
                rel = full.relative_to(workspace).as_posix()
                if query in rel.casefold():
                    hits.append(rel)
                    if len(hits) >= 50:
                        return "\n".join(hits)
        return "\n".join(hits) if hits else "No matching files."

    if name == "read_file":
        path = _resolve_in_workspace(workspace, str(arguments.get("path", "")))
        if not path.is_file():
            return f"File not found: {arguments.get('path')}"
        try:
            return path.read_text(encoding="utf-8", errors="replace")[:MAX_TOOL_RESULT_CHARS]
        except OSError as exc:
            return f"Could not read file: {exc}"

    if name == "append_file":
        rel = _norm_rel(str(arguments.get("path", "")))
        if not rel:
            return "path is required"
        if not _allowed_by_touch(rel, touch_allow):
            return f"blocked by touch_allow: {rel}"
        path = _resolve_in_workspace(workspace, rel)
        if not path.is_file():
            return f"File not found (append requires an existing file): {rel}"
        text = arguments.get("text", "")
        if not isinstance(text, str):
            text = str(text)
        try:
            with path.open("a", encoding="utf-8", newline="") as handle:
                handle.write(text)
            return f"appended {len(text)} chars to {rel}"
        except OSError as exc:
            return f"Could not append: {exc}"

    if name == "write_file":
        rel = _norm_rel(str(arguments.get("path", "")))
        if not rel:
            return "path is required"
        if not _allowed_by_touch(rel, touch_allow):
            return f"blocked by touch_allow: {rel}"
        path = _resolve_in_workspace(workspace, rel)
        content = arguments.get("content", "")
        if not isinstance(content, str):
            content = str(content)
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8", newline="\n")
            return f"wrote {len(content)} chars to {rel}"
        except OSError as exc:
            return f"Could not write: {exc}"

    if name == "run_git":
        raw_args = arguments.get("args") or []
        if not isinstance(raw_args, list) or not all(isinstance(a, str) for a in raw_args):
            return "args must be a list of strings"
        if not _git_args_allowed(raw_args):
            return (
                "git args not allowlisted. Allowed: status, diff, log, rev-parse, "
                "ls-files, checkout -- <path>"
            )
        if raw_args[0] == "checkout":
            for rel in raw_args[2:]:
                if not _allowed_by_touch(_norm_rel(rel), touch_allow):
                    return f"blocked by touch_allow: {rel}"
        result = _run_git(workspace, raw_args)
        out = (result.stdout or "") + (("\n" + result.stderr) if result.stderr else "")
        out = out.strip() or f"(exit {result.returncode}, empty output)"
        if result.returncode != 0:
            return f"git {' '.join(raw_args)} failed (exit {result.returncode}):\n{out}"
        return out[:MAX_TOOL_RESULT_CHARS]

    if name == "finish":
        return str(arguments.get("summary", "")).strip() or "finished"

    return f"Unknown tool: {name}"


def _parse_arguments(raw) -> dict:
    """Tool arguments, recovering a structurally-truncated argument payload.

    The envelope repair in ``repair_truncated_json`` fixes the OUTER tool-call
    object, but ``arguments`` is itself a JSON *string*, and a model that runs
    out of output budget mid-``content`` truncates that inner document too.
    This used to fail silently to ``{}`` â€” so ``write_file`` lost its ``path``
    and the loop answered "path is required".

    Measured 2026-08-11: a local builder spent all 36 tool turns emitting
    ``write_file`` and receiving ``path is required`` every single time, because
    a truncated inner payload discarded every argument including the ones that
    had arrived intact. Recovering the readable prefix turns that dead loop into
    a real write whose content is short â€” which the workspace diff then shows
    honestly, rather than a mission that produced nothing at all.
    """
    if isinstance(raw, dict):
        return raw
    if not isinstance(raw, str) or not raw.strip():
        return {}
    try:
        value = json.loads(raw)
        return value if isinstance(value, dict) else {}
    except ValueError:
        pass
    repaired = repair_truncated_json(raw)
    if repaired is not None:
        try:
            value = json.loads(repaired)
            if isinstance(value, dict):
                return value
        except ValueError:
            pass
    return {}


def workspace_diff(workspace: Path) -> str:
    """Capture working-tree changes, including newly created untracked files.

    Plain ``git diff`` omits untracked paths. Shared-loop builders create new
    files via ``write_file``; those must appear in the proposed diff or every
    new-file mission collapses to ``verification_apply: empty diff``.
    Pattern matches ``hub.cursor_builder._git_diff``: stage â†’ cached diff â†’ reset.
    """
    root = Path(workspace)
    add = _run_git(root, ["add", "-A", "--", "."])
    if add.returncode != 0:
        # Fall back to tracked-only diff rather than inventing emptiness silently.
        tracked = _run_git(root, ["diff", "--", "."])
        return tracked.stdout if tracked.returncode == 0 else ""
    cached = _run_git(root, ["diff", "--cached", "--", "."])
    _run_git(root, ["reset", "-q", "HEAD", "--", "."])
    if cached.returncode != 0:
        return ""
    return (cached.stdout or "").strip("\n")


def workspace_status(workspace: Path) -> str:
    result = _run_git(workspace, ["status", "--porcelain"])
    return result.stdout if result.returncode == 0 else result.stderr


def _is_meaningful_git_diff(result_text: str) -> bool:
    """True for real `git diff` evidence â€” not empty-output placeholders."""
    text = (result_text or "").strip()
    if not text or text.startswith("git ") or text.startswith("(exit "):
        return False
    return "diff --git" in text or text.startswith("diff") or "@@" in text


def run_engineering_loop(
    task: str,
    workspace: str | Path,
    chat_turn: ChatTurnFn,
    touch_allow: list[str] | None = None,
    max_turns: int = MAX_TOOL_TURNS,
    system_prompt: str = ENGINEERING_SYSTEM_PROMPT,
) -> EngineeringResult:
    """Provider-neutral tool loop. `chat_turn` is the only provider seam."""
    root = Path(workspace).resolve()
    if not root.is_dir():
        return EngineeringResult(False, "setup", f"workspace missing: {root}")

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": task},
    ]
    trace: list[str] = []
    summary = ""
    observed_diff = ""
    repeated: dict[str, int] = {}

    for turn in range(1, max_turns + 1):
        assistant = None
        last_err = None
        for attempt in range(3):
            try:
                assistant = chat_turn(messages, ENGINEERING_TOOLS)
                break
            except Exception as exc:  # adapter/transport â€” retry transient, else fail closed
                last_err = exc
                detail = str(exc)
                category = classify_transport_failure(detail)
                # Quota/auth/disabled/offline: fail closed so Auto (Frugal) can failover.
                if category in NO_IMMEDIATE_RETRY:
                    return EngineeringResult(
                        False,
                        "model",
                        f"chat_turn failed: {exc}",
                        turns=turn,
                        tool_trace=trace,
                        observed_diff=observed_diff,
                    )
                transient = any(
                    token in detail
                    for token in (
                        "HTTP 429",
                        "HTTP 503",
                        "ResourceExhausted",
                        "timed out",
                        "Timeout",
                        "provider error",
                        "unexpected response shape",
                        "returned no tool_calls",
                        "empty reply",
                    )
                )
                if not transient or attempt == 2:
                    return EngineeringResult(
                        False,
                        "model",
                        f"chat_turn failed: {exc}",
                        turns=turn,
                        tool_trace=trace,
                        observed_diff=observed_diff,
                    )
                import time as _time

                _time.sleep(2 * (attempt + 1))
        if assistant is None:
            return EngineeringResult(
                False,
                "model",
                f"chat_turn failed: {last_err}",
                turns=turn,
                tool_trace=trace,
                observed_diff=observed_diff,
            )

        if not isinstance(assistant, dict):
            return EngineeringResult(
                False, "model", "chat_turn returned non-dict", turns=turn, tool_trace=trace
            )

        content = assistant.get("content")
        tool_calls = assistant.get("tool_calls") or []
        messages.append(
            {
                "role": "assistant",
                "content": content,
                "tool_calls": tool_calls or None,
            }
        )

        if not tool_calls:
            # Protocol requires a tool every turn (finish ends the loop).
            # Empty tool_calls used to terminate early and skip remaining steps.
            messages.append(
                {
                    "role": "user",
                    "content": (
                        "Protocol error: you returned no tool_calls. "
                        "Emit the next tool call now. When every task step is "
                        "done, call finish. Do not return empty tool_calls."
                    ),
                }
            )
            continue

        finished = False
        for index, call in enumerate(tool_calls):
            function = call.get("function") or {}
            name = function.get("name") or call.get("name") or ""
            arguments = _parse_arguments(function.get("arguments", call.get("arguments")))
            call_id = call.get("id") or f"call_{turn}_{index}"

            if name == "finish":
                # A002-4: refuse hallucinated success. If the workspace is still
                # clean and no write/append succeeded, nudge the model to mutate
                # a real path instead of accepting finish â†’ empty proposed_diff.
                provisional = workspace_diff(root)
                had_successful_write = any(
                    t.startswith("write_file: wrote") or t.startswith("append_file: appended")
                    for t in trace
                )
                if not (provisional or "").strip() and not had_successful_write and not (
                    observed_diff or ""
                ).strip():
                    nudge = (
                        "finish rejected: workspace has no proposed diff and no "
                        "successful write_file/append_file yet. Call write_file "
                        "with a non-empty path under touch_allow (e.g. hub/window.py "
                        "and/or tests/...), then finish."
                    )
                    trace.append(f"finish: {nudge}")
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call_id,
                            "name": name,
                            "content": nudge,
                        }
                    )
                    messages.append({"role": "user", "content": nudge})
                    finished = False
                    break

                summary = execute_tool(name, arguments, root, touch_allow)
                trace.append(f"finish: {summary}")
                finished = True
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call_id,
                        "name": name,
                        "content": summary,
                    }
                )
                break

            result_text = execute_tool(name, arguments, root, touch_allow)
            if (
                name == "run_git"
                and isinstance(arguments.get("args"), list)
                and arguments["args"]
                and arguments["args"][0] == "diff"
                and _is_meaningful_git_diff(result_text)
                and not observed_diff
            ):
                # Preserve the first real diff; never overwrite with a later
                # empty-diff placeholder such as "(exit 0, empty output)".
                observed_diff = result_text

            # A model that cannot act on an error repeats it verbatim. Measured
            # 2026-08-11: a local builder spent every one of 36 turns on
            # "write_file: path is required" â€” thirteen minutes to produce the
            # same sentence 36 times. Escalate once with concrete guidance, then
            # stop and SAY WHY, instead of exhausting the budget in silence.
            signature = f"{name}:{result_text[:120]}"
            if _is_tool_error(result_text):
                repeated[signature] = repeated.get(signature, 0) + 1
                count = repeated[signature]
                if count == REPEAT_NUDGE_AT:
                    guidance = _repeat_guidance(name, result_text)
                    trace.append(f"loop-guard: nudged after {count}x {signature[:70]}")
                    messages.append({"role": "user", "content": guidance})
                elif count >= REPEAT_ABORT_AT:
                    trace.append(f"loop-guard: aborted after {count}x {signature[:70]}")
                    return EngineeringResult(
                        False,
                        "loop",
                        (
                            f"builder repeated the same failing tool call {count} times "
                            f"without adapting: {name} -> {result_text[:160]}"
                        ),
                        turns=turn,
                        tool_trace=trace,
                        observed_diff=observed_diff,
                    )
            else:
                repeated.pop(signature, None)

            trace.append(f"{name}: {result_text[:200]}")
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call_id,
                    "name": name,
                    "content": result_text,
                }
            )

        if finished:
            break
    else:
        # A002-5: turn limit must not discard successful workspace mutations.
        # Prior Claude run wrote hub/build_identity.py then failed "exceeded 24
        # tool turns without finish" with an empty proposed_diff.
        diff = workspace_diff(root)
        status = workspace_status(root)
        if not (diff or "").strip() and _is_meaningful_git_diff(observed_diff):
            diff = observed_diff
        if (diff or "").strip():
            return EngineeringResult(
                ok=True,
                stage="done",
                reason="",
                summary=(
                    f"tool turn limit ({max_turns}) reached; "
                    "proposed diff collected from workspace mutations"
                ),
                diff=diff,
                observed_diff=observed_diff or diff,
                git_status=status,
                turns=max_turns,
                tool_trace=trace,
            )
        return EngineeringResult(
            False,
            "loop",
            f"exceeded {max_turns} tool turns without finish",
            turns=max_turns,
            tool_trace=trace,
            observed_diff=observed_diff,
        )

    diff = workspace_diff(root)
    status = workspace_status(root)
    # Prefer tool-observed unified diff when final collection is still empty
    # (e.g. model restored files after capturing evidence).
    if not (diff or "").strip() and _is_meaningful_git_diff(observed_diff):
        diff = observed_diff
    return EngineeringResult(
        ok=True,
        stage="done",
        reason="",
        summary=summary,
        diff=diff,
        observed_diff=observed_diff or diff,
        git_status=status,
        turns=turn,
        tool_trace=trace,
    )


_JSON_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)


def repair_truncated_json(text: str) -> str | None:
    """Close a structurally-truncated JSON object. Returns repaired text, or None.

    Small local builders (qwen3, qwen2.5-coder, gpt-oss and friends) routinely
    emit a tool-call envelope that is correct except for one missing closing
    brace â€” measured 2026-08-11 against a real qwen3 endpoint::

        {"content": null, "tool_calls": [{"id": "call_1", ... "arguments": "..."}]}
                                        ^ this object is never closed  ^

    ``json.loads`` rejects it, the caller sees ``tool_calls: []``, and the
    engineering loop scores a valid tool call as "no tool_calls" â€” burning a
    turn. Repeated over a mission that produces exactly the observed failures:
    "exceeded 36 tool turns without finish" and "empty reply".

    This repair only ever APPENDS the closers the text already implies, never
    invents keys or values, and only runs after ``json.loads`` has failed â€” it
    can therefore turn a failure into a success, never a success into anything
    else. A payload whose damage is not purely structural still fails, and the
    caller falls back to treating the reply as prose exactly as before.
    """
    raw = (text or "").strip()
    if not raw.startswith("{"):
        return None

    closer_for = {"{": "}", "[": "]"}
    opener_for = {"}": "{", "]": "["}
    out: list[str] = []
    stack: list[str] = []
    in_string = False
    escaped = False
    inserted = 0  # bounded: a repair, not a rewrite

    for char in raw:
        if in_string:
            out.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
            out.append(char)
        elif char in "{[":
            stack.append(char)
            out.append(char)
        elif char in "}]":
            want = opener_for[char]
            # The dominant real-world shape: an inner object is never closed and
            # the model jumps straight to the outer closer ("...}]}" instead of
            # "...}}]}"). Close the stranded scopes, then honour this closer.
            while stack and stack[-1] != want and inserted < 8:
                out.append(closer_for[stack.pop()])
                inserted += 1
            if not stack or stack[-1] != want:
                return None  # genuinely mismatched, not merely unfinished
            stack.pop()
            out.append(char)
        else:
            out.append(char)

    if not stack and not in_string and not inserted:
        return None  # already balanced; damage is elsewhere

    repaired = "".join(out)
    if in_string:
        repaired += '"'
    # A truncation can strand a trailing comma or a dangling key ("foo": ).
    stripped = repaired.rstrip()
    if stripped.endswith(","):
        repaired = stripped[:-1]
    elif stripped.endswith(":"):
        repaired = stripped + " null"
    repaired += "".join(closer_for[opener] for opener in reversed(stack))

    try:
        json.loads(repaired)
    except ValueError:
        return None
    return repaired


def parse_tool_response_text(text: str) -> dict:
    """Best-effort adapter helper: pull an OpenAI-shaped assistant message from prose/JSON."""
    text = (text or "").strip()
    if not text:
        return {"role": "assistant", "content": "", "tool_calls": []}
    # Strip a single markdown fence if the model ignored the "JSON only" rule.
    fenced = re.match(r"^```(?:json)?\s*\n(.*?)```\s*$", text, re.DOTALL | re.IGNORECASE)
    if fenced:
        text = fenced.group(1).strip()
    try:
        data = json.loads(text)
    except ValueError:
        data = None
        match = _JSON_OBJECT_RE.search(text)
        if match:
            try:
                data = json.loads(match.group(0))
            except ValueError:
                data = None
        if data is None:
            # Structural truncation (one missing closer) is the dominant local
            # builder failure â€” repair it rather than discarding a real tool call.
            for candidate in (text, match.group(0) if match else None):
                if not candidate:
                    continue
                repaired = repair_truncated_json(candidate)
                if repaired is not None:
                    try:
                        data = json.loads(repaired)
                        break
                    except ValueError:
                        data = None
        if data is None:
            return {"role": "assistant", "content": text, "tool_calls": []}

    if isinstance(data, dict) and (data.get("tool_calls") or data.get("content") is not None):
        calls = data.get("tool_calls") or []
        # Normalize arguments that models emit as objects instead of JSON strings.
        normalized = []
        for call in calls:
            if not isinstance(call, dict):
                continue
            function = dict(call.get("function") or {})
            args = function.get("arguments")
            if isinstance(args, dict):
                function["arguments"] = json.dumps(args)
            normalized.append(
                {
                    "id": call.get("id") or f"call_{len(normalized)+1}",
                    "type": "function",
                    "function": {
                        "name": function.get("name") or call.get("name") or "",
                        "arguments": function.get("arguments") or "{}",
                    },
                }
            )
        return {
            "role": "assistant",
            "content": data.get("content"),
            "tool_calls": normalized,
        }
    if isinstance(data, dict) and data.get("name"):
        args = data.get("arguments") or {}
        if isinstance(args, dict):
            args = json.dumps(args)
        return {
            "role": "assistant",
            "content": None,
            "tool_calls": [
                {
                    "id": "call_1",
                    "type": "function",
                    "function": {"name": data["name"], "arguments": args},
                }
            ],
        }
    return {"role": "assistant", "content": text, "tool_calls": []}

