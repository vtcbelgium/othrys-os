# OTHRYS LEGACY INVENTORY — GPT GOLDEN REUSE INDEX

**Owner:** GPT Control  
**Write authority:** GPT only. Delegates, Titans, builders, Claude, Cursor, local models and future agents may READ but must not modify this file unless GPT explicitly authorises a maintenance mission.  
**Purpose:** Before proposing or authorising new code, GPT checks this inventory and the cited source. Reuse/extract beats invention.  
**Status markers:** `[ ]` known stock, not yet reused in V2 · `[x]` reused/admitted into V2 · `[~]` partial / doctrine-only / needs verification · `[!]` risky, stale, frozen, conflicting or authority-gated.  
**Truth order:** running behaviour → passing tests → Accepted ADRs → current canonical docs → historical docs → chat/model memory.

---

## 0. MANDATORY GPT PRE-CODE CHECK

Before GPT asks anyone to write new code:

- [ ] Search this file for the requested capability.
- [ ] Open the cited source implementation/doc, not just this summary.
- [ ] Check whether the stock is live, frozen, retired, documentary-only, worktree-only, or stale.
- [ ] Prefer exact reuse where safe.
- [ ] Otherwise extract the smallest useful primitive.
- [ ] If new code is still required, record `INVENTORY CHECKED:` and why each candidate was insufficient.
- [ ] Never invent a second subsystem merely because the existing subsystem is inconvenient.

---

# 1. REPOSITORY / ESTATE MAP

## 1.1 `othrys-hub` — legacy cockpit + product/factory + many bridges

Canonical online repo: `vtcbelgium/othrys-hub`  
Known local path: `C:\Users\othry\Projects\othrys-hub`  
Role: legacy operator cockpit, Factory, builder/provider routing, Trust Canal UI/bridge, local orchestration surfaces, Blueprint Studio, system map, many Core mirrors/adapters.

- [ ] `hub/` — PySide6 desktop application and orchestration adapters.
- [ ] `core/` — absorbed/mirrored Core packages and Titan code. **Check origin before editing; duplicate-source drift risk.**
- [ ] `docs/` — mission evidence, governance, Book of Blocks, composition law, product doctrine.
- [ ] `tests/` — Hub/Factory/ladder/provider/verification tests.
- [!] branch/worktree sprawl exists; verify exact branch/HEAD before reuse.

## 1.2 `othrys-core` / local `othrys-core-windows` — constitutional + Titan/core implementation

Canonical online repo: `vtcbelgium/othrys-core`  
Known local path: `C:\Users\othry\Projects\othrys-core-windows`  
Role: constitutional law, Crown, Titans, Talos operations, Kronos contracts, Mnemosyne, Mycelium, Assurance/Test Centre, Bridge/Event Bus, architecture.

- [ ] `titan/adr/` — Accepted ADR law.
- [ ] `titan/*/src/` — Titan/runtime code.
- [ ] `books/` — Titan books and doctrine.
- [ ] `crown/` — family/blueprint/index/compiler code.
- [ ] `great-library/` — canonical/historical institutional knowledge.
- [ ] `docs/` — architecture/spec/mission evidence.

## 1.3 `othrys-blocks` — dedicated reusable product Capability Block source

Known local path: `C:\Users\othry\Projects\othrys-blocks`  
Doctrine says this sibling repository owns reusable product Block implementation; Hub owns Block governance/composition doctrine.

Known Block families/files from live inventory:

- [ ] `blocks/media/image-prep/`
- [ ] `blocks/monetization/affiliate-offer/`
- [ ] `blocks/analytics/visit-tracking/`
- [ ] `blocks/analytics/event-log/`
- [ ] `blocks/auth/supabase-session/`
- [ ] `blocks/knowledge/grounded-retrieval/`
- [ ] `blocks/knowledge/source-extraction/`
- [ ] `blocks/learning/gap-engine/`
- [ ] `blocks/learning/mastery-ledger/`
- [ ] `blocks/ai/provider-router/`

**Do not copy these folders into V2 by default. Inspect contract/provenance/maturity and consume/extract canonically.**

## 1.4 `othrys-studio` — standalone Studio / modern web UI quarry

Known local path: `C:\Users\othry\Projects\othrys-studio`  
Role: extracted Studio, React/Vite/Tailwind/Puck-based design surface; possible future visual quarry, not V2 foundation.

- [ ] `apps/hub-web/` — React 19 / Vite / Tailwind app.
- [ ] `@puckeditor/core` usage — page/block editor, **not** graph engine.
- [ ] motion/lucide/UI assets.

## 1.5 `othrys-web`

Canonical online repo: `vtcbelgium/othrys-web`  
Known local path: `C:\Users\othry\Projects\othrys-web`  
Role: public/proving/commercial surface, not Block source of truth.

## 1.6 `othrys-tools`

Known local path: `C:\Users\othry\Projects\othrys-tools`  
Role: tools/product quarry. Must be individually classified before V2 reuse.

## 1.7 `oros/*` — Factory product workspaces / product evidence quarry

Known root: `C:\Users\othry\Projects\oros`.

Known workspaces:

- [ ] `office-buddy-mini`
- [ ] `eu-capitals-travel-log`
- [ ] `factory-autonomy-probe`
- [ ] `factory-cheap-complete-probe`
- [ ] `oros-affiliate-offer-transplant`
- [ ] `oros-image-prep-transplant`
- [ ] `oros-zero` / PENTA proving workspace (if still present)

These are product/run evidence, not automatically reusable Blocks.

## 1.8 `vtc-platform` — locked product/source quarry

