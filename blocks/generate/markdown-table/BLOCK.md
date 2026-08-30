## ID
`block.generate.markdown-table`

## MATURITY
TRAINING_CANDIDATE only.

## PROVENANCE
L1-033: Qwen3.5 initial build scored 0/8 because scalar validation was inverted, columns came only from the first row, Markdown row delimiters were wrong, and empty input accessed records[0]. Qwen3-Coder hard repair produced no mutation. Operator bounded recovery implemented the exact contract. Final Talos 8/8 PASS. Record this as total first-pass semantic failure, heavy no-mutation repair, and intervention debt.
