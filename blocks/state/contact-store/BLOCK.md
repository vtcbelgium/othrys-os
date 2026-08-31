## ID
`block.state.contact-store`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Durable local contact CRUD with canonicalization, corruption refusal, atomic persistence and deep-cloned outputs.

## PROVENANCE
L2-005: Qwen3.5 first build was off-contract (Deno/nonexistent dependency). Its bounded repair regressed to wrong API/default export and hard-coded storage path. Qwen3-Coder hard repair timed out before a receipt was written, but left a complete bounded artifact in the allowed path. Talos independently proved that artifact 8/8 PASS. Record timeout-with-valid-artifact separately from clean worker success.

## ADMISSION
Training proof never grants authority.
