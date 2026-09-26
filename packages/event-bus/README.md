# @othrys-os/event-bus

Canonical OTHRYS domain-event distribution package. It provides immutable domain events, an in-memory dispatcher, subscribers, and a repository seam without UI, HTTP, Supabase, or product-specific network logic.

This package was migrated from the retired `othrys-core` lineage during Level 2.5. That lineage is provenance only; current ownership lives in `vtcbelgium/othrys-os` under `packages/event-bus`.

## Consume

Current first-party consumers use a checksum-pinned vendored tarball carrying package identity `@othrys-os/event-bus@0.1.1`. Public registry publication is not assumed by this README.

```ts
import { InMemoryEventBus, LocalEventRepository, createEvent } from "@othrys-os/event-bus";
```

Products consume the package seam; they do not copy platform source or depend on a sibling retired repository.

## Boundary

This package contains domain-event mechanics. Its current event payload map is product/domain oriented and its shipped `LocalEventRepository` is in-memory.

It is **not** the OTHRYS OS operational persistence ledger.

Canonical OS operational events use `runtime/os/event_ledger.mjs`, the `othrys.os.event.v1` envelope, and append-only streams under `.othrys/logs/` as governed by `docs/V2-010G/CHRONICLE_AND_LOG_LAW.md`.

This package grants no OTHRYS authority, does not route missions, does not own product state, and performs no remote network work by itself.

Current package identity: `@othrys-os/event-bus@0.1.1`.
