## ID
`block.utility.relative-time`

## VERSION
`0.1.0-harvest`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Produce deterministic relative-time labels from explicit past and current timestamps, avoiding hidden wall-clock dependence.

## PROVENANCE
VTC harvest from `vtc-platform/src/forum/forumConfig.js::timeAgo`. Adapted to require explicit `nowIso` so tests and OTHRYS execution remain deterministic; old dates return stable ISO date labels rather than locale-dependent output.

## ADMISSION
Harvest proof never grants authority.