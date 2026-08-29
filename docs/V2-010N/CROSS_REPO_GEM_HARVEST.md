# V2-010N Cross-Repo Gem Harvest

**Date:** 2026-08-29
**Status:** QUARRY / STUDY evidence; no entry here grants runtime authority.
**Method:** inspect live V2 first; VTC current tree read-only; compare historical VTC OTHRYS commits with current Core `origin/main`; inspect Hub/Jarvis measured evidence; collapse duplicates by lineage rather than rediscovering them.

## Repository truth during harvest
- `othrys-v2`: live canonical, `origin/main` at 010M closeout `655d29b...` before 010N branch.
- `vtc-platform`: HEAD == `origin/main` `032a47c...`; working tree contains unrelated user work, therefore READ-ONLY.
- `othrys-hub`: local checkout behind remote and heavily dirty; no worktree mutation. Historical/local evidence inspected only.
- `othrys-core-mission036-adr`: local checkout behind remote; current comparisons use `origin/main` Git objects.
- VTC pre-split Hephaestus/Prometheus/Talos source has no unique exported symbols absent from current Core. Mnemosyne persistence and Genesis are richer in current Core. Do not create a "lost VTC core" subsystem.

## P0 — adapt now / current mission
1. **061G Context Metabolism** — old Mycelium `anastomosis.ts`: PINNED/ACTIVE survive; required/authority evidence survives; reconstructible payload may become a reference; optional EVICTABLE may disappear; hard fail on evidence loss. Old proof: 8,564 -> 1,032 bytes with zero required/authority loss.
2. **VTC rigid skeleton -> enrichment** — `catalog-agent`: discover/scrape establishes allowed identities; parallel/AI enrichment may enrich exactly those identities but cannot add/remove them. Adapt as frozen context identity skeleton.
3. **VTC evidence ladder** — exact self-match -> grounded external evidence -> free witnesses -> paid escalation; ungrounded witness confidence capped. Harvest the principle that repetition cannot outrank grounding.
4. **Current-V2 improvement over 061G** — never model fake byte compression. Reduce only through actual serialized reference substitution or actual eviction.
## P0/P1 — preserve for near-term execution fabric
5. **Jarvis stat-gated refresh** — unchanged files are skipped by `(mtime_ns,size)` before open/hash/embed; touched-but-identical files hash once and retain embeddings. Measured warm search p50 42.6 -> 20.9 ms; 750 repeated note reads/hashes per five queries -> 0.
6. **Jarvis lazy expensive probes** — Ollama/provider health is consulted only when work actually requires it. No-change refresh pays zero provider roundtrips.
7. **Jarvis decoded derived-state cache** — decode/normalize/casefold once per chunk, invalidate only affected paths. General law: rebuildable derived representations may cache aggressively if invalidation is narrower than source truth.
8. **Bounded optional councils** — advisers are optional; wait only a fixed wall-clock budget, then proceed with arrived evidence and record stragglers. Never let advisory breadth stall the primary path indefinitely.
9. **FRUGAL-HEART readiness ledger** — persist provider failure class/cooldown without secrets; selection excludes known-cooling seats, cold ledger changes nothing, corrupt ledger never blocks. Do not rediscover the same outage every mission.
10. **Measured within-tier routing** — once >=3 observations exist, measured reliability may reorder candidates inside the cheapest legal tier; it may never cross tier/authority boundaries. Telemetry failure falls back to roster order.
11. **Factory cheap-to-complete** — route based on remaining verified work rather than sunk work or nominal builder rank. Quarry for Factory/Hephaestus after Artifact/WorkKey receipts mature.

