# PandaOS -> OTHRYS V2 Harvest Report — 2026-08-27

**Status:** RESEARCH / DOCUMENTED_ONLY / NO BUILD AUTHORITY  
**Observed on:** PandaOS v1.0.1, Windows Legion, disposable project `othrys-panda-lab`  
**Purpose:** preserve what was actually observed, separate it from inference, and define what OTHRYS V2 should study before harvesting any pattern.

## Executive verdict
PandaOS is a serious reference implementation for the same problem-space OTHRYS occupies, but it is not currently proven to replace OTHRYS.

The strongest observed value is not its chat UI. It is the combination of structured project state, role/persona switching, reusable skills, explicit permission modes, model/provider abstraction, project knowledge, and a real Work State state-machine with human-decision gates and evidence gates.

OTHRYS should not react by rebuilding PandaOS or abandoning V2. It should use PandaOS as a living specimen: test it on bounded real work, harvest interaction and control patterns that survive verification, and keep OTHRYS focused on its larger North Star — autonomous build, verification, operation, repair, maintenance, learning, and lifecycle control over time.

## Evidence classes used in this report
- **OBSERVED_UI:** visible directly in screenshots during this session.
- **OBSERVED_RUN:** behavior seen during the controlled `OTHRYS Viewer Test` Work State walkthrough.
- **PANDA_REPORT:** Panda's own project-local read-only report from `.pandaos/*` / `.claude/*`.
- **EXTERNAL_CONTEXT:** public background discussed in-session; must be independently reverified before it becomes canonical V2 evidence.
- **INFERENCE:** design conclusion for OTHRYS; not a fact about PandaOS.
## 1. Project composition observed

The new-project wizard exposed a three-step composition flow: `Start -> Agents -> Finalize`.

`Start Fresh` was selected. Panda also offered category templates including Data, Development, Productivity and Tools, with concrete starters such as Analyze Data, Data Warehouse, Full-Stack App, Website, API/Backend Service, Desktop Electron App, Mobile App, Browser Extension and Library/Package.

**Harvest signal:** a project template is not just boilerplate; it is a capability/team preset. OTHRYS should later study whether an Oros Blueprint should declare required authorities/capabilities and let the runtime assemble them, instead of hard-wiring every Titan and Block into every mission.

The default team selection exposed four roles:
- Planner — plans features, creates specs, breaks work into ordered tasks.
- Builder — implements from the plan, writes tests.
- Reviewer — quality gate, checks requirements/implementation.
- Designer — produces accessible interactive design/prototypes.

The wizard initially surfaced two skills (`git-commit`, `git-pr`), but the created project exposed a much larger skill set. This matters: the wizard is a simplified presentation, not the full runtime truth.

**OTHRYS mapping candidate:** `role/authority != capability`. Panda's separation of persona from skill independently supports the OTHRYS separation of Titan from Block, but Panda personas are not equivalent to Titans and Panda skills are not automatically equivalent to certified Blocks.
## 2. Agents/personas and skills — project-local evidence

Panda's read-only project-local report found four on-demand team personas in `.pandaos/team/`, referenced by `team-config.md` and `.team-managed.json`.

Important correction to the early UI interpretation: these were reported as **inline personas, not independently running sub-agents**. `.pandaos/agents/` and `.claude/agents/` were empty in the test project.

Reported role/skill bindings:
- `planner` -> `planning-and-task-breakdown`, `spec-driven-development`, `planning`
- `builder` -> `incremental-implementation`, `ai-code-review`, `git-commit`
- `reviewer` -> `ai-code-review`, `multi-agent-review`, `systematic-debug`
- `designer` -> `frontend-design`, `web-assets`, `pandaos-design-prototype`

Panda reported 12 skills in `.pandaos/skills/` and 19 in `.claude/skills/`, with the latter a superset. Additional visible skills included `pandaos-automation-builder` and a design suite for documents, mockups, motion, product demos and slides.

**Harvest:** OTHRYS should study declarative bindings between an authority and the small capabilities it may invoke. Avoid giant permanent prompts that contain every procedure.

