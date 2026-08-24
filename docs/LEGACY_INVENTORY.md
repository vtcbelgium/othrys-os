# Legacy Inventory — canonical sources V2 must check before writing code

Pointers only. Nothing here is copied into V2, and nothing here is modified by V2.
Legacy repositories are quarry: read, never write. Paths are on `jeroen-legion`
under `C:\Users\othry\Projects\`.

Law 16 of `BOOK_OF_GPT.md` requires this file to be consulted before new code.

| Asset | Path | Status | Use for |
|---|---|---|---|
| Book of Blocks | `othrys-hub/docs/governance/BOOK_OF_BLOCKS.md` | ACTIVE senior doctrine | What may be called a Block; species taxonomy §0; contract §5; maturity §7; promotion §8; anti-patterns §14; naming §16; Passport §22; do-not-build §28 |
| Block Composition Law | `othrys-hub-oros-composition-law-001/docs/governance/BLOCK_COMPOSITION_LAW.md` | ACCEPTED companion (2026-08-22), **unmerged into hub main** | Blueprint declares · Factory resolves · `oros.lock` records |
| Documentary schemas | `othrys-hub-oros-composition-law-001/docs/OROS-COMPOSITION-LAW-001/SCHEMAS.md` | DOCUMENTARY ONLY, **outside canonical HEAD** | Shape of `product_capabilities@v0` and `oros.lock@v0`. No executable schema is authorised |
| Hephaestus Block Forge | `othrys-hub-oros-composition-law-001/docs/OROS-COMPOSITION-LAW-001/HEPHAESTUS-BLOCK-FORGE.md` | ACCEPTED packet, worktree only | quarry → contract → extract → reintegrate → cross-integrate → verify → repair → maintain |
| ADR-0050 Oros & Constellation Ratification | `othrys-core-windows/titan/adr/ADR-0050-oros-constellation-ratification.md` | **Accepted Constitutional Law** (L4, 2026-07-19) | What an Oros is; binding on C4 |
| othrys-blocks conventions | `othrys-blocks/docs/CONVENTION.md` | ACTIVE physical/identity law | Block directory layout, identity, versioning, consumption |
| Specimen Block | `othrys-blocks/blocks/media/image-prep/` | IMPLEMENTED | The real `BLOCK.md` Passport shape and directory grammar |
| Provisional Block Passport | `othrys-hub/docs/VTC-BLOCK-CONTRACT-001/PROVISIONAL-BLOCK-PASSPORT.md` | Documentation checklist only | Contract/passport worked example |
| Oros Zero specimen | `oros/oros-zero/` | IMPLEMENTED (PENTA-001, 2026-08-23) | The existing proving Oros. Disposable, bound to `capability.media.image-prep`, must never become a home for Block #2. Referenced, never recreated or modified |

## Canon drift — recorded, not repaired

V2 does not merge worktrees and does not touch legacy repositories. These are the
Hub owner's to resolve:

1. `BOOK_OF_BLOCKS.md` in `othrys-hub` main is 709 lines; the copies in
   `othrys-hub-oros-composition-law-001` and `othrys-hub-hephaestus-block-forge-001`
   are 710 — they carry the pointer to the accepted composition companion.
2. `BLOCK_COMPOSITION_LAW.md` is ACCEPTED (operator Apply, 2026-08-22) but exists
   only in those worktrees, not in the file the Book itself calls the canonical source.
3. `docs/OROS-COMPOSITION-LAW-001/` — including the documentary `product_capabilities@v0`
   and `oros.lock@v0` shapes — exists outside canonical HEAD for the same reason.

Consequence for V2: when law is quoted, quote the worktree copy and say so, because
the canonical Hub file does not yet carry law that has been accepted.
