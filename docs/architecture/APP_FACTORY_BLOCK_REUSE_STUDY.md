# OTHRYS App Factory and Capability Reuse Study

**Status:** ARCHITECTURE STUDY / EVIDENCE-BOUND / NON-AUTHORITATIVE BY ITSELF  
**Date:** 2026-09-17  
**Trigger:** VTC -> FlipSets second-consumer case  
**Purpose:** determine whether OTHRYS should deliberately build future apps and websites from proven reusable capability stock instead of repeatedly rewriting equivalent product code.

## Executive conclusion

Yes. The current OTHRYS architecture already points in this direction, and VTC -> FlipSets is a strong concrete case for making the reuse loop explicit.

The correct model is **not** "clone VTC and rename it," and it is **not** "turn every repeated helper into a Block." The correct model is:

```text
product evidence
    ↓
harvest reusable capability candidates
    ↓
admit + qualify canonical Blocks
    ↓
Blueprint declares capability need
    ↓
Factory resolves eligible exact composition
    ↓
Hephaestus builds only the missing product-specific code/adapters
    ↓
Talos verifies the Block contracts and whole product
    ↓
Oros runs as authoritative reality
    ↓
Micro-Constellation / Stars observe the running domains
    ↓
portfolio evidence strengthens or weakens Blocks and integration edges
    ↺
next Oros becomes cheaper, faster and safer
```

The economic asset is therefore not merely a code library. It is accumulated, tested **software capital**:

`Capability Block + proven integration edge + consumer evidence + known failure history`.

The important constraint is equally strong: **products pull reusable capability into existence; the Block catalogue must not become a speculative framework project.**

---

## 1. Repository truth inspected

This study is based on current repository evidence, principally:

### OTHRYS OS

- `books/book-of-blocks/README.md`
- `books/book-of-blueprints/README.md`
- `books/book-of-constellations/README.md`
- `books/book-of-factory/README.md`
- `books/book-of-hephaestus/README.md`
- `books/book-of-oroi-projects/README.md`
- `docs/architecture/OTHRYS_HIERARCHY.md`
- `docs/architecture/OFFICIAL_BLOCK_OROS_CONSTELLATION_MODEL.md`
- `.othrys/project.json`
- `runtime/factory/contracts.ts`
- `runtime/factory/plan.ts`
- `runtime/factory/factory.test.ts`
- `runtime/hephaestus/authority.ts`
- `runtime/hephaestus/block_quarry.mjs`
- `runtime/hephaestus/forge.mjs`
- `packages/**`

### OTHRYS Blocks

- `README.md`
- `BLOCKS-LEDGER.md`
- `catalog/CATALOG.md`
- `catalog/HARVEST-QUEUE.md`
- `harvest/vtc-platform/**`
- current Block passports under `blocks/**`

### VTC origin evidence

- `docs/adr/ADR-0001-vtc-is-an-oros-product-repository.md`
- `MASTER-PLAN.md`
- `src/tabs/CollectionTab.jsx`
- `src/tabs/WishlistTab.jsx`
- `src/tabs/MarketplaceTab.jsx`
- `src/App.jsx`
- VTC harvest records in `othrys-blocks/harvest/vtc-platform/**`

No claim in this study promotes a candidate, changes Block maturity, grants execution authority or claims automatic composition that the current runtime has not proved.

---

## 2. The architecture is good, with one necessary discipline

The overall direction is sound because OTHRYS already separates six different problems that are often collapsed into one framework:

| Species | Correct job in repeated app production | Must not become |
|---|---|---|
| **Blueprint** | desired product outcomes, constraints and capability demand | implementation, template clone or runtime truth |
| **Capability Block** | canonical reusable user-meaningful capability | whole product, Star, random helper or hidden product policy |
| **Bridge / Adapter** | provider edge or explicit product glue | provider-neutral capability identity |
| **Factory** | resolve and compose eligible exact stock for one Oros | maturity authority or product owner |
| **Hephaestus** | bounded construction, extraction and repair | promoter, verifier or product-intent owner |
| **Oros** | sovereign running product reality | copied template or reusable library |
| **Constellation / Stars** | observe/manage operational domains after composition | runtime product, package graph or Block registry |

