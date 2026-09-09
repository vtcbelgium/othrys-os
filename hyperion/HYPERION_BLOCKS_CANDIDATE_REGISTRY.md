# HYPERION BLOCKS — CANDIDATE REGISTRY

> Status: DESIGN/RESEARCH QUEUE ONLY — none of these entries are admitted Blocks.

This registry converts the Hyperion commercial doctrine into narrowly scoped Block candidates while preserving OTHRYS admission discipline.

## Ranking model

Score future candidates on:

`REUSE_FREQUENCY + USER_VALUE + DISTRIBUTION_VALUE + ECONOMIC_OPTIONALITY + MEASURABILITY + LOW_SUPPORT_FIT + LOW_TRUST_COST + CLEAN_BOUNDARY - COMPLEXITY - PLATFORM_DEPENDENCE - LEGAL_AMBIGUITY - MANIPULATION_RISK`

Priority is not build authority.

## P0 candidates

### HBLK-001 — Contextual Hint Selector
**Job:** decide whether a small contextual hint is useful now.

Inputs: task context, current user state, candidate hints, confidence, prior outcomes.

Outputs: selected hint or `SILENCE`.

Why P0: expresses the OTHRYS intelligence law directly and can serve many products without being inherently commercial.

Must prove: low false-positive annoyance, explicit silence path, deterministic fallback, explainable selection evidence.

### HBLK-002 — Intervention Timing Gate
**Job:** determine whether this is the right moment to interrupt.

Outputs: `ALLOW | DELAY | SILENCE` plus reason.

Why P0: prevents otherwise good recommendations from becoming noise.

### HBLK-003 — Evidence-Backed Recommendation
**Job:** rank genuinely relevant tools/options from declared evidence independent of commission.

Commercial metadata is attached after ranking, never used as hidden ranking weight.

Must prove: same recommendation order with affiliate payout removed unless an explicitly non-commercial variable changed.

### HBLK-004 — Recommendation Disclosure
**Job:** present concise disclosure when a recommendation has affiliate/sponsor/commercial status.

Why P0: reusable trust primitive; commercial plumbing should not rely on ad hoc disclosure text.

### HBLK-005 — Commercial Potential Scorer
**Job:** inspect an asset and produce applicable commercial surfaces plus constraints.

Candidate outputs: one-time, subscription, pay-per-run, ads, sponsor, affiliate, API, licence, white-label, data, certification, marketplace, sale, keep-free, or no-fit.

Must never open a financial gate.

### HBLK-006 — Monetization Density Guard
**Job:** cap how many commercial interventions a product/page/session may show based on utility, intent and trust sensitivity.

Why P0: formalizes subtlety instead of relying on taste.

### HBLK-007 — Distribution Hypothesis Packet
**Job:** require a public experiment to declare how intended users could realistically find it.

Outputs: discovery channels, intent terms, shareability surface, existing marketplace/ecosystem route, expected first-value path and measurement contract.

Core law: `IF NOBODY COMES, THE BUILD DID NOT FINISH.`

### HBLK-008 — Value Event Recorder
**Job:** record whether the user actually completed the core job, not just loaded/clicked the page.

Why P0: Hyperion must optimize real value rather than vanity metrics.

### HBLK-009 — Trust/Friction Signal Recorder
**Job:** capture dismissals, repeated interruptions, cancellation friction, complaint signals and other evidence that optimization is damaging experience.

### HBLK-010 — Value Valve Eligibility Adapter
**Job:** translate a product/channel's qualified commercial readiness into a machine-readable candidate state while preserving global/product/channel financial authority.

Outputs may include `DISABLED | PREPARING | READY | SUSPEND_RECOMMENDED`.

It may not independently output or cause `OPEN`.

## P1 candidates

### HBLK-011 — Natural Limit Upgrade Trigger
Detect when a user genuinely reaches a useful free-tier boundary rather than manufacturing artificial pain.

### HBLK-012 — Next Useful Job Router
Recommend another relevant OTHRYS capability/product after the current job succeeds.

### HBLK-013 — Search Intent Classifier
Classify intent such as informational, transactional, diagnostic, comparison, setup, troubleshooting or recurring monitoring.

