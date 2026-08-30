## ID
`block.developer.env-metadata`
## MATURITY
TRAINING_CANDIDATE only.
## SECURITY
Names/presence only. Never expose values.
## PROVENANCE
L1-027: Qwen3.5 first build 6/8. Qwen3-Coder repair catastrophically regressed to 3/8 and introduced forbidden filesystem/createRequire code despite a no-I/O contract. Operator replaced the bounded parser after repair paths failed. Final Talos 8/8 including explicit secret non-leakage. Treat as high-value security/repair-regression evidence.
