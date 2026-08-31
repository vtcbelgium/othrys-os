# OTHRYS Repository Constitution — four active repositories

**Status:** CONSOLIDATION TARGET. This document governs local estate cleanup; it does not rewrite remote history.

OTHRYS should have **four active authored repositories**. Historical repositories are evidence sources, not parallel owners.

| Repository | Canonical role | Must not own |
|---|---|---|
| `othrys-v2` / OTHRYS OS | control plane, runtime, governance, books, Missions/Work, training, admissions/evidence, operator surfaces | VTC product reality; canonical reusable Capability Block implementation |
| `othrys-web` | public OTHRYS face, showcase, distribution/proving surfaces | control-plane authority; Block source; VTC business state |
| `vtc-platform` | real product/Oros and commercial/product quarry | OTHRYS control plane; generic platform law |
| `othrys-blocks` | canonical reusable Capability Block implementation | OTHRYS OS runtime; whole Oroi; legacy junk archive |

## Legacy disposition
`othrys-hub-main`, `othrys-hub`, `othrys-core-windows`, and `othrys-studio` cease to be active repositories after archive proof and dependency removal. Their Git refs, dirty deltas and untracked authored files are preserved in a verified recovery archive before local working directories are removed.

Legacy material that still improves OTHRYS is **harvested by concept and provenance**, not copied wholesale into the active tree. Exact mirrors, stale embeddings, generated outputs and redundant evidence remain archive material.

## Ownership law
One concern gets one active owner. Current implementation may temporarily carry provenance references to historical paths, but executable OTHRYS OS code must not require a deleted legacy working tree.

`othrys-blocks` is deliberately separate: Block code has a different lifecycle, portability proof and consumer boundary than the control plane. Putting legacy code into that repository would contaminate the canonical Block source.

## Cleanup gate before Level 3
Level 3 remains locked until: four-repo topology is verified; OTHRYS OS has no executable dependency on removed repos; temporary/generated junk is excluded or removed; stale mission/training state is reconciled; architecture books and machine invariants pass; Level 1+2 proof remains green; full OTHRYS runtime regression remains green; and the working tree has an intentional reviewed change set only.