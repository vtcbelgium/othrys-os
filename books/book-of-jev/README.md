# The Book of Jev

Status: **CURRENT OS EDITION — EXPERIMENTAL TRAINING SURFACE**

The JEV Cortex is OTHRYS's separated System One decision laboratory. It exists to evaluate whether fast typed probabilistic judgment can safely improve routing, mission alignment, context selection, verification and study classification.

It is not a Titan, not an execution authority and not a replacement for GPT, Claude, Qwen, deterministic code, Trust Canal or Talos.

## Canonical evidence

- `runtime/os/jev_cortex.mjs`
- `runtime/os/jev_cortex.test.mjs`
- `training/jev/README.md`
- `training/jev/question-sets.json`
- `training/jev/benchmark-cases.json`
- `training/jev/run-benchmark.mjs`
- `logs/jev/2026-09-24-foundation.md`

## Research source ledger

External evidence and community experiments are recorded in `books/book-of-jev/SOURCES.md`. Local open System-One challenger results are recorded in `books/book-of-jev/CHALLENGERS.md`. Official sources define product/API facts; community projects only inspire test hypotheses.

## Current house law

- The JEV Cortex is non-authoritative and grants no authority.
- Every circuit starts in `TRAINING`.
- Jev may observe, classify, score and recommend; code owns permissions and effects.
- Router, Mission, Risk, Context, Verify and Study are independent logical circuits with independent trust.
- Compatible questions may share a physical Jev request without sharing trust.
- New model versions inherit trust `0` and must requalify.
- Question-set changes are version changes and require regression testing.
- Confidence is not correctness; workload calibration is required.
- Consequential Choice circuits require option-order permutation testing.
- Jev unavailability must leave OTHRYS in a safe deterministic state.
- Benchmark success may make a circuit eligible for human shadow review; it cannot self-promote.

## Stable and candidate lanes

The foundation pins `jev-1.13.0` as the initial control model and uses `jev-latest` as the initial candidate alias. A future candidate is tested as a new model even when the provider presents it behind a moving alias.

Provider lanes are independent from model identity:

- TypeSafe direct.
- Vercel AI Gateway via the TypeSafe-compatible route.
- OpenRouter as a declared comparison lane pending adapter qualification.

## Training progression

`TRAINING -> SHADOW -> ADVISORY -> LIMITED -> TRUSTED`

Progression is per circuit. There is no global “unlock Jev” switch.

The first eligible circuits are intentionally low consequence: Router classification and Study classification. Mission, Risk, Context and Verify remain present in the Cortex but do not gain authority from another circuit's performance.

## Verification boundary

The JEV Cortex can never make its own benchmark result authoritative. Talos/human/source-of-truth review remains external. Risk signals cannot override deterministic permissions. Model identity remains labor, not authority.

## Future integration direction

OTHRYS Head presents the current Core/deliberative side and the experimental JEV Cortex side. During training, real work stays on the existing path while Jev results are compared and logged. Switchyard may later consume a qualified Router signal, but only after explicit promotion evidence.

This Book is institutional memory, not execution authority.


## Free-first route order

OTHRYS should consume legitimate no-cost capacity before any paid fallback:

1. **Vercel AI Gateway via deployment OIDC** — preferred for OTHRYS Web because the deployment already lives on Vercel, requires no stored gateway key, includes $5/month free AI Gateway credit, and Jev is additionally free through 2026-09-25.
2. **Cloudflare Workers AI** — free allocation of 10,000 neurons/day if/when a Cloudflare account is connected.
3. **Netlify AI Gateway** — zero provider-key setup with a hard-limited free credit plan if a Netlify deployment is intentionally introduced.
4. **OpenRouter / TypeSafe direct** — paid comparison lanes only, even though Jev's per-call cost is extremely small.

No route may silently cross from a free allocation into paid spend. Paid fallback requires explicit future policy/authorization.


## Free-access strategy — 2026-09-24

OTHRYS prefers the least-secret, least-cost path that preserves provider observability and does not change Jev's authority posture.

### Preferred lane: Vercel AI Gateway via deployment OIDC

For the deployed OTHRYS Web application, Vercel OIDC is the preferred Jev training credential.

