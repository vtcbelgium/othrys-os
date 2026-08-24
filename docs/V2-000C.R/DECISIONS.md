# V2-000C.R — Doctrine reconciliation

Ratified by GPT. Resolves C1–C5 raised by `docs/V2-000C/CONTRADICTIONS.md`.
Doctrine correction only: no feature was built, no architecture was expanded,
no legacy repository was touched.

Authority order for V2: running evidence > tests > Accepted ADRs / ratified
doctrine > current docs > historical material > conversation and model memory.

## C1 — Control Feedback — RESOLVED

Control Feedback is **not** a Capability Block. Classification:
**`SHARED_SERVICE` / `PLATFORM_ONLY`** (Book of Blocks §0.6, §0.7).

Implementation and tests are preserved unchanged. It is a V2 control-plane
service: it records mission evidence for GPT and holds no product capability.

**Technical debt, recorded not repaired:** it currently lives at
`blocks/control_feedback/`. That path is a V2 artefact from V2-000A and does
**not** make it a Block, and does not license redefining Block. Physical
relocation is a separate mission; nothing depends on the rename today.

## C2 — SOCKET / CAPSULE — RESOLVED

Neither term enters V2 Block or Oros architecture. Neither exists in senior
Block doctrine.

- A typed, versioned attachment point is a **PORT** (Book of Blocks §0.2), and
  only where a canonical Block Port is actually meant.
- A Block's executable body is the **Block directory** (`othrys-blocks/docs/CONVENTION.md`).
- **Mycelium already owns "capsule"** (`CONTEXT_CAPSULE*.md`) for agent context
  payloads. V2 must not overload it.

No replacement abstraction is invented to preserve the proposed shape. The
shape was the error.

## C3 — Oros Zero — RESOLVED

`C:\Users\othry\Projects\oros\oros-zero` is *the* Oros Zero specimen
(PENTA-001, 2026-08-23): `kind: proving-oros`, disposable, bound to
`capability.media.image-prep`, workspace convention `<projects>/oros/<slug>`.
Its own README forbids it becoming "a place to add Block #2".

V2 references it. V2 does not create another, and did not modify it.

## C4 — othrys-v2 is not an Oros — RESOLVED

ADR-0050 remains binding: an Oros is a sovereign governed product world
allocated to a customer, product, organisation or individual, with exactly one
canonical Blueprint.

`othrys-v2` is control-plane / controller machinery. It gets **no** Oros
identity, **no** Blueprint, and does not become a product world. Product and
Oros architecture stays outside this repository unless later ratified law says
otherwise.

## C5 — Book of GPT terminology — RESOLVED

`BOOK_OF_GPT.md` law 12 was **BLOCKS**; it is now **COMPONENTS**, and V2 units
are components / services / modules / controls / adapters. No new generic
architecture noun was created.

Law 16 **BEFORE NEW CODE** was added: check the Legacy Inventory and senior
canon, reuse before build, BLOCK is reserved for canonical product-capability
Blocks, control-plane machinery is not a Block unless senior Block law says so,
othrys-v2 is control plane and not an Oros, and canonical vocabulary is not to
be given synonyms.

The Book of GPT no longer conflicts with senior Block doctrine.

## Classification map

Ratified as a map only. Nothing here is implemented by this mission.

```
GPT
  ↓
V2 CONTROL PLANE            (othrys-v2 — not an Oros)
  ↓
shared / control services   (Control Feedback: SHARED_SERVICE / PLATFORM_ONLY)
  ↓
mission / delegation boundary
  ↓
OTHRYS product world
  ↓
Oros                        (ADR-0050; e.g. oros/oros-zero)
  ↓
Blueprint                   (exactly one per Oros)
  ↓
Capability Blocks           (Book of Blocks §0.1; othrys-blocks)
  ↓
Ports                       (Book of Blocks §0.2)
```

## Canon drift

Recorded in `docs/LEGACY_INVENTORY.md`. Not repaired: no worktree merged, no
legacy repository modified, no large legacy document copied into V2.
