# OTHRYS V2 TEMPORARY LIBRARY

**Status:** HISTORICAL BOOTSTRAP INDEX / NO RUNTIME AUTHORITY
**Owner:** GPT Control  
**Purpose:** preserve the early V2 room/shelf map while current knowledge ownership is reconciled into Mnemosyne and the OTHRYS OS knowledge zones.

The temporary Library is an index, not a second source of truth. Mnemosyne is now the admitted knowledge substrate; canonical machine state remains in V2 control files, mission/work evidence and receipts. This file persists only as a migration/reference map until every listed item has an explicit current owner.

## LIBRARY LAW

The Library is organized as:

`LIBRARY -> ROOMS -> SHELVES -> ITEMS`

A **Room** is a broad domain of knowledge.  
A **Shelf** is a stable subject/category inside a Room.  
An **Item** is a Book, Law, research note, inventory, Chronicle, evidence set, or future canonical artifact.

Prefer placing an item on an existing Shelf before creating a new Room or Shelf.

### Naming distinction

- `BOOK_OF_*.md` — manual for an actor, system, Titan, capability or operational role: what it is and how it operates.
- `*_LAWS.md` — bounded rules for a mechanism/domain: what behaviour is legal, constrained or forbidden.
- `*_RESEARCH.md` — evidence/research basis; informative, not primary authority.
- `*_INVENTORY.md` — map of existing stock and reuse candidates.
- `*_CHRONICLE.md` — accepted historical milestones and lessons.

Books and Laws are deliberately different artifact classes. Do not call a mechanism-law document a Book merely for style.

## ROOM 01 — CONTROL & GOVERNANCE

### Shelf: Controller
- `BOOK_OF_GPT.md` — GPT manager/controller manual.
- `GPT_RAILS.md` — operational procedure.
- `GPT_STATE.json` — current control snapshot.
- `GPT_LOG.jsonl` — append-only control events.

### Shelf: Processing Laws
- `LOOP_LAWS.md` — universal loop/process toolbox: deterministic loops, ReAct, Critic, Ralph, Evaluator-Optimizer, Self-Refine, Verified Reflexion, Search/LATS-like processing, compounding, nesting, budgets, stall and termination.

### Shelf: Foundation Laws
- `FOUNDATION_LAWS.md` — V2 empty-house/Block foundation constraints.
- `FOUNDATION_LAWS_RESEARCH.md` — research basis for the foundation laws.

## ROOM 02 — MEMORY & INTELLIGENCE

### Shelf: Intake
- `GPT_INBOX.md` — unpromoted conversation intelligence; zero authority.

### Shelf: History
- `V2_CHRONICLE.md` — accepted milestones/incidents/lessons.

### Shelf: Research
- `GPT_RAILS_RESEARCH.md` — research basis for control rails and memory discipline.

## ROOM 03 — LEGACY QUARRY

### Shelf: Golden Inventory
- `LEGACY_INVENTORY.md` — GPT-owned reuse index.

### Shelf: Detailed Inventories
- `inventory/JARVIS.md`
- `inventory/OTHRYS_CORE_CONTROL.md`
- future inventory supplements belong here until the real Library owns them.

## ROOM 04 — BLOCKS & OROS

### Shelf: Block Stock -- CURRENT ADMISSION MAP
- `block.media.image-prep` -- active admitted `0.1.1`; earlier `0.1.0` is historical/superseded evidence.
- `block.monetization.affiliate-offer` -- active admitted `0.1.0`, maturity `REUSABLE`, proven two-Block composition.
- `block.analytics.visit-tracking` -- active admitted `0.1.1`, maturity remains `RAW`; production schema/RLS/retention proof is still absent.

Historical ledgers may contain mission-era statements such as "Block #2 remains FORBIDDEN." Those statements remain valid historical evidence for their time and are not current house law.