**Do not copy blindly:** OTHRYS Blocks carry maturity, provenance, admission and proof obligations. Panda skills were not shown to have equivalent certification, digest binding, adversarial proof or independent verifier requirements.
## 3. Permission model observed

The chat execution selector exposed four meaningful modes:
- **Agent** — edits, commands and web fetches run without asking.
- **Auto-Edit** — file edits run automatically; commands/fetches still ask.
- **Plan** — edits and commands denied; reads/searches allowed.
- **Default** — asks before edits, commands and web fetches.

This is one of Panda's clearest UX wins. Authority is visible and operator-selectable instead of hidden in prompt prose.

**Harvest candidate for V2:** expose explicit operating authority levels such as `OBSERVE`, `PLAN`, `SUPERVISED_EXECUTE`, `AUTONOMOUS_EXECUTE`, tied to Trust Canal policy rather than a UI-only toggle.

The first broad inspection also surfaced per-tool permission cards with `Allow`, `Always`, `Deny` for external-directory access and Atlas actions.

**OTHRYS requirement:** any analogous permission should be scope-bound, attributable, expiring where appropriate, and recorded as evidence. `Always` must never become an invisible global escalation.

The project experiment demonstrated a valuable principle: when the Work State required a file artifact but the operator's original instruction forbade file writes, Panda stopped and surfaced the conflict instead of silently violating the stronger constraint.

**Harvest:** policy conflict should be a first-class stop condition, not a prompt-following contest.
## 4. Atlas / knowledge layer observed

Atlas was initially mistaken for a broken subsystem because `pandactions_atlas_structure` calls stalled at the exact 300-second response timeout. The later settings screenshots corrected that diagnosis: **Atlas was disabled** for the account's real corpus, while a fictional sample knowledge base remained viewable.

The sample Atlas UI exposed a structured knowledge home with Search, Home, Knowledge map, Inbox, Review and typed page groups including concepts, workflows, patterns, events, companies, commitments and requirements.

The sample also proposed turning a repeated procedure into a skill, with a human `Create the skill` decision. This suggests an explicit bridge from repeated behavior -> extracted procedure -> reusable capability.

**Mnemosyne harvest candidate:** observe repeated successful procedures, propose procedural memories/capabilities, but require provenance + qualification before promotion to a Block.

Atlas settings showed a project-watch model. The Community plan reported that one project can be indexed; `othrys-panda-lab` was the watched project, while the Demo Dashboard was not.

Settings also showed a distinction between session-derived pages and whole-codebase indexing. Whole-project Atlas indexing was marked as an upgrade capability in the observed UI.

**Harvest:** separate episodic/session memory from code/project semantic indexing. Do not pretend one retrieval mechanism covers both.
Atlas generation settings observed:
- PandaOS Cloud connection for background generation.
- Intensity setting (Balanced observed).
- English default page language.
- Ignore rules for paths.
- Free-form steering instructions appended to generation.
- Explicit daily and monthly spend caps; observed defaults were `$2/day` and `$10/month`.

Pipeline settings observed:
- `Write knowledge pages` enabled.
- Session summary threshold set to `3` minimum entities in a window.
- `Auto-apply maintenance` enabled.
- `Ground every message` disabled, with an explicit warning that it costs context.

**Mnemosyne harvest:** memory maintenance should be its own background pipeline, with bounded cost/context budgets, explicit write policy, and no assumption that every turn must be grounded with the whole memory corpus.

Connected-source settings exposed metadata-level mirroring for Designs & artifacts, Google Calendar, Gmail started threads and Google Drive documents. The UI explicitly said external knowledge is mirrored as metadata-level summaries, not full content.

**Harvest:** connected-source memory should distinguish metadata mirrors from canonical content. Mnemosyne must record source class and authority so a summary never masquerades as the underlying document.
Atlas agent-access settings observed:
- Agents may be allowed to save/edit memory through `atlas_remember` and `atlas_update_page`.
- A `Tools while paused` policy controls whether Atlas tools remain callable when generation is paused.
- In the observed configuration, tools while paused were set to turn off.

