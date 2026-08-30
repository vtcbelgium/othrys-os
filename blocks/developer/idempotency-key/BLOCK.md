## ID
`block.developer.idempotency-key`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Stable SHA-256 idempotency keys from recursively canonicalized request fields.

## PROVENANCE
L1-030: Qwen3.5 initial build reached 7/8. Its bounded repair produced no mutation. Qwen3-Coder hard repair destructively replaced the module and removed the required export. After both governed repair routes failed, an operator bounded recovery restored the original worker diff and added the single proven finite-number guard. Final Talos 8/8 PASS. Record the intervention as repair-regression/capability debt, not builder success.

## ADMISSION
Training proof never grants authority.
