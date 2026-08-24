# V2-000F — Control Feedback audit

**Base:** `e9e8b33decb9484cce71c7bfa19c1b491962a124`, working tree clean, `HEAD == origin/main`.
**Classification:** `SHARED_SERVICE` / `PLATFORM_ONLY`. Not a Capability Block.

**Responsibility, whole:** convert one bounded mission and one bounded delegate
result into trustworthy machine-readable evidence, then return control to GPT.

`MISSION -> validated envelope -> bounded delegate result -> validated receipt ->
immutable run receipt -> LATEST pointer -> sync evidence -> WAIT_GPT`

No continuation authority. The service never decides whether the mission
succeeded; `result_claimed` is the delegate's claim and `next_state` is a schema
constant.

## File inventory

Eleven tracked files, 996 lines (229 of them tests), zero third-party dependencies. Every import:
`argparse`, `json`, `os`, `re`, `sys`, `tempfile`, `pathlib` — stdlib only. No
network, clock, environment, subprocess, thread, timer or random call exists in
the service (`PROVEN_ABSENT` by grep over the whole package).

| File | Purpose | Input | Output | State read | State written | Side effects | Failure mode | Test coverage | Necessary |
|---|---|---|---|---|---|---|---|---|---|
| `blocks/__init__.py` | package root | — | — | — | — | none | — | import-time | yes — package boundary |
| `control_feedback/__init__.py` | `SCHEMA_VERSION`, `NEXT_STATE` constants + contract docstring | — | 2 constants | — | — | none | — | every test | yes — single source of the two invariants |
| `validate.py` | JSON-Schema-subset validator | instance + schema dict | ordered error list | `schemas/*.json` | — | reads schema files | `SchemaError` on unsupported keyword; error list on invalid data | 4 envelope + all write paths | yes |
| `secrets.py` | credential denylist scan | serialized receipt text | matched pattern names | — | — | none | `SecretDetected` | DENY ×2, ALLOW ×6 | yes |
| `receipt.py` | build / atomic write / immutability / LATEST / sync stamp | envelope, delegate result, root, SHAs | run receipt, `LATEST.json`, sync stamp | `receipts/LATEST.json`, existence of target paths | `receipts/runs/**`, `receipts/LATEST.json`, `receipts/sync/**` | creates dirs, temp file, `os.replace`, fsync | `ReceiptError` — writes nothing | 20 tests | yes |
| `cli.py` | one process, one explicit action, one exit code | argv + file paths | JSON to stdout, exit 0/2/3 | input files | delegates to `receipt.py` | stdout only | refuses with exit 2; sync unproven exits 3 | 5 tests | yes |
| `schemas/mission_envelope.schema.json` | envelope contract | — | — | — | — | none | invalid envelope refused | 4 tests | yes |
| `schemas/receipt.schema.json` | receipt contract, `next_state` const | — | — | — | — | none | invalid receipt refused | 12 tests | yes |
| `schemas/sync_stamp.schema.json` | sync-proof contract | — | — | — | — | none | invalid stamp refused | 6 tests | yes |
| `tests/__init__.py` | test package | — | — | — | — | none | — | — | yes — discovery |
| `tests/test_control_feedback.py` | 30 deterministic tests | — | verdict | temp dirs | temp dirs only | none outside `TemporaryDirectory` | — | — | yes |

**Nothing was found unnecessary.** One piece of accidental complexity was removed:
a no-op `.lstrip("./")` on `receipt_ref` in `stamp_sync`. Output proven identical
(`receipts/runs/<MISSION>/<STAMP>.json`).

## Contract

- **Envelope in:** `schema_version`, `mission_id`, `objective`, `delegate`, `issued_by`, `issued_at`, optional `constraints`, `expected_proof`. `additionalProperties: false`.
- **Delegate result in:** exactly seven keys — `created_at`, `files_changed`, `commands_run`, `tests`, `evidence`, `result_claimed`, `blocker`. Missing or extra keys are refused by name.
- **Receipt out:** 17 required fields; `next_state` is `const "WAIT_GPT"`; `sync_status` ∈ `NOT_SYNCED | SYNCED | PUSH_FAILED`; `repo_sha`/`remote_sha` are 40-hex or null.
- **Sync stamp out:** `repo_sha`, `remote_sha`, `blocker`, `sync_status`, `verified_at`, `receipt_ref`, `remote`, `next_state`.
- **Exit codes:** `0` done · `2` refused (fail closed) · `3` remote sync not proven.
- **No defaults are invented:** every timestamp and SHA is supplied by the caller, so every receipt is reproducible.

## State ownership

| Artifact | Owner | Readers | Writers | Mutable | Referenced by |
|---|---|---|---|---|---|
| `receipts/runs/<MISSION>/<STAMP>.json` | the mission that produced it | anyone | written once, never again | **no** | `LATEST.json`, sync stamp `receipt_ref` |
| `receipts/LATEST.json` | Control Feedback | GPT, delegates | `emit` (full rewrite), `stamp-sync` (sync fields only) | yes, by design | the canonical single pointer |
| `receipts/sync/<REPO_SHA>.json` | the commit it attests | anyone | written once, never again | **no** | `repo_sha` |

`root` is always passed in explicitly. The service owns no path it was not given,
holds no ambient state, and reads no environment variable.

