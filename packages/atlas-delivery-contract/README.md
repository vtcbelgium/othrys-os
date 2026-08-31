# @othrys-os/atlas-delivery-contract

Canonical OTHRYS OS Atlas projection delivery package. It carries the versioned graph contract, validation helpers, read-model/traversal logic, drift/freshness helpers, and the pinned projection payload consumed by web surfaces.

This package was migrated from the retired `othrys-core` lineage during Level 2.5. Historical contract provenance remains preserved inside the delivered artifacts, but current ownership lives in `vtcbelgium/othrys-os` under `packages/atlas-delivery-contract`.

## Consume

Current first-party consumers use a checksum-pinned vendored tarball carrying package identity `@othrys-os/atlas-delivery-contract@0.1.1`. Public registry publication is not assumed by this README.

```ts
import contractJson from "@othrys-os/atlas-delivery-contract/atlas-contract.json";
import manifestJson from "@othrys-os/atlas-delivery-contract/contract-manifest.json";
import { Atlas, freshness, validateContract } from "@othrys-os/atlas-delivery-contract";
```

Consumers validate and render this delivery contract. They do not regenerate institutional truth, reach into retired sibling repositories, or treat the package as execution authority.

## Boundary

Contract-only distribution: no collector, filesystem authority, secret broker, mission execution, or product mutation. Current package identity: `@othrys-os/atlas-delivery-contract@0.1.1`.
