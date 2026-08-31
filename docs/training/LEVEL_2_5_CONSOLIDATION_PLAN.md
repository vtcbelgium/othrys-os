# OTHRYS OS — Level 2.5 Consolidation Plan

**Status:** PLANNED / REQUIRED BEFORE LEVEL 3  
**Authority:** operator decision 2026-08-31  
**Purpose:** close transition debt after Levels 1–2 and the Great Harvest before unlocking Level 3.  
**Level law:** this is a consolidation gate, not a new numbered training level and grants no authority. Level 3 remains LOCKED until every required exit gate below is proven.

## Mission objective

Finish the architectural consolidation created by the four-repo cutover, disposition all Level 1–2 training stock, harden Hephaestus against observed training failure families, prove clean-root portability, and permanently close broad legacy archaeology.

## Non-negotiable laws

- Exactly four active repositories remain: `othrys-os`, `othrys-web`, `othrys-blocks`, `vtc-platform`.
- `othrys-os` is control-plane/runtime/governance truth; `othrys-blocks` is reusable Block implementation truth.
- Historical repo names may remain only as provenance/evidence, never as live filesystem or package authority.
- No Level 3 activation, automatic admission, paid auto-escalation, autonomous input, or new authority during Level 2.5.
- Every mutation is bounded, independently verified, recorded, and reversible where practical.
## Workstream A — Extinguish final legacy live dependencies

1. Inventory every live import, runtime reference and package dependency carrying `othrys-core`, `othrys-hub`, `jarvis`, `titan-os`, `vtc-docs`, or retired repo paths.
2. Re-home `@othrys-core/event-bus` into the current four-repo architecture with explicit owner, version, tests and migration path.
3. Re-home the Atlas delivery contract currently consumed by `othrys-web`; remove obsolete package identity without weakening contract validation.
4. Update `othrys-web` and `vtc-platform` consumers and boundary tests to the new canonical package identity.
5. Retire or adapt `training/forge-qualification/north_worker.py`, which still targets the removed `othrys-hub-main` path.
6. Distinguish immutable historical evidence from live dependencies; historical provenance is preserved, not rewritten.
7. Prove zero executable dependencies on removed repositories or removed local paths.

**Exit gate A:** clean install + tests/builds of every affected repo; live-reference scan reports no retired repo as executable authority.

## Workstream B — Make `othrys-blocks` physically canonical

1. Census the duplicated Block implementations currently present in `othrys-os/blocks` and `othrys-blocks/blocks`.
2. Confirm hashes, versions, contracts, tests, provenance and current admission state before mutation.
3. Define the canonical consumption seam from OTHRYS OS to `othrys-blocks` without creating a second registry or hidden copy mechanism.
4. Remove duplicated implementation ownership from OTHRYS OS only after consumers and verification resolve against `othrys-blocks`.
5. Preserve admission evidence, historical proof paths and Great Harvest provenance.
6. Add a drift/extinction check so a future copied Block implementation in OS fails visibly.
7. Re-run all Block contracts from the canonical repository and all OTHRYS consumers.

**Exit gate B:** one physical implementation owner for admitted reusable Blocks; no byte-identical implementation fork remains in OTHRYS OS.

## Workstream C — Finish canonical Garden / R&D intake

1. Treat the existing Mnemosyne inbox as the canonical intake mechanism; do not build another database or agent.
2. Migrate every still-open item in `GPT_INBOX.md` into Mnemosyne reviewable intake with provenance.
3. Retire `GPT_INBOX.md` as active intake once migration proof exists; keep it only as historical receipt if useful.
4. Formalize the lifecycle `INBOX -> GARDEN -> R_AND_D -> PROVEN / REJECTED -> ADMISSION_CANDIDATE`.
5. Add compact canonical Garden and R&D indexes derived from explicit files/reviews, with zero authority.
6. Define stale/review/reject/merge rules and duplicate suppression against Great Library, Harvest, decisions and existing research.
7. Ensure Prometheus and repeated-procedure skill proposals can land in this lifecycle without auto-promotion.

**Exit gate C:** exactly one active idea/research intake path; every item is provenance-bound, reviewable, searchable and authority-free.

## Workstream D — Disposition all Level 1–2 training stock

1. Enumerate every Level 1 and Level 2 `TRAINING_CANDIDATE`, proof artifact, lesson and reused/adapted stock item.
2. Give each one exactly one terminal disposition: `FORGE_PRIMITIVE`, `PATTERN`, `BLOCK_CANDIDATE`, `MERGE_EXISTING`, `REFERENCE`, or `REJECT`.
3. Do not equate training completion with Block admission.
4. For Block candidates, require reusable contract, provenance, independent proof, no duplicate owner and second-consumer/portability evidence where appropriate.
5. Merge duplicates and record why; reject unsafe or over-specific artifacts explicitly.
6. Update Great Library indexes so training stock cannot remain ambiguously half-promoted.
7. Produce a disposition ledger with counts by family and final destination.

**Exit gate D:** zero ambiguous Level 1–2 training candidates; all stock has a terminal documented destination and admission remains explicit.

## Workstream E — Harden Hephaestus from training telemetry

