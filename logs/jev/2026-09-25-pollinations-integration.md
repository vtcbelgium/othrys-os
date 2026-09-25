# Pollinations integration — 2026-09-25

Status: **LIVE-TESTED PROVIDER / JEV LIGHT ADVISORY / authority 0**

## Scope

Pollinations is integrated into the OTHRYS brain as a bounded remote advisory provider behind Jev's LIGHT execution spine.

It does **not** replace the native Jev Router decision lane. The Router remains on the typed OpenRouter/TypeSafe Jev path. Pollinations is used for read-only advisory work where a generic text model is appropriate.

Canonical path:

`Jev decision -> LIGHT -> Legion advisory -> local Ollama first -> Pollinations fallback -> bounded result`

Routing is still not authorization. Pollinations cannot grant authority, mutate repositories, change credentials, deploy, or bypass Trust Canal/Talos.

## Credential boundary

- credential: `POLLINATIONS_API_KEY`;
- source: Windows DPAPI Keymaster vault;
- secret value is never serialized into provider inventory, receipts, logs, or test output;
- provider calls receive the secret only at the final Authorization header boundary.
## Current account-visible model truth

Authenticated model discovery was executed against `https://gen.pollinations.ai/v1/models`.

The current key exposes exactly one text model:

- `community/AkshayCoder48/v3`;
- alias: `AkshayCoder48/v3`;
- prompt price: `0.0000001 Pollen/token`;
- completion price: `0.0000003 Pollen/token`.

Therefore this current lane is **not zero-cost**. It is classified `BOUNDED_POLLEN`.

The earlier candidate DeepSeek/Qwen model names selected in the dashboard were not visible to this key when verified through the authenticated model endpoint. OTHRYS therefore does not hard-code those names or pretend they are available.

Model selection is dynamic from the key-visible catalogue:
1. free/zero-price text model first, if present;
2. otherwise the lowest-priced known text model;
3. unknown pricing fails closed;
4. optional preferred model must actually be visible to the key.
## Cost guard

Every advisory call estimates a worst-case Pollen cost before inference.

Current hard code ceiling:
- `0.001 Pollen` estimated maximum per call.

The Pollinations dashboard key also has its separate account-side budget cap, so OTHRYS has both a local preflight ceiling and provider-side key ceiling.

A live bounded advisory measured:
- requested model: `community/AkshayCoder48/v3`;
- resolved provider model: `fc/v3`;
- 117 prompt tokens;
- 91 completion tokens;
- estimated maximum: `0.000054 Pollen`;
- secret exposed: false;
- authority: false;
- execution: false.

## Fallback behavior

`runtime/workers/legion_brain_advisory.mjs` now supports:
- `local` — Ollama only;
- `pollinations` — Pollinations only;
- `local-first` — default: local Ollama; a Pollinations fallback is allowed only with explicit opt-in.

Set `OTHRYS_BRAIN_POLLINATIONS_FALLBACK=1` to allow remote fallback. Without that flag, repository evidence stays local when Ollama fails.
## Verification

Focused provider/brain unit suite:
- 18 passed / 0 failed.

Expanded Jev + brain suite:
- 49 passed / 0 failed.

Full runtime OS + Command Deck regression after rebasing onto current `origin/main`:
- **424 passed / 0 failed**.

Legion bridge Python suite:
- **8 passed / 0 failed**.

Live proofs:
- authenticated model discovery: PASS;
- real Pollinations chat completion through sealed Keymaster credential: PASS;
- forced Pollinations advisory worker: PASS;
- local failure without remote opt-in: FAIL-CLOSED locally, no Pollinations fallback;
- local failure with `OTHRYS_BRAIN_POLLINATIONS_FALLBACK=1` -> Pollinations fallback: PASS;
- hidden `<think>` envelope stripped from returned advisory text: PASS;
- provider metadata remains non-authoritative: PASS.

## Primary evidence

- `runtime/os/pollinations_transport.mjs`
- `runtime/os/pollinations_transport.test.mjs`
- `runtime/os/provider_probe.mjs`
- `runtime/workers/legion_brain_advisory.mjs`
- `runtime/os/brain_light_executor.mjs`
- `runtime/os/brain_light_executor.test.mjs`
