## ID
`block.utility.threshold-ladder`

## VERSION
`0.1.0-harvest`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Resolve a numeric score against a strictly increasing threshold ladder and return current rung, next rung and normalized progress.

## PROVENANCE
VTC harvest from the XP-level logic in `vtc-platform/src/Badges.jsx` and `api/xp.js`. Generalized from XP to any deterministic threshold ladder.

## ADMISSION
Harvest proof never grants authority.