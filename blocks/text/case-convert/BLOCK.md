## ID
`block.text.case-convert`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE. Not ADMITTED. Not CERTIFIED. Not GOLDEN.

## PURPOSE
Deterministic conversion between lower, upper, title, sentence, camel, pascal, snake and kebab case using one shared word tokenizer.

## PROVIDES
`convertCase(input, mode) -> string`

## STATE / NETWORK / SECRETS / PERMISSIONS
NONE.

## PROVENANCE
Built and repaired by OTHRYS Level 1 job `L1-005`. The first build duplicated faulty tokenization logic; Talos drove a shared-tokenizer repair. Final proof: 10/10 PASS. One Talos sentence fixture was corrected because it contradicted the declared lower-to-uppercase boundary rule.

## ADMISSION
Candidate only; training success never auto-admits.
