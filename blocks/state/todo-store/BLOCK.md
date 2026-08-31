## ID
`block.state.todo-store`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Durable local todo CRUD with strict persisted-state validation and atomic mutation.

## PROVENANCE
L2-003: Qwen3.5 first build reached 0/8 because persistence path handling, canonicalization and API semantics were wrong. Qwen3.5 bounded repair produced NO_ATTEMPT_MUTATION after touch-allow rejections. Qwen3-Coder hard repair mutated the module but regressed the contract: default export, hard-coded DB path, random IDs, eager writes and lost corruption semantics. After governed repair routes failed, operator bounded recovery restored the declared contract. Final Talos 8/8 PASS. Repair regression and operator intervention are explicit capability debt.

## ADMISSION
Training proof never grants authority.
