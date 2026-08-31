# CHANGELOG — @othrys-core/atlas-delivery-contract

## 0.1.0 — 2026-07-23

**WP-INT-03:** First npm publication of the Atlas delivery contract.

- Extracted browser-safe contract from `titan/atlas/dist-contract/`.
- Exports: validation, read model, traversals, drift, proof, overlays.
- Bundled `atlas-contract.json` + `contract-manifest.json` (contract v2, schema v1).
- othrys-web migrates from git-synced vendored copy to this package.