## VTC production laws worth keeping
12. **Task-specific provider trust** — reliability is per task type, Laplace-smoothed from observed agreement. Avoid one global "best model" score.
13. **Atomic quota + server clamps** — reserve/consume quota atomically; even when a non-authority counter fails open, hard token/model/auth limits still bound spend.
14. **Hard-cap multiplexing** — Vercel 12-function cap was solved by one dispatcher over modular internal renderers. Preserve internal modularity; multiplex only at the scarce deployment seam.
15. **Privacy-minimal telemetry** — page analytics stores no IP/cookie/localStorage; daily rotating hash only, analytics failure never breaks product. Apply to observer telemetry where durable identity is unnecessary.
16. **Quality ratchets** — VTC reduced lint debt 303 -> 157 without destabilizing live hooks/runtime code. Binary fail-closed gates stay for security/authority; complexity, duplication, context weight and legacy debt should ratchet downward rather than demand unsafe mass cleanup.
17. **Block extraction classification** — classify matching origin code as `HOST_CONFIG / BRIDGE / CALLER / DEBT / FALSE_POSITIVE`; delete only the independent algorithm being replaced. VTC visit-tracking extraction proved duplicate independent algorithm count = 0 while unrelated hashes remained untouched.
18. **Product/platform boundary by executable test** — VTC proves the app works without a Core path and allows only the sanctioned package/event seam. Oroi should eventually ship the same isolation proof.
19. **Prove-before-delete** — VTC removed 376 MB / 8,877 files of hollow Titan scaffolding only after proving unique content count was zero and migrated research existed elsewhere.
20. **Browser/local offload** — image preprocessing ran client-side before upload to reduce paid/server work. General rule: move deterministic safe transforms toward the cheapest trusted edge when data boundary permits.

## Core/Hub laws reaffirmed by history scan
- **Proof Engine: records, not verdicts** — transport raw evidence across seams; destination verifier owns verdict.
- **Stale task recovery** — durable ownership/lease state must reclaim abandoned work rather than preserve phantom workers.
- **Record denial before ACK** — consequential negative outcomes become durable evidence before acknowledgement.
- **Observer failure isolation** — evidence/journal/telemetry failure should not crash a primary safe operation when the observer is explicitly non-authoritative; authority/security evidence remains fail-closed.
- **Dedupe read models** — Hub removed four superseded Wave read models and shrank registry 18 -> 14. Derived surfaces should be deleted when one canonical read model replaces them.

## Rejected / do not import
- Recreating old VTC OTHRYS platform inside product repos.
- Global provider trust scores that ignore task class.
- Consensus as authority; witness agreement is evidence only.
- Context compression by unverifiable summaries or invented byte estimates.
- Mass technical-debt cleanup that changes untested runtime behavior merely to make a metric green.
## Durability / refusal gems from current Core lineage
21. **Refusal memory outside filtered state** — Mnemosyne MEM-01C stores classification/leak refusals in an append-only sidecar, not the snapshot they can exclude data from. Otherwise filtering an entry also erases why it was rejected. Harvest for knowledge/artifact reuse quarantine.
22. **Unknown is not fresh** — corrupt/torn refusal or admission sidecars make crash-window status `unknown`; callers may not guess that missing evidence was a deliberate exclusion. Useful general evidence-completeness law.
23. **Crash-window honesty** — journal admission before snapshot attempt so a hard kill between admission and save is observable on restart as specific lost IDs, not silently called restored/fresh.
24. **Effect identity includes input** — Talos SPEC-011 binds correlation + capability + input digest; reusing a correlation ID with changed input must never replay the old result. Current WorkKey generalizes this further.

## Cross-cutting design conclusions
- Derived/cache state should be catalog/source-digest keyed and disposable; canonical evidence remains source-of-truth.
- Cold state preserves deterministic baseline behavior. Learning/health/adaptation is exclude/reorder-only inside existing legality.
- Negative evidence deserves durable identity just like successful evidence.
- Optimize observers independently from authority: observers may fail open only where the primary safety boundary remains intact and the lost observation is explicitly non-authoritative.
- The best recurring pattern across VTC, Hub, Core and current V2 is **less repeated work, fewer repeated bytes, narrower scope and better evidence**, not more autonomous actors.