Known local path: `C:\Users\othry\Projects\vtc-platform`  
Role: major source quarry from which Blocks were extracted. Treat as locked unless explicitly authorised.

## 1.9 `study-buddy`

Known local path: `C:\Users\othry\Projects\study-buddy`  
Role: independent product/project; quarry only when relevant.

## 1.10 `othrys-memory` — canonical online Obsidian memory mirror

Canonical online repo: `vtcbelgium/othrys-memory`  
Role: online canonical memory/readable feedback; not runtime authority.

---

# 2. BLOCK / OROS / BLUEPRINT CANON — MUST CHECK BEFORE ANY COMPOSITION CODE

## 2.1 Book of Blocks

Source: `othrys-hub/docs/governance/BOOK_OF_BLOCKS.md`  
Status: ACTIVE Block doctrine.

- [~] Defines Block as versioned, provenance-bearing capability-level unit.
- [~] Requires one coherent product capability.
- [~] Requires explicit `provides / requires / optional` contract.
- [~] Requires bounded data, authority, side effects, trust assumptions.
- [~] Requires independently verifiable acceptance contract.
- [~] Requires provenance and lifecycle.
- [~] Defines Ports as versioned contracts.
- [~] Defines Bridges/Adapters as provider/integration implementations of Ports.
- [~] Explicitly rejects universal Port registry/framework before evidence.
- [~] Defines maturity: `RAW → PROVEN → REUSABLE → CERTIFIED → GOLDEN → DEPRECATED → RETIRED`.
- [~] Block Passport is conceptual/checklist, not universal runtime schema.

## 2.2 Book of Hephaestus — Block anatomy

Source: `othrys-core/books/book-of-hephaestus/README.md`  
Status: foundation extension / Titan doctrine.

Canonical anatomy:

- [~] **Contract** — capability promise.
- [x] **Port** — typed, versioned attachment point (Book of Blocks §0.2). *V2-000C.R searched the recovered repositories: `SOCKET` does not occur in Block or Oros doctrine. Port is the canonical term.*
- [x] **Block directory** — executable substance: code, dependencies, runtime assets, tests (`othrys-blocks/docs/CONVENTION.md`). *`CAPSULE` does not occur in Block or Oros doctrine; Mycelium owns it for agent context payloads.*
- [~] **Manifest** — machine-readable identity, version, maturity, requirements, effects, secrets, runtime, verification, removal posture.
- [~] Blueprint is the Oros chassis and should request capability contracts where possible.
- [~] Oros Zero starts with one Block and advances slowly.

## 2.3 Block Composition Law

Source: `othrys-hub` branch/worktree `mission/oros-composition-law-001`, `docs/governance/BLOCK_COMPOSITION_LAW.md`  
Status: ACCEPTED governance companion; may be branch/worktree-only relative to some Hub heads.

- [~] Blueprint declares desired capability/outcome/constraints/reuse policy/acceptable ranges.
- [~] Factory later resolves exact eligible Blocks/Bridges/versions/digests/provenance/Ports/adapters.
- [~] `oros.lock` records actual composition and evidence; it does not grant authority.
- [~] Only `REUSABLE`, `CERTIFIED`, `GOLDEN` eligible for normal reuse.
- [~] No silent upgrade/fork/per-consumer patch/secret grant.
- [!] No general resolver/runtime generator/executable schema/package manager was authorised by this law.

## 2.4 Documentary composition schemas

Source: `docs/OROS-COMPOSITION-LAW-001/SCHEMAS.md` on composition-law branch.

- [~] `product_capabilities@v0` — Blueprint-owned desired need.
- [~] fields include capability id/version, outcome, necessity, constraints, reuse policy, eligible block/range/bridges, config refs, gap.
- [~] `oros.lock@v0` — documentary actual composition record.
- [~] fields include exact block id/version/package/tree digest/provenance/maturity/provides/requires/optionals/bridges/adapters/config refs/evidence.
- [!] Documentary only at time of source; no validator/generator implied.

## 2.5 Oros constitutional law

Source: `othrys-core/titan/adr/ADR-0050-oros-constellation-ratification.md`  
Status: ACCEPTED constitutional law.

- [~] Othrys = Control Plane.
- [~] Oros = sovereign governed digital plot/world for a product/customer/org/individual.
- [~] Oros may contain Website, Applications, Product, Data, Blueprint, Services, Integrations, Business identity, Operational lifecycle.
- [~] Every Oros has exactly one canonical Blueprint.
- [~] Oros is authoritative operational reality.
- [~] Constellation is a governed intelligence/management projection, not runtime reality.
- [~] Bridge transports/applies authorised policy; does not author policy; fails closed on absent/ambiguous/invalid policy.

---

# 3. TALOS — OPERATIONS / FLOW / LEDGER / REPLAY STOCK

Primary source family: `othrys-core/titan/talos/src/ops/**` and Hub mirror `core/titan/talos/src/ops/**`.

## 3.1 Engine / lifecycle

- [ ] `ops/engine.ts` — canonical `Complex`, mission intake/execution/state transition path.
- [ ] `ops/lifecycle.ts` — mission finite-state machine and legal transitions.
- [ ] states observed: `RECEIVED, VALIDATED, QUEUED, CLAIMED, RUNNING, VALIDATING, PAUSED_FOR_APPROVAL, RETRY_SCHEDULED, SUCCEEDED, FAILED, CANCELLED, DEAD_LETTERED, ARCHIVED`.
- [ ] optimistic-concurrency transition enforcement.
- [ ] success only through validation/evidence gate.

## 3.2 Events / receipts / replay

