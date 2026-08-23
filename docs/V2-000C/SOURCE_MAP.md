# V2-000C — Source Map

Recovered by direct filesystem search of the legacy repositories on 2026-08-23.
Read, not remembered. Nothing in any legacy repository was modified.

Searched: `othrys-hub`, `othrys-hub-main`, `othrys-hub-oros-composition-law-001`,
`othrys-hub-hephaestus-block-forge-001`, `othrys-core-windows`,
`othrys-core-mission036-adr`, `othrys-blocks`, `oros`.

| # | SOURCE | PATH | STATUS | AUTHORITY | RELEVANT LAW | CONFLICTS / DRIFT | V2 CONSEQUENCE |
|---|---|---|---|---|---|---|---|
| 1 | Book of GPT | `othrys-v2/BOOK_OF_GPT.md` | ACTIVE (V2-local, created V2-000A.1) | Junior. Controls V2 execution only | §12 "Build V2 from isolated, replaceable, independently testable blocks" | Uses **block** for a V2 code unit; senior doctrine uses **Block** for a reusable product capability | Root contradiction. GPT must resolve |
| 2 | Book of Blocks | `othrys-hub/docs/governance/BOOK_OF_BLOCKS.md` | ACTIVE northern-light doctrine | **Senior.** Defines what OTHRYS may call a Block | §0 species taxonomy · §5 contract · §7 maturity ladder · §8 promotion · §14 anti-patterns · §16 naming · §17 trust · §20 data ownership · §22 Passport · §28 do-not-build | Hub-main copy (709 lines) lacks the composition-law pointer carried by the worktree copies (710 lines) | Control Feedback fails §0.1/§0.6 as a Capability Block |
| 3 | Book of Blocks (worktree copies) | `othrys-hub-oros-composition-law-001/docs/governance/BOOK_OF_BLOCKS.md`, `othrys-hub-hephaestus-block-forge-001/...` | ACTIVE + accepted pointer | Same doctrine | Adds pointer to `BLOCK_COMPOSITION_LAW.md` | Identical to each other; **+1 line vs hub main** | The accepted companion is not merged into the declared canonical file |
| 4 | Block Composition Law | `othrys-hub-oros-composition-law-001/docs/governance/BLOCK_COMPOSITION_LAW.md` | ACCEPTED governance companion (operator Apply 2026-08-22), subordinate to the Book | Senior-subordinate | Blueprint declares desired capability · Factory later resolves exact versions · `oros.lock` records actual composition · "authorises no implementation" | **Absent from `othrys-hub` main.** Accepted-but-unmerged | Composition grammar is known and explicitly not implementable by this mission |
| 5 | Documentary schemas | `othrys-hub-oros-composition-law-001/docs/OROS-COMPOSITION-LAW-001/SCHEMAS.md` | **DOCUMENTARY ONLY** | Shape, not authority | `product_capabilities@v0`, `oros.lock@v0` field tables; config by reference name only | "No executable schema, validator, JSON/YAML lock instance or generator exists **or is authorised**" | A V2 executable manifest/lock would exceed this |
| 6 | ADR-0050 Oros & Constellation Ratification | `othrys-core-windows/titan/adr/ADR-0050-oros-constellation-ratification.md` | **Accepted — Constitutional Law**, ratified by L4 2026-07-19 | Outranks the Book | §2: an Oros is a sovereign governed digital plot allocated to a customer/product/organisation; exactly one canonical Blueprint; the Oros is authoritative reality | — | An Oros is a constitutional entity, not a test harness |
| 7 | othrys-blocks conventions | `othrys-blocks/docs/CONVENTION.md` | ACTIVE physical/identity law (BLOCKS-HOME-001) | Owns Block **source** layout | `blocks/<family>/<block-name>/` containing `package.json`, `README.md`, `BLOCK.md`, `src/`, `tests/`; optional `schemas/`, `migrations/`, `adapters/`; no registry; no publishing | — | The physical Block grammar already exists and is proven |
| 8 | Implemented specimen Block | `othrys-blocks/blocks/media/image-prep/BLOCK.md` + `src/` + `tests/` | IMPLEMENTED, maturity recorded in-file | Evidence of the real grammar | Passport sections in actual use: ID · VERSION · VISIBILITY · MATURITY · PURPOSE · PROVIDES · OPERATIONS · REQUIRES · OPTIONAL · STATE OWNERSHIP · RUNTIME · NETWORK · SECRETS · PERMISSIONS · CONFIG · OBSERVABILITY · SOURCE PROVENANCE · ORIGIN CONSUMER · SECOND CONSUMER | — | This, not an invented manifest, is the manifest shape |
| 9 | Provisional Block Passport | `othrys-hub/docs/VTC-BLOCK-CONTRACT-001/PROVISIONAL-BLOCK-PASSPORT.md` | "Documentation checklist only. **Not** a runtime schema" | Documentary | IDENTITY · PURPOSE · PROVIDES · REQUIRES · OPTIONAL · INPUT/OUTPUT/ERROR CONTRACT; maturity `CANDIDATE` | — | Confirms Passport is an evidence file, never a runtime |
| 10 | **Oros Zero (already exists)** | `oros/oros-zero/{oros.json,blueprint.json,flow/,README.md}` | IMPLEMENTED, PENTA-001, 2026-08-23 | Existing named artifact | `othrys.oros.identity.v0`; `kind: proving-oros`; disposable; bound to `capability.media.image-prep`; workspace convention `<projects>/oros/<slug>`; README: it must never become "a place to add Block #2" | **Name collision** with what V2-000C asks to create | V2 cannot create a second Oros Zero |
| 11 | Hephaestus Block Forge packet | `othrys-hub-oros-composition-law-001/docs/OROS-COMPOSITION-LAW-001/HEPHAESTUS-BLOCK-FORGE.md` | Located, summarised through source 4 | — | `quarry → contract → extract → reintegrate → cross-integrate → verify → repair → maintain` | Not read in full — the gate fired first | Named for completeness only |

## Terms the search did NOT find in Block/Oros doctrine

`SOCKET` — no occurrence in `BOOK_OF_BLOCKS.md`, `BLOCK_COMPOSITION_LAW.md`,
`othrys-blocks/docs`, `othrys-blocks/blocks`, or `book-of-othrys`. The canonical
term for a typed, versioned attachment point is **PORT** (Book of Blocks §0.2).

`CAPSULE` — no occurrence in Block or Oros doctrine. It occurs only in Mycelium
material (`CONTEXT_CAPSULE*.md`), where it means an agent context payload — a
different subsystem entirely. The canonical term for a Block's executable body is
the Block directory itself (`src/`, `tests/`, `package.json`) per source 7.
