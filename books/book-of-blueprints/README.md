# The Book of Blueprints

**Status:** CANONICAL HOUSE MAP — desired-state product contract.

## Definition
A **Blueprint** is the single canonical governing description of what one Oros is intended to be. It expresses desired product outcomes and constraints without pretending to be the implementation or the running product.

## Blueprint owns
A Blueprint may declare:
- product identity, objective and venture constraints;
- desired capabilities and user-observable outcomes;
- required / optional / forbidden capability needs;
- runtime, data, privacy, authority, accessibility and operational constraints;
- reuse policy (`must_reuse`, `may_reuse`, `product_specific`);
- eligible Block ranges and eligible Bridge classes where evidence permits them;
- explicit gaps when no eligible reusable capability exists.

## Blueprint does not own
It cannot declare Block maturity, rewrite a Block contract, grant secrets or authority, bind an exact implementation version as product law, fabricate runtime state, or force reuse when verified composition says bespoke work is safer.

## Resolution boundary
`Blueprint (desired need) -> Factory (exact resolution) -> oros.lock (composition receipt) -> Oros (runtime truth)`

Factory resolves exact eligible Block/Bridge versions, adapters, digests and evidence. The Oros remains authoritative if a lock or Blueprint disagrees with reality; disagreement is a defect to investigate.

## Relationship to PandaOS harvest
Panda's project templates and durable Work objects support the principle of declarative project intent, but OTHRYS keeps Blueprint separate from Work/Mission state. Work says **what we are doing now**; Blueprint says **what the Oros is meant to be**.

## Canonical evidence
- `docs/architecture/OTHRYS_HIERARCHY.md`
- `docs/architecture/OFFICIAL_BLOCK_OROS_CONSTELLATION_MODEL.md`
- harvested Block Composition Law / documentary `product_capabilities@v0`

## Rule
Exactly one canonical Blueprint per Oros. Derived views are projections; they may never become a second product truth.

## Current house law
This Book defines desired-state product description and **grants no authority**. A Blueprint may request and constrain; it cannot self-resolve, execute, admit or promote.