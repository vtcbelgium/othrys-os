# @othrys-core/event-bus

The Othrys domain event bus: immutable domain events, a dispatcher, subscribers, and an
append-only store. **This is the package products consume** — the first supported seam between
othrys-core and the product repositories (othrys-web, vtc-platform).

Standalone, pure domain. No UI, no React, no Supabase, no HTTP, no vendor brand (Article 8).

Every significant platform action becomes an **immutable domain event** — a past-tense fact,
frozen at construction, appended to a log and delivered to subscribers. The goal: every
subsystem communicates through events instead of holding a direct dependency on another. A
module publishes `PhotoUploaded`; rewards / search / audit subscribe. Neither imports the other.

## Why this package exists

Before it, othrys-core was not distributed at all. Every consumer had to copy the source or
hand-write a shim, and both happened: `vtc-docs/event-bus` was a byte-identical fork, and
`vtc-platform/src/titan/eventBusCompat.js` is a hand-written adapter whose own comment says
*"swap this import for `@othrys-core/event-bus` once it is distributed as a package."*

This package is that swap. **Products must not copy Othrys source or maintain compatibility
shims** — they import this.

## Install and use

```bash
npm install @othrys-core/event-bus
```

```ts
import { InMemoryEventBus, LocalEventRepository, createEvent } from "@othrys-core/event-bus";

const bus = new InMemoryEventBus(new LocalEventRepository());

bus.subscribe("PhotoUploaded", (event) => {
  console.log(event.type, event.payload);
});

await bus.publish(createEvent("PhotoUploaded", { photoId: "p-1" }));
```

## Events (10 defined)

`CollectibleCreated` · `CollectibleUpdated` · `PhotoUploaded` · `PriceImported` ·
`CollectionCreated` · `WishlistChanged` · `MarketplaceListingCreated` · `BadgeAwarded` ·
`CreditGranted` · `SearchPerformed`

Each is a `DomainEvent<T>` — `id`, `type`, `occurredAt`, a typed `payload`, and `metadata`
(`actorId`, `aggregateId`, `correlationId`, `causationId`, `source`) for tracing and
choreography. Adding an event is one key in `EventPayloads` + `EVENT_TYPES`; nothing in the
dispatcher, store, or subscribers changes.

## Dispatch contract

`publish(event)`:

1. **Persist first** — append to the store; if it can't be stored, nothing is delivered and the
   publish rejects. The log is the source of truth.
2. **Deliver** — to every matching handler, in subscription order, awaiting async handlers.
3. **Isolate failures** — a throwing handler never stops the others and never fails the
   publisher; failures come back in `PublishResult.errors`. A bus fault must never disturb the
   application.

## Subscribers

A subsystem ships an `EventSubscriber` (`name`, `subscribedTo`, `handle`) and is wired once with
`registerSubscriber(bus, subscriber)`. Two references are included: an **audit trail** (wildcard
observer) and a **rewards** subscriber that answers `PhotoUploaded` by *publishing* a
`CreditGranted` (with `causationId` back to the upload) — choreography, not a direct call.

## Layout

```
src/
  domain/
    events.ts            # payloads, DomainEvent envelope, createEvent (deep-frozen)
    EventBus.ts          # EventBus + EventHandler + Subscription + EventSubscriber interfaces
    EventRepository.ts   # append-only event-store interface
  infra/
    InMemoryEventBus.ts     # the dispatcher (persist-first, isolate failures) — 100% covered
    LocalEventRepository.ts # in-memory append-only log (the only shipped store)
    repositoryProvider.ts   # the single store swap point
    busProvider.ts          # the single shared-bus access point
  subscribers/
    registerSubscriber.ts   # wire a declarative EventSubscriber onto the bus
    exampleSubscribers.ts   # audit trail (wildcard) + rewards (reacts by publishing)
  index.ts                  # public API barrel
```

## Commands

```bash
npm run build          # rm -rf dist && tsc -p tsconfig.build.json  → dist/ (ESM + .d.ts)
npm test               # vitest run — 32 tests
npm run typecheck      # tsc --noEmit (strict)
npm run test:coverage  # dispatcher at 100% (hard gate in vitest.config.ts)
```

The dev `tsconfig.json` is `noEmit` (typecheck + vitest only). `tsconfig.build.json` is the only
thing that produces a consumable artifact.

Source imports carry explicit `.js` extensions so the emitted ESM resolves in plain Node as well
as in bundlers (Vite for vtc-platform, Next.js for othrys-web). TypeScript maps `"./foo.js"`
back to `foo.ts` at compile time. **Keep the extensions** — dropping them silently produces
output Node cannot resolve. `dist/` is generated and git-ignored; `prepack` rebuilds it, so a
publish can never ship a stale artifact.

## Verified

- **Dispatching is 100% covered** — statements / branches / functions / lines on
  `InMemoryEventBus.ts`, enforced as a threshold gate.
- **Immutable events** — `events.test.ts` proves an event (and its payload) cannot be mutated
  after creation.
- **Consumable** — the built `dist/` has been imported and exercised from plain Node.

## Boundary

Othrys owns capability, never a customer's world. This package never depends on a product, and
a product never reaches past this surface into othrys-core internals.

---

*Part of [othrys-core](../../README.md). Roadmap: [MASTER-PLAN.md](../../MASTER-PLAN.md). The record never lies.*