## The fifteen hard laws

| # | Law | Verdict | Evidence |
|---:|---|---|---|
| 1 | never decides mission success | `PROVEN_PRESENT` | `result_claimed` copied verbatim; `test_block_never_upgrades_a_claim` |
| 2 | never schedules | `PROVEN_ABSENT` | no timer/thread/cron import anywhere |
| 3 | never retries | `PROVEN_ABSENT` | no loop over an operation; the only loops iterate schema properties |
| 4 | never selects a model/provider | `PROVEN_ABSENT` | no AI, no provider, no network |
| 5 | never invokes fallback | `PROVEN_ABSENT` | every failure raises; nothing is caught to continue |
| 6 | never mutates historical receipts | `PROVEN_PRESENT` | `test_run_receipt_is_not_rewritten_by_stamping` |
| 7 | never overwrites an immutable run receipt | `PROVEN_PRESENT` | existence check; `test_run_receipt_is_immutable`, `test_duplicate_sync_stamp_is_refused` |
| 8 | never exposes secrets | `PROVEN_PRESENT` | payload scanned before every write; DENY ×2 and ALLOW ×6 |
| 9 | never claims sync without matching proven SHAs | `PROVEN_PRESENT` | `SYNCED` only when both are strings and equal; malformed-but-equal SHAs still refused by schema |
| 10 | always terminates at `WAIT_GPT` | `PROVEN_PRESENT` | schema `const`; no other value can be written |
| 11 | fails closed on invalid envelope/result/receipt | `PROVEN_PRESENT` | 8 refusal tests; root directory empty after refusal |
| 12 | atomic writes | `PROVEN_PRESENT` | temp file in the target directory, fsync, `os.replace`, directory fsync on POSIX |
| 13 | no temporary residue after success or failure | `PROVEN_PRESENT` | `test_atomic_write_leaves_no_temp_files` and `test_failed_atomic_replace_leaves_no_residue_and_no_target` |
| 14 | one canonical LATEST pointer | `PROVEN_PRESENT` | single path constant; corrupt or schema-invalid LATEST refused |
| 15 | preserves exact evidence provenance | `PROVEN_PRESENT` | `envelope_ref`, `receipt_ref`, per-file `sha256`, caller-supplied timestamps |

## Negative controls

Eight added this mission, twenty-two already present. Every rejection was
verified to leave the target directory empty or unchanged.

invalid envelope · unknown envelope property · malformed `issued_at` · missing
result field · unexpected result field · malformed receipt · immutable-receipt
overwrite · duplicate sync stamp · secret-shaped receipt · secret-shaped sync
blocker · mismatching SHAs · absent remote SHA · equal-but-malformed SHAs ·
corrupt `LATEST.json` · schema-invalid `LATEST.json` · malformed input file ·
simulated `os.replace` failure.

Two limits stated honestly: a crash between the run-receipt write and the
`LATEST.json` write leaves the immutable receipt on disk without the pointer
updated — evidence survives, the pointer lags, and re-running `emit` for the same
timestamp is refused rather than silently repaired. The same applies between the
sync stamp and its `LATEST.json` update. Neither can fabricate success.

## Popup investigation — read-only

`POPUP_CAUSE = NOT_FOUND (V2) / NOT_OBSERVED (host)`

- `othrys-v2` contains **no** `.bat`, `.cmd`, `.ps1`, `.vbs`, `.lnk` or task XML, and no reference to `schtasks`, `Register-ScheduledTask`, `RunOnce`, `CurrentVersion\Run` or a startup folder. `PROVEN_ABSENT`.
- Control Feedback has no timer, thread, scheduler, subprocess or network call. `PROVEN_ABSENT`.
- Across `C:\Users\othry\Projects` (depth 3) the launchers found are interactive Hub entry points — `OTHRYS.bat`, `run.bat`, `run_via_hub.bat`, `PUSH-ALL.bat`. None contains a 120-second or two-minute interval. `PROVEN_ABSENT` for a 2-minute loop in those scripts.
- Windows Task Scheduler, the registry `Run`/`RunOnce` keys, the Startup folder and the live process list are **`NOT_OBSERVED`**: this delegate runs in a Linux VM whose only visible paths are the two mounted folders. `/mnt/c` does not exist.

Nothing was modified or disabled. A host-side check is required to close this:
`schtasks /query /fo LIST /v`, `Get-ScheduledTask | ? {$_.State -eq "Ready"}`,
`Get-CimInstance Win32_StartupCommand`, and the Startup folder.

## Today's state check

All twelve statements verified true at this base: Control Feedback classified
`SHARED_SERVICE` / `PLATFORM_ONLY`; no current file asserts it is Block #1 (the
three matches are the corrections that say it is not); no live architecture uses
Socket/Capsule; `othrys-v2` is stated not to be an Oros; zero Capability Blocks
admitted; Block #2 forbidden; Single-History Law present as law 30; GPT state
records the merge base and both parents; Loop Laws present (328 lines);
Temporary Library's Block Stock shelf is empty; one Legacy Inventory with
`docs/LEGACY_INVENTORY.md` reduced to a pointer; immutable evidence for
V2-000A, V2-000A.1, V2-000B, V2-000C, V2-000C.R, V2-000D and V2-000E intact.

No control document needed correcting.