- [ ] `ops/events.ts` — append-only operation event union and `MissionRecord` fold.
- [ ] `ops/adapters/file-ledger.ts` — durable JSONL Night Ledger; fsync-before-memory; replay; torn trailing line handling.
- [ ] `ops/reconstruction.ts` — reconstruct run/correlation timeline, explicitly preserve unknowns.
- [ ] `store.replay(missionId)` — event replay/checkpoint semantics.
- [ ] `ops/tick/cycle.ts` — cycle journal `cycles.jsonl`.

## 3.3 Retry / timeout / failure

- [ ] `ops/retry.ts` — bounded exponential retry policy (`maxAttempts`, delay, cap).
- [ ] `ops/core.ts` — `TalosError`, retryable/non-retryable classification primitive.
- [ ] timeout/cancel isolation tests.
- [ ] dead-letter behaviour.

## 3.4 Idempotency / artifacts

- [ ] mission-level idempotency key binding.
- [ ] `ops/tick/idempotency-key.ts` — correlation+capability+input digest.
- [ ] canonical JSON SHA-256 input digest.
- [ ] content-addressed output/artifact references.

## 3.5 Scheduling / tick

- [ ] `ops/tick/cli.ts` — `--once` / daemon tick entry.
- [ ] `ops/tick/cycle.ts` — one cycle orchestration.
- [ ] `ops/tick/pidfile.ts` — single-writer PID file with stale PID recovery.
- [ ] due emitters: Meliteus, Callimachus, reverify, introspection, knowledge sources.

## 3.6 Flow / DAG stock

- [ ] `ops/adapters/reference-orchestrator.ts` — explicit mission `input.plan` DAG support; duplicate/unknown/cycle rejection.
- [ ] `engine.ts executeSteps()` — topological dependency walk and per-node execution.
- [~] historical PENTA seam added/attempted step-output→step-input threading; verify current branch before reuse.

## 3.7 Authority / disposition

- [ ] `ops/organ-disposition.ts` — execution disposition vocabulary incl authority/policy/dependency blocked states.
- [ ] `introspection/boundary.ts` — proposal-only / no-auto-fix / no-canon-writes / no-sandbox hard boundary.

**V2 rule:** before inventing a mission FSM, durable ledger, replay, idempotency, retry, DAG walker, PID/single-writer gate or receipt model, inspect Talos first.

---

# 4. KRONOS — KERNEL CONTRACT STOCK

Primary source: `othrys-core/titan/kronos/src/*`.

- [~] `lifecycle.ts` — kernel lifecycle states and legal transitions.
- [~] known states: `DORMANT, BOOTING, VERIFYING, ALIVE, DEGRADED, CRITICAL, RECOVERING, HALTING`.
- [~] `heartbeat.ts` — `KernelHeartbeat` contract: boot id, sequence, timestamp, uptime, lifecycle, constitution fingerprint, components, compacted context.
- [~] `execution-semantics.ts` — at-least-once delivery, idempotent boot steps, caller-owned idempotency, exactly-once false.
- [~] `cancellation.ts` — graceful vs forced cancellation contract; compensation requirement for graceful path.
- [~] `supervision.ts` — component lease contract.
- [~] child termination default propagate.
- [!] historical inventory found contracts-only / LIFE not activated. Verify before assuming runtime.
- [!] ADR-0071 boundary: Kronos owns valve/pulse; Talos owns calendar/crank/order of work. No second scheduler.

**V2 rule:** heartbeat/pulse/lifecycle work begins by harvesting these contracts, not inventing them again.

---

# 5. HEPHAESTUS / MYCELIUM — ENGINEERING, CONTAINMENT, RESOURCE, CAPSULE STOCK

Primary source family: `othrys-core/titan/hephaestus/src/**`.

## 5.1 Mycelium execution / DAG / resource stock

- [ ] `mycelium/dag.ts` — DAG compile/work graph support.
- [ ] `mycelium/governor.ts` — CPU/RAM/load ResourceGovernor / admission decision.
- [ ] `mycelium/lease.ts` — lease/concurrency control.
- [ ] `mycelium/telemetry.ts` — observational TelemetryBus.
- [ ] `mycelium/survival.ts` — durable survival/work/lease/corruption/recovery state.
- [ ] `mycelium/homeostasis.ts` — homeostasis logic; verify proper owner/use before extracting.

## 5.2 Containment / envelope

- [ ] `mycelium/containment.ts` — path/secret containment and envelope enforcement.
- [ ] known primitives: create envelope, path containment, enforce envelope, default read envelope.
- [ ] `mycelium/capsule.ts` — existing Mycelium capsule concept; **do not confuse with product Block Capsule; inspect semantics first.**

## 5.3 Host / assurance wiring

- [ ] `host/myceliumHost.ts`
- [ ] `host/assuranceTestCentreHost.ts`
- [ ] `core/bin/hephaestus-mycelium.mjs`
- [ ] `core/bin/assurance-test-centre.mjs`
- [ ] wiring modules for Talos/Nyx/Care/assurance.

## 5.4 Book of Hephaestus

- [~] defines Block Contract/Port/Manifest anatomy. *(V2-000C.R: the Socket/Capsule wording was not found in the recovered sources.)*
- [~] preferred order: qualified Block → Blueprint pattern → known composition → bounded adaptation → new construction.
- [~] Hephaestus must not self-loop or silently change workflow; Talos owns traversal/retries.

**V2 rule:** before inventing containment, resource governance, lease, survival queue, DAG compilation, engineering capsule, Forge or Block anatomy, inspect Hephaestus/Mycelium stock.

---

# 6. MNEMOSYNE — MEMORY / ADMISSION / SNAPSHOT STOCK