1. Aggregate all Level 1–2 failure lessons and attempts into failure families.
2. Explicitly measure `NO_ATTEMPT_MUTATION`, zero-byte/no-op mutation, timeout/no-artifact, false `ok:true`, wrong API/filesystem semantics, unavailable dependency, bad path targeting and repair exhaustion.
3. Add or strengthen deterministic preflight checks before expensive builder invocation.
4. Require artifact/mutation evidence before accepting a builder success claim.
5. Improve path pinning, bounded timeout/watchdog behavior, staged validation, rollback and exact contract oracles.
6. Make failure classification reusable by Switchyard/Forge qualification without granting routing or admission authority.
7. Re-run representative failed jobs or synthetic fixtures to prove each hardened failure family is detected earlier or recovered more safely.
8. Record remaining capability debt instead of masking operator recovery as autonomy.

**Exit gate E:** a quantified before/after failure report plus executable regression tests for every recurrent failure family observed in Levels 1–2.

## Workstream F — Clean-root four-repo reconstruction rehearsal

1. Start from a disposable empty root with no sibling project state.
2. Clone exactly the four canonical repositories from their current `main` branches.
3. Install/reconstruct dependencies using only repository-declared instructions and permitted local tooling.
4. Validate repository boundaries, package resolution, Block discovery, Garden/Mnemosyne policy and OTHRYS runtime startup.
5. Run full OTHRYS runtime, training-source, Block-contract and governance suites.
6. Build/test `othrys-web` and `vtc-platform`; verify `othrys-blocks` independently.
7. Execute one tiny governed build through the real OTHRYS path and require independent Talos verification.
8. Prove no hidden dependency on retired repositories, AppData archaeology, old WSL clones or developer-only filesystem paths.
9. Destroy the disposable rehearsal root after preserving the signed/digested receipt.

**Exit gate F:** clean-root reconstruction PASS with exact commit SHAs, commands, test counts, dependency sources and no undeclared local requirement.
## Workstream G — Close plan/document drift

1. Reconcile `OTHRYS_OS_BUILD_PLAN.md` so it has one current phase and no conflicting RUNNING/NEXT sections.
2. Reconcile `V2_BUILD_BACKLOG.md`: retain historical mission chronology, remove duplicate live-order ambiguity, and mark Level 2.5 as the sole pre-Level-3 gate.
3. Change stale harvest closeout statuses such as `ESTATE_PRUNE_HARVEST_2026-08-31.json: IN_PROGRESS` only when evidence supports COMPLETE.
4. Mark obsolete references to old repo topology as historical where they are documentation rather than executable dependencies.
5. Reconcile `othrys-web` and `vtc-platform` master plans where they still describe `othrys-core` as live architecture.
6. Do not rewrite immutable historical receipts merely to make names look current.

**Exit gate G:** current plans agree on four-repo architecture, current training state, Garden/R&D ownership, Block ownership and next legal work.

## Workstream H — Legacy route closure

1. Re-run the four-repo Great Harvest/perimeter integrity checks after all Level 2.5 mutations.
2. Confirm the final quarry remains `CLOSED`, all 43 candidates terminal, and `unreviewed = 0`.
3. Confirm all retired repositories remain cold Recovery/provenance only.
4. Confirm no broad archaeology task remains open; future legacy access requires a named capability gap or provenance question.
5. Verify Recovery catalog, off-machine recovery copy and restore evidence are healthy enough to preserve the cold estate.
6. Create a `LEGACY_ROUTE_CLOSED` milestone/receipt containing hashes, repo SHAs, residual exceptions and closure law.
7. Make the closure law explicit: Great Harvest stays queryable forever, but lateral hunting through retired estates is no longer normal development work.

**Exit gate H:** legacy route formally CLOSED; zero unreviewed quarry stock and zero live authority from retired estates.

## Workstream I — Pre-Level-3 whole-body verification

1. All four repositories clean and synchronized with `origin/main`.
2. OTHRYS recursive runtime suite PASS.
3. Training source suite PASS.
4. Canonical Block contract suite PASS from `othrys-blocks`.
5. Training/governance suite PASS with Level 3 still locked during verification.
6. Web tests/typecheck/build PASS.
7. VTC tests/build PASS and production mutation remains out of scope.
8. Fresh-clone/clean-root proof PASS.
9. Garden/R&D maintenance reports healthy with no unexplained awaiting-review debt required for Level 3.
10. No secret value committed; Keymaster remains metadata/custody-bound.
## Explicit non-goals during Level 2.5

- Do not activate Level 3 early.
- Do not build PandaOS, perform the Level 8/9 reconstruction exams, or enter Recursive OTHRYS work.
- Do not qualify supervised/autonomous Visual Control merely because H16 remains partial.
- Do not turn Garden/R&D into a second authority, database, agent framework or marketplace.
- Do not mass-promote training artifacts into Blocks.
- Do not reopen broad Hub/Core/Jarvis archaeology without a named evidence gap.
- Do not perform unrelated UI polish or product feature work.

## Level 3 unlock gate

Level 3 may be proposed for explicit operator activation only when Workstreams A–I are COMPLETE/PASS and a Level 2.5 graduation receipt proves:

- final legacy live dependencies extinguished;
- one canonical physical Block owner;
- one canonical Garden/R&D intake lifecycle;
- zero ambiguous Level 1–2 training dispositions;
- recurrent Hephaestus failure families hardened and regression-tested;
- clean-root four-repo reconstruction and one tiny governed build independently verified;
- plan/harvest drift reconciled;
- `LEGACY_ROUTE_CLOSED` sealed;
- whole-body verification green;
- `automaticLevelAdvance=false`, `automaticAdmission=false`, `authorityGranted=false` preserved.

**Unlock law:** completion of Level 2.5 does not itself activate Level 3. It only makes Level 3 eligible for a separate explicit operator decision.
