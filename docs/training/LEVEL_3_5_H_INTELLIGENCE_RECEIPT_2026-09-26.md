# OTHRYS Level 3.5-H — Intelligence Seal Receipt

**Date:** 2026-09-26  
**Scope:** Level 3.5-H only  
**Result:** SEALED  
**Authority granted:** false  
**Automatic level advance:** false  
**Level 4:** LOCKED pending a separate explicit operator command

## Seal statement

Talos now consumes verified Mnemosyne operational evidence, synthesizes bounded cross-organ adaptations, and those adaptations measurably change later Hephaestus/Switchyard decisions without granting authority or bypassing existing policy gates.

## Evidence chain

| Gate | Result | Evidence |
| --- | --- | --- |
| Mnemosyne operational evidence ingestion | PASS | `runtime/os/mnemosyne_operations.mjs`; digest-valid operational events are collected by Talos. |
| Talos operational synthesis | PASS | `runtime/os/talos_learning_core.mjs`; operational Builder and route evidence produce adaptation plans. |
| Hephaestus downstream adaptation | PASS | Verified 3.5-G Builder evidence changed the top executable Forge choice from `local.gemma4-12b` to `local.qwen3-8b`. |
| Switchyard downstream adaptation | PASS | Verified Pollinations route evidence produces `successRate: 1.0` / `failureRate: 0` for `pollinations-advisory` and feeds existing `measuredTrust` ranking. |
| Policy preservation | PASS | Local-first, cost, privacy, health, certification and authority gates still outrank learned trust; Pollinations remains eligible but local advisory remains default under `PREFER_LOCAL`. |
| Evidence tamper resistance | PASS | Only digest-valid `othrys.os.mnemosyne-operational-event.v1` events are accepted into live Talos routing evidence. |
| Keymaster / JEV free-provider boundary | PASS | Pollinations remains sealed behind Keymaster, strict zero-Pollen rules remain enforced, and paid/positive-price routes fail closed. |
| Whole-body verification | PASS | 576 / 576: OS deep 417, build-core 52, Mycelium 78, workers 29. |
| Canonical Block ownership seam | PASS | T590 resolves the canonical `othrys-blocks` sibling owner; Factory 35 / 35 after canonical sibling path restoration. |
| Level progression boundary | PASS | Level 4 remains locked; intelligence changes preference/diagnosis, not permission or level progression. |

## Integrated implementation

- `58527ac` — Talos learns from Mnemosyne operational evidence.
- `01add0e` — Pollinations admitted as a legal ZERO-cost LIGHT Switchyard advisory route while preserving local-first behavior.
- `6e8a488` — Talos route learning feeds Switchyard through existing measured-trust ranking.
- Whole-body harness now uses a self-contained Python test runner so Mycelium/worker verification does not depend on an undeclared external pytest installation.

## Observable decision proof

### Hephaestus

Before operational learning, the same coding/app task ranked `local.gemma4-12b` first. After Talos consumed the verified 3.5-G Builder proof, `local.qwen3-8b` ranked first. The change came from verified evidence; `authorityGranted` remained false.

### Switchyard

Pollinations live smoke evidence records two successful qualified inference paths and retains HTTP-400 models as reserve. Talos converts the verified provider result into route trust. Switchyard consumes that trust only after its existing legality, cost, locality, health, certification and privacy gates. Under the current local-first policy, `llama3.2-advisory` still wins automatically and Pollinations remains the legal ZERO-cost remote alternative.

## Final disposition

Level 3.5 HubToWeb is SEALED. The historical Hub/Deck human interface remains extinct, OTHRYS Web is the canonical human/operator interface, OTHRYS OS remains the control-plane/runtime truth, and Talos now closes the verified evidence -> adaptation -> re-verification loop required by the Intelligence Law.

This receipt does not unlock Level 4.