Primary source family: `othrys-core/titan/mnemosyne/src/**`.

- [ ] `admission-gate.ts` — origin classes, corroboration, admission provenance, contradiction and quarantine records.
- [ ] `knowledge-model.ts` — knowledge kinds/tiers/relations/admission verdicts.
- [ ] `callimachus.ts` + roster/shelf — knowledge review/callimachus stock.
- [ ] `muses.ts` — Muse gates/routing.
- [ ] `persistence.ts` — snapshot create/verify/restore + store interfaces.
- [ ] file-backed Mnemosyne snapshot store.
- [ ] `concordance.ts` — reconciliation/concordance stock.
- [ ] `vaults.ts`, `vault-grants.ts` — vault and grant primitives.
- [ ] `office.ts` — Mnemosyne office/runtime surface.
- [!] Mnemosyne is institutional memory, not live workflow DB. Do not repurpose it into run-state storage.

**V2 rule:** before creating memory admission, contradiction/quarantine, snapshots, provenance or institutional knowledge state, inspect Mnemosyne.

---

# 7. PROMETHEUS / RESEARCH STOCK

Known canonical families from Core/Hub:

- [ ] Prometheus Titan research/gather code and ADRs (`ADR-0008/0016/0018/0019` family).
- [ ] `great-library/titans/prometheus.md` historical/built posture.
- [ ] Prometheus Search Fabric research/seed material in Great Library/Garden.
- [ ] knowledge-source due hooks in Talos tick.
- [ ] source/evidence classification logic around Factory Research/Gather.

**V2 rule:** before inventing search fabric, source intake, external research provenance or gather classification, quarry Prometheus + Factory Gather.

---

# 8. RHEA / CARE STOCK

Known source/docs:

- [ ] `docs/mission036/CARE_CASE_CONTRACT.md`
- [ ] `docs/mission037/CARECASE_RUNTIME_CONTRACT.md`
- [ ] `docs/mission037/RHEA_DEGRADATION_PROOF.md`
- [ ] care runtime/store paths under Hub/Core state.
- [ ] known capabilities: `care.observe`, `care.assess`, `care.open-case`, `care.plan`, `care.request-repair`, `care.verify`, `care.watch`, `care.close`.
- [ ] durable CareCase deduplication/proof stock.
- [ ] proposal/request repair boundary; no uncontrolled Apply.

**V2 rule:** before inventing incident/care-case state, degradation watch, repair request or support-loop persistence, inspect Rhea.

---

# 9. THEMIS / METIS / EVALUATION & COUNSEL STOCK

- [~] `ADR-0072-metis-titan-of-counsel.md` — Metis counsel/intent charter; historical inventory said charter-only, no runtime workspace.
- [~] `ADR-0074-hermes-unification-and-themis-office.md` — Themis independent evaluation office, not necessarily Titan runtime.
- [~] Book of Hephaestus says Metis states intent/hypotheses/acceptance criteria, Hephaestus constructs, Themis independently evaluates when required.

**V2 rule:** before inventing planner/critic/judge roles, recover Metis/Themis boundaries.

---

# 10. TRUST / AUTHORITY / BRIDGE / POLICY STOCK

## 10.1 Trust Canal — Hub governed write path

Primary source: `othrys-hub/hub/trustcanal.py` and corresponding Core Trust Canal control-plane/specs.

- [ ] `propose_change(...)` — local brain proposes, cannot directly write.
- [ ] operator allow/deny gate.
- [ ] control-plane dispatch requirement before apply.
- [ ] path re-validation against repo/secret boundaries.
- [ ] Python compile check before `.py` write.
- [ ] states roughly pending → allowed/denied → applied/failed.
- [!] historically one-file/one-repo proposal scope. Verify before reuse.

## 10.2 Bridge constitutional role

From ADR-0050 / Constitution:

- [~] transports authorised commands/events/evidence.
- [~] may enforce policy authored elsewhere.
- [~] cannot author policy/interpret constitutional intent/own governance.
- [~] fail closed/escalate on absent/ambiguous/invalid policy.

## 10.3 Hermes / event bus / signal fabric

- [ ] `titan/event-bus/src/othrys/facts.ts` — fact type/validation/create primitives.
- [ ] `hub/signal_fabric.py` — process-local event/store honesty and disk projection.
- [!] historical signal fabric explicitly reported process-local memory / cross-process replay blocked; do not treat as durable bus.

**V2 rule:** before creating permission gates, write governance, fact envelopes, event validation or Bridge transport, inspect Trust Canal + Bridge + Hermes stock.

---

# 11. FACTORY — OROS BUILD PIPELINE STOCK

Primary source: `othrys-hub/hub/factory/**`.

## 11.1 Core run model / persistence

- [ ] `model.py` — `STAGES = UNDERSTAND, RESEARCH, PLAN, BUILD, VERIFY, PREVIEW, RELEASE`; run/stage models.
- [ ] `store.py` — per-Oros JSON durable persistence with atomic temp+replace.
- [ ] `workspace.py` — Oros workspace root convention.
- [ ] `provenance.py` — operator/dogfood/test/abandoned run provenance classification.

## 11.2 Autonomy seam / resume

- [ ] `service.py next_autonomous_edge()` — safe automatic edge selection; explicit operator-only decisions excluded.
- [ ] stale ACTIVE recovery → failed/interrupted semantics.
- [ ] persisted resume/autonomy seam.

## 11.3 Understand / plan / contracts

- [ ] `understand.py` — brief normalization and required fields.
- [ ] Factory acceptance contract generation/model.
- [ ] build spec generation.

## 11.4 Verify / repair / escalation

