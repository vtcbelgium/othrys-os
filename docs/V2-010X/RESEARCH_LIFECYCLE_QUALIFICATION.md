# V2-010X — Prometheus Research Lifecycle Qualification

Date: 2026-08-29
Verdict: REUSE_INBOX_PATTERN / DEFER_SCHEDULING

## Research inbox

The old Hub has a useful bounded lifecycle: Gather report → ResearchFinding → ranked inbox → inspect / deeper research / archive / process. Findings carry relevance, confidence, novelty, urgency, provenance, evidence and report linkage.

Authority is correctly separated: a finding is not canon, processing does not auto-apply, and production mutation remains false. Prometheus evidence may be handed onward, but Mnemosyne admission and Hephaestus execution remain separate authorities.

Focused non-UI inbox tests: 6/6 PASS.

## Daily scan

The daily-scan implementation contains useful safety patterns: default OFF, in-flight dedupe, bounded interval, orphan-claim recovery, explicit outcome separate from tick state, no invented scheduler, no auto-apply and no production mutation.

However autonomous scheduled research remains out of V2-010X scope and is **not admitted**. V2 should reuse these laws later through the existing Cronos/time seam rather than transplant `hub.window.footer_clock` scheduling.
## Fossils / defects harvested

- One UI inbox test is stale against the newer simplified detail renderer: behavior survives, copy assertion drifted.
- One daily-scan overlap test mixes an injected 2026-08-09 timestamp with the real 2026-08-29 clock on its nested call, so the stale-claim guard truthfully changes behavior. Remaining daily-scan tests: 6/6 PASS.
- These are not V2 implementation candidates. The lesson is to inject one clock through an entire time-sensitive proof and test semantics rather than old presentation strings.

## Penta / Triad fit

Penta may invoke Prometheus as the intelligence member of a campaign, but owns no research backend. The Triad consumes evidence artifacts only: Prometheus discovers/evaluates, Mnemosyne decides knowledge admission, Hephaestus consumes admitted/contextual knowledge for engineering. Talos verifies execution truth; Kronos/Cronos owns time/lifecycle cadence when that later becomes legal.