# V2-010K Work Log — Library / Vault Posture

**Status:** RUNNING / evidence log only.

## 2026-08-29 — stock audit

Read current OTHRYS OS Build Plan, `TEMP_LIBRARY.md`, 010G knowledge-zone/vault research, current Mnemosyne contract, legacy Core `vaults.ts`, `SPEC-025-hecatoncheires.md`, `titan/HECATONCHEIRES.md`, Book of Mnemosyne vault chapter, vault isolation tests, snapshot restore drill and Crown Blueprint stock.

Decision: do not port the old vault engine. Current OTHRYS OS keeps one Mnemosyne substrate and formalizes logical zones/read models plus an honest security posture. Source Vault remains the existing content-addressed archive. Blueprint/Hall/Garden/R&D are classifications, not new stores or authorities.

Current-code eleven-hand audit: 3 `PRESENT_AND_TESTED`, 4 `PARTIAL`, 4 `ABSENT`. Strong current proof exists for identity/mission admission, SHA/tamper evidence and append-only admission audit. Scope isolation, Oros isolation, context minimization and restore posture are partial. Encryption, anomaly/enumeration detection, general prompt-injection quarantine and sensitive-export/emergency-lockdown are absent.

## Defect found during focused proof

After checking out the tracked estate catalog on Windows, raw SHA-256 no longer matched `estate-summary.json` because Git converted LF JSONL to CRLF. This made Mnemosyne fail closed immediately after a clean checkout. Fix: catalog verification now hashes a canonical LF representation; archived source-object byte identity remains exact/raw. Added explicit LF↔CRLF checkout-portability regression.

## Stable policy integration

Promoted current policy from mission-only notes to stable `docs/KNOWLEDGE_ZONES.md` and `docs/HECATONCHEIRES_POSTURE.json`. Both are declared in `.othrys/project.json` so Mnemosyne treats them as project-local truth ahead of estate history. The Mnemosyne Book and component contract now reference currentness, bounded context, logical zones and the stable policy files.

Added `knowledge_zones.mjs` as a derived read model over existing estate search. Source Vault is an evidence facet over the existing content-addressed archive, not a second store. Blueprint/Hall/Garden/R&D/Chronicle/Quarantine are navigation/currentness classifications only and grant no authority.

Added hostile secret fixture proving secret-shaped source metadata may be recorded for audit while the corresponding bytes are never written to the archive. Hecatoncheires Hand 8 remains PARTIAL because general provider-context minimization is still absent.

Integrated Hecatoncheires inspection into Mnemosyne quality and the Housekeeper fast anti-drift suite. Restarted the pre-010K Housekeeper process so it loaded the new digest/security code. Fresh cycle 125: quality 0 defects, fast 46/46 PASS in ~628 ms, no mutations/authority.

## Live-corpus classification hardening

Real-estate sanity queries exposed a false Blueprint classification: zone matching included repository names, so ordinary `.claude` files inside a repo named `blueprint-studio` could be mislabeled. Fixed classification to inspect provenance source paths only and added `basisRefs` showing the exact refs responsible for a zone decision.

Hall of Echoes now recognizes explicit `superseded`, `deprecated`, `rejected`, `retired`, `historical` and `archive` source paths in addition to live currentness states. General search relevance remains independent from zone membership; optional zone-filtered projection filters after relevance ranking rather than distorting search.

Hecatoncheires fast proof was strengthened: its regression now executes every unique cited test for all non-ABSENT hands. Result: posture 3/3 PASS; full Housekeeper fast anti-drift set still PASS in ~763 ms, so security evidence is re-proven every five-minute cycle at low cost.

## First full Legion soak

Recursive runtime Node suite: **287/287 PASS**. Python: **26/26 Mycelium + 10/10 Workers = 36/36 PASS**. Hecatoncheires posture: `3 PRESENT_AND_TESTED / 4 PARTIAL / 4 ABSENT`, checker green and authority-free. Mnemosyne quality: 0 defects, 3 informational findings. `git diff --check`: PASS.

Zone live-corpus testing found and fixed repository-name contamination in Blueprint classification. Classification now uses source paths only, exposes exact `basisRefs`, recognizes explicit Hall-of-Echoes history paths, and provides optional zone-filtered projection after relevance ranking. General search remains zone-neutral.

## 2026-08-29 - Turn-around housekeeping / multiplicity study
- Operator requested a deliberate turn-around pass: optimize what exists, stress it, and study whether duplicate/multichannel execution can increase useful throughput.
- No new execution authority was added during V2-010K. Multiplicity remains a candidate until a separate mission can freeze scheduling, independence, budget and verifier semantics.
- Current Mycelium is a single-choice router: one capability/resource request -> one feasible node. It is already node-neutral and authority-free; it is not a one-machine architecture.
- Stress: 26/26 Mycelium tests PASS; 10,000-node synthetic routing averaged ~9.30 ms/selection; 10,000 chaos routes over 256 nodes with rotating quarantine averaged ~0.219 ms/route with 0 failures; 20,000 concurrent read-only route calls over 32 threads averaged ~0.250 ms/call with 0 failures.
- Hephaestus authority suite repeated 50x: 0 failures (~6.97 s total). Current Hephaestus freezes one engineering plan/acceptance boundary and bounded attempts; multiplying builders inside one mutable workspace would create collision/evidence ambiguity and is NOT safe by default.
- High-value candidate: MULTICHANNEL / 3D MYCELIUM = independent work lanes across (node/resource patch) x (capability) x (work lane/claim), with Talos retaining lease lifecycle and Trust Canal retaining authority. Safe fan-out only for independent/read-only/sharded work or isolated workspaces; one verifier/merge gate decides what survives.
- Productivity rule candidate: duplicate hands only when expected verified throughput gain exceeds coordination + verification + contention cost. Redundant same-task execution is reserved for high-risk cross-check/race cases, not default duplication.
- Hephaestus candidate: multiple isolated hands may build independent slices or alternative candidates, but never concurrently mutate the same allowed path set. Merge/admission remains single, external and verifier-gated.
- Mycelium candidate: evolve from `select_node()` to a future bounded `route_plan()` that can return N independent placements with anti-affinity/resource ceilings; do not change current route semantics inside 010K.
- Extended soak after multiplicity study: full runtime Node suite repeated 10x with 0 failed runs (~35.2 s total); both Python suites repeated 10x with 0 failed suites (~7.7 s total). No flaky failure surfaced.
- Repo hygiene: no tracked `__pycache__`, `.pyc`, `.env`, local Housekeeper state, or Mnemosyne archive objects; no byte-identical duplicate tracked runtime files >80 bytes; no zero/oversized runtime files surfaced. Housekeeper cycle 131 remained green with 47/47 fast tests and 0 defects.