### HBLK-014 — Shareable Result Packager
Turn genuinely useful output into a safe share/link/embed artifact where appropriate.

### HBLK-015 — Pricing Choice Presenter
Present qualified tiers/options with low cognitive load and no deceptive defaults.

### HBLK-016 — Repeat Value Detector
Distinguish one-shot curiosity from repeated dependency/habit/workflow value.

### HBLK-017 — Support Burden Meter
Normalize human-support minutes per successful value event/revenue/active user.

### HBLK-018 — Maintenance Burden Meter
Track operator/automation burden required to keep an asset alive.

### HBLK-019 — Ad Density Guard
Prevent advertising inventory from degrading the user job beyond defined thresholds.

### HBLK-020 — Sponsor Integrity Guard
Ensure sponsorship state cannot alter benchmark/evidence outcome.

## P2 candidates

- marketplace listing adapter;
- comparison/alternatives generator;
- reactivation trigger;
- useful-alert recommender;
- watchlist bridge;
- bundle eligibility scorer;
- sponsor-funded-free marker;
- last-verified presenter;
- transparent pricing explainer;
- compatibility proof presenter;
- pay-per-run bridge;
- cross-product attribution adapter;
- public benchmark share card;
- privacy/local-processing trust marker when factually true;
- commercial surface A/B experiment adapter;
- intervention lifetime-value evaluator.

## Qualification ladder

Do not invent a parallel maturity system. These are candidate research states only:

`IDEA -> RESEARCH PACKET -> PROTOTYPE CANDIDATE -> TEST EVIDENCE -> NORMAL OTHRYS ADMISSION`

Once admitted, use normal OTHRYS maturity:

`RAW -> PROVEN -> REUSABLE -> CERTIFIED -> GOLDEN -> DEPRECATED -> RETIRED`

## Critical anti-corruption tests

Any Hyperion recommendation/conversion Block should eventually face tests such as:

1. **No payout test** — remove affiliate/sponsor economics; recommendation quality/order should remain evidence-led.
2. **Gate-closed test** — commercial gate closed; core product still works.
3. **Silence test** — irrelevant context produces no intervention.
4. **Overload test** — multiple eligible commercial Blocks compete; density guard selects bounded output.
5. **User-value-first test** — commercial surface cannot block first value.
6. **Removal test** — remove Hyperion Block; core product still completes its job.
7. **Trust-regression test** — conversion gain with materially worse retention/complaints is not automatically accepted.
8. **Disclosure test** — commercial status is visible where required.
9. **Dark-pattern test** — no fake scarcity, forced continuity, disguised ad, deceptive default or cancellation sabotage.
10. **Authority test** — Block cannot open money or invent permission.

## Product composition examples

### Basic agent setup guide
Potential composition:
`SEARCH_INTENT -> FIRST_VALUE -> COMPATIBILITY_PROOF -> CONTEXTUAL_HINT -> EVIDENCE_BACKED_RECOMMENDATION -> DISCLOSURE -> VALUE_EVENT`

No reason to mount an ad-heavy composition by default.

### Poker reference / strategy site
Potential composition:
`SEARCH_INTENT -> CORE_REFERENCE -> CONTEXTUAL_HINT -> RELATED_TOOL -> VALUE_EVENT`

Any gambling-linked commercial channel requires separate legality/platform/harm review and must not optimize toward gambling spend.

### PDF utility
Potential composition:
`FIRST_VALUE -> VALUE_EVENT -> NATURAL_LIMIT -> OPTIONAL_UPGRADE -> DENSITY_GUARD`

### Developer benchmark
Potential composition:
`EVIDENCE -> METHODOLOGY -> VERIFIED_RESULT -> TOOL_RECOMMENDATION -> DISCLOSURE -> SHAREABLE_RESULT`

## Selection law

> **DO NOT BUILD THE WHOLE HYPERION BLOCK FAMILY AT ONCE.**

The first implementation candidate should be selected only after Great Harvest preflight and evidence that the capability recurs across multiple real products/workflows.

The strongest likely first pair is `Contextual Hint Selector` + `Intervention Timing Gate`, because they encode OTHRYS-wide intelligence and can later support commercial composition without making commercialization the core dependency.
