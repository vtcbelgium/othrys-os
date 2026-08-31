## ID
`block.state.local-kv`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Bounded local JSON-backed key/value state with atomic mutation writes and corruption fail-closed semantics.

## PROVENANCE
L2-001. Initial local.qwen3-8b build was syntactically invalid and semantically incorrect for durable state. A bounded qwen3-8b repair produced NO_ATTEMPT_MUTATION. Qwen3-Coder-30B hard repair also failed to mutate because of malformed tool-call transport. After governed repair paths failed, operator-bounded recovery implemented the declared contract. Talos source 9/9 PASS and packaged candidate 9/9 PASS. Intervention is capability debt, not builder success.

## ADMISSION
Training proof never grants authority.