This is the reason the model can scale. Reuse is allowed without erasing product sovereignty.

The necessary discipline is: **never let the app-factory ambition turn the Blocks programme into pre-emptive framework construction.** Reuse must be evidence-led.

---

## 3. What "app factory" should mean in OTHRYS

"Factory" should not mean generating a giant boilerplate repository and then letting every product drift.

The desired operator experience is closer to:

```text
new Oros: FlipSets

Blueprint requires:
- authenticated account
- collector state with physical copies
- want state
- contact-only classifieds
- market price insight
- basic analytics

Blueprint forbids:
- user-to-user payment handling
- escrow
- shipping authority
- transaction commission

Factory resolves:
- eligible exact Block versions
- exact Bridges
- known-safe integration edges
- explicit gaps

Hephaestus constructs:
- Oros shell
- adapters
- LEGO-specific catalogue integration
- FlipSets-specific Deal Check / Hobby Offset / UX
- only missing capability code that cannot lawfully be reused

Talos verifies:
- exact source consumed, not copied
- Block contracts
- product acceptance
- no forbidden authority
```

The result is still a sovereign FlipSets application. It is simply assembled from more accumulated software capital than VTC was able to use when VTC pioneered those capabilities.

---

## 4. Reuse has several species; only one species is a Capability Block

A major finding from the repositories is that "reusable" is broader than "Block."

### 4.1 Capability Blocks

User-meaningful product outcomes with explicit contracts, bounded authority/effects, provenance, tests and lifecycle.

Examples already on the canonical shelf include image preparation, affiliate offer construction, session handling, source extraction and learning capabilities at different maturity levels.

### 4.2 Forge primitives and patterns

Deterministic operations and engineering patterns that help construct Blocks and applications but are not themselves official Capability Blocks.

Examples: robust statistics, retry policies, canonical JSON, state-transition patterns, bounded evidence packets.

### 4.3 OTHRYS OS shared packages

Shared platform contracts that belong to OTHRYS OS rather than product Blocks. Current OS package stock includes the event bus and Atlas delivery contract. A reusable platform package does not become a Capability Block merely because products consume it.

### 4.4 Bridges

Provider-specific implementations of a capability edge. eBay, Supabase, a LEGO catalogue provider, an email provider or payment provider should not become the provider-neutral capability identity.

### 4.5 Product adapters

Small explicit mappings between an Oros domain and a Block/Bridge contract. Adapters are expected. They are healthier than hiding product assumptions inside a supposedly generic Block.

### 4.6 Factory / Hephaestus stock

Scaffolding, build scripts, lint/test harnesses, routing setup, deployment configuration, environment conventions and other engineering acceleration can be reusable without becoming Capability Blocks.

A React/Vite/Supabase/Vercel app shell is not by itself a user-meaningful product capability. It belongs as governed engineering/scaffold stock or composition knowledge, not as `block.app.generic-web-app`.

### 4.7 Proven integration edges

A known-good connection such as:

`collector records -> price insight -> portfolio statistics`

or:

`classified listing -> contact adapter -> messaging`

is reusable evidence even when the components remain independently owned. OTHRYS should retain compatibility and failure evidence about such edges rather than repeatedly rediscovering wiring behavior.

---

## 5. Current reusable Block stock: what can actually be reused today

The current `othrys-blocks` ledger is intentionally conservative.

### 5.1 Normal Factory-eligible product Blocks today

Current Factory code permits only `REUSABLE`, `CERTIFIED` or `GOLDEN` maturity. At the current ledger snapshot, two canonical Blocks are `REUSABLE`:

- `block.media.image-prep`
- `block.monetization.affiliate-offer`

These are the clearest normal-reuse stock today.

### 5.2 Canonical Blocks that exist but are not yet normal Factory reuse stock

The following canonical homes are currently `RAW` and therefore should not be silently treated as production app-factory building blocks:

- `block.ai.provider-router`
- `block.analytics.event-log`
- `block.analytics.visit-tracking`
- `block.auth.supabase-session`
- `block.knowledge.grounded-retrieval`
- `block.knowledge.source-extraction`
- `block.learning.gap-engine`
- `block.learning.mastery-ledger`

