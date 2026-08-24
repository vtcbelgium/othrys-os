# V2-001E — STOP: `BLOCK_CANONICAL_PATH_UNDEFINED`

Section 0 of this mission is a gate: determine from **law** whether a canonical location
for Capability Block implementation already exists inside `othrys-v2`. If it does not,
stop and report, and do not invent one.

**It does not. Nothing was copied. No path was created.**

Law is not merely silent on this — it is **contrary**. That distinction matters for what
GPT does next, so it is set out precisely below.

## The controller's diagnosis is correct

Before the blocker, the premise deserves confirmation, because it is right and it is the
reason this mission exists.

`othrys-v2` **cannot reconstruct Block #1 today.** The active admission record carries a
14-entry manifest of `{path, sha256}` — **hashes only, zero bytes of source.** A search
of the whole repository finds no Block implementation file; `blocks/` contains only
Control Feedback, which is `SHARED_SERVICE` / `PLATFORM_ONLY` and not a Capability Block.
The record's own `reconstruction.sufficient_to_reconstruct` names, as its first item,
*"canonical repo othrys-blocks at commit `b4171d3`"*.

So V2 can **verify** the specimen and cannot **rebuild** it. Combined with `othrys-blocks`
having no remote, the active admitted Block exists in exactly one place on one machine.
That is a real defect, and this report does not dispute it.

## What law actually says

### 1. Senior law names a canonical home, and it is not V2

**Book of Blocks — "Canonical product Block source (BLOCKS-HOME-001)"**
(`othrys-hub/docs/governance/BOOK_OF_BLOCKS.md`, lines 48–58):

> Reusable product Capability Block **implementation** is owned by the dedicated sibling
> repository:
> - Path: `C:\Users\othry\Projects\othrys-blocks`
> - Logical repository: `othrys-blocks`
>
> Hub owns Block governance and composition doctrine (this Book).
> othrys-blocks owns reusable product implementation.
>
> **Do not copy Block source into VTC, Hub, Core, Studio, or `oros/*`.** Consumers import
> the canonical source. Physical convention: `blocks/<family>/<block-name>/`

This is affirmative ownership, not an omission.

### 2. V2's own laws delegate the question to that authority

- `FOUNDATION_LAWS.md` §1 (line 15): *"the executable body is the **Block directory**
  (`othrys-blocks/docs/CONVENTION.md`)."*
- `BOOK_OF_GPT.md` law 24: *"the canonical terms are **Port** and the Block directory."*
- `docs/V2-000C.R/DECISIONS.md`: *"A Block's executable body is the **Block directory**
  (`othrys-blocks/docs/CONVENTION.md`)."*
- `LEGACY_INVENTORY.md` line 153 and `docs/V2-000C/SOURCE_MAP.md` row 7: same pointer.

Every V2 route to this question terminates in `othrys-blocks/docs/CONVENTION.md`, which
defines `blocks/<family>/<block-name>/` **inside othrys-blocks**. No V2 document defines
any V2-internal path for Capability Block implementation.

### 3. Both admission records state the opposite of this mission's goal

`admissions/block.media.image-prep@0.1.0.json` and `@0.1.1.json`, `source.ownership`:

> *"legacy owns the implementation; V2 owns only this admission record.
> **No implementation was copied into othrys-v2.**"*

`GPT_STATE.json` records `implementation_in_v2: false` for both specimens. These are
existing admission evidence, which §7 forbids mutating.

### 4. Copying collides with the maturity the active record claims

Book of Blocks §7 defines `REUSABLE` as *"Canonical source consumed by the origin Oros
**and** successfully transplanted into an independent second Oros **without source fork
or copy**."* §14 lists **"Copy-and-crown"** and **"Fork-per-Oros"** as anti-patterns.
`othrys-blocks/docs/CONVENTION.md` (Consumption law) forbids *"copying Block source"* and
*"forking one implementation per product"*. The Oros composition law agrees —
`HEPHAESTUS-BLOCK-FORGE.md`: *"Independent Oros consumes exact same source through
declared interfaces; **no fork/copy/patch**."*

Block #1 is admitted at maturity `REUSABLE`. A second copy is the precise thing that
definition excludes. Executing this mission as written could invalidate the basis of the
maturity currently recorded in the active admission.

### 5. Amending the Book has one legal route, and it is not a delegate mission

Book of Blocks, line 709:

> *"This Book may be amended only through a logged, evidenced governance mission;
> amendments do not retroactively manufacture proof for an existing Block."*

### 6. There is precedent for stopping exactly here

Book of Blocks line 588 records that `VTC-BLOCK-EXTRACT-001` **"correctly stopped at
`BLOCK_CANONICAL_HOME_UNRESOLVED`"**, and that extraction resumed only as a separately
authorised mission. Stopping on the canonical-home question is established, honoured
behaviour in this estate — not obstruction.

## What was and was not done

Completed before the gate closed:

- **§1 base gate — PASS.** Clean tree; `HEAD == origin/main == c6c125c`; V2-001D visible
  and pushed; Block #1 `ACTIVE_ADMITTED` at `0.1.1`; runtime proof recorded (node 10/10,
  browser 29/29, aggressive 18/18).
- **§2 source specimen — VERIFIED.** Recomputed digest
  `48afa7ac082db75b40278bf71ff552f6ff0ca4e1429006f759dec4c37b3b55bd`, exact match to the
  active admission; `package.json` declares `0.1.1`; 14-file manifest intact. Had the
  mission proceeded, the source was sound.
- **§0 law inspection — COMPLETE**, across `BOOK_OF_GPT.md`, `FOUNDATION_LAWS.md`,
  `LOOP_LAWS.md`, `LEGACY_INVENTORY.md`, `TEMP_LIBRARY.md`, `V2_CHRONICLE.md`, both
  admissions, the V2-001A.R / B* / C / D evidence, the QA suite, the canonical
  `BOOK_OF_BLOCKS.md`, `othrys-blocks/docs/CONVENTION.md`, the Oros composition law
  (`OROS-COMPOSITION-LAW-001`), and `BLOCK.md`.

Not done, by instruction: **no copy, no V2 Block path created, no directory invented, no
admission modified, no ownership document updated, no inventory update** (§8 permits it
only after success), **no architecture, no registry, no resolver, no remote, no
repository.** `othrys-blocks` was read only — HEAD still `b4171d3`, digest identical at
start and end.

## What GPT now has to decide

Not a design question — a question of which existing legal instrument to use. Three
routes exist in current law; **this mission chooses none of them.**

1. **Amend the Book of Blocks** through the logged, evidenced governance mission its
   line 709 requires, moving canonical Block ownership to `othrys-v2`. That is a Hub
   governance act, above a V2 delegate's authority.
2. **Leave ownership where law puts it** and close the reconstruction gap another way.
   Note that the two obvious means — giving `othrys-blocks` a remote, and carrying source
   bytes inside the admission record — are respectively forbidden by this mission's
   controller decision and blocked by §7's ban on inventing a schema.
3. **Override senior law explicitly and record the override**, accepting the consequences
   for the `REUSABLE` maturity basis in §7 and the anti-patterns in §14.

The reconstruction defect is real and worth fixing. The disagreement is only about the
remedy, and the remedy as written collides with law that V2's own foundation cites as
authority. That is the kind of collision this gate exists to catch.

**`NEXT_STATE = WAIT_GPT`.**
