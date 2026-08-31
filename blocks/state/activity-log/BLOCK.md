## ID
`block.state.activity-log`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Bounded durable activity feed with monotonic sequence numbers, duplicate protection, canonical JSON, atomic persistence and fail-closed corruption handling.

## PROVENANCE
L2-021: Qwen3.5 and Qwen3-Coder first routes both failed to mutate because tool paths were malformed. A path-pinned Qwen3-Coder attempt emitted an `ok:true` artifact but violated the Node/API/persistence contract. Operator bounded recovery followed only after governed routes were exhausted. Talos source 6/6 PASS and packaged candidate 6/6 PASS.

## ADMISSION
Training proof never grants authority.
