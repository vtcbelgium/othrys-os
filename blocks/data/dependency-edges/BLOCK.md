## ID
`block.data.dependency-edges`

## VERSION
`0.1.0-harvest`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Derive deterministic root and dependency edges from visible nodes while refusing malformed identities and ignoring dependencies outside the visible set.

## PROVENANCE
VTC harvest from the pure Titan network derivation in `vtc-platform/src/titan/titanService.js::buildConnections`. Generalized from Titan/core terminology to arbitrary dependency graphs.

## ADMISSION
Harvest proof never grants authority.