Reasons:
- no long-lived Jev/TypeSafe secret needs to be created or stored;
- Vercel documents OIDC authentication for Jev through AI Gateway;
- the current Vercel Jev launch promotion is free through 2026-09-25;
- Vercel AI Gateway also documents a $5/month free allowance for eligible free-tier teams that have not transitioned to paid credits;
- OTHRYS Web is already deployed on Vercel, so this adds no second hosting control plane.

The Web broker accepts `VERCEL_OIDC_TOKEN` for the Vercel Gateway lane and never exposes it to the browser.

### Secondary lane: Netlify AI Gateway

Netlify documents Jev as zero-configuration inside Netlify Functions: no provider API key or TypeSafe account is required. Netlify's Free credit-based plan includes 300 credits/month.

OTHRYS does not currently adopt this lane because it would introduce a second deployment platform solely for inference. It remains a fallback/research option rather than installed infrastructure.

### Secondary lane: Cloudflare Workers AI

Cloudflare Workers AI provides a free allocation of 10,000 neurons/day on the Workers Free plan. Jev is an ecosystem integration candidate, but OTHRYS currently has no authenticated Cloudflare Workers AI control path.

Do not create a Cloudflare account solely to duplicate a working Vercel OIDC lane without a measured reliability or availability reason.

### OpenRouter

OpenRouter's Free plan offers free general-purpose models and a free-model router, but Jev itself is not a permanent free model there. OpenRouter therefore remains useful for comparator/fallback experiments, not the primary free Jev path.

### Credential-farming prohibition

OTHRYS must not create duplicate provider accounts, rotate identities, or otherwise abuse promotional/free-credit programs. Free lanes are used under ordinary provider terms only.

### Current operational conclusion

Use:
`OTHRYS Web -> Vercel deployment OIDC -> Vercel AI Gateway -> typesafe-ai/jev`

before requesting a standalone TypeSafe key.

This changes cost/credential routing only. JEV Cortex remains TRAINING with authority 0.


## Chase workflow adaptation

The latest workflow study has been folded into the Cortex architecture as a bounded execution-planning layer.

Canonical adaptation:
`interfaces -> one OTHRYS Bridge -> deterministic route or JEV Router -> FAST/LIGHT/DEEP execution recommendation -> Themis/Keymaster/Trust Canal -> tools/connectors -> Talos/verification -> Books/memory/receipt`.

The implementation lives in:
- `runtime/os/jev_execution_planner.mjs`
- `runtime/os/jev_execution_planner.test.mjs`
- `docs/jev/CHASE-WORKFLOW-ADAPTATION.md`

The central rule is unchanged: **routing is not authorization**. A Jev lane recommendation cannot grant authority, release credentials, execute a connector, or complete verification.


## OTHRYS brain integration

The Cortex is now wired into the real OTHRYS Web command front door.

Canonical runtime flow:

`Web/System Manager -> /v1/commands -> T590 Command Deck -> Legion /brain/router -> Keymaster -> OpenRouter Jev -> brain decision -> FAST/LIGHT/DEEP -> existing governed lifecycle`.

The Cortex runs on Legion so provider credentials remain inside the Windows DPAPI Keymaster vault. Only typed observations cross back to the T590.

Every new Web command gets at most one provider evaluation. The resulting brain decision is persisted beside the Web plan and reused for status polling.

Decision sources:
- `JEV_CORTEX`: live semantic Router evidence;
- `DETERMINISTIC_FALLBACK`: explicit degraded mode when the Cortex cannot be reached.

Safety law:
- the Cortex cannot grant authority;
- deterministic BUILD/PLAN classification can never be downgraded by Jev;
- admin/build/risk >= 2 remain DEEP;
- DEEP enters the existing canonical Mission lifecycle;
- execution remains behind Themis / Trust Canal / Switchyard / launch permits;
- Talos verification remains independent.

Primary evidence:
- `runtime/os/brain_orchestrator.mjs`
- `runtime/os/jev_remote_router.mjs`
- `runtime/workers/legion_brain_router.mjs`
- `runtime/workers/legion_worker_bridge.py`
- `runtime/command-deck/web_command_planner.ts`
- `runtime/command-deck/server.mjs`
- `logs/jev/2026-09-24-brain-e2e.md`

Live E2E and broad regression evidence are recorded in the log above. The integration remains TRAINING / authority 0.
