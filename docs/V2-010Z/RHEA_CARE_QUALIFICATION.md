# V2-010Z — Rhea Care Resident Qualification

Date: 2026-08-29
Verdict: QUALIFIED_FOR_ADAPTATION
Great Harvest: ADAPT

## Proven old stock

Current harvested Hub seams:
- `hub/care/runtime.py` object `9df6f786c03f905334c2888ebf370d55b4b1bf8e`
- `tests/test_mission037_rhea_triad_care.py` object `5ad41d92692d274a8eb841ed46722c65460f4dbb`
- charter/proof from Missions 036/037
- activation commit `3fb2a72b8bbe084b1b0b22871407fd1b9b40a5e2`

Focused old-Hub Rhea suite: **13/13 PASS**.

Rhea's proven identity is Care/Vitality. It is not a fourth Triad office and not Kronos. Its old authority envelope explicitly owns neither Life, scheduling, build, credentials, research nor memory.
## Seam classification

| Harvested seam | Decision | V2 reason |
| --- | --- | --- |
| CareCase lifecycle / transition table | **REUSE SEMANTICS** | Explicit, fail-closed state machine with useful terminal/exception states. Adapt as pure native domain logic. |
| Secret-shaped-field refusal | **REUSE** | Matches current V2 secret-free evidence law. |
| CareCase private JSON/index/event store | **REJECT AS ARCHITECTURE** | V2 already has durable Work/evidence/event surfaces. Do not create a second mission-like authority/store. Persistence, if needed later, must be a derived/project-local care record with one owner. |
| In-process failure streak dictionary | **ADAPT** | Anti-noise law is excellent; volatile process counters are not durable evidence. Derive persistence from bounded timestamped observations/loop evidence. |
| Threshold constants / transient suppression | **REUSE + CALIBRATE LATER** | Single transient must not open a case. Numeric values remain initial policy, not learned authority. |
| `sources.py` Hub-wide source wiring | **REJECT PLUMBING / REUSE INTENT** | V2 already exposes Work, Talos loop projection, Housekeeper quality, Atlas/Mnemosyne and Mycelium/node health. Rhea consumes these read models instead of rebuilding collectors. |
| `run_triad_care_cycle` orchestration | **REJECT ORCHESTRATOR / ADAPT PROTOCOL** | Rhea coordinates a case but must not become a second workflow engine. Current Work + Trust Canal + Talos own governed execution flow. |
| Prometheus diagnosis / Mnemosyne recall requests | **REUSE BOUNDARY** | Current residents already exist; consume them as evidence/context only. |
| Hephaestus repair request | **REUSE BOUNDARY** | Rhea may form a repair request; current engineering/Trust Canal gates decide whether work proceeds. |
| Rhea verification | **ADAPT** | Rhea may judge vitality/recovery evidence, but Talos remains execution-verification truth. Care verification means "subject healthy again", never "patch verified". |
| Kronos LIFE escalation | **REUSE OWNERSHIP LAW** | Rhea may recommend/escalate; Life decisions remain Kronos/operator. No LIFE runtime admitted by this mission. |
| HubAlert aggregation | **ADAPT AS PROJECTION** | Useful symptom aggregation/quiet watching semantics; no new alert backend in qualification. |
| TitanDNA implementation | **REJECT LEGACY FORM / REUSE HONEST-METRICS LAW** | V2 uses current House Book/contract/Atlas evidence; keep `NOT_YET_MEASURED` rather than invented care fitness. |

## Current V2 fit

Rhea does not need a new sensor fabric. Current V2 already provides:
- durable Work records and transitions;
- Talos retry/dead-letter/verifier events and loop projection;
- structured loop failure diagnosis and stall-risk analysis;
- Housekeeper/Mnemosyne quality evidence;
- resident Prometheus intelligence and Mnemosyne context;
- Hephaestus bounded engineering contracts;
- Mycelium/node health and route degradation evidence.

The smallest resident Care seam is therefore **interpretation, not infrastructure**: a pure CareCase state machine + bounded anti-noise assessment + typed care-plan/repair-request/escalation envelopes. It consumes existing evidence and cannot execute the requested action.

## Required invariant

`FAULT SIGNAL → PERSISTENCE ASSESSMENT → CARE CASE → CONTEXT/DIAGNOSIS → CARE PLAN → GOVERNED REQUEST → TALOS/EXTERNAL EXECUTION TRUTH → VITALITY VERIFY → WATCH/CLOSE`

No arrow grants authority. A healthy subject can recover without a repair. A failed Rhea means `CARE_UNAVAILABLE`, not `SYSTEM_DOWN`. Care must degrade independently from the Triad.

## Admission recommendation

**QUALIFIED:** yes, for a separate House-admission mission.

Minimum native implementation should contain only pure care state/assessment/request semantics first. Durable storage, UI, alerts, cadence and autonomous repair remain excluded until evidence proves a missing current-V2 capability.