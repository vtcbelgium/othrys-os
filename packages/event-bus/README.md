# @othrys-os/event-bus

Canonical OTHRYS OS domain-event distribution package. It provides immutable domain events, an in-memory dispatcher, subscribers, and append-only local event storage without UI, HTTP, Supabase, or product-specific logic.

This package was migrated from the retired `othrys-core` lineage during Level 2.5. That lineage is provenance only; current ownership lives in `vtcbelgium/othrys-os` under `packages/event-bus`.

## Consume

Current first-party consumers use a checksum-pinned vendored tarball carrying package identity `@othrys-os/event-bus@0.1.1`. Public registry publication is not assumed by this README.

```ts
import { InMemoryEventBus, LocalEventRepository, createEvent } from "@othrys-os/event-bus";
```

Products consume the package seam; they do not copy platform source or depend on a sibling retired repository.

## Boundary

The package contains domain-event mechanics only. It grants no OTHRYS authority, does not route missions, does not own product state, and performs no remote network work by itself.

Current package identity: `@othrys-os/event-bus@0.1.1`.