- [ ] deterministic verify executor.
- [ ] Chrome extension MV3 verifier stock.
- [ ] bounded repair cycles.
- [ ] bounded escalation repair count.
- [ ] acceptance item derivation.
- [ ] deterministic contract alignment repair introduced in Travel Log path.

## 11.5 Release / product packaging

- [ ] Chrome extension packaging/release/provenance machinery.
- [!] product-specific assumptions historically strong; extract primitives, do not import Factory wholesale into V2.

**V2 rule:** before building run persistence, stage machine, resume, acceptance, bounded repair, workspace conventions, provenance or release receipts, inspect Factory.

---

# 12. BUILDERS / PROVIDERS / AUTO-FRUGAL STOCK

Primary Hub sources:

- [ ] `hub/builders.py` — BuilderMind definitions, selection, tiers, Auto Frugal, apply/reject posture.
- [ ] `hub/capability_registry.py` — builder capability/eligibility registry (NOT product Block registry).
- [ ] `hub/providers.py` — provider adapters/roster.
- [ ] `hub/custom_minds.py` — custom OpenAI-compatible minds/builders.
- [ ] `hub/cost_intel.py` — frugal/reliability scoring.
- [ ] `hub/preflight.py` — provider/service preflight incl NVIDIA NIM checks.
- [ ] `hub/arsenal.py` — later free-builder arsenal additions.
- [ ] `hub/keymaster/engineering_battery.py` — builder engineering certification battery.
- [ ] `hub/ladder.py` — builder fallback ladder.
- [ ] `hub/window.py` ladder worker/progress UI integration.

Known seats/routes from live evidence:

- [ ] `qwen3-builder` local Ollama.
- [ ] local GPT-OSS custom builders.
- [ ] Claude CLI builder.
- [ ] Cursor external CLI adapter (historically direct-only / auto-ineligible).
- [ ] NVIDIA NIM custom/free seats incl tested Kimi/Step/Nemotron variants.
- [ ] Gemini/Cerebras/Mistral/provider seats.

Known lessons/code repairs:

- [ ] free-first tier selection.
- [ ] health/qualification filtering.
- [ ] bounded failover ladder.
- [ ] CORE-LOOP-001A single-builder/no-fallback fail-close path.
- [ ] CORE-LOOP-001B engineering-loop stall/finish contract repair.
- [!] CORE-LOOP-001C exposed unsafe existing-file `write_file`; do not import legacy mutation path blindly.

**V2 rule:** before creating provider selection, builder roster, certification, model health, cost routing, fallback or engineering-loop tools, inspect these files and CORE-LOOP evidence.

---

# 13. ENGINEERING LOOP / TOOLING STOCK

Known Hub engineering loop mechanisms:

- [ ] read-file tooling.
- [ ] find-files/repository inspection tooling.
- [ ] write-file tooling (unsafe for existing source observed in CORE-LOOP-001C; quarantine until inspected).
- [ ] finish contract / finish-after-write nudge.
- [ ] tool-turn limit / stall detection.
- [ ] `MAX_STALL_READS` and repeated-read loop guard work from CORE-LOOP-001B.
- [ ] engineering acceptance checks that reject docs-only changes for implementation-required missions.

**V2 rule:** never create an agent tool-loop without reviewing this failure history. Existing-file edits must be narrow/validated/transactional.

---

# 14. KEYMASTER / SECRETS / PROVIDER HEALTH STOCK

Known Hub/Core components:

- [ ] Keymaster credential broker/office.
- [ ] provider credential slots and health read models.
- [ ] engineering battery/certification integration.
- [ ] secret exposure guardrails.
- [ ] proposal-only / no auto-rotation historical posture.

Known health-related surfaces:

- [ ] provider health panel/read model.
- [ ] preflight checks.
- [ ] NVIDIA NIM catalog/model-demotion checks.

**V2 rule:** before inventing secret storage, credential references, health probes, builder qualification or rotation, inspect Keymaster.

---

# 15. ASSURANCE / TEST CENTRE / CHAOS / SOAK STOCK

Primary source family: Hephaestus host + Mycelium assurance modules.

- [ ] `host/assuranceTestCentreHost.ts` — discover→coverage→suite→break/recovery/security/authority→repair→posture model.
- [ ] coverage classes: fully/partially/untested/not-applicable/authority-gated/external-blocked/unknown.
- [ ] `core/bin/assurance-test-centre.mjs`.
- [ ] `mountainChaosHost.ts` / chaos CLI.
- [ ] `mountainSoakHost.ts` / soak CLI.
- [ ] `mountainStressHost.ts` / stress CLI.
- [ ] Mycelium chaos/red-team/soak-controller/soak-hardening modules.
- [ ] Talos `mission-control/soak.ts` deterministic accelerated soak.
- [ ] Hub `run.py --verify` / `--doctor`.
- [ ] Hub pytest suite.

**V2 rule:** before inventing coverage posture, independent verification, chaos, soak, stress or assurance evidence, quarry this subsystem.

---

# 16. BLUEPRINT / CROWN / FAMILY STOCK

Primary Core sources:

- [ ] `crown/blueprint.mjs` — governed reference-based institutional Blueprint index/compiler.
- [ ] `crown/family.mjs` — family tree/institutional hierarchy.
- [ ] Crown dist-context generation/validation.
- [ ] `docs/oi/BLUEPRINT_FAMILY_MAP.md`.
- [ ] ADR-0048 Blueprint family law.
- [ ] ADR-0066 template Blueprints/starter-stack doctrine.

Hub projection/editor stock:

