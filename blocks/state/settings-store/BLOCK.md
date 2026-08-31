## ID
`block.state.settings-store`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Validated defaults plus durable local overrides with atomic persistence and fail-closed corruption handling.

## PROVENANCE
L2-002: Qwen3.5 first build failed at module load by importing nonexistent util.deepClone and also conflated defaults with persisted overrides. First repair escaped the workspace through an old perimeter link and was rejected. Qwen3-Coder hard repair timed out without mutation. Operator bounded recovery followed only after governed repair paths failed. Final Talos 9/9 PASS. Operator recovery is explicit capability debt, not builder success.

## ADMISSION
Training proof never grants authority.