This likely explains the earlier 300-second Atlas calls more plausibly than a proven runtime defect. The exact failure mode still needs reproduction after Atlas is enabled.

Sharing/export exposed a particularly relevant feature: **Export vault** to an Obsidian-openable folder, with an OKF bundle and `AGENTS.md`; options included redaction and an AI pass.

**Mnemosyne harvest:** knowledge must remain exportable and inspectable as files. OTHRYS should strongly prefer Git/file-readable institutional memory over a vendor-opaque database. Export, provenance and reconstructibility should be designed in from the start, not added as escape hatches.

Danger-zone settings showed that pausing Atlas keeps the corpus readable, and deleting the knowledge base snapshots/archives before starting empty.

**Harvest:** distinguish `pause generation`, `archive`, `delete active corpus`, and `hard purge`. Destructive memory actions need different semantics and receipts.

## 5. Search / embeddings observed
Panda's chat search runs embeddings on-device by default unless cloud embedding is enabled. The observed model string was `Xenova/multilingual-e5-small`, 384 dimensions, described as free/on-device. The UI reported 192 messages indexed.

**Mnemosyne/Search Fabric candidate:** benchmark a small local multilingual embedding model for fast semantic recall before building heavy infrastructure. Measure retrieval quality on OTHRYS Books, receipts, Chronicle and school material rather than adopting Panda's choice by analogy.
## 6. Model/provider abstraction observed

The Models settings exposed these connected routes:
- PandaOS Cloud — Community plan.
- Claude — Max plan.
- OpenAI Codex — Plus plan.

Additional connection classes visible but not connected:
- Claude on AWS Bedrock.
- User API keys.
- OpenCode Go.
- **Local**.

The presence of a first-class Local connection is important for OTHRYS: Panda is explicitly designed to accept local inference/runtime as one route rather than treating cloud models as the only intelligence source.

Default configuration observed:
- Connection: PandaOS Cloud.
- Model for new chats: `Auto`.
- Reasoning effort: Medium.
- Reuse last model/connection globally: off.
- Reuse last model/connection within the project: on.

`Agent model switching` was enabled. Its UI description says agents keep the tier they request while Auto chooses the actual model.

**Switchyard harvest:** agents/authorities should request a capability/tier/SLA, not a provider name. The router should resolve that request against certified model health, cost, locality, privacy, latency and task fit.
`Usage Limit Failover` was a single toggle: when a subscription runs out mid-chat, move the chat to another connection that still has usage.

This is useful but, from the UI observed, it is **quota failover**, not evidence of a full Auto-Frugal router. No cost/health/certification/locality scoring was shown.

**OTHRYS distinction to preserve:** Switchyard/Auto Frugal should remain evidence-driven routing across local/free/subscription/paid seats, with health and certification gates. Panda's failover is a reference for continuity UX, not proof that OTHRYS routing is redundant.

Voice and image generation were separately routable. Voice used Panda Cloud in the observed configuration. Image generation also showed Panda Cloud, with a note that Codex sessions use the ChatGPT plan for image generation.

**Harvest:** separate modality routing from coding/chat routing; a single provider preference should not dictate speech, vision, image, embedding and engineering engines.

## 7. Work State — strongest observed harvest

Work State was initially disabled under Models -> Behavior. Its description: track a feature through phases, each with its own mode, owner and gates; disabling detaches chats but leaves the record intact.

After enabling it, a controlled hypothetical feature `OTHRYS Viewer Test` was created in Plan mode with a persistent Progress panel separate from ordinary chat.

The panel represented a durable feature object (`F001`) with Objective, Problem, Scale, Out of scope, Risks, Details, Slices and task progression. The chat operated on this object rather than relying on conversational memory alone.

**Core harvest:** conversational AI should operate against structured durable work state. The chat is an interface/controller; it must not be the only source of mission truth.
The first Work State decision card detected a larger job and asked `Plan it out` versus `Just start`. Choosing `Plan it out` moved the feature into a Planner-owned Plan phase and authored the work plan.

The planned test used one slice, `Viewer Test scaffold`, with three stages:
`Design -> Build -> Review`.