- [ ] `hub/blueprint_studio/model.py`
- [ ] `hub/blueprint_studio/layout.py`
- [ ] `hub/blueprint_studio/navigation.py`
- [ ] `hub/blueprint_studio/panel.py`
- [ ] `hub/blueprint_studio/projection.py`
- [ ] `hub/blueprint_studio/proposals.py`
- [ ] `hub/blueprint_studio/validation.py`
- [ ] `hub/blueprint_studio/crown_source.py`

Known relationship/node vocab includes Oros/Blueprint/Constellation/Stars/Titans/assets/evidence/missions/history.

**V2 rule:** before building a Blueprint model, family registry, projection graph or node/relationship vocabulary, inspect these.

---

# 17. VISUAL / UI / GRAPH STOCK

## 17.1 Hub desktop shell

- [ ] `hub/main.py` — PySide6 application bootstrap.
- [ ] `hub/window.py` — major main-window/UI controller.
- [ ] `hub/dual_facade.py` — Mountain/Studio dual facade.
- [ ] `hub/browser.py` — QWebEngineView/shared browser, QWebChannel/JS bridge patterns.
- [ ] `hub/theme.py` — theme/status colors.
- [ ] `hub/timeline.py` — timeline/readout widgets.

## 17.2 Existing QPainter graph surfaces

- [ ] `hub/blueprint_studio/panel.py::_BlueprintCanvas` — nodes/edges, pan/zoom, hit testing, status colors, signals.
- [ ] `hub/blueprint_studio/layout.py` — current layout functions.
- [ ] `hub/system_map/widget.py::_MapCanvas` — older hand-rolled graph canvas.
- [ ] system-map hierarchy/layout/navigation modules.

## 17.3 Web/Studio surface

- [ ] `othrys-studio/apps/hub-web` React/Vite/Tailwind host.
- [ ] existing QWebEngine loopback static/Vite hosting pattern.
- [ ] Chromium remote debugging/QWebChannel bridge patterns.
- [!] React Flow/xyflow/Cytoscape/D3/dagre/ELK/mermaid were historically absent; do not claim existing stock without rechecking.

**V2 rule:** before introducing a new graph library, canvas, event bridge or UI shell, inspect these proven surfaces.

---

# 18. LIVE EVENT / JOURNAL / UI TRANSPORT STOCK

- [ ] Talos durable event ledger is strongest existing producer.
- [ ] `hub/hephaestus/journal.py` — append-only JSONL forge journal + replay helper (producer historically retired; verify before reuse).
- [ ] `hub/hephaestus/recovery.py` — recovery consumer.
- [ ] `hub/engineering_recall.py` — journal/recall consumer.
- [ ] `hub/window.py` `LadderWorker(QThread)` progress→Qt Signal pattern.
- [ ] many cross-process adapters use blocking subprocess + read final JSON.
- [!] historical finding: no general live event bus to UI; do not invent one without first assessing Talos ledger tail + Qt signal bridge option.

---

# 19. N8N / EXTERNAL WORKFLOW STOCK

Known source: `othrys-core/titan/mission-control/n8n/`.

- [ ] `phase1a-github-notify.json`
- [ ] `phase1b-guard-validate.json`
- [ ] `replay-webhook.mjs`
- [ ] `README.md`
- [ ] GitHub webhook HMAC verification pattern.
- [ ] Telegram terminal notification pattern.
- [ ] signed replay/self-test pattern.
- [!] explicit doctrine: Git remains source of truth; n8n is projection/notifier, never protocol fact/state authority.
- [!] idempotency historically not implemented for GitHub delivery key.

**V2 rule:** use n8n for projections/integration only unless law changes; never make it canonical workflow truth by accident.

---

# 20. OBSIDIAN / MEMORY SYNC / PROMPT-CLOSE STOCK

Hub/local stock:

- [ ] `hub/obsidian_log.py` — known Hub vault writer.
- [ ] vault path resolution in `hub/config.py` (`resolve_obsidian_vault`).
- [ ] canonical Obsidian Build Log.

Memory repo automation stock:

- [ ] `.automation/sync_obsidian_vault.py` — safe vault sync: identity check, secret screening, conservative fetch/rebase/push, local==remote verification, no force/reset/clean.
- [ ] five-minute/timed runner around vault sync.
- [ ] Prompt-Close Law requiring canonical logging + online equality before claiming completion.
- [!] legacy Hub mirror-export path has produced `ModuleNotFoundError: No module named 'hub'`; use `--skip-export` where appropriate rather than coupling V2 to broken exporter.

**V2 rule:** before creating sync/logging/mirror logic, inspect and reuse this stock. V2 feedback and remote visibility must remain separate from legacy exporter failure.

---

# 21. CONTROL FEEDBACK V2 — ALREADY ADMITTED

Canonical V2 repo: `vtcbelgium/othrys-v2`.

- [x] `blocks/control_feedback/__init__.py`
- [x] `blocks/control_feedback/validate.py` — dependency-free schema-subset validator.
- [x] `blocks/control_feedback/secrets.py` — credential denylist/refuse-write guard.
- [x] `blocks/control_feedback/receipt.py` — atomic writer, `LATEST.json`, immutable run receipt, sync stamp.
- [x] `blocks/control_feedback/cli.py` — `validate | emit | stamp-sync`.
- [x] mission envelope schema.
- [x] receipt schema.
- [x] sync stamp schema.
- [x] tests: 22 passing at V2-000A/000A.1 evidence.
- [x] `BOOK_OF_GPT.md` — V2 control law.
- [!] host/delegate GitHub egress distinction proven; delegate environment cannot be assumed to push.

---

# 22. PRODUCT BLOCK STOCK — DETAILED KNOWN SPECIMENS

