# OTHRYS Training Levels 1–2 — Deep Harvest Report

**Status:** HARVEST COMPLETE / CONTINUING QUARRY  
**Scope:** completed Level 1 + Level 2 corpus, internal recurring mechanisms, and low-gravity VTC extraction  
**Authority:** none; every newly extracted capability remains `TRAINING_CANDIDATE`

## Corpus turned inside out

The completed curriculum contains 64 jobs: 40 atomic Level 1 jobs and 24 stateful Level 2 jobs. The harvest matched final training source bytes against packaged Block source, inventoried raw worker/repair receipts, normalized missing provenance, and retained failure evidence rather than treating green finals as the whole story.

Current evidence envelope:
- 64 / 64 jobs COMPLETE.
- 64 / 64 jobs now have `LEARNING_RECEIPT.json`.
- 63 / 64 training source artifacts are byte-identical to packaged Block source; L2-024 is the expected composition adaptation because packaged imports differ from training-local imports.
- 127 parsed worker/repair result receipts.
- ~4105.383 seconds of measured worker execution evidence.
- Fresh L1+L2 source proof: 64 files, 486 / 486 PASS.
- Fresh Block-contract shelf proof after harvest: 75 contract files, 536 / 536 PASS.
- Training governance core: 3 / 3 PASS; Level 3 remains locked.

## Evidence recovered, not rewritten

Level 1 had only 12 explicit learning receipts and only 5 manifest Block identities despite 40 independently proven packaged candidates. Exact source hashes were used to reconstruct the missing provenance. The manifest now names the packaged candidate and contract proof for every L1 job. Twenty-eight missing Level 1 learning receipts were reconstructed from existing machine receipts, tests, manifest lessons and packaged proof; no new historical outcomes were invented.## Worker / orchestration dataset

The normalized result set contains 79 worker receipts marked `ok:true`, 33 `NO_ATTEMPT_MUTATION`, 10 out-of-scope mutation failures, 2 path-escape failures, 2 file errors and 1 repeated-tool-loop failure. `ok:true` remains execution evidence only; Level 2 repeatedly demonstrated that Talos can still reject the artifact semantically.

Seventeen jobs explicitly preserve operator-intervention/capability-debt language in canonical lessons. This is valuable negative knowledge for Hephaestus, Talos, Rhea, Mycelium, Kronos and Switchyard: route success must be learned from independently verified outcomes, not worker confidence.

Machine-readable evidence lives in:
- `LEVELS_1_2_DEEP_HARVEST.json`
- `LEVELS_1_2_DEEP_HARVEST_SUMMARY.json`
- `LEVELS_1_2_WORKER_EVIDENCE.json`
- `LEVELS_1_2_BLOCK_INVENTORY.json`

## New internal recurring-mechanism candidates

Two repeated Level 2 mechanisms were strong enough to extract as independent candidates:
- `block.data.canonical-json` — recursive canonical JSON + unsafe-key refusal.
- `block.state.atomic-json-file` — validator-bound atomic local JSON persistence with corruption refusal.

These do not replace domain Blocks. They capture mechanics that were repeatedly hand-written across CRUD, tracker, transfer, dashboard and composition tasks, reducing future duplication while keeping domain validation outside the primitive.## VTC low-gravity Block harvest

VTC was inspected as a capability mine, not copied wholesale. Existing extractions such as affiliate-offer, image-prep and visit-tracking were recognized and not duplicated. Eight additional low-gravity seams were extracted and independently tested:
- `block.text.slug-display-label` from shared figure-name humanization.
- `block.utility.threshold-ladder` from XP level resolution.
- `block.utility.capped-grant` from bounded daily credit grants.
- `block.web.sitemap-xml` from dynamic sitemap rendering.
- `block.utility.compact-number` from forum count labels.
- `block.utility.relative-time` from forum age labels, adapted to explicit time input.
- `block.data.dependency-edges` from pure Titan graph derivation.
- `block.data.alias-resolver` from forum category aliases.
- `block.control.feature-flag-policy` from feature-flag resolution, separating deterministic policy from React/Supabase host glue.

This makes **11 new harvest candidates** in this pass: 2 internal recurring primitives + 9 VTC-derived candidates. All are bounded, dependency-light and independently green. None is admitted.

## VTC seams deliberately left in quarry

Higher-gravity VTC capabilities remain quarry or Blueprint material: wallet/atomic spend, server-authoritative XP/badges, messaging/presence/read receipts, moderation queues, event/RSVP, storage upload, PDF/report composition, SSR metadata/JSON-LD, PWA/offline, email journeys and database-backed feature flags. Their value is real, but they carry auth, database, UI or distributed-state gravity and should be extracted under later contracts rather than fragmented into fake primitives.

## Block shelf repair

Four already-proven Level 2 candidates were missing provenance documents. `notes-store`, `inventory-store`, `time-tracker` and `dashboard-summary` now have `BLOCK.md` files bound to their original L2 lessons and independent proof. This was documentation recovery, not a new admission.