The Progress panel showed overall slice progress independently from the chat transcript, including completed/open task counts.

An autonomy/intervention selector appeared when starting work:
- `Run everything` — slices proceed automatically; design/checkpoints pass on their own.
- `Only ask at design and checkpoints` — routine work runs; operator is asked at consequential boundaries.
- `Ask me before each slice` — explicit approval before each slice.

**High-value harvest:** autonomy should be a policy over transition classes, not a binary `autonomous yes/no`. OTHRYS should distinguish routine execution from consequential gates and allow operators to choose how often intervention is required without changing the underlying lifecycle.

The middle policy was used for the experiment.

## 8. Work State ownership and mode handoff

Observed phase ownership/modes in Panda's final report:
- Plan -> Planner -> `plan` mode.
- Design -> Designer -> `plan` mode.
- Build -> Builder -> `acceptEdits` / Auto-Edit mode.
- Review -> Reviewer -> `default` mode.

When Design completed, Panda called a work-task completion operation and attempted a slice advance. The transition did not silently mutate the feature: it raised an approval card and waited.
The approval card explicitly recorded the proposed transition (`Move "Viewer Test scaffold" to Build?`) and the chosen execution mode. After approval, the card remained as an `ANSWERED` decision record with the operator's choice.

The same slice object then continued into Build; Panda did not create a replacement pseudo-job. Ownership visibly changed Designer -> Builder and the Build task became open while Design stayed completed.

**Harvest:** transition records should survive as audit evidence attached to the same durable mission/slice identity. Do not model each phase as a disconnected chat task.

## 9. Human-decision gates vs machine-evidence gates

The experiment exposed a particularly strong distinction:
- Plan gate: `approval: required`.
- Design gate: `approval: required`.
- Build gate: `approval: none`, `evidence: required`, plus a declared artifact.
- Review gate: `approval: none`, `evidence: required`.

This cleanly separates **permission** from **proof**.

Human approval means: an authorized person permits a transition.
Evidence means: the system can demonstrate that the required condition/work exists.

**OTHRYS harvest:** Trust Canal admission/authority and Talos/Verifier evidence should remain orthogonal. A user saying yes is not proof of success; proof of success is not permission to perform a consequential action.

This pattern strongly aligns with existing V2 law that the builder never verifies itself, but Panda's UX makes the distinction much easier for an operator to understand.
The Build stage declared its completion artifact before transition: an `implementation-log` at `.pandaos/logs/f001-othrys-viewer-test.md`.

When that artifact conflicted with the original no-write instruction, the Builder stopped and offered two choices instead of falsifying completion. After the operator explicitly authorized only that one file, Panda first attempted its artifact tool, reported that tool unavailable in the environment, then wrote the declared file directly within the authorized path.

The Builder then checked off the Build task and advanced the slice while supplying evidence. The Reviewer became active, read the implementation log, compared it with the recorded plan/design, checked the Review task, and completed the slice.

**Harvest:** completion contracts should declare required artifacts/evidence before execution. Evidence created after failure to justify an already-made claim is weaker than an artifact that the gate expected in advance.

**Study requirement:** Panda's Reviewer was a persona in the same overall environment. OTHRYS must not infer independence from the label `Reviewer`; V2's independent verifier boundary remains stronger and must be preserved.

## 10. Final Work State semantics observed

Panda's final summary reported the transition mechanisms:
- `work_feature set-phase` moves the whole feature between phases.
- `work_slice advance / complete` moves a slice through its stages.
- Each transition re-arms the next owner with that stage's mode/engine/effort.
- When a gate needs approval, an awaiting-approval call returns and the stage does not move until answered.

The final Progress panel showed the plan at `1/1`; the slice had traversed all three stages. The feature could then be explicitly completed as a separate final transition.

**Harvest:** OTHRYS should model feature/mission state, slice/work-unit state and task state separately. One status field is not enough for a durable autonomous lifecycle.
## 11. UX patterns worth studying

The screenshots consistently separated three layers:
1. **Conversation** — explanation, decisions and operator dialogue.
2. **Structured Progress** — persistent feature state, objectives, risks, slices and task counts.
3. **Execution controls** — mode, model Auto, tools, approval cards and intervention policy.

