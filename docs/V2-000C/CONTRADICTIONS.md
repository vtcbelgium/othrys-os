# V2-000C — Authority Gate: material contradictions

The gate in V2-000C §1 fired. Implementation stopped **before** any Block anatomy,
Oros Zero, manifest, or composition file was created. Nothing under `blocks/` was
touched. No legacy repository was modified.

Each contradiction below changes implementation, so none may be silently chosen.

## C1 — Control Feedback is not a Capability Block under senior doctrine

Book of Blocks §0.1: a Block is "a reusable **product capability** at
user-meaningful scale". §0.6: Hub/Core infrastructure — naming **mission
ingestion** among its examples — "is **not** automatically a product Block". §0.7
requires every candidate to be classified as exactly one of `CAPABILITY ·
BRIDGE · WORKFLOW · UI_PRIMITIVE · SHARED_SERVICE · PLATFORM_ONLY · NOT_A_BLOCK`.

Control Feedback is mission-receipt and sync-attestation machinery for the build
system. Its honest classification is `SHARED_SERVICE` or `PLATFORM_ONLY`, not
`CAPABILITY`.

§14 names the failure directly: **"Platform-as-Block"** — declaring platform
infrastructure a product Block — under a heading that reads "Reject or stop when
work shows any of these".

Giving Control Feedback product-Block anatomy and a rung on the product
maturity ladder is the anti-pattern, not the goal.

**GPT must decide:** does V2 assert a second, V2-local meaning of "block", or does
Specimen Block #1 have to be an actual product capability?

## C2 — `SOCKET` and `CAPSULE` are not canonical vocabulary

V2-000C §2 lists SOCKET and CAPSULE as existing anatomy to preserve, and forbids
inventing synonyms, with the rule "Existing language wins."

The repositories contain neither term in Block or Oros doctrine. The canonical
terms are **PORT** (§0.2, "a versioned contract... the contract between Blocks is
the magic") and, for the executable body, the Block directory itself
(`othrys-blocks/docs/CONVENTION.md`). `CAPSULE` is already taken by Mycelium's
context capsule and would collide.

Adopting SOCKET/CAPSULE would create exactly the synonyms the mission forbids.
Substituting PORT and Block-directory silently would reinterpret the mission.

**GPT must decide:** confirm PORT and Block directory, or state that V2 renames them.

## C3 — Oros Zero already exists, elsewhere, bound to another capability

`oros/oros-zero/` was created by PENTA-001 on 2026-08-23: `oros.json`
(`schema: othrys.oros.identity.v0`, `kind: proving-oros`, `disposable: true`),
`blueprint.json` (one `product_capabilities@v0` entry for
`capability.media.image-prep`), `flow/oros-zero.flow.json`, fixtures and a README.

Its `workspaceConvention` is `<projects>/oros/<slug>`, citing
`hub/factory/workspace.py:22` — an Oros lives beside the repositories, not inside
one. Its README states what it must never become: "A product. A second Factory.
**A place to add Block #2.** A reason to build a Block registry, a Port registry
or a capability resolver."

Creating an "Oros Zero" inside `othrys-v2` would duplicate a live canonical name,
break the workspace convention, and do the one thing the existing Oros Zero
forbids.

**GPT must decide:** a distinct name and location, or reuse of the existing Oros Zero.

## C4 — An Oros is constitutional, and othrys-v2 is not a product world

ADR-0050 is **Accepted Constitutional Law**, ratified by the Human Final
Authority on 2026-07-19: "An Oros is a sovereign, governed digital plot of land
allocated by Othrys to a single customer, product, organisation or individual...
Every Oros has exactly one canonical Blueprint... The Oros is the authoritative
reality."

`othrys-v2` is Control Plane build machinery, not a customer product world.
Declaring an Oros inside it to host governance plumbing is constitutional
invention — V2-000C §13's own stop condition.

**GPT must decide:** whether a V2 proving harness may carry the name Oros at all.
If it is only a harness, doctrine already has a word for the honest thing: it is a
mission evidence harness, not an Oros.

## C5 — Book of GPT versus senior ratified law (root cause)

Book of GPT §12: "Build V2 from isolated, replaceable, independently testable
blocks. A block has an explicit input, output, contract, proof, and failure state."

Book of Blocks §0.1 and §14 reserve "Block" for reusable product capabilities and
reject platform infrastructure wearing the name.

Both are authoritative; the Book of GPT is junior and V2-local, the Book of Blocks
is ACTIVE ratified doctrine sitting under Constitutional Law. C1–C4 are all
downstream of this one word.

**This is V2-000C §13's final stop condition, met exactly:**
"BOOK_OF_GPT.md conflicts with senior ratified law."

## Drift recorded, not resolved

- `BOOK_OF_BLOCKS.md` in `othrys-hub` main (709 lines) lacks the composition-law
  pointer present in both worktree copies (710 lines).
- `BLOCK_COMPOSITION_LAW.md` and `docs/OROS-COMPOSITION-LAW-001/` exist **only** in
  the worktrees. The companion is ACCEPTED (operator Apply, 2026-08-22) but not
  merged into the file the Book itself calls the canonical source.
- Consequence: the canonical Hub file does not yet carry law that has been accepted.
  Which copy binds V2 is an open question for the Hub owner, not for this mission.

## What was deliberately NOT done

No Contract, Port, Capsule, Manifest, Blueprint, Oros, composition file, harness,
or test was created. `blocks/control_feedback/` is byte-identical to its V2-000A.1
state. Legacy repositories were read only.
