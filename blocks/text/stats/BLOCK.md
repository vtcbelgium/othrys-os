## ID
`block.text.stats`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE. Not ADMITTED. Not CERTIFIED. Not GOLDEN.

## PURPOSE
Deterministic text statistics: Unicode code-point character count, whitespace-delimited word count, and normalized line count.

## PROVIDES
`textStats(input) -> Object.freeze({chars, words, lines})`

## STATE / NETWORK / SECRETS / PERMISSIONS
NONE.

## PROVENANCE
Built by OTHRYS Level 1 job `L1-004`. Initial build exposed a null-case bug and an encoding-corrupted Talos fixture; a fresh governed rebuild passed 6/6.

## ADMISSION
Candidate only; no automatic admission.
