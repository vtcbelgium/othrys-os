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


### Production proof — 2026-09-24

The integrated OTHRYS brain is live on the T590 Command Deck and Legion brain bridge.

Production smoke exposed and fixed one legacy deterministic false positive: a negated phrase such as `Do not deploy` could previously trigger BUILD because the old front-door regex ignored negation. The front door and brain mission floor are now negation-aware while retaining governed treatment for positive mutation verbs.

The exact production retest routes read-only service status to:
- source: `JEV_CORTEX`
- lane: `FAST`
- executor: `deterministic.status`
- mission required: false
- Mission delta: 0
- authority: false
- execution: false

Full production evidence: `logs/jev/2026-09-24-brain-production-proof.md`.


## Brain completion proof — 2026-09-24

The OTHRYS brain now has a complete bounded execution spine behind the real Web/System Manager front door.

Canonical behavior:

`admit -> Jev Router -> brain decision -> FAST / LIGHT / DEEP -> bounded executor or governed Mission -> verification evidence -> persisted brain result -> System Manager`

### FAST
- deterministic, read-only execution;
- no Mission required;
- current examples: system/status inspection and direct deterministic answers;
- completed result is persisted and returned to Web;
- authority and execution grants remain false.

### LIGHT
LIGHT is no longer only a handoff.

Fresh-web research:
- executor owner: Prometheus;
- runs through the Legion brain bridge;
- Keymaster supplies sealed `TAVILY_API_KEY`;
- Tavily basic search only;
- generated provider answers and raw content are disabled;
- returns source-backed findings;
- no write authority.

Repository/read-only analysis:
- bounded repo evidence capsule is assembled on the T590 from git state, recent commits and Mnemosyne matches;
- evidence is sent through the authenticated Legion brain bridge;
- adviser: `qwen3-fast:latest`;
- local cost class: ZERO;
- adviser has no repository/tool/write authority;
- missing repo context fails closed instead of pretending completion.

Non-repo lightweight explanation may use the T590 `llama3.2` advisory fallback. It is not trusted as the factual repo-analysis model.

Measured local-model behavior:
- T590 llama3.2 cold load: ~21.8 s; warm: ~2.4 s;
- Legion qwen3-fast cold observation during qualification: ~12.1 s;
- exact completed worker warm proof: **1.304 s**;
- exact warm proof stayed within the supplied evidence and did not infer completion from the branch name.

### DEEP
- remains inside the canonical Mission lifecycle;
- deterministic danger floor keeps BUILD, ADMIN and risk >= 2 in DEEP;
- Jev cannot downgrade this floor;
- Themis / Trust Canal / Switchyard / worker launch / verification boundaries remain authoritative.

### Verification and honesty rules
- Jev remains TRAINING / authority 0;
- a semantic routing observation is evidence, never permission;
- LIGHT completion requires validated read-only specialist output;
- repo LIGHT requires actual bounded repo context;
- specialist verification is not labeled independent unless an independent verifier really ran;
- if a specialist is unavailable, the result remains `HANDOFF_READY` or records an explicit brain-result error rather than inventing completion.

### Test evidence
Focused final OS regression:
- **61/61 Node tests passed** across brain orchestration, Jev, Switchyard, Web planning/control, persistence and execution lanes;
- **8/8 Legion bridge tests passed**;
- real front-door integration test proves Web admission -> Jev observation -> FAST execution -> persisted result -> status restore;
- live Prometheus/Tavily research worker returned 3 findings using 1 basic credit with authority/execution false;
- live Legion repo advisory returned an evidence-bound answer with authority/execution false.

System Manager is expected to surface completed FAST/LIGHT brain text directly and keep the GPT handoff closed. DEEP/unresolved work retains the governed handoff path.

Primary completion evidence:
- `runtime/os/brain_light_executor.mjs`
- `runtime/os/brain_no_mission_result.mjs`
- `runtime/workers/legion_brain_advisory.mjs`
- `runtime/workers/legion_brain_research.mjs`
- `runtime/workers/legion_worker_bridge.py`
- `runtime/command-deck/server.mjs`
- `runtime/command-deck/web_control_http.test.ts`
- `logs/jev/2026-09-24-brain-completion.md`

## Pollinations provider lane — 2026-09-25

Pollinations is now an admitted **LIGHT advisory provider** behind the OTHRYS brain, not a replacement for the native Jev Router.

Canonical provider posture for bounded repo advisory is:

`local Legion Ollama` by default; `Pollinations` requires explicit provider selection or explicit remote-fallback opt-in.

The local model remains first because it is zero-cost and keeps bounded repository evidence local. OTHRYS does not silently send repository evidence to Pollinations when the local model fails.

Keymaster owns `POLLINATIONS_API_KEY`; the secret is applied only at the final Authorization-header boundary.

The provider adapter:
- discovers only models visible to the current key;
- treats blank pricing as free only for community models;
- allows explicit zero pricing;
- refuses every model with any positive numeric Pollen price;
- refuses `paid_only=true`;
- keeps the `0.001 Pollen` guard as a defensive ceiling even though admitted calls estimate zero;
- strips provider reasoning envelopes before returning advisory text;
- records provider/model/cost class without recording the secret;
- remains read-only and authority-free.

The live key is now a strict free-only Pollinations arsenal. Authenticated discovery currently exposes **18 available zero-Pollen text models**; additional selected free models can remain hidden when Pollinations health filtering marks them unavailable. The Pollinations lane is therefore classified `ZERO`, with no paid fallback.

The core Router remains on the typed TypeSafe/OpenRouter Jev lane. Generic Pollinations chat output is not allowed to masquerade as native Jev decision evidence.

Full evidence and live verification are recorded in:
- `logs/jev/2026-09-25-pollinations-integration.md`;
- `runtime/os/pollinations_transport.mjs`;
- `runtime/os/pollinations_transport.test.mjs`.