FlipSets can be strategically useful here: where its product need is real, it can become an independent transplant consumer and produce the evidence needed to move suitable Blocks toward `REUSABLE`. The product must not be distorted merely to manufacture qualification evidence.

### 5.3 Existing high-value candidates relevant to future apps

The current Blocks ledger/harvest queue includes, among others:

- `data/robust-statistics`
- `limits/atomic-route-quota`
- `limits/tiered-ai-budget-policy`
- `pwa/install-prompt`
- `media/hover-zoom`
- `ledger/idempotent-periodic-grant`
- `marketplace/price-summary`
- source-of-truth reconciliation patterns
- guarded transition / external-action receipt patterns
- repository boundary / consumer-contract qualification patterns

These are **candidates/pattern stock**, not admitted Blocks. The app factory should prefer existing admitted stock, then inspect candidates, then build bespoke product behavior where no eligible stock exists.

---

## 6. VTC -> FlipSets: the first obvious collector-domain transplant laboratory

VTC already contains working behavior that overlaps heavily with FlipSets:

- authenticated user state;
- collection persistence;
- multiple distinct physical copies of one catalogue entity;
- per-copy condition, grade, price paid, variants, completeness, photos and sale outcome;
- want/wishlist state;
- community demand lookup;
- contact-only classifieds;
- offer / wanted / ISO listing species;
- mutual collection/wishlist matching;
- direct contact/messaging;
- notifications;
- market-price summaries;
- portfolio/value statistics;
- CSV export;
- user photos and image preparation.

The wrong response is to clone the VTC files.

The correct response is to classify each overlap:

```text
VTC working behavior
   ├─ already canonical Block? -> consume it
   ├─ genuine second-consumer capability? -> harvest/extract candidate
   ├─ provider-specific edge? -> Bridge
   ├─ reusable engineering stock? -> Forge/Factory stock
   └─ VTC-specific composition/policy? -> leave in VTC
```

### 6.1 New candidate: collector ledger

**Working candidate identity:** `collecting/collector-ledger`  
**Status:** capability candidate only; not admitted and not a canonical Block yet.

The generic outcome is:

> A user can truthfully record what collectible entities they want and the distinct physical copies they own, including copy-specific state and lifecycle.

A possible domain-neutral contract would center on:

```text
user -> wants -> entity_ref
user -> owns  -> copy_ref -> entity_ref
```

Copy state may include bounded generic fields such as acquisition, condition, storage reference, disposition and sale outcome, while domain-specific metadata remains host-owned.

Why it is a good candidate:

- VTC already has substantial origin behavior;
- FlipSets genuinely needs the same user-meaningful outcome;
- copy identity is useful beyond either toy line or LEGO;
- one canonical contract would eliminate drift between `owned`, nested copy data and separate want representations;
- the capability can remain catalogue-provider neutral.

What must stay out:

- LEGO set fields;
- MOTU/GI Joe accessories or VTC grading policy;
- UI layout;
- product valuation provider;
- Hobby Offset;
- Deal Check;
- messaging;
- classifieds.

### 6.2 New candidate: contact classifieds

**Working candidate identity:** `marketplace/contact-classifieds`  
**Status:** capability candidate only; not admitted and not a canonical Block yet.

The generic outcome is:

> A user can publish an offer/want/trade listing, discover relevant listings and reach a contact boundary without the application becoming party to the transaction.

The authority boundary is central:

```text
listing authority      = yes
search/discovery       = yes
contact target         = yes
payment authority      = none
escrow authority       = none
shipping authority     = none
transaction authority  = none
transaction commission = none
```

An informational asking price may be listing data without granting payment authority.

Messaging should remain an explicit optional edge rather than being swallowed into this Block. The VTC harvest already concludes that the full Messenger is product composition, while narrower communication-eligibility/reporting patterns may deserve later extraction after real second-consumer evidence.

### 6.3 Existing candidate: marketplace price summary

Do not create a FlipSets-specific price engine when the VTC harvest already identifies `marketplace/price-summary` as an extraction candidate. FlipSets is a natural second consumer for a provider-neutral price insight contract once that candidate is extracted, qualified and admitted.

Provider access remains a Bridge. The price-summary capability should consume normalized evidence rather than become `eBayPriceBlock` or `BrickLinkPriceBlock`.

### 6.4 Matching is not automatically a Block

