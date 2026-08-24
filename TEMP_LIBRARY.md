# OTHRYS V2 TEMPORARY LIBRARY

**Status:** TEMPORARY INDEX / NO RUNTIME AUTHORITY  
**Owner:** GPT Control  
**Purpose:** give early V2 knowledge a simple physical home before the canonical Great Library/Garden/Mnemosyne is wired.

The temporary Library is an index, not a second source of truth. Canonical machine state remains in V2 control files and receipts. Accepted institutional knowledge may later move into the real OTHRYS Library/Mnemosyne structure.

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

### Shelf: Block Stock — ADMITTED INTO V2 (exactly one)
- `block.media.image-prep` `0.1.0` — digest `32b34548…d363d7b`. Admitted by V2-001A.R.
  Record: `admissions/block.media.image-prep@0.1.0.json`. Implementation stays in
  `othrys-blocks/blocks/media/image-prep`; V2 holds the admission truth, not the code.
  Candidates are not stock: the other nine directories in `othrys-blocks/blocks` remain
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

Receipts are evidence/runtime control artifacts, not knowledge notes. The Library indexes them but does not reinterpret them.

## GROWTH RULE

Do not build a Library application, database, semantic index or navigation system yet. This file is the temporary map.

When the canonical Great Library/Garden/Mnemosyne is admitted into V2, migrate by explicit mapping:

`TEMP ROOM -> CANONICAL ROOM/DOMAIN`
`TEMP SHELF -> CANONICAL SHELF/COLLECTION`
`ITEM -> canonical owner/reference`

No silent duplication. No item becomes more authoritative merely because it is placed in the Library.