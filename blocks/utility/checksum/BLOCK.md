## ID
`block.utility.checksum`
## MATURITY
TRAINING_CANDIDATE only.
## PROVENANCE
L1-021: Qwen3.5 implementation was correct first pass. Initial Talos suite falsely failed base64 due to a wrong expected oracle. Independent node:crypto + hex-to-base64 reconciliation proved builder output correct; test oracle corrected. Final 8/8. This is high-value verifier-quality evidence: Talos itself must be challengeable by independent proof.