This is a major presentation lesson for V2. OTHRYS currently has rich evidence and control concepts; Panda demonstrates how to expose them without forcing the operator to read raw ledgers.

Specific UI harvest candidates:
- decision cards embedded in the timeline but durable after answering;
- side-by-side Progress panel that survives persona changes;
- compact `owner + phase + mode` transitions;
- visual completed/open task counts inside one stable slice;
- clear `Waiting on you`, `Working`, `Continue` operator states;
- explicit `Out of scope` and `Risks` in the plan, not buried in prose;
- autonomy policy selectable at the boundary where work begins;
- simplified wizard views backed by richer project-local configuration.

**Do not harvest cosmetics before semantics.** V2 should first prove the state/gate model, then make it satisfying and visual.

## 12. Reliability defects / caution observed

Two early reconnaissance attempts hit the exact five-minute AI-response timeout while attempting Atlas-related operations. The first broad scan also wandered to `C:\Users\othry\Projects\AGENTS.md`, outside the intended lab folder, triggering external-directory permission requests.

This proves Panda can over-broaden a reconnaissance task unless scope is explicit. It also proves UI polish does not remove agent/runtime failure modes.
The later Atlas settings showed Atlas generation disabled, so the timeout cannot yet be classified as an Atlas engine defect. Reproduce only after deliberate enablement, with one watched project and spending caps understood.

The Work State plan also showed a wording inconsistency: Scale `Standard` was described as `slices and tasks, but no gates`, yet the actual Design stage carried `approval: required`. Treat marketing/UI labels as simplified views; inspect the underlying state before copying concepts.

The Build artifact tool was unavailable during the test, requiring a direct file write after narrow operator authorization. This is a useful resilience behavior but also a reminder that capability availability can differ from declared workflow expectations.

**OTHRYS lesson:** capability presence, capability health and capability authority are three different facts and must be checked before a mission depends on them.

## 13. PandaOS vs OTHRYS — current boundary

PandaOS has now been directly observed doing real structured orchestration inside an initiated feature workflow. It has not been observed doing the full OTHRYS North Star autonomously over time.

Still unproven in Panda from this session:
- continuous deployed-service monitoring;
- spontaneous fault detection without a user-started chat/task;
- self-initiated repair based on health conditions;
- independent verifier on a separate node;
- certified capability admission with digest/provenance/maturity;
- distributed Legion/T590 execution routing;
- durable incident learning that changes future autonomous policy;
- economic survival/autonomous product portfolio behavior;
- autonomous Oros maintenance across long-lived deployments.

Therefore Panda should currently be treated as **workstation/orchestration reference**, not as proof that the OTHRYS lifecycle is redundant.
## 14. OTHRYS concepts strengthened by the comparison

The session gives external implementation support to several V2 ideas without proving Panda's internals are identical:
- **Titans vs Blocks:** authority/persona should be distinct from reusable capability.
- **Talos / lifecycle:** work should move through explicit states, not implied conversational phases.
- **Trust Canal:** human authority gates should block transitions, not merely add advisory text.
- **Verifier/evidence:** completion must require proof separate from permission.
- **Mnemosyne:** memory should have typed knowledge, background maintenance, scoped watching, export and review.
- **Switchyard:** authorities should request model capability/tier; routing should resolve provider/model.
- **Command Deck:** state, decisions and evidence can be made visually legible without weakening the underlying ledger.
- **Visual Control Layer:** GUI state can become another sensor/actuator under observe/supervise/autonomous policy.

The OTHRYS advantage should not be `we have more nouns`. It should be that these mechanisms are bound into a trustworthy autonomous lifecycle with independent proof, reconstructible state and long-lived maintenance.

## 15. High-priority harvest candidates

### H1 — Work State state machine
Study feature -> slice -> stage -> task identity, transition operations, re-arming of owner/mode/engine, resume behavior, cancellation, rollback, stale-state handling and persistence across restarts.

