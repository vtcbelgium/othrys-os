## ID
`block.data.canonical-json`

## VERSION
`0.1.0-harvest`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Recursively canonicalize JSON-safe values with sorted object keys, array-order preservation, unsafe-key refusal and deterministic serialization.

## PROVENANCE
Internal Level 2 harvest. Repeated canonicalization and unsafe-key logic appears across durable state, import/export, dashboard and composition tasks. Extracted to reduce repeated hand-rolled serialization logic.

## ADMISSION
Harvest proof never grants authority.