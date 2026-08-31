## ID
`block.state.search-filter`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Durable canonical record storage with deterministic top-level scalar filtering and case-insensitive text search.

## PROVENANCE
L2-018: stock check surfaced the reviewed `candidate.data.search` concept but no admitted implementation. Qwen3.5 and Qwen3-Coder both timed out without result/source artifacts. Operator bounded recovery followed the declared contract. Talos initially rejected a fields-only query, but that fixture contradicted the contract (fields are only required when text is non-empty); the oracle was corrected after a focused probe. Final source and packaged Block 8/8 PASS.

## ADMISSION
Training proof never grants authority.
