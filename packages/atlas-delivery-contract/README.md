# @othrys-core/atlas-delivery-contract

The Othrys **Atlas delivery contract**: versioned graph schema, validation, read model,
traversals, drift detection, proof ledger, and the pinned architecture snapshot.
**This is the package products consume** — the second supported seam between othrys-core
and product repositories (othrys-web).

Contract-only: no collector, no filesystem access, no vault, no broker, no runtime business
logic. othrys-core generates truth; products validate and render it.

## Why this package exists

Before it, othrys-web vendored `dist-contract/` via git sync (`npm run atlas:sync`).
That worked but duplicated truth, required a sibling checkout, and had no npm boundary test.
This package is the swap — same contract, canonical npm distribution.

## Install and use

```bash
npm install @othrys-core/atlas-delivery-contract
```

```ts
import contractJson from "@othrys-core/atlas-delivery-contract/atlas-contract.json";
import manifestJson from "@othrys-core/atlas-delivery-contract/contract-manifest.json";
import {
  validateContract,
  freshness,
  Atlas,
  dependencies,
  type AtlasContract,
} from "@othrys-core/atlas-delivery-contract";

const result = validateContract(contractJson);
if (!result.ok) throw new Error(result.issues.join("; "));

const atlas = new Atlas({
  generatedAt: result.contract.generatedAt,
  nodes: result.contract.nodes,
  edges: result.contract.edges,
  schemaVersion: result.contract.schemaVersion,
  summary: { /* derived from contract */ },
});

const deps = dependencies(atlas, "othrys:othrys");
```

## What ships

| Export | Contents |
|---|---|
| `.` | Types, validation, read model, traversals, drift, proof, overlays |
| `./atlas-contract.json` | Pinned architecture snapshot (~329 KB graph + summaries) |
| `./contract-manifest.json` | sha256 manifest + othrys-core revision provenance |

## Commands

```bash
npm run sync       # refresh src/ from ../atlas/dist-contract/ (after atlas:publish)
npm run build      # tsc → dist/ + copy JSON
npm test           # vitest — contract consumer tests
npm run typecheck  # strict, noEmit
```

Run `npm run sync` in othrys-core after every `npm run atlas:publish`, then bump version
and release. The sync script is mechanical — never hand-edit `src/`.

## Boundary

- **In scope:** shared types, schemas, validation, serialization, read model, pinned data.
- **Out of scope:** collector, generator, HTML renderer, vault, broker, application UI.

Products must not copy Othrys Atlas source or maintain a vendored `lib/atlas/contract/`.

---

*Part of [othrys-core](../../README.md). ADR: [ADR-0046](../adr/ADR-0046-atlas-delivery-contract.md).*
