## ID
`block.storage.filename-sanitizer`
## MATURITY
TRAINING_CANDIDATE only.
## PROVENANCE
L1-022: stock check found no direct reusable primitive. Qwen3.5 first build 8/9. Its repair catastrophically regressed to 1/9 while still mutating successfully. Qwen3-Coder 30B restored the full contract and reached 9/9. Strong evidence that mutation success != semantic progress; Talos regression gates are essential.