### H2 — Gate taxonomy
Extract the minimal distinction between `approval`, `evidence`, `artifact`, `checkpoint`, `policy conflict`, and `transition authority`. Compare directly with Trust Canal + Talos + Control Feedback rather than creating a second gate system.

### H3 — Intervention policy
Study how `Run everything`, `Only ask at design/checkpoints`, and `Ask before each slice` map to transition classes. Candidate OTHRYS equivalent: operator chooses intervention policy while mission law remains unchanged.
### H4 — Atlas -> Mnemosyne
Study typed page model, knowledge map, Inbox/Review, background extraction, maintenance, contradiction handling, memory edits by agents, watched-project scope, source metadata, export and archive/delete semantics.

### H5 — repeated procedure -> skill proposal
The sample Atlas UI explicitly proposed creating a skill from a repeated procedure. Study the trigger, confidence threshold, human review and lifecycle. OTHRYS analogue should be `observed repeated procedure -> Garden candidate -> Hephaestus qualification -> Block admission`, never direct memory-to-production promotion.

### H6 — local search
Benchmark small on-device embeddings for fast semantic recall. Compare multilingual-e5-small with current OTHRYS candidates on latency, RAM/VRAM, retrieval quality, chunking sensitivity and update cost.

### H7 — model tier requests
Study whether Panda personas request named tiers, reasoning effort, modality or other constraints. Compare to Auto Frugal's certified-builder selection and provider health. Harvest only the clean request/resolution contract if useful.

### H8 — project composition UX
Study templates as `team + skills + rules + knowledge + integrations` presets. Potential Oros/mission benefit: assemble only required Titans/Blocks/tools/context instead of activating the whole system.

### H9 — project-local control files
Panda's project-local `.pandaos/` and `.claude/` files make agent/team/skill behavior inspectable. Study exact schemas and whether they are portable/versionable. OTHRYS should prefer Git-native declarative control over hidden UI state.

### H10 — Progress surface
Harvest the visual separation of chat from durable work state. Candidate Command Deck view: objective, risk, scope, current owner, gate, evidence, attempts, node and next transition — with raw receipts available but not forced into the main UI.
### H11 — permission UX
Study Panda's `Agent / Auto-Edit / Plan / Default` model and per-tool Allow/Always/Deny prompts. Harvest the clarity, not the exact names. OTHRYS authority must still be enforced by Trust Canal and bounded node policy.

### H12 — evidence artifact declaration
Study how a stage declares required artifacts and how those artifacts bind to transition evidence. Candidate V2 use: mission/spec freezes expected evidence contracts before Builder runs.

### H13 — resumability
Disable/re-enable Work State, close/reopen Panda, and restart Windows to see whether F001-style state survives exactly. Test stale approvals, partially written artifacts and interrupted persona handoffs.

### H14 — integration/source boundaries
Study Apps vs Integrations vs Connected Sources. Determine whether they differ by execution authority, knowledge-only access or connector type. Map only after semantics are known; do not invent OTHRYS equivalents from labels.

### H15 — Local connection
Connect a disposable local model endpoint and test whether Panda can use Legion-local Qwen without cloud routing. Then investigate whether an MCP/remote tool can expose the T590 as a bounded execution node without giving Panda direct uncontrolled shell authority.

### H16 — Visual/computer-use bridge
Panda does not need to own OTHRYS Visual Control. Study whether its Apps/MCP/tool layer can consume an eventual OTHRYS screen sensor/control service. If yes, Panda may become a cockpit/client while OTHRYS retains node authority and evidence.

## 16. Things NOT to harvest yet
- Do not create a second V2 Work State engine beside Talos.
- Do not create a new universal agent framework because Panda has personas.
- Do not replace certified Blocks with unqualified `skills`.
- Do not move canonical OTHRYS memory into Panda/Atlas.
- Do not make PandaOS a reconstruction dependency for V2.
- Do not enable Atlas against the full 662-session corpus until data scope, spend and export/recovery are intentionally chosen.
- Do not infer independent verification from a `Reviewer` persona label.
- Do not assume Panda's Auto router is equivalent to Auto Frugal without evidence.
- Do not give Panda Agent mode against canonical V2 until permission and recovery behavior are proven on disposable repos.
- Do not copy Panda's UI before V2's underlying transition/evidence semantics are reconciled.