## 22.1 `block.media.image-prep` v0.1.0

- [ ] family/path: `othrys-blocks/blocks/media/image-prep`.
- [ ] stateless image preparation capability.
- [ ] operations: downscale, JPEG normalize, square compose; optional background removal Bridge per doctrine.
- [ ] browser/Chromium Canvas runtime requirement.
- [ ] no network, no secrets in core.
- [ ] Node contract tests + Playwright Chromium tests.
- [ ] provenance from VTC extraction.
- [ ] second consumer `oros-image-prep-transplant` proved reuse; historical classification REUSABLE.
- [!] do not fake a Node canvas implementation; preserve proven browser surface if reused.

## 22.2 `block.monetization.affiliate-offer` v0.1.0

- [ ] canonical package under `othrys-blocks/blocks/monetization/affiliate-offer`.
- [ ] documented Port around affiliate offer.
- [ ] proven eBay EPN Bridge.
- [ ] requires credential/config references.
- [ ] second consumer `oros-affiliate-offer-transplant` proved reuse; historical classification REUSABLE.
- [!] old README maturity may be stale relative to transplant evidence.

## 22.3 `block.analytics.visit-tracking`

- [ ] path under `blocks/analytics/visit-tracking`.
- [ ] visit-ingest Port + visit-record schema.
- [ ] host-provided salt, persistence Bridge, retention days.
- [ ] memory/Supabase/Vercel geo Bridges/adapters.
- [ ] historical classification RAW due missing independent second-consumer proof.

---

# 23. OFFICE BUDDY / EXTENSION PRODUCT STOCK

Known Oros/product evidence:

- [ ] Office Buddy Mini Chrome MV3 extension.
- [ ] popup UI, single CTA, settings removed in final compact form.
- [ ] grammar/empathy/calendar copy/countdowns/water/stretch/anti-screen-sleep/Excel boss-mode concepts.
- [ ] mascot/design assets/history in Studio/product repo/evidence.
- [ ] Factory BUILD by local Qwen, repair/escalation path, VERIFY V1–V6, release/provenance/package machinery.

Potential quarry categories:

- [ ] Chrome extension scaffold.
- [ ] MV3 verifier.
- [ ] compact popup UI patterns.
- [ ] calendar/import parsing logic.
- [ ] anti-screen-sleep implementation.
- [ ] extension release packaging.

---

# 24. STUDY BUDDY STOCK

Known repo: `study-buddy`.

Potential code/capability quarry:

- [ ] transcript ingestion / speech-to-text integration work.
- [ ] study/lesson capture.
- [ ] spaced review/repetition contract worktree in Hub.
- [ ] knowledge magnet / course analytics concepts.
- [ ] OpenAI provider adapter/error handling fixes from previous work.
- [!] inspect actual repo before reuse; do not infer implementation from product doctrine.

---

# 25. VTC EXTRACTION / BLOCK WORKTREES

Known worktrees/quarry lines:

- [ ] `vtc-block-extract-001r`
- [ ] `vtc-block-affiliate-extract-001`
- [ ] `vtc-block-analytics-extract-001`
- [ ] Hub `hephaestus-block-forge-001` worktree.
- [ ] Hub `oros-composition-law-001` worktree/branch.

These contain extraction/provenance/contract evidence. Before re-extracting a capability, search these first.

---

# 26. CORE / HUB WORKTREES & ALTERNATE IMPLEMENTATIONS TO CHECK BEFORE WRITING DUPLICATES

Known lines from live inventory:

- [ ] `othrys-hub-main`
- [ ] `othrys-hub-oros-composition-law-001`
- [ ] `othrys-hub-hephaestus-block-forge-001`
- [ ] `othrys-hub-study-buddy-spaced-review-contract-001`
- [ ] `othrys-hub-obsidian-always-sync-001`
- [ ] `othrys-hub-blueprint-studio-001`
- [ ] `othrys-hub-system-map`
- [ ] `othrys-hub-design-studio-modern-web-001`
- [ ] `othrys-hub-tiles-*` family.
- [ ] `othrys-core-mission036-adr`.

**Rule:** a missing feature on current HEAD may already exist in a worktree. Search worktrees before creating it again.

---

# 27. CHROME / PLAYWRIGHT / BROWSER VERIFICATION STOCK

- [ ] Playwright tests in `othrys-blocks` image-prep.
- [ ] Playwright tests in affiliate-offer.
- [ ] Chrome MV3 verifier in Factory.
- [ ] CDP / extension popup verification knowledge from Factory repair work.
- [ ] QWebEngine Chromium remote debugging in Hub.

**V2 rule:** before adding browser harnesses or browser-based Block adapters, search this stock.

---

# 28. GIT / PROVENANCE / DURABILITY STOCK

- [ ] atomic file write patterns in Factory store.
- [ ] fsync durable JSONL in Talos FileNightLedger.
- [ ] Git-native canonical knowledge doctrine/Garden seed.
- [ ] Trust Canal governed commit/apply path.
- [ ] Factory provenance run classification.
- [ ] Block provenance/tree-digest evidence.
- [ ] Obsidian safe Git sync script.

**V2 rule:** before creating an atomic writer, append-only log, Git receipt, provenance record, digest, sync routine or commit gate, search these first.

---

# 29. KNOWN DO-NOT-DUPLICATE / DO-NOT-INHERIT WARNINGS

