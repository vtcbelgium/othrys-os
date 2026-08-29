# Free Resource Research — 2026-08-29

Goal: maximize legal zero-marginal-capacity use without lowering capability, trust, privacy or authority gates.

## Panda continuity lesson
PandaOS public pricing says Pro can connect multiple Claude, Codex or OpenCode subscriptions and switch seamlessly when one runs out. Public material does not establish the exact 10% threshold observed/recalled elsewhere. OTHRYS therefore treats 10% as its own stricter reserve policy: switch before depletion and preserve the last slice for recovery/fallback.

Source: https://pandaos.ai/pricing

## Public zero-cost quarry
- Groq Free Plan: model-specific RPM/RPD/TPM/TPD limits. Responses expose request/token remaining-limit headers, making it unusually suitable for measured reserve routing. Source: https://console.groq.com/docs/rate-limits
- OpenRouter Free: 25+ free models, 4 free providers, 50 requests/day on a free account. Useful as bounded diversity/fallback, not an unlimited primary path. Source: https://openrouter.ai/pricing
- Cloudflare Workers AI: 10,000 Neurons/day at no charge, reset daily at 00:00 UTC; some larger models require paid Workers but many free-plan models remain. Source: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Gemini API: free usage tier exists; active limits are model/project dependent across RPM/TPM/RPD. Treat account limits as measured facts, never constants. Source: https://ai.google.dev/gemini-api/docs/rate-limits
- GitHub Models: fully retired 2026-07-30; reject from live routing. Source: https://docs.github.com/en/github-models

## OTHRYS law
Availability is not admission. Every route still needs legality, health, capability fit and task-specific qualification. Switchyard consumes measured capacity; it never invents trust or authority.
