# OTHRYS V2

Clean rebuild. One mission = one bounded change = one proof.

## Blocks

### `blocks/control_feedback`

Lets GPT control OTHRYS by reading a machine-readable receipt of every
delegated mission. It records evidence. It never decides whether a mission
succeeded.

Flow:

    MISSION ENVELOPE -> delegate result -> receipt -> push online -> WAIT_GPT

Contract:

| in  | mission envelope (`missions/*.json`), delegate result (JSON), repo root |
| out | immutable run receipt, canonical `receipts/LATEST.json`, sync stamp     |
| no  | AI, retries, fallback, scheduler, hidden state, clock reads, secrets    |

Artifacts:

- `receipts/runs/<MISSION_ID>/<TIMESTAMP>.json` — immutable. Written once;
  a second write to the same path is refused, never overwritten.
- `receipts/LATEST.json` — canonical pointer. Byte-identical to the run
  receipt at emit time; its sync fields are updated by `stamp-sync`.
- `receipts/sync/<REPO_SHA>.json` — immutable remote-sync proof.

Every receipt ends at `next_state = "WAIT_GPT"`. The block never selects,
schedules, or starts the next mission.

`sync_status` is `SYNCED` only when `repo_sha` and `remote_sha` are both
present and identical. Anything else is `NOT_SYNCED` and exits non-zero, so a
caller cannot mistake an unpushed state for a synchronized one.

## Usage

    python3 -m blocks.control_feedback.cli validate --kind envelope --file missions/V2-000A.json
    python3 -m blocks.control_feedback.cli emit --root . --envelope missions/V2-000A.json --result <result.json>
    python3 -m blocks.control_feedback.cli stamp-sync --root . --remote <url> \
        --repo-sha <sha> --remote-sha <sha> --verified-at <RFC3339Z>

Exit codes: `0` done, `2` refused (fail closed), `3` remote sync not proven.

Nothing here reads a clock or an environment variable. Timestamps and SHAs are
supplied by the caller so every receipt is reproducible.

## Tests

    python3 -m unittest discover -s blocks/control_feedback/tests -t .
