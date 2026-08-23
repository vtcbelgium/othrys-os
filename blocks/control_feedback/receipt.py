"""Atomic receipt writer.

Contract
    inputs : mission envelope (validated), delegate result (explicit dict), root
    outputs: one immutable run receipt + the canonical LATEST.json
    never  : decide mission success, retry, schedule, read a clock, read env

The block records evidence. `result_claimed` is the delegate's claim, not a
verdict. `next_state` is always WAIT_GPT.
"""

import json
import os
import tempfile
from pathlib import Path

from . import NEXT_STATE, SCHEMA_VERSION
from . import secrets as secret_guard
from .validate import load_schema, validate

RESULT_KEYS = frozenset(
    {
        "created_at",
        "files_changed",
        "commands_run",
        "tests",
        "evidence",
        "result_claimed",
        "blocker",
    }
)

LATEST_NAME = "LATEST.json"


class ReceiptError(Exception):
    """Refused. Nothing was written."""


def canonical_json(obj):
    return json.dumps(obj, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def atomic_write(path, text):
    """Write via temp file + rename in the same directory. No partial files."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, tmp_name = tempfile.mkstemp(
        dir=str(path.parent), prefix=".tmp-", suffix=".json"
    )
    try:
        with os.fdopen(handle, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(text)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp_name, str(path))
    except BaseException:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)
        raise
    return path


def _compact_stamp(created_at):
    return created_at.replace("-", "").replace(":", "")


def build_receipt(envelope, result, envelope_ref):
    """Pure function: envelope + delegate result -> receipt dict."""
    envelope_errors = validate(envelope, load_schema("mission_envelope"))
    if envelope_errors:
        raise ReceiptError("invalid mission envelope: %s" % "; ".join(envelope_errors))

    provided = set(result)
    if provided != set(RESULT_KEYS):
        raise ReceiptError(
            "delegate result keys mismatch: missing=%s unexpected=%s"
            % (sorted(RESULT_KEYS - provided), sorted(provided - RESULT_KEYS))
        )

    receipt = {
        "schema_version": SCHEMA_VERSION,
        "receipt_id": "%s--%s"
        % (envelope["mission_id"], _compact_stamp(result["created_at"])),
        "mission_id": envelope["mission_id"],
        "envelope_ref": envelope_ref,
        "objective": envelope["objective"],
        "delegate": envelope["delegate"],
        "created_at": result["created_at"],
        "files_changed": result["files_changed"],
        "commands_run": result["commands_run"],
        "tests": result["tests"],
        "evidence": result["evidence"],
        "result_claimed": result["result_claimed"],
        "blocker": result["blocker"],
        "repo_sha": None,
        "remote_sha": None,
        "sync_status": "NOT_SYNCED",
        "next_state": NEXT_STATE,
    }

    receipt_errors = validate(receipt, load_schema("receipt"))
    if receipt_errors:
        raise ReceiptError("invalid receipt: %s" % "; ".join(receipt_errors))
    return receipt


def run_receipt_path(root, receipt):
    return (
        Path(root)
        / "receipts"
        / "runs"
        / receipt["mission_id"]
        / ("%s.json" % _compact_stamp(receipt["created_at"]))
    )


def write_receipt(root, receipt):
    """Validate, guard, then write the immutable run receipt and LATEST.json."""
    errors = validate(receipt, load_schema("receipt"))
    if errors:
        raise ReceiptError("refusing to write invalid receipt: %s" % "; ".join(errors))

    payload = canonical_json(receipt)
    secret_guard.assert_clean(payload)

    run_path = run_receipt_path(root, receipt)
    if run_path.exists():
        raise ReceiptError("run receipt already exists, refusing to mutate: %s" % run_path)

    latest_path = Path(root) / "receipts" / LATEST_NAME
    atomic_write(run_path, payload)
    atomic_write(latest_path, payload)
    return run_path, latest_path


def read_latest(root):
    latest_path = Path(root) / "receipts" / LATEST_NAME
    if not latest_path.is_file():
        raise ReceiptError("no LATEST.json at %s" % latest_path)
    latest = json.loads(latest_path.read_text(encoding="utf-8"))
    errors = validate(latest, load_schema("receipt"))
    if errors:
        raise ReceiptError("LATEST.json is invalid: %s" % "; ".join(errors))
    return latest


def stamp_sync(root, remote, repo_sha, remote_sha, verified_at, blocker=None):
    """Record remote-sync evidence for the current LATEST receipt.

    SYNCED is recorded only when both SHAs are present and identical. The block
    does not push, does not retry, and does not interpret a mismatch as success.
    Returns (stamp, stamp_path). Caller decides what to do with sync_status.
    """
    latest = read_latest(root)

    synced = (
        isinstance(repo_sha, str)
        and isinstance(remote_sha, str)
        and repo_sha == remote_sha
    )
    stamp = {
        "schema_version": SCHEMA_VERSION,
        "mission_id": latest["mission_id"],
        "receipt_ref": str(
            run_receipt_path(".", latest).as_posix()
        ).lstrip("./"),
        "remote": remote,
        "repo_sha": repo_sha,
        "remote_sha": remote_sha,
        "blocker": blocker,
        "sync_status": "SYNCED" if synced else "NOT_SYNCED",
        "verified_at": verified_at,
        "next_state": NEXT_STATE,
    }

    errors = validate(stamp, load_schema("sync_stamp"))
    if errors:
        raise ReceiptError("refusing to write invalid sync stamp: %s" % "; ".join(errors))

    payload = canonical_json(stamp)
    secret_guard.assert_clean(payload)

    stamp_path = (
        Path(root)
        / "receipts"
        / "sync"
        / ("%s.json" % (repo_sha if isinstance(repo_sha, str) else "unknown"))
    )
    if stamp_path.exists():
        raise ReceiptError("sync stamp already exists, refusing to mutate: %s" % stamp_path)
    atomic_write(stamp_path, payload)

    latest["repo_sha"] = repo_sha
    latest["remote_sha"] = remote_sha
    latest["sync_status"] = stamp["sync_status"]
    latest_errors = validate(latest, load_schema("receipt"))
    if latest_errors:
        raise ReceiptError("refusing to write invalid LATEST.json: %s" % "; ".join(latest_errors))
    atomic_write(Path(root) / "receipts" / LATEST_NAME, canonical_json(latest))
    return stamp, stamp_path