#### Image-prep detail
  - **ACTIVE:** `0.1.1` — digest `48afa7ac…7b3b55bd`, `RUNTIME_PROVEN` on LEGION
    (node 10/10, browser 29/29, aggressive 18/18). Promoted by V2-001D.
    Record: `admissions/block.media.image-prep@0.1.1.json`.
  - **HISTORICAL / SUPERSEDED:** `0.1.0` — digest `32b34548…d363d7b`. Admitted by
    V2-001A.R, runtime-proven by V2-001B.T, superseded after V2-001C repaired two
    defects the aggressive QA suite proved. Record unmodified and still valid evidence.
  - Ledger: `admissions/SUPERSESSION.md`. It is a ledger, not a registry or resolver.
  - Canonical implementation is now `blocks/media/image-prep` inside `othrys-v2` (V2-001F).
    `othrys-blocks/blocks/media/image-prep` remains provenance/quarry history, not V2 ownership.
  - Candidates are not stock: the other nine directories in `othrys-blocks/blocks` remain
    available legacy stock and are **not** admitted.

### Shelf: Platform / Control Services
- `blocks/control_feedback/` — **Control Feedback**, classification `SHARED_SERVICE` / `PLATFORM_ONLY` (V2-000C.R). Not a Capability Block, not Block #1. Its `blocks/` path is recorded technical debt; relocation is a separate mission.

### Shelf: Composition / Oros
- future accepted Oros/Blueprint/composition artifacts belong here conceptually; do not create empty architecture merely to fill the shelf.

## ROOM 05 — MISSIONS & EVIDENCE

### Shelf: Mission Inputs
- `missions/`

### Shelf: Receipts
- `receipts/`

### Shelf: QA / Adversarial evidence
- `qa/block.media.image-prep/` — the aggressive suite that proved two real defects in a
  Block already passing 24/24. `AGGRESSIVE_TEST_EVIDENCE.md`, `adversarial.spec.js` (18),
  `digest.test.mjs` (0.1.0-era proof, deliberately unedited), `digest-0.1.1.test.mjs`
  (active proof, added by V2-001D).

Receipts are evidence/runtime control artifacts, not knowledge notes. The Library indexes them but does not reinterpret them.

## MIGRATION / GROWTH RULE

Do not build a Library application, database, semantic index or navigation system from this file. Mnemosyne is already admitted; this file is now the historical bootstrap map.

Current mapping:

| Temporary room | Current canonical owner / zone |
|---|---|
| Control & Governance | repo control files + Books/Laws; indexed by Mnemosyne |
| Memory & Intelligence | Mnemosyne; Chronicle remains curated history |
| Legacy Quarry | Quarry / External Harvest; zero admission by location |
| Blocks & Oros | canonical V2 Blocks/Oros evidence + Books; Mnemosyne indexes references |
| Missions & Evidence | Mission/Work/receipts remain source evidence; Mnemosyne indexes, never overrides |

Great Library, Source Vault, Blueprint Vault, Hall of Echoes, Garden and R&D Centre are now current logical policy zones defined in `docs/KNOWLEDGE_ZONES.md` and projected by `runtime/os/knowledge_zones.mjs`. They remain classifications over Mnemosyne, not separate storage engines or authorities. Migration is reference-first: no silent duplication, and no item becomes more authoritative because it appears in this index.
## RESEARCH ADDENDUM — PANDAOS REFERENCE

### Room 02 / Shelf: Research
- `docs/PANDAOS-HARVEST/PANDAOS_V2_HARVEST_REPORT_2026-08-27.md` — extensive observed PandaOS v1.0.1 architecture/UX harvest: Work State, gates, personas/skills, Atlas, model routing, permissions, local search, limitations and bounded follow-up study. `RESEARCH / DOCUMENTED_ONLY`; no runtime or architecture authority.

### Multiplicity / multichannel candidate - 2026-08-29
Current Mycelium is proven as an authority-free single-placement router and already models multiple nodes. A future bounded mission should study **3D Mycelium**: route independent work across node/resource patch x capability x work lane/claim. This is not permission for parallel mutation. Talos keeps leases/retries, Trust Canal keeps authority, and independent verification/merge stays external. Hephaestus may later use multiple isolated hands for independent slices or competing candidates, but same-workspace/same-path concurrent mutation remains forbidden. Promote only if measured verified throughput beats coordination, verification and contention cost.
