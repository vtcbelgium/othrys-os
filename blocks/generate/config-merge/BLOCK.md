## ID
`block.generate.config-merge`

## MATURITY
TRAINING_CANDIDATE only.

## PROVENANCE
L1-035: Qwen3.5 first build reached 2/8 with broken scalar validation and freezing order. Qwen3-Coder repair regressed the one-file contract by importing a missing helper. Qwen3.5 second repair produced no mutation. Talos fixtures were then reconciled with the declared null-prototype contract: strict deep-equality against normal-prototype literals was an oracle defect, so those assertions were changed to semantic JSON equality. Operator bounded recovery implemented the contract after governed repair paths failed. Final Talos 8/8 PASS. This job carries builder, repair-regression, oracle-correction, and intervention evidence.