- [!] Do not create a second Talos-style mission FSM/ledger/retry engine without proving existing Talos primitives cannot be extracted.
- [!] Do not make Kronos another scheduler; existing law forbids this boundary violation.
- [!] Do not turn Mnemosyne into live run-state DB.
- [!] Do not create universal Block/Port registries merely for convenience.
- [!] Do not confuse product Capability Blocks with Studio UI blocks.
- [!] Do not confuse `hub/capability_registry.py` builder registry with product Block registry.
- [!] Do not confuse Mycelium `capsule.ts` with product Block Capsule without inspecting semantics.
- [!] Do not trust `write_file` on existing source from legacy engineering loop without repair/guard.
- [!] Do not assume delegate environment == Windows host capabilities.
- [!] Do not use n8n as canonical execution truth.
- [!] Do not claim sync/push/health/pass without direct proof.
- [!] Do not import the entire legacy Hub into V2. Quarry/extract primitives only.

---

# 30. INVENTORY GAPS — MUST REMAIN VISIBLE

This file is intended to become exhaustive. The following stock is known to exist but still requires a file-by-file indexed pass before GPT may claim the inventory is literally complete:

- [ ] Full `othrys-hub/hub/*.py` file-by-file catalogue.
- [ ] Full `othrys-hub/tests/**` catalogue.
- [ ] Full `othrys-core/titan/**` file-by-file catalogue.
- [ ] Full `othrys-core/core/bin/**` CLI catalogue.
- [ ] Full `othrys-blocks/**` file-by-file catalogue from the local/private repo.
- [ ] Full `othrys-studio/**` file-by-file catalogue.
- [ ] Full `othrys-tools/**` file-by-file catalogue.
- [ ] Full `othrys-web/**` file-by-file catalogue.
- [ ] Full `vtc-platform/**` capability quarry catalogue.
- [ ] Full `study-buddy/**` code catalogue.
- [ ] Every unmerged worktree's unique code delta.

**Critical honesty rule:** until those passes are completed, GPT must say `inventory coverage: PARTIAL` rather than `complete`.

---

# 31. V2 ADMISSION / REUSE CHECKLIST

For each candidate reused in V2, GPT changes its marker to `[x]` only after evidence answers:

- [ ] exact source repo/path/commit identified;
- [ ] authority/status known;
- [ ] actual code read;
- [ ] tests/proof read or rerun;
- [ ] hidden dependencies identified;
- [ ] runtime/environment assumptions identified;
- [ ] security/authority implications identified;
- [ ] direct reuse vs extraction decision recorded;
- [ ] V2 contract/Block mapping recorded;
- [ ] V2 receipt names the provenance;
- [ ] no duplicate implementation was introduced.

---

# 32. CURRENT GPT DECISION RULE

Before issuing the next V2 implementation mission, GPT must begin internally with:

`INVENTORY CHECK → CANON CHECK → SMALLEST REUSE/EXTRACTION → MISSION → RECEIPT → GPT REVIEW`

If this file already names a candidate mechanism, GPT must inspect that mechanism before proposing new code.

**Maxim:** We already paid for the old code. V2 earns speed by harvesting it, not forgetting it.

---

# 9. SENIOR CANON POINTERS RECOVERED BY V2-000C

Verified by direct filesystem search on 2026-08-23, read-only. Folded in from
`docs/LEGACY_INVENTORY.md` during the V2-000E reconciliation; that file is now a
pointer to this one. Paths are under `C:\Users\othry\Projects\`.

| Asset | Path | Status |
|---|---|---|
| Book of Blocks | `othrys-hub/docs/governance/BOOK_OF_BLOCKS.md` | ACTIVE senior doctrine (709 lines) |
| Block Composition Law | `othrys-hub-oros-composition-law-001/docs/governance/BLOCK_COMPOSITION_LAW.md` | ACCEPTED 2026-08-22, **unmerged into hub main** |
| Documentary schemas | `othrys-hub-oros-composition-law-001/docs/OROS-COMPOSITION-LAW-001/SCHEMAS.md` | DOCUMENTARY ONLY, outside canonical HEAD |
| Hephaestus Block Forge | `othrys-hub-oros-composition-law-001/docs/OROS-COMPOSITION-LAW-001/HEPHAESTUS-BLOCK-FORGE.md` | ACCEPTED packet, worktree only |
| ADR-0050 Oros & Constellation Ratification | `othrys-core-windows/titan/adr/ADR-0050-oros-constellation-ratification.md` | **Accepted Constitutional Law** (L4, 2026-07-19) |
| othrys-blocks conventions | `othrys-blocks/docs/CONVENTION.md` | ACTIVE physical/identity law |
| Specimen Block | `othrys-blocks/blocks/media/image-prep/` | IMPLEMENTED; `BLOCK.md` records `0.1.0`, PRODUCT, maturity REUSABLE |
| Provisional Block Passport | `othrys-hub/docs/VTC-BLOCK-CONTRACT-001/PROVISIONAL-BLOCK-PASSPORT.md` | Documentation checklist only |
| Oros Zero specimen | `oros/oros-zero/` | IMPLEMENTED (PENTA-001, 2026-08-23). Referenced, never recreated or modified |

## 9.1 Canon drift — recorded, not repaired

V2 does not merge worktrees and does not modify legacy repositories. These belong
to the Hub owner:

1. `BOOK_OF_BLOCKS.md` in `othrys-hub` main is 709 lines; the worktree copies are
   710 and carry the pointer to the accepted composition companion.
2. `BLOCK_COMPOSITION_LAW.md` is ACCEPTED (operator Apply, 2026-08-22) but exists
   only in the worktrees, not in the file the Book calls its canonical source.
3. `docs/OROS-COMPOSITION-LAW-001/` — including the documentary
   `product_capabilities@v0` and `oros.lock@v0` shapes — sits outside canonical HEAD.

When V2 quotes this law, quote the worktree copy and say so.
