# V2-001H — Block #2 Quarry / Selection

**Verdict:** SELECT `block.monetization.affiliate-offer@0.1.0` as the frozen Block #2 candidate.
**Mission scope:** selection only; no ingest/admission/implementation in V2-001H.

## Selection law
Foundation Law §17 says Block #2 is primarily the composition test: it must attach with the same Block anatomy and declared boundaries without changing Foundation Laws. Therefore scoring weights proof and portability above feature desirability.

## Frozen candidate identity
- ID: `block.monetization.affiliate-offer`
- Version: `0.1.0`
- Package: `@othrys-blocks/monetization-affiliate-offer`
- Quarry path: `othrys-blocks/blocks/monetization/affiliate-offer`
- Canonical file count for selection: **18** (excludes `node_modules`, `test-results`, `.git`)
- Frozen tree digest: `f87bbdc437fb2f27e80f6e11cf9a9d327d7620218bc312505367dfa085e02c4e`
- Extraction commit: `b79da66293acdb816004c555e1f4f4e4bbbfba3f`
- REUSABLE transplant commit: `37edc9ffb64e679d5ccec7ebbefeacb1d37e4f4d`
- Current quarry HEAD: `b4171d3eb3a28acd30a707892dc7db9c73444a82`; candidate directory has no diff from `37edc9ff…`.

## Evidence already earned
- Origin extraction: 27/27 Node, 8/8 Chromium, 17 targeted VTC tests, Vite build PASS.
- Origin maturity reached PROVEN with fail-closed attribution/provider/unsafe-input behavior and disclosure repair.
- Independent second Oros consumed the exact same source unchanged: 8/8 Node + 10/10 Chromium.
- Same-source and copy-hunt proofs: no source fork, no VTC dependency, no provider recipe copied into the second Oros.
- Portability defect classes A–H: none fired for valid second-consumer use.
- Maturity: **REUSABLE**, two proven independent Oroi; not CERTIFIED/GOLDEN.
- Current V2-001H sanity rerun: all legacy Block Node suites green; affiliate second consumer full `npm test` green and repo remained clean.

## Authority / composition shape
Affiliate-offer is stateless, owns no user data, storage, cookie, localStorage, file, DB or secret. Construction performs no network I/O. Provider identity is an explicit Bridge (`providerId`), attribution is host config, and missing/unknown/unsafe authority fails closed. It exercises a different boundary from Block #1: provider Bridge + host-owned commercial config + host-rendered disclosure rather than Canvas/media transformation.

## Foundation-weighted ranking
Weights: existing proof 25%, portability/independent consumer 20%, authority simplicity 15%, isolation 10%, dependency simplicity 10%, composition value 15%, immediate clean-V2 usefulness 5%.

| Rank | Candidate | Score /100 | Disposition |
| --- | --- | ---: | --- |
| 1 | `block.monetization.affiliate-offer` | **97** | SELECT — REUSABLE, two consumers, Node+Chromium, low authority, distinct Bridge/config composition shape |
| 2 | `block.analytics.visit-tracking` | 60 | DEFER — strong extraction, but RAW; live proof blocked on least-privilege storage authority |
| 3 | `block.knowledge.grounded-retrieval` | 59 | DEFER — strategically useful, but RAW; no canonical cutover or independent transplant |
| 4 | `block.knowledge.source-extraction` | 58 | DEFER — useful/isolated, but RAW; no independent transplant |
| 5 | `block.ai.provider-router` | 57 | DEFER — useful and origin E2E exists, but RAW with wider provider/secret authority surface |
| 6 | `block.learning.gap-engine` | 51 | DEFER — deterministic and small, but RAW with only two current package tests |
| 7 | `block.analytics.event-log` | 48 | DEFER — simple/non-blocking, but RAW and storage/taxonomy transition debt remains |
| 8 | `block.auth.supabase-session` | 45 | DEFER — RAW; auth/session authority makes it a poor foundation composition specimen |
| 9 | `block.learning.mastery-ledger` | 44 | DEFER — RAW; learner-state ownership makes it a later state-composition test |

Scores are selection aids, not maturity claims. Existing Book-of-Blocks maturity and evidence remain authoritative.

## Why not visit-tracking now
Its extraction is technically good: zero external runtime dependencies and 18/18 Node tests. But the origin-proof mission correctly halted at `VISIT_TRACKING_SCOPED_INSERT_AUTHORITY_MISSING`; live least-privilege INSERT authority and retention truth are unresolved. Using it as Block #2 would combine composition proof with storage/security-policy repair.

## Why not the Study Buddy harvest now
Those seven Blocks are explicitly RAW transition stock. Study Buddy still owns duplicate origin implementations; canonical cutover and independent transplant remain pending. They are excellent later quarry, but they would make the second foundation specimen prove too many unknowns simultaneously.

## Current verification performed by V2-001H
- All ten legacy Block Node workspaces ran green without changing quarry Git status: provider-router 4/4; event-log 2/2; visit-tracking 18/18; supabase-session 3/3; grounded-retrieval 2/2; source-extraction 3/3; gap-engine 2/2; mastery-ledger 2/2; image-prep 10/10; affiliate-offer 27/27.
- `oros-affiliate-offer-transplant` remained clean at `79062a11dcc9333382746cc1c912cba56ef3492a`; full `npm test` re-passed same-source, copy-hunt, 8/8 Node construct, and 10/10 Chromium.
- Legacy `othrys-blocks` status before/after verification was identical.

## Next mission boundary
V2-001H authorises only the identity freeze above. A separate mission must independently re-check the frozen 18-file digest, ingest the exact specimen under `blocks/monetization/affiliate-offer`, earn V2-owned runtime proof, create an admission record, and then prove it composes beside Block #1 without changing Foundation Laws.
