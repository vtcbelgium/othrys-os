# Book of Jev — Research Source Ledger

Research date: **2026-09-24**

This file separates official product evidence from community experiments. Community results are treated as hypotheses and test inspiration, not as OTHRYS truth.

## Official TypeSafe evidence

### TypeSafe Quick Start
- URL: https://docs.typesafe.ai/introduction/quickstart
- Used for: direct `POST /v1/systemone` shape; Bearer authentication; shared `state`; typed `noul`, `choice`, and `score` questions; response model/answers/usage shape.
- OTHRYS consequence: the first provider adapter mirrors the documented wire format rather than wrapping Jev as a chat model.

### TypeSafe Models
- URL: https://docs.typesafe.ai/models
- Used for: pinned vs moving model aliases and current Jev model posture.
- OTHRYS consequence: stable and candidate model identities are separate; moving aliases cannot inherit trust.

### Jev 1.13 model jaggedness
- URL: https://docs.typesafe.ai/model-jaggedness/jev-1.13
- Used for: documented weaknesses including literal interpretation, numeric/date work, irrelevant context, adversarial state and structural inconsistencies.
- OTHRYS consequence: these are benchmark families, not footnotes.

### Parallel questions cookbook
- URL: https://docs.typesafe.ai/cookbooks/parallel_questions
- Used for: batching independent questions over shared state.
- OTHRYS consequence: logical circuits keep separate trust while compatible questions may share one physical evaluation.

## Official ecosystem integration evidence

### Vercel AI Gateway — TypeSafe-compatible Jev API
- URL: https://vercel.com/changelog/ai-gateway-now-supports-typesafe-clients-and-http-api-for-jev
- Published: 2026-09-21
- Used for: TypeSafe client base URL `https://ai-gateway.vercel.sh/typesafe`, AI Gateway key path, and compatibility of existing System One calls.
- OTHRYS consequence: Vercel is implemented as a transport/provider lane behind the Cortex broker rather than as a separate cognitive circuit.

### Vercel eve evaluation guide
- URL: https://github.com/vercel/eve/blob/main/docs/guides/evaluate.md
- Used for: application-owned execution with evaluations around agent/tool decisions.
- OTHRYS consequence: Jev can advise future gates, but OTHRYS code retains permissions and effects.

### LangChain — building a harness with Jev
- URL: https://www.langchain.com/blog/building-a-harness-with-jev
- Used for: pre-tool evaluation / guardrail pattern.
- OTHRYS consequence: Risk Circuit is designed as semantic evidence before deterministic policy, never as the permission system.

## Community experiments — non-authoritative

### jasonduncan/jev-browser
- URL: https://github.com/jasonduncan/jev-browser
- Used for: observe → bounded decision → code-owned action → evaluate/continue loop pattern.
- OTHRYS consequence: future micro-decision loops are a research direction only; they are not enabled by the foundation.

### blakestone-x/jev-mcp
- URL: https://github.com/blakestone-x/jev-mcp
- Used for: MCP-style reusable decision operations and reported Choice option-order sensitivity.
- OTHRYS consequence: consequential Choice benchmarks include reversed/permuted option order. A low-confidence answer is never promoted merely because it is typed.

## Evidence discipline

- Official documentation defines API/product behavior.
- Vendor examples inform integration patterns but do not prove OTHRYS reliability.
- Community measurements generate benchmark hypotheses only.
- No external benchmark result is copied into the OTHRYS trust score.
- OTHRYS trust is earned only from versioned OTHRYS-specific evidence.


## Free-access route study — 2026-09-24

### Vercel AI Gateway
- URL: https://vercel.com/docs/ai-gateway/pricing
- Finding: every Vercel team gets $5/month of included AI Gateway credit on the free tier; no commitment.
- URL: https://vercel.com/docs/ai-gateway/authentication-and-byok
- Finding: Vercel deployments receive `VERCEL_OIDC_TOKEN` automatically and may use it instead of storing an AI Gateway API key.
- URL: https://vercel.com/blog/ai-gateway-jev-model-launch
- Finding: Jev is free on AI Gateway through 2026-09-25.
- OTHRYS consequence: Vercel deployment OIDC is the preferred zero-secret first live lane.

### Cloudflare Workers AI
- URL: https://developers.cloudflare.com/ai/models/typesafe/jev/
- Finding: `typesafe/jev` is available in Workers AI.
- URL: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Finding: Workers Free includes 10,000 neurons/day; requests stop rather than bill when the free allocation is exhausted unless the account is on a paid Workers plan.
- OTHRYS consequence: viable free fallback if a Cloudflare account/token is later available. Exact Jev neuron pricing remains dashboard-surfaced rather than fully public in the model page.

### Netlify AI Gateway
- URL: https://www.netlify.com/changelog/typesafe-jev-ai-gateway/
- Finding: Jev is available with zero provider-key setup inside Netlify Functions.
- URL: https://www.netlify.com/pricing/
- Finding: Netlify Free is $0 with a hard 300-credit monthly limit; free plans cannot auto-charge beyond the limit.
- URL: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/pricing-for-ai-features/
- Finding: AI inference consumes 180 Netlify credits per $1 of model usage.
- OTHRYS consequence: valid free sandbox lane, but moving OTHRYS execution merely to obtain this lane would add unnecessary infrastructure today.

### OpenRouter
- URL: https://openrouter.ai/typesafe/jev-1.13/
- Finding: Jev is currently $0.042/M input tokens and $0 output. OpenRouter has many free generative models, but Jev itself is not a free model.
- OTHRYS consequence: keep as a very-low-cost comparison/fallback lane, not a free primary lane.

### TypeSafe direct
- Public documentation reviewed did not expose a permanent documented free tier or no-key route for direct TypeSafe Jev.
- OTHRYS consequence: do not assume promotional/direct credits exist; direct access remains separately credentialed.
