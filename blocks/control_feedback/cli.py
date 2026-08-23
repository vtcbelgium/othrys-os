"""Control Feedback CLI. One process, one explicit action, one exit code.

    validate    --kind {envelope,receipt,sync_stamp} --file PATH
    emit        --root PATH --envelope PATH --result PATH [--envelope-ref REF]
    stamp-sync  --root PATH --remote URL --repo-sha SHA --verified-at RFC3339Z
                [--remote-sha SHA]   omit when the push did not land

Exit codes
    0  action completed
    2  refused: invalid input, invalid output, or credential-shaped content
    3  remote sync not proven (repo_sha != remote_sha, or a SHA is missing)

No defaults are invented: every timestamp and SHA is supplied by the caller.
"""

import argparse
import json
import os
import sys
from pathlib import Path

from . import receipt as receipt_module
from .secrets import SecretDetected
from .validate import SchemaError, load_schema, validate

EXIT_OK = 0
EXIT_REFUSED = 2
EXIT_NOT_SYNCED = 3

KINDS = {"envelope": "mission_envelope", "receipt": "receipt", "sync_stamp": "sync_stamp"}


def _load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _emit(payload):
    sys.stdout.write(json.dumps(payload, indent=2, sort_keys=True) + "\n")


def cmd_validate(args):
    errors = validate(_load_json(args.file), load_schema(KINDS[args.kind]))
    if errors:
        _emit({"valid": False, "kind": args.kind, "file": args.file, "errors": errors})
        return EXIT_REFUSED
    _emit({"valid": True, "kind": args.kind, "file": args.file})
    return EXIT_OK


def cmd_emit(args):
    envelope = _load_json(args.envelope)
    result = _load_json(args.result)
    envelope_ref = args.envelope_ref
    if envelope_ref is None:
        envelope_ref = os.path.relpath(args.envelope, args.root).replace(os.sep, "/")
    built = receipt_module.build_receipt(envelope, result, envelope_ref)
    run_path, latest_path = receipt_module.write_receipt(args.root, built)
    _emit(
        {
            "receipt_id": built["receipt_id"],
            "run_receipt": str(run_path),
            "latest": str(latest_path),
            "result_claimed": built["result_claimed"],
            "sync_status": built["sync_status"],
            "next_state": built["next_state"],
        }
    )
    return EXIT_OK


def cmd_stamp_sync(args):
    stamp, stamp_path = receipt_module.stamp_sync(
        args.root, args.remote, args.repo_sha, args.remote_sha, args.verified_at, args.blocker
    )
    _emit(
        {
            "stamp": str(stamp_path),
            "remote": stamp["remote"],
            "repo_sha": stamp["repo_sha"],
            "remote_sha": stamp["remote_sha"],
            "blocker": stamp["blocker"],
            "sync_status": stamp["sync_status"],
            "next_state": stamp["next_state"],
        }
    )
    return EXIT_OK if stamp["sync_status"] == "SYNCED" else EXIT_NOT_SYNCED


def build_parser():
    parser = argparse.ArgumentParser(prog="control_feedback", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p_validate = sub.add_parser("validate", help="validate one document")
    p_validate.add_argument("--kind", required=True, choices=sorted(KINDS))
    p_validate.add_argument("--file", required=True)
    p_validate.set_defaults(func=cmd_validate)

    p_emit = sub.add_parser("emit", help="write a receipt from envelope + delegate result")
    p_emit.add_argument("--root", required=True)
    p_emit.add_argument("--envelope", required=True)
    p_emit.add_argument("--result", required=True)
    p_emit.add_argument("--envelope-ref", default=None)
    p_emit.set_defaults(func=cmd_emit)

    p_stamp = sub.add_parser("stamp-sync", help="record remote sync evidence")
    p_stamp.add_argument("--root", required=True)
    p_stamp.add_argument("--remote", required=True)
    p_stamp.add_argument("--repo-sha", required=True)
    p_stamp.add_argument("--remote-sha", default=None)
    p_stamp.add_argument("--verified-at", required=True)
    p_stamp.add_argument("--blocker", default=None)
    p_stamp.set_defaults(func=cmd_stamp_sync)

    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (receipt_module.ReceiptError, SecretDetected, SchemaError) as error:
        _emit({"refused": type(error).__name__, "detail": str(error)})
        return EXIT_REFUSED


if __name__ == "__main__":
    sys.exit(main())
