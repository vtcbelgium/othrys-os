# V2-010X — Prometheus + Triad + Penta Study

## Disposition

Prometheus: **ADAPT** from substantial repo-proven implementation.  
Triad: **REUSE AS CONSTITUTIONAL LAW / CONTRACT PATTERN**, not as a new runtime orchestrator.  
Pentarchy/Penta: **REUSE AS CAMPAIGN COMPOSITION + PROOF PATTERNS**, never as a fifth authority or new engine.

## Triad truth recovered

The accepted Core Triad is exactly Prometheus (Intelligence), Mnemosyne (Knowledge), and Hephaestus (Engineering). Ownership is exclusive; cross-office interaction is evidence/artifact handoff; no office may directly command another. Graceful degradation is a constitutional requirement.

The old Hub later proved a useful governed data plane: Prometheus `recommend/score` → typed intelligence/evidence artifact → Mnemosyne `search/trace/recall` read-only context → Hephaestus `plan-report`. It explicitly stopped before build and blocked `mnemosyne.remember` auto-admission.

This is structurally compatible with V2's existing authority split: GPT_CONTROL plans, Mnemosyne is explicit-file/review-required knowledge, Hephaestus owns engineering, Talos owns independent evidence. Therefore V2 should recover the **artifact/correlation contract and ownership law**, not revive the Hub adapter layer or Genesis subprocess bridge.
## Penta / Pentarchy truth recovered

Pentarchy was explicitly defined as a **campaign name** for Kronos + Talos + Prometheus + Mnemosyne + Hephaestus. It does not alter the Triad, does not make Kronos/Talos Titans, and does not create a new orchestration authority.

The Flow Engine was deliberately the existing Talos ops engine. The Flow Canvas was a read-only projection of durable Talos events. Its strongest reusable invariant is `LIVE = LEDGER = REPLAY = CANVAS`: presentation may never outrun evidence, and divergence is a failure rather than something to smooth over.

Penta also produced useful engineering lessons: explicit no-op contracts, fail-fast stall detection, health separate from certification, free-first builder ranking, and construction-gap detection that rejects docs-only pseudo-completion.

## Prometheus truth recovered

Prometheus already had local safe reads (`score`, `recommend`), a dry-run governed external-read seam (`run-knowledge-source`), a substantial daily research scan, source/provider scouting, capability harvesting and reliability work. The Hub deliberately policy-blocked mutating/authority-bearing Prometheus operations.

Daily scan's strongest reusable laws: default OFF; no second scheduler; bounded existing tick seam; stale-claim recovery; cancellation cannot admit findings; findings land in review/inbox; no auto-apply; provider/key drift may alert but cannot change scan verdict.

## Defect harvested, not copied

Focused old-Hub tests produced 80 passes / 1 failure. The failure is in Penta offset-tail proof on Windows: text-mode newline translation writes CRLF, so the returned byte offset is 18 while the test expects 16. V2 must define replay/tailing offsets in raw bytes (or normalize explicitly), never mix text character counts with durable byte positions.
## V2 architecture decision from the study

1. Keep **one Triad** as a constitutional composition: Prometheus → Mnemosyne → Hephaestus, with typed evidence and correlation identity between them.
2. Keep **Talos outside the Triad** as independent verifier/evidence authority. Penta may compose Talos with the Triad for a campaign, but may not redefine ownership.
3. Keep **Kronos outside the Triad** as time/lifecycle machinery; no implicit LIFE authority.
4. Reuse Penta's Flow Canvas invariant in the Command Deck: every visual state must be derived from durable execution evidence; no UI-owned progress truth.
5. Prometheus admission should begin with read-only intelligence surfaces and an inbox/review boundary. Scheduled research remains OFF until separately admitted.
6. Do not port Hub's Genesis subprocess adapter, Hub telemetry stores, or duplicated provider/build selection. V2 already has native project manifests, Switchyard, Mnemosyne, Work, Talos and Trust Canal equivalents.

## Next qualification slice

Prometheus should be decomposed into four candidate seams: **local intelligence** (`score/recommend`), **external evidence acquisition** (dry-run source runner), **research lifecycle/inbox**, and **scheduled scan policy**. Qualify them independently. The first likely resident slice is local intelligence because it is deterministic/read-only and naturally feeds Mnemosyne without requiring network or scheduler authority.