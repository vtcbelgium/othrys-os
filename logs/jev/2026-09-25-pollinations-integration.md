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

After the key was expanded into a strict free-only arsenal, authenticated discovery exposes **18 currently available text models**.

Every returned model currently has:
- community model identity;
- no positive numeric Pollen price;
- blank community pricing, which Pollinations defines as free;
- secret exposure: false.

The dashboard contains additional free models that may be absent from authenticated discovery while Pollinations health filtering marks them down or unavailable.

Model selection is now strict:
1. blank-priced community models are normalized to zero Pollen;
2. explicitly zero-priced models are allowed;
3. any positive numeric Pollen price is refused;
4. `paid_only=true` is refused;
5. an optional preferred model must still be visible and strict-free.

There is no paid fallback inside the Pollinations lane.
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

Focused provider/brain unit suite after strict-free normalization:
- 19 passed / 0 failed.

Expanded Jev + brain suite:
- 49 passed / 0 failed.

Full runtime OS + Command Deck regression after strict-free normalization:
- **425 passed / 0 failed**.

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

## Free-arsenal smoke update — 2026-09-26

Authenticated Keymaster discovery after the expanded dashboard whitelist:
- visible text models: 18;
- all 18 normalize to strict zero-Pollen community pricing;
- positive-price models visible: 0;
- secret exposed: false.

Live chat smoke:
- Cohere North Mini Code: PASS, costClass ZERO, estimatedMaxPollen 0;
- Kilo Auto: PASS, costClass ZERO, estimatedMaxPollen 0;
- GT Agent v1: HTTP 400 on the current chat adapter, keep RESERVE/QUARANTINE until qualified;
- GLM 5.3 Flash FREE: HTTP 400 on the current chat adapter, keep RESERVE/QUARANTINE until qualified.

This demonstrates why key access and Switchyard admission remain separate: free access is broad, active routing still requires a passing runtime smoke/qualification.

## Cross-system logging — 2026-09-26

The strict-free Pollinations state is also recorded in:
- Book of Keymaster — custody and zero-price enforcement boundary;
- Book of Models — ACTIVE / RESERVE / QUARANTINE / REFUSED taxonomy;
- Book of Switchyard — access is not admission;
- Book of Prometheus — free-capacity discovery and price-drift responsibility;
- Book of Talos — live qualification result;
- Book of OTHRYS OS — system-level free remote labor pool;
- V2-011J Blood Loop — intake lifecycle;
- V2 Remote Arsenal — remote capability status;
- `logs/keymaster/2026-09-26-pollinations-free-arsenal.md` — dedicated custody/arsenal evidence.
