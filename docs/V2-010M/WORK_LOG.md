# V2-010M Work Log

## 2026-08-29 — own-repo harvest first

Read current V2 Mycelium/project substrate before changing architecture. Re-read old Hub Mycelium DNA and Mission 061F/061G/061H/062 evidence.

Recovered proven OTHRYS laws:
- remove work before accelerating work;
- WorkKey / Claim / Artifact stay distinct;
- growth follows useful demand and has a paired retraction law;
- resource reports use measured/inferred/unavailable/bounded-zero dispositions, never fabricated UNKNOWN;
- 061F proved seven metabolic modes and a 7.2x throughput win from scaling a contended workload down from 16 workers to 1;
- 061H proved immutable observations -> qualification -> Pareto -> hysteresis preference among legal routes only;
- 062 proved minimal clean-root survival/regrowth and secret exclusion.

## Biological harvest

Studied fungal network literature on tip growth/branching, cords, source-sink relocation, anastomosis, selective reinforcement/recycling, robustness/cost trade-offs, ecological memory, sclerotia and electrical-signaling caveats.

Strong adaptations: cheap exploration vs reinforced transport tissue; sparse cross-links instead of full mesh; source/sink remodeling; local damage rerouting; regression/recycling of unused tissue; survival posture under stress. Rejected fungal-brain/electrical metaphors as insufficiently established for architecture.

## Current implementation

Added pure `runtime/mycelium/metabolism.py` with:
- truthful resource report normalization and scarcity derivation;
- REST / INTERACTIVE / NORMAL / BURST / CONSERVE / SOAK / RECOVERY selection;
- concurrency-knee calibration using the smallest failure-free width within 97% of best measured throughput;
- project + measured-knee channel ceiling;
- explicit GROW / HOLD / CONTRACT / QUIESCE decisions from useful gain vs marginal metabolic cost;
- metabolic wrapper around existing authority-free Mycelium placement planning.

Focused metabolism suite: 15/15 PASS. Full Mycelium: 65/65 PASS.

Stress:
- 500,000 randomized metabolic decisions: 0 invariant failures, ~963 ms on Legion;
- 100,000 randomized metabolic route plans over a Legion/T590-shaped colony: 0 invariant failures, ~1,233 ms;
- Legion-like curve selected knee 16 instead of redline 32;
- T590-like curve selected knee 4;
- historic 061F contention curve selected knee 1, preserving the measured 7.2x scale-down lesson.

No worker launch, no persistent adaptive state, no route invention, no AI, no authority increase.
