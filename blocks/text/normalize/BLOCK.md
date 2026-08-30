## ID
`block.text.normalize`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE. Not ADMITTED. Not CERTIFIED. Not GOLDEN.

## PURPOSE
Normalize free text into deterministic lowercase search text by converting `-`, `_`, and `/` separators to spaces, collapsing whitespace, and trimming outer whitespace.

## PROVIDES
`normalizeText(input) -> string`

## STATE OWNERSHIP
NONE.

## NETWORK / SECRETS / PERMISSIONS
NONE.

## PROVENANCE
Adapted deterministically by OTHRYS Level 1 training job `L1-002` from the proven Prometheus `normalizeText` primitive in old Hub/Core. The original function supported word-aware capability matching and prevented raw-substring false positives. OTHRYS used stock reuse after bounded qwen3-builder task-fit failures.

## ADMISSION
Candidate only. Training proof and old-stock provenance do not automatically grant admission.
