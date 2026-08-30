## ID
`block.data.json-format`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE. Not ADMITTED. Not CERTIFIED. Not GOLDEN.

## PURPOSE
Deterministic JSON pretty formatting and minification with native parse errors and explicit mode validation.

## PROVIDES
`jsonFormat(input, mode = "pretty") -> string`

## STATE / NETWORK / SECRETS / PERMISSIONS
NONE.

## PROVENANCE
Built by OTHRYS Level 1 job `L1-006`. Initial build passed 5/6 Talos tests but incorrectly converted unsupported-mode RangeError into generic Error. Talos drove one bounded repair. Final proof: 6/6 PASS.

## ADMISSION
Candidate only; training success never auto-admits.