## 17. Tomorrow's real-work test — recommended protocol

Use one tiny, reversible, low-risk OTHRYS task in a disposable branch/worktree or clone. The task must be real enough to require actual code/test behavior but small enough to inspect completely.

Test sequence:
1. Freeze repo, branch, HEAD, dirty state and exact task.
2. Let Panda create Work State; record generated plan, scope, risks, slices and gates before execution.
3. Use the middle intervention policy: ask only at design/checkpoints.
4. Record which persona owns each stage and which model/connection Panda selects.
5. Record every permission request and whether Panda stays inside scope.
6. Require a real test/evidence gate, not only an implementation log.
7. Verify independently outside Panda that the claimed change exists and tests really passed.
8. Intentionally create one small failure or unmet gate and observe retry/recovery behavior.
9. Close/reopen Panda and verify Work State persistence.
10. Compare total operator effort, model usage, elapsed time and defect rate with the current V2 mission path.

**Pass criterion:** Panda reduces operator ceremony without weakening V2 truth/evidence boundaries.
**Fail criterion:** the polished UI hides weaker proof, scope drift, unverifiable completion, or opaque state.
## 18. External context from the same research session

Public background discussed during the session described PandaOS as a 2026 spinout from Berlin data/AI consultancy Pandata GmbH, with founders including Marco Szeidenleder, Philipp Türker and Riccardo Destratis; Destratis was described as having built the first implementation after frustration with stitching together multiple AI coding tools.

This context helps explain the product orientation toward integration/orchestration rather than foundation-model research.

**Evidence warning:** this pedigree is `EXTERNAL_CONTEXT`, not repo-proven truth. Reverify from primary company/founder sources before using it in any strategic comparison or public OTHRYS material.

## 19. Harvest priority

**P0 — study immediately before related V2 design work**
- Work State state machine and transition contract.
- Human-decision gate vs machine-evidence gate separation.
- Intervention/autonomy policy.
- Durable Progress surface over structured work state.
- Project-local declarative team/skill/control files.

**P1 — study when Mnemosyne/Switchyard work begins**
- Atlas typed knowledge, review, maintenance and export.
- Local embeddings/search.
- model-tier request -> router resolution.
- Local provider connection.
- repeated procedure -> skill proposal.

**P2 — later integration research**
- Apps/Integrations/Connected Sources boundaries.
- T590 bridge through MCP/tooling.
- Panda as optional OTHRYS cockpit/client.
- mobile access and cross-device operator UX.
## 20. Strategic conclusion for V2

PandaOS should be treated as **reference architecture + optional workstation**, not as the new canonical home of OTHRYS.

The best outcome is not `OTHRYS becomes PandaOS`. The best outcome is:

`PandaOS or another cockpit`  
`-> invokes/visualizes OTHRYS`  
`-> OTHRYS owns durable lifecycle state, authority, proof, distributed execution and self-maintenance`.

If Panda can later remove commodity UI/integration work without weakening OTHRYS control, use it. If a Panda pattern is better than V2's current operator experience, harvest the pattern. If Panda already solves a commodity layer well, do not rebuild it for pride.

But the V2 North Star remains larger and must stay explicit:

`observe need/fault -> plan -> select proven capability -> authorize -> build/repair -> independently verify -> deploy/operate -> monitor -> learn -> maintain -> repeat`

Panda's Work State experiment strengthens, rather than replaces, the case for OTHRYS to make that lifecycle a first-class machine-readable state model with visible gates and evidence.

## 21. Research status

**Verdict:** `HIGH_VALUE_REFERENCE / HARVEST_REQUIRED / NO_ARCHITECTURE_PROMOTION_YET`  
**Next evidence:** one bounded real OTHRYS task under Panda Work State, followed by independent V2 verification.  
**Atlas:** keep disabled until deliberate scoped test; current 300s timeout is unresolved, not proven defect.  
**Canonical dependency:** forbidden at this stage.  
**Implementation permission from this report:** none.
