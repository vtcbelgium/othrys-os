## ID
`block.state.atomic-json-file`

## VERSION
`0.1.0-harvest`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Minimal reusable Node ESM JSON persistence primitive: missing-value reads, caller-supplied validation, temp-file plus rename replacement, clone boundaries and fail-closed corruption.

## PROVENANCE
Internal Level 2 harvest. The same mkdir/temp/write/rename/corruption pattern recurred across many CRUD, tracker, import/export and dashboard jobs. This candidate isolates that repeated persistence seam without owning domain validation.

## ADMISSION
Harvest proof never grants authority.