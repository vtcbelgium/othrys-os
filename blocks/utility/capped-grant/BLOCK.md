## ID
`block.utility.capped-grant`

## VERSION
`0.1.0-harvest`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Compute a deterministic bounded grant from requested amount, total cap and already-used allowance.

## PROVENANCE
VTC harvest from the daily-capped credit award path in `vtc-platform/api/credits.js`. Generalized away from coins, membership and database concerns.

## ADMISSION
Harvest proof never grants authority.