VTC already contains mutual matching between owned and wanted items. FlipSets will likely need direct demand/supply matches too.

That does **not** justify creating a standalone match engine immediately. First keep matching as product composition or an internal operation of contact-classifieds. Extract a separate capability only if a stable independent contract and additional consumers emerge.

---

## 7. What FlipSets should reuse, prove, and keep product-specific

### Reuse when eligible

- `media.image-prep` for user-set photos where the product needs it;
- OS event-bus contract where the Oros integration requires OTHRYS events;
- any later `REUSABLE` session/analytics Blocks rather than reimplementing equivalent boundaries;
- `marketplace/price-summary` after it becomes eligible;
- collector-ledger/contact-classifieds after real extraction and admission.

### Use FlipSets as independent transplant evidence when the product naturally needs the capability

- `auth.supabase-session`;
- `analytics.event-log`;
- `analytics.visit-tracking`;
- possibly PWA install behavior if extracted;
- future collector/classifieds Blocks.

The important rule is **need first, qualification second**. Do not add a feature merely to raise a Block's maturity.

### Keep FlipSets-specific initially

- LEGO catalogue/provider mapping;
- set/minifigure/piece domain semantics;
- Deal Check economics and presentation;
- Hobby Offset;
- Flip inventory workflow and product statistics;
- free/paid product packaging and Money Gate policy;
- product brand, copy and UI;
- Benelux-specific product strategy;
- any recommendation model whose utility has not been proven outside FlipSets.

If another Oros later needs the exact same user-meaningful outcome, harvest again.

---

## 8. Blueprint's exact role in an app-producing portfolio

Blueprint is the correct place to stop product intent from being encoded accidentally in copied starter code.

For FlipSets, the canonical Blueprint should eventually declare at least four classes of need:

### Required capability outcomes

Examples:

- authenticated account/session;
- collector ledger;
- want state;
- contact-only classified discovery;
- market-price insight;
- basic product analytics.

### Optional capability outcomes

Examples:

- user image preparation;
- notifications;
- contact messaging;
- affiliate outbound offers after the product/legal gate allows it.

### Forbidden capability/authority

For FlipSets this is especially valuable:

- no user-to-user payment processing;
- no escrow;
- no shipping authority;
- no transaction commission;
- no silent monetization unlock.

### Reuse policy

The Blueprint can say where a proven capability **must be reused**, **may be reused**, or remains **product-specific**. It does not choose its own maturity or exact runtime implementation.

### Important correction: Blueprint is not the reusable template

OTHRYS law says there is exactly one canonical Blueprint per Oros. Therefore a generic "collector app Blueprint" must not become a second product truth copied into many Oroi.

Recurring product shapes may be retained as **Factory/knowledge archetypes or scaffold recipes**, but each Oros still owns one canonical Blueprint derived from its actual venture intent and constraints.

This protects product differentiation while still accelerating composition.

---

## 9. Factory's role — and the current implementation gap

The architectural target is already explicit:

`Blueprint desired need -> Factory exact resolution -> oros.lock receipt -> Oros runtime reality`.

The current runtime is more conservative than that target. `runtime/factory/contracts.ts` and `plan.ts` currently require an `OrosBrief` containing **exact Block references** (`blockId`, `blockVersion`, `admissionPath`). The test suite explicitly rejects an extra automatic `resolver` field. It then verifies admission, eligible maturity, canonical `othrys-blocks` ownership and source presence before generating a bounded engineering command.

This is good fail-closed behavior, but it means:

> **automatic Blueprint capability demand -> best eligible Block resolution is not yet implementation truth.**

The app-factory direction should therefore be recorded as a destination, not claimed as complete.

A future bounded Factory evolution could:

1. read Blueprint capability demand and reuse policy;
2. query admitted compatible capability stock;
3. resolve eligible Block ranges to exact identities;
4. resolve required Bridges/provider edges;
5. prefer previously proven integration edges when compatible;
6. return explicit gaps rather than silently generate replacements;
7. record the exact result in `oros.lock`;
8. produce a bounded Hephaestus construction plan for product-specific work only.

No part of that future resolver should promote Block maturity or grant authority.

---

## 10. Hephaestus' role in the app factory

Hephaestus should be thought of as the **smith**, not the product architect or Block promoter.

Current runtime evidence already supports this separation:

- engineering commands have strict fields;
- mutation scope is bounded to allowed paths;
- platform-sensitive paths are forbidden;
- acceptance checks cannot be weakened;
- work remains bound to admission/mission identity;
- the Forge ranks builders but ranking grants no execution permission;
- Block quarry assessment classifies source regions rather than blindly extracting folders.

The Block quarry classification is particularly relevant to app reuse:

- `CAPABILITY`
- `HOST_CONFIG`
- `BRIDGE`
- `CALLER`
- `DEBT`
- `FALSE_POSITIVE`

The quarry requires duplicate capability code to be extinguished/replaced while preserving host glue. That is almost exactly the mechanism needed for VTC -> canonical Block -> FlipSets:

```text
VTC source region
   capability logic -> extract to canonical Block
   host config       -> preserve in VTC
   provider Bridge   -> preserve/separate explicitly
   caller/UI         -> preserve and rewire to canonical Block
   debt              -> record, do not baptise as reusable
```

For new apps, Hephaestus should preferentially **assemble proven stock before generating new equivalent capability code**. Where the Blueprint has an unresolved gap, Hephaestus may build bounded product-specific behavior; later real reuse can trigger harvest.

---

## 11. Constellations and Stars: where they matter

Constellations should not participate in source-code composition.

The current Book is explicit: Blocks build product capability; Stars observe/manage operational domains after composition.

For FlipSets, a Micro-Constellation might eventually project domains such as:

- **Commerce / Market Intelligence Star** — classified activity, price-insight health, outbound market adapters;
- **Analytics Star** — product events, retention/usage signals, Hobby Offset adoption metrics;
- **Security Star** — auth/session health, abuse/report signals, provider boundaries;
- **Communication Star** — messaging/contact delivery if that domain exists.

Those Stars may observe several Blocks, Bridges and FlipSets-specific modules simultaneously. They do not own those components.

### Great Constellation and the compounding portfolio

The Great Constellation is where repeated app production becomes more than code reuse.

Across many Oroi it can eventually derive governed portfolio evidence such as:

- which Block versions are actually adopted;
- which integration edges repeatedly succeed or fail;
- upgrade/failure history;
- operational cost;
- product health and traction signals;
- where bespoke code repeatedly appears because a reusable capability is missing.

This evidence can inform Mnemosyne, future harvest, Factory recommendations and operator decisions. It must never silently install or promote anything.

Therefore the full flywheel is:

```text
Blueprint intent
   ↓
Factory composition
   ↓
Hephaestus construction
   ↓
Oros reality
   ↓
Micro-Constellation / Stars
   ↓
Great Constellation portfolio evidence
   ↓
Mnemosyne / quarry / qualification
   ↓
stronger Blocks + stronger integration-edge evidence
   ↓
next Factory composition
```

This is the architectural mechanism by which "app #20" can genuinely become cheaper and safer than "app #1" without turning all products into clones.

---

## 12. Reuse matrix for future apps and websites

The following matrix is the recommended decision order.

| Need | Reuse location | Example | Rule |
|---|---|---|---|
| user-meaningful cross-product capability | Capability Block | collection ledger, price summary | require real contract + evidence |
| provider access | Bridge | Supabase, eBay, catalogue API | provider must not define Block identity |
| local product mapping | Adapter | LEGO set -> `entity_ref` | keep explicit in Oros |
| generic deterministic helper | Primitive/Pattern | robust median, retry rule | do not inflate Block count |
| platform contract | OTHRYS OS package | event bus | not a product Block |
| build/scaffold acceleration | Factory/Forge stock | Vite wiring, lint/test harness | reusable engineering stock, not product capability |
| desired product composition | Blueprint | required/optional/forbidden capabilities | one canonical Blueprint per Oros |
| running product reality | Oros | FlipSets, VTC | remains sovereign |
| operational management projection | Constellation/Star | Commerce, Analytics | observes/manages; does not implement |

---

## 13. Anti-patterns the app factory must reject

### Clone-and-rename

Copy VTC into FlipSets, then edit names and schemas. This creates immediate drift and defeats canonical reuse.

### Mega-Block

