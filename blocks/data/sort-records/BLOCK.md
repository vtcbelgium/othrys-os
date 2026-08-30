## ID
`block.data.sort-records`

## MATURITY
TRAINING_CANDIDATE only.

## PURPOSE
Stable deterministic multi-key record sorting without mutating caller data.

## PROVENANCE
L1-010: initial Qwen3.5 build 3/7. Qwen3-Coder attempted repair but left comparator direction wrong and froze caller records, violating non-mutation. Qwen3.5 follow-up produced no mutation. Operator performed the proven two-line correction only after builder repair paths failed. Final Talos 7/7. This intervention is capability debt and high-value training evidence, not builder success.
