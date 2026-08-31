## ID
`block.state.journal`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Append-only local JSONL journal with deterministic event validation, duplicate-ID refusal and corruption fail-closed behavior.

## PROVENANCE
L2-016: stock check found archived journal-schema evidence but no directly reusable admitted implementation. Qwen3.5 build timed out with no result/source artifact. Qwen3-Coder hard build also timed out with no result/source artifact. After both governed builder routes failed, operator bounded recovery implemented only the declared contract. Talos source and packaged Block both 7/7 PASS.

## ADMISSION
Training proof never grants authority.