`collector-platform` containing auth + collection + messaging + pricing + marketplace + analytics. This recreates a monolith under a reusable-sounding name.

### Framework-first extraction

Building dozens of speculative Blocks because future apps "might" need them. This consumes time and produces weak contracts without consumer evidence.

### Hidden Bridge

Hard-coding eBay/Supabase/Stripe/LEGO provider semantics into a supposedly provider-neutral Block.

### Blueprint-as-template

Treating a canonical Oros Blueprint as a starter file cloned into every app. Blueprint is product intent, not source boilerplate.

### Constellation-as-dependency-graph

Putting packages/services under Stars and calling that runtime architecture. Stars are management projections.

### Hephaestus-as-authority

Letting the builder promote its own work, weaken acceptance or decide product intent. Build authority is deliberately narrower.

### Maturity laundering

Calling a RAW or candidate capability reusable because another app wants it. Second-consumer demand is evidence opportunity, not automatic promotion.

### Premature generic UI Blocks

Turning tabs, cards, themes and app shells into Capability Blocks merely because several products use React. Reuse them as design/scaffold stock unless they independently satisfy the Capability Block definition.

---

## 14. Recommended operating doctrine

### Law A — Reuse before rewrite
Before implementing a product capability, inspect canonical Blocks, OS packages, candidate/harvest stock and proven integration edges.

### Law B — Eligibility before convenience
A convenient RAW/candidate package is not normal Factory reuse stock. Respect maturity and admission boundaries.

### Law C — App first when the product is the evidence
If a capability has only one real consumer, keep the second product moving with explicit product-specific code/adapters where necessary. Harvest once the shared contract is real.

### Law D — Same source or it is not reuse
Origin and transplant must consume the same canonical implementation. Copy/paste is duplication, not reuse.

### Law E — Preserve product sovereignty
Reusable capability must not absorb brand, domain semantics or product strategy that belong to the Oros.

### Law F — Preserve explicit gaps
If no eligible capability exists, Factory should say so. A visible gap is healthier than secretly forking or pretending a candidate is mature.

### Law G — Learn the edge, not only the component
Composition evidence must retain Block version, Bridge/adapter edge, consumer, acceptance, failures and rollback history.

### Law H — Observation feeds learning, not authority
Constellation evidence can improve future decisions but cannot silently mutate products or promote Blocks.

---

## 15. Recommended next practical sequence using FlipSets

This study does not authorize implementation, but the lowest-risk sequence would be:

1. **Create/ratify one FlipSets Blueprint** from the existing FlipSets product book/refinement.
2. Classify each required capability as `must_reuse`, `may_reuse`, `product_specific` or explicit gap.
3. Reuse only currently eligible Blocks in the first composition.
4. Use FlipSets only as a real transplant for RAW Blocks it genuinely needs; qualify those through their existing lifecycle rather than bypassing maturity.
5. Open bounded harvest work for the collector-ledger and contact-classifieds candidates from VTC origin evidence.
6. Continue the already-recorded marketplace/price-summary candidate instead of creating a FlipSets price duplicate.
7. Keep Deal Check, Hobby Offset and LEGO semantics in FlipSets.
8. Let Hephaestus build adapters/product-specific slices under bounded mission scope.
9. Verify through Talos and record exact composition/evidence.
10. Once FlipSets runs, derive Micro-Constellation/Star projections from real evidence rather than designing a fictional operations topology first.

---

## 16. Final assessment

The architecture should be pursued.

VTC -> FlipSets is a particularly strong demonstration because the second product is similar enough to expose genuine repeated capability but different enough to punish cloning. Vintage action figures and LEGO sets share collection, copy identity, demand, classifieds, contact and price-intelligence needs; they do **not** share catalogue semantics, product strategy, core UX or business logic.

That is exactly the environment in which good reusable boundaries become visible.

The long-term objective is not "generate apps with AI." It is more disciplined:

> **Accumulate verified product capabilities and integration knowledge so each new Oros spends less engineering effort rediscovering solved problems, while remaining a sovereign product.**

Or, in compact OTHRYS form:

> **Blueprint asks. Factory composes. Blocks provide. Hephaestus builds the gap. Talos proves. The Oros runs. Constellations learn. The next Oros starts ahead.**
