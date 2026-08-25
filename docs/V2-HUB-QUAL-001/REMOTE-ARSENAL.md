# V2 Remote Arsenal

Mission: `V2-HUB-QUAL-001`
Mode: qualification/control only. No V2 capability build is authorized by this document.

## Control doctrine

`GPT Control -> deterministic gate -> bounded remote tool -> external evidence -> PASS/FAIL/BLOCKED/STALL -> checkpoint`

Authority never grows on uncertainty. A transport being available does not grant mutation authority.

## A1 — Remote Desktop Commander — PRIMARY CONTROL TRANSPORT

Status: **ACTIVE / PROVEN**.

Route: `Phone -> GPT Control -> Remote Desktop Commander -> Jeroen-Legion`.

Proven: device online/auth valid; filesystem read/write; process launch/inspection; search; Git/PowerShell/Python invocation; transport recovery after a heartbeat timeout.

V2 authority: read state, run tests, operate qualification specimens, invoke Hub. Direct live-V2 capability mutation is **not authorized**.

Recovery rule: ping failure -> `list_devices` -> if online/auth-valid, classify transport hiccup and use a small command probe; if offline/auth-invalid, STOP.

## A2 — Hub read-only V2 intelligence

Status: **CERTIFIED READ-ONLY**.

Proven: `repo_intel`, repository context pack, branch/HEAD/dirty/remote truth, deterministic verification planning.

Authority: zero writes. Read-only work must not invoke a builder.

## A3 — Hub buildloop + qwen3-builder/Ollama

Status: **CERTIFIED IN THE ISOLATED QUALIFICATION SPECIMEN FOR SCRATCH CONSTRUCTION**.

Route: `GPT -> Hub buildloop -> disposable clone -> explicit qwen3-builder -> Ollama -> deterministic review`.

Proven: explicit builder identity binding; no hidden fallback; bounded stall; exact file/directory scope; dirty/base mismatch refusal; proposal isolation; Core/Hephaestus approval stop.

Authority: construct proposals in disposable clones only through the qualification specimen. The dirty live Hub has not yet received this safety patch. Live V2 Apply remains locked pending final promotion decision.

## A4 — Verified Apply primitive

Status: **CERTIFIED IN DISPOSABLE V2 CLONES ONLY**.

Proven: mission success required; approval/diff digest binding; base SHA binding; clean target; touch scope recheck; exact one-file Apply; second Apply refused after target becomes dirty; canonical Hephaestus path also passed.

Authority: no live V2 use yet.

## A5 — Private GitHub lifeline relay — INDEPENDENT FALLBACK

Status: **ACTIVE / INDEPENDENT FALLBACK PROVEN; AUTHORITY PROBE-ONLY**.

Route: `GPT -> private GitHub issue -> Legion watcher -> Hub -> qwen3-builder -> disposable proof -> GitHub result -> GPT`.

Command contract is exact-only and author-bound. Live mutation is disabled.

Proven independently: GPT created private GitHub issue #6 directly, without Commander initiating the command; the Legion watcher executed the exact scratch probe and returned PASS. Malformed issue #4 failed closed with BODY_NOT_JSON; corrected issue #5 and GPT-direct issue #6 both completed in disposable workspaces with live_repo_mutated=false.

Authority: `scratch_builder_probe` only until separately widened and requalified.

## A6 — Local builder fleet

Primary mechanical actuator: `qwen3-builder` -> Ollama `qwen3:8b`.

Rule: explicit builder object is identity-bound end to end. Requested unavailable builder -> STOP; no provider substitution.

## Remote authority ladder

1. `READ_STATE` — certified.
2. `RUN_TESTS` — certified.
3. `BUILD_SCRATCH_PROPOSAL` — certified through the isolated qualification Hub specimen; live-Hub promotion pending.
4. `REVIEW_PROPOSAL` — certified.
5. `VERIFIED_APPLY_TO_DISPOSABLE_CLONE` — certified.
6. `APPLY_TO_LIVE_V2` — **LOCKED**.
7. `COMMIT_LIVE_V2` — **LOCKED**.
8. `PUSH_LIVE_V2` — **LOCKED**.

## Mandatory preflight for any future live construction

V2 clean; local HEAD == origin/main == expected base; remote binding matches; exact mission/correlation IDs frozen; explicit builder frozen; fallback false; touch allow canonicalized; verification frozen; proposal produced in scratch; approval binds exact diff digest; target rechecked immediately before Apply.

## Evidence location

Canonical campaign ledger: `docs/V2-HUB-QUAL-001/EVIDENCE.jsonl`
Current campaign state: `docs/V2-HUB-QUAL-001/STATUS.md`
