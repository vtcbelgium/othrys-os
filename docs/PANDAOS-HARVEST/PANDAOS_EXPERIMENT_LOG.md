# PandaOS -> OTHRYS OS Experiment Log

**Started:** 2026-08-27  
**Mode:** slow, observational, evidence-first  
**Authority:** research only; discoveries do not authorize implementation or architecture promotion.

## Operating rule
Every meaningful PandaOS experiment is recorded between steps: what was attempted, screenshots/observations, state transitions, permissions, artifacts, failures, costs when visible, what Panda actually proved, and what remains inference.

We proceed slowly. One bounded experiment at a time. No broad access to canonical OTHRYS until the previous boundary is understood. Panda may earn more responsibility only through evidence.

For each observed Panda capability classify it as:
`ALREADY_HAVE` | `EXPOSE_OUR_STOCK` | `HARVEST_PATTERN` | `RESEARCH_MORE` | `GARDEN_CANDIDATE` | `REJECT`

Never equate a polished UI with a proven mechanism. Never equate Panda's claim of completion with independent OTHRYS proof.

## Learning method — reconstruction
The operator compared this approach to a music-production teacher recreating existing songs in Logic Pro with synthesizers in order to learn how the originals worked.

That is now the Panda harvest method: **reconstruct to understand**. We study a working reference, decompose why it works, reproduce the useful mechanism in our own system, compare behavior, then deliberately improve or diverge where OTHRYS has a stronger goal.

The objective is not a PandaOS skin. The objective is to use reconstruction as engineering education while turning existing OTHRYS machinery into OTHRYS OS.
## Session 001 — 2026-08-27
Baseline Panda lab created separately from canonical OTHRYS. Initial broad environment/Atlas inspection repeatedly hit ~300-second timeout. Later settings inspection proved Atlas was disabled, so cause remains unresolved rather than classified as an Atlas defect.

Project-local read without Atlas succeeded. Observed four on-demand personas: Planner, Builder, Reviewer, Designer. They are persona/role handoffs rather than demonstrated independent persistent agents. Observed 19 unique skills across project skill directories.

Model/settings inspection observed PandaOS Cloud, Claude Max, OpenAI Codex/ChatGPT-plan connection, API/Bedrock/OpenCode/Local connection options, Auto model selection, agent capability-tier switching, quota failover option, and local semantic chat indexing using on-device embeddings.

Atlas settings observed project watching, knowledge generation/maintenance controls, agent memory-write access, optional connected sources, spend caps, vault export and Obsidian-compatible output. Atlas remains unproven in live use.

Work State was enabled and tested using hypothetical `OTHRYS Viewer Test`. Observed durable Progress state, objective/problem/scope/risks/details, slices/tasks, explicit phase ownership, intervention policy and transitions.

Observed lifecycle: `Plan -> Design -> Build -> Review -> Complete`. Design required human approval. Build required evidence plus declared `implementation-log` artifact. Panda stopped when that requirement conflicted with the original no-file-modification instruction; after a narrow exception it wrote only the required log and continued. Reviewer consumed evidence and completed the slice.

Key harvest: separate **authorization** from **proof**. Human approval answers whether a transition is permitted; evidence/artifacts answer whether work actually happened. Transition decisions remain visible as answered audit records.

Session verdict: `HIGH_VALUE_REFERENCE / HARVEST_REQUIRED / NO_ARCHITECTURE_PROMOTION_YET`.

## Next experiment
Tomorrow: one tiny, reversible, real OTHRYS OS task through Panda Work State. Record every meaningful transition before expanding scope. Independently verify the result outside Panda. Compare quality, evidence, cost/usage, failures, intervention burden and whether Panda respects existing OTHRYS rules.
## Strategy lock — 2026-08-27 end of Session 001
The eight-step OTHRYS OS reconstruction strategy is now formalized in `OTHRYS_OS_RECONSTRUCTION_PLAN.md`.

Execution doctrine: **COPY BEFORE CREATE / EXPOSE BEFORE REBUILD / PROVE BEFORE EXPAND / ONE CONCEPT, ONE RECONSTRUCTION.** Panda is both reference implementation and potentially a bounded construction tool; it never becomes canonical OTHRYS authority.

Tomorrow is deliberately narrow: interrogate observed Work State behavior, freeze one tiny real OS-shell task, snapshot truth, run Panda under controlled intervention, stop at claimed completion, verify independently, then qualify or reject further scope.

North Star remains unchanged: V2 is the proven motor; OTHRYS OS is the coherent operating surface; eventual differentiation is autonomous initiation, verification, repair, operation and maintenance rather than merely human-started agentic work.
## Session 002 — Interrogation 001: Work State internals
Panda answered 10 focused questions without modifying files, executing commands, changing Work State, or completing F001.

### Documented claims reported by Panda
- Work State plan/state lives in Panda tools, not editable repo plan files; manual plan-file editing does nothing.
- Feature lifecycle and slice lifecycle are separate.
- `work_feature complete` finishes the attached feature, makes it immutable, and detaches the chat; legal only at final phase with blockers cleared.
- Gates have independent `approval` and `evidence` fields.
- Approval gates wait for a user decision card; evidence gates accept evidence on the transition call.
- Evidence is explicitly described as **attestation, not a verified claim**.
- Owners are re-armed on transition with their member model/engine/effort/skills; rules also say avatar, permissions and model switch per member.
- Plan writes are transactional; revision parameters imply optimistic concurrency/stale-state rejection.

### Panda's inferred claims — not yet proven
- Canonical state likely lives in a Panda app-level persistent store keyed by feature id.
- Evidence binding is likely temporal/positional to the transition, not cryptographic/content-verified.
- Reviewer independence is procedural only because personas share an underlying agent/runtime.
- Work State likely survives restart via persistent app state.
- Transition state likely behaves atomically/commit-then-return across interruptions.

### Highest-value harvest finding
Panda itself states that evidence is an **attestation, not verified proof**. Its reviewer persona is not a genuinely independent verifier. This sharply validates the OTHRYS split: Panda-style workflow UX is valuable, while Talos-style independent verification/evidence remains a stronger motor-level requirement.

### Session 002 — persistence probe
**Method:** fully close/reopen PandaOS, reopen `othrys-panda-lab`, then inspect Progress rather than trusting chat history.

**Observed after restart:**
- Existing chat/history persisted.
- Progress retained plan `OTHRYS Viewer Test`, id `f001`.
- Plan is checked complete.
- Slice `Viewer Test scaffold` persisted as `1 of 1 finished`, `3/3 tasks`.
- A separate `Ship` feature-level stage remains `not started`, with `Advance to Ship` available.
- Therefore slice completion != feature completion is independently supported by the persisted Progress UI.
- The earlier chat summary saying "work is done" was looser than canonical Progress state; F001 is not fully finished/shipped.
- Model selector after restart visibly shows `DeepSeek V4 Flash 0731`; pre-restart screenshot showed `Auto`. Cause is unresolved and must not be inferred.

**Classification:** persistence claim = PARTIALLY PROVEN. Structured Work State survives app restart. Exact physical persistence store, full transition history persistence, and model-selection change cause remain unproven.

**Harvest:** Panda's durable hierarchical work UI is high-value. OTHRYS OS should distinguish task/slice completion from Mission lifecycle completion and operational/shipping state, while canonical state outranks conversational summaries.
### Session 002 — bounded truth-check failure + capability-surface harvest
**User rule reinforced:** keep Panda logs continuously; harvest every meaningful observation, not only successful runs.

**Truth-check behavior:** Panda could not resolve `git` on PATH. Initial narrow read-only Git requests were permitted. It then searched common Git locations, failed, and attempted broader Program Files / PATH discovery. Those scope-expanding commands were denied. Panda respected denial but remained in `On it...` for several minutes instead of terminating with a bounded blocked receipt.

**Classification:** `USEFUL_WITH_LIMITS`. Panda respected explicit permission denial, but recovery behavior widened discovery and lacked a clean extinction condition.

**OTHRYS harvest:** when a required capability is unavailable and the next recovery step exceeds frozen scope, stop with `INSUFFICIENT_EVIDENCE` / blocked receipt and ask for explicit authority expansion. Add bounded attempt/time budgets; no indefinite `On it...`.

**UX harvest:** Panda displays a small optional waiting-game during long agent execution, with Auto Off / Disable / Close controls. Pattern worth considering as operator-wait UX, but secondary to clear progress/timeouts.

**Capability-surface screenshots:** Panda separates `Agents`, `Skills`, `Apps`, and `Integrations` into browsable catalogs. Observed examples: 170 agents grouped by teams/domains; 126 skills with per-project installation; Apps with their own workspace/UI (Git, Docker, Database, etc.); Integrations as MCP/tool connections without separate UI.

**OTHRYS mapping candidate:** `Titans/Workers -> Blocks -> Engines/Big Blocks -> Connections`. Preserve stronger OTHRYS semantics: Titans remain durable authorities, specialists can be subordinate/disposable workers; Blocks carry admission/proof/version/health/provenance; Engines are substantial runtimes/surfaces; Connections are external service/tool boundaries.

**Lifecycle harvest:** existence != assignment. Candidate future Block lifecycle: `Quarry -> Candidate -> Tested -> Admitted -> Available -> Assigned to Oros -> Active -> Degraded/Retired`.

### 2026-08-28 — V2 Truth Check manually stopped
- Operator stopped the long-running Panda recovery loop.
- Final visible state contained no verdict/report; the chat returned to idle input.
- Successful bounded probes before failure: `git status --short` permission was allowed; explicit checks for likely Git locations and the checkout `.git` path were allowed.
- Panda then widened into broader filesystem/PATH discovery; those recovery commands were denied.
- Important behavior: after manual stop Panda did not fabricate a truth verdict from partial evidence.
- Classification: REJECT recovery pattern; HARVEST stop semantics; HARVEST fail-closed/no-fake-verdict behavior.
- OTHRYS OS implication: recovery must have an explicit scope budget and attempt budget. Crossing either boundary should terminate with typed insufficient evidence rather than widening authority.
- Next probe must avoid Git entirely and use bounded project-local file reads only.

### 2026-08-28 — Project-local read probe behavior
- Panda successfully read `V2_BUILD_BACKLOG.md` using project-local access.
- It searched project-local paths for `OTHRYS_OS_NORTH_STAR.md`, `V2-006*.json`, `docs/PANDAOS-HARVEST/**`, and `runtime/command-deck/**`.
- `OTHRYS_OS_NORTH_STAR.md` was not found at the expected root path in the Legion checkout.
- Panda located multiple V2-006 mission/result files and read a latest mission candidate plus Command Deck index using project-local reads.
- Panda then attempted a shell `Test-Path` command for `docs/PANDAOS-HARVEST`, despite the explicit instruction: no shell commands.
- Classification: project-local file reasoning = USEFUL; instruction adherence = PARTIAL; shell fallback = REJECT for this bounded probe.
- Strong divergence signal: Legion checkout appears older/different than T590 truth because the North Star file created on T590 is absent here. Do not yet declare full repo divergence until final Panda report/remaining evidence is seen.
- Operator action: deny shell fallback; allow only project-local read/search mechanisms.

### 2026-08-28 — Denied shell fallback terminates bounded probe
- Operator denied Panda's PowerShell `Test-Path` fallback as instructed.
- Panda stopped immediately afterward and returned to idle input; it did not continue with its already-working project-local search/read tools.
- Before stopping, project-local discovery had found `V2_BUILD_BACKLOG.md`, 11 `V2-006*.json` matches, one `docs/PANDAOS-HARVEST/**` match, and Command Deck files.
- Panda reported `OTHRYS_OS_NORTH_STAR.md` was not found under that exact name in the Legion checkout.
- Important UX/agent behavior: a denied optional recovery tool appears capable of terminating the run instead of triggering an allowed-method fallback.
- Classification: HARVEST permission-denial semantics; REJECT brittle fallback behavior; RESEARCH_MORE whether explicit follow-up can resume from accumulated context.
- OTHRYS OS implication: denial should be a typed tool outcome, not necessarily mission termination. If alternate admitted capabilities remain, the worker should re-plan within scope; otherwise terminate explicitly as INSUFFICIENT_EVIDENCE.

### 2026-08-28 — Project-local evidence report completed
Panda successfully resumed using project-local reads/search only and produced a structured PROVEN / DOCUMENTED-PLANNED / UNKNOWN report without further shell access.

**Panda report on Legion `C:\Users\othry\Projects\othrys-v2`:**
- Reported V2-001J through V2-006E as proven with PASS result files and pinned candidate SHAs.
- Reported Command Deck trail V2-006A..006D internally coherent with the UI.
- Reported V2-006E as latest proven mission and V2-006F as defined/planned without result.
- Reported `OTHRYS_OS_NORTH_STAR.md` absent and `docs/PANDAOS-HARVEST/` absent from Legion checkout.
- Verdict issued: `LEGION_PROJECT_EVIDENCE_COHERENT` — internally coherent, while named newer strategy/research files were missing evidence rather than contradictions.
- Panda proposed V2-006F as smallest next task. This proposal is NOT accepted; next-task authority remains outside Panda.

**Independent T590 comparison immediately after report:**
- T590 verification checkout has `OTHRYS_OS_NORTH_STAR.md` and Panda harvest docs.
- T590 backlog records completion only through V2-006D, plus new Visual Control/Panda/OTHRYS OS strategy entries.
- T590 contains `missions/V2-006E.json` but no `V2-006E.result.json`; no V2-006F mission/result exists there.
- Therefore Legion and T590 are not identical snapshots. Legion appears ahead on execution history (006E result, 006F definition); T590 appears ahead on current strategic documentation/research.
- Classification: `REAL_DIVERGENCE / RECONCILIATION_REQUIRED BEFORE PANDA MUTATION`.
- Important lesson: internal coherence of one checkout is not enough to establish canonical truth across the colony. Cross-node reconciliation must precede mutation.

### 2026-08-28 — Cross-check exposes split checkout state
- Panda produced `LEGION_PROJECT_EVIDENCE_COHERENT` using only project-local reads after explicit recovery instructions.
- Panda report says Legion contains V2-006A through V2-006E result evidence, with V2-006E PASS and V2-006F defined/planned without result.
- Independent T590 check shows `missions/V2-006E.json` exists, but `V2-006E.result.json`, `V2-006F.json`, and `V2-006F.result.json` are absent in the T590 checkout.
- T590 additionally contains `OTHRYS_OS_NORTH_STAR.md`, `docs/PANDAOS-HARVEST/`, Visual Control research, and OTHRYS OS backlog additions that Legion lacks.
- Therefore `LEGION_PROJECT_EVIDENCE_COHERENT` is only a local-coherence verdict, not colony/canonical equivalence.
- Classification: REAL_DIVERGENCE / RECONCILIATION_REQUIRED BEFORE PANDA MUTATION.
- OTHRYS OS implication: local coherence must never be conflated with canonical colony truth; future state surfaces should show local snapshot identity + canonical sync status explicitly.
- Immediate next step: extract exact Legion-only 006E result and 006F mission content through bounded project-local reads, then reconcile against T590 without allowing Panda to mutate either checkout.

### 2026-08-28 — Real mission V2-006F Build interruption result
- Panda preserved Work State after repeated command failures and operator stop.
- Builder report states exactly one file changed: `runtime/command-deck/admission_watcher.ts`; created, then edited once to fix `cycle()` return typing.
- Build task accounting remained `0/5`; no task was marked complete without verification.
- `admission_watcher.test.ts` was not created; verification was not completed.
- Panda explicitly refused to attest that the code compiles or behaves correctly.
- Work State stayed in Build and did not transition to Review.
- Verification blocker was the Panda Windows command path: Node commands returned empty output / abnormal latency and one probe exceeded 7 minutes before operator denial.
- Harvest classification: PASS durable Work State / PASS no-fake-progress / PASS fail-closed reporting / FAIL execution-adapter reliability.
- OTHRYS implication: Builder candidate state, execution substrate health, and verifier state must remain separate. Infrastructure failure must never become candidate success/failure by inference.

### 2026-08-28 — External review of Panda 006F candidate
- Panda candidate extracted from Legion Work State while frozen at Build 0/5.
- Independently compared on T590 against `runtime/command-deck/intent_bridge.ts`, its tests, Trust Canal admission/ledger, and telemetry service pattern.
- Positive: candidate reuses `admitDeckIntent` in-process; adds no shell/child_process/Hephaestus/Talos/Worker/execution path; preserves `authorityGranted:false` / `executionStarted:false` through the existing bridge; torn-tail check occurs before any admission; replay delegates to existing idempotent bridge.
- BLOCKER found: malformed JSON can cause partial admission. Candidate parses and admits each line sequentially; if line 1 is valid and line 2 is malformed, line 1 is already written to the Trust Canal ledger before `INBOX_MALFORMED_LINE` is thrown. This violates Panda's own plan requirement that malformed inbox input admit nothing / fail closed.
- Secondary issue: `recordError()` writes directly to the error path but never creates its parent directory; error reporting may silently disappear on a fresh user-space setup.
- Secondary issue: returned `{failed:false}` is invariant and currently carries no useful failure state because failures throw.
- Verdict: CANDIDATE_REJECTED_BEFORE_VERIFICATION. Do not mark Build tasks complete. Required repair: validate/parse the complete newline-terminated inbox first, then perform admissions only after whole-file structural validation succeeds; ensure error-directory creation or otherwise prove it exists.
### 2026-08-28 — 006F external review repair loop
- External review rejected Panda's first watcher candidate before verification because line-by-line parse/admit allowed partial admission if a later JSON line was malformed.
- Secondary issue: error-file parent directory was not guaranteed to exist.
- Panda accepted the surgical repair request without leaving Build, without marking tasks complete, and without running commands.
- Repair report says `admitCompleteIntents` now performs a two-phase pass: parse/validate all non-empty lines first, then admit only after whole-file structural validation succeeds.
- Panda also added parent-directory creation before error-file writes.
- No new authority path was added; Panda explicitly preserved the 006D/Trust Canal seam and kept Work State at Build 0/5.
- Classification: HARVEST external-review->repair loop; HARVEST no-fake-progress; HARVEST negative-safety requirements; candidate remains UNVERIFIED until exact repaired source is independently reviewed and tested.

### 2026-08-28 — repaired candidate static review v2
- Panda repaired the partial-admission defect by parsing all non-empty newline-complete records before calling `admitDeckIntent` on any intent.
- Panda also added `mkdirSync(dirname(errorPath), { recursive: true })` before writing the best-effort error file.
- External static review confirms those two requested repairs are present and the watcher still reuses the strict 006D bridge with no shell/child-process/Hephaestus/Talos/Worker/accept/reject/release authority added.
- New issue found: `pollMs = Math.max(1000, Number(...))` does not fail closed on malformed `OTHRYS_ADMISSION_POLL_MS`; `Number(...)` can become `NaN`, and `setTimeout(..., NaN)` effectively collapses toward an immediate/tight loop.
- Classification: REPAIR_REQUIRED before external verification. Core admission boundary improved; config validation still insufficient.
- OTHRYS harvest: configuration is part of the safety boundary. Invalid runtime config must become a typed fail-closed state, never a silent timing change or busy loop.

### 2026-08-28 — V2-006F Panda repair #3
- External static review flagged malformed `OTHRYS_ADMISSION_POLL_MS` handling as a fail-closed/config-safety defect.
- Panda modified only `runtime/command-deck/admission_watcher.ts`.
- New behavior: default `5000`; explicit Number parse; reject non-finite values and values below 1000 with `OTHRYS_ADMISSION_POLL_MS_INVALID`; no silent coercion/tight loop.
- Panda preserved prior whole-file prevalidation, error-directory creation, strict 006D/Trust Canal reuse, and no execution authority.
- Panda obeyed scope: no commands, no verification, no task completion, no transition to Review; Work State remains Build 0/5.
- Classification: HARVEST bounded external-review -> surgical repair loop; ALREADY_HAVE candidate-builder vs independent-verifier separation; RESEARCH_MORE exact repaired source before static PASS.

### 2026-08-28 — V2-006F final static review after poll-interval repair
- Panda candidate now validates OTHRYS_ADMISSION_POLL_MS explicitly: finite and >=1000 ms or startup fails with OTHRYS_ADMISSION_POLL_MS_INVALID.
- Prior repairs remain present: whole-file JSON parse before any admission; error-file parent mkdir; reuse of admitDeckIntent; no new execution authority.
- Static review verdict: PASS WITH TEST REQUIREMENT.
- Remaining concern to cover in tests: module-level env validation/auto-start side effects on import must be controlled via env in the test harness; semantically invalid later intents should be tested for expected partial-vs-no-partial behavior according to mission law.
- Work State remains Build 0/5; no verification claim accepted yet.

### 2026-08-28 — Cost/architecture harvest: persistent work, replaceable labor
- Panda Community usage observed at 63% starter usage remaining during V2-006F.
- Decision: stop using Panda as the default execution substrate; use it primarily as a reference/orchestration quarry and bounded experiment harness.
- High-value UX harvest: mission/work state remains canonical while models/providers can be hot-swapped underneath it.
- OTHRYS OS target: Mission stays fixed; Titan/owner stays fixed; Switchyard selects local/free/certified/healthy labor; operator can override without resetting work/evidence.
- Product implication: accelerate OTHRYS OS Alpha shell so proven V2 machinery becomes visible and usable, then move routine Build/Verify work to local Qwen/T590/Talos wherever possible.
- Economic law candidate: remote paid model = escalation resource, not default labor. Local-first execution should be explicit in the OS surface.

## 2026-08-28 — Panda-generated test file static review
- Candidate test suite extracted exactly from Panda; Work State still Build 0/5, no verification claim.
- BLOCKER: invalid-poll test creates a local `env` object but never applies it to `process.env`; dynamic imports therefore still see the already-set `OTHRYS_ADMISSION_POLL_MS='5000'`. The test does not exercise the bad values as written.
- BLOCKER: required-env import test likewise creates `env` with empty inbox/ledger paths but never applies it to `process.env`; the expected rejection is not actually tested.
- BLOCKER: source-audit regexes contain unescaped `(` in `/spawn|exec(|execSync|spawnSync/` and `/require(['"]child_process/`; as written these regex literals are syntactically invalid / unsafe and can prevent the test file from parsing.
- NOTE: `import.meta.dirname` may depend on the Node version; external verification should confirm runtime support or use a portable URL-to-path pattern.
- SEMANTIC CASE: later syntactically-valid JSON rejected by strict 006D bridge currently causes an earlier valid line to remain admitted. This is explicitly documented by Panda. Mission text requires malformed/torn input to fail closed and every intent to pass the strict bridge; whether semantic-rejection should be batch-atomic is not yet proven by repo law. Treat as policy decision, not silently as PASS.
- Verdict: TEST_SUITE_STATIC_FAIL — repair tests before any external run.

### 2026-08-28 — V2-006F test repair
- Panda modified only `runtime/command-deck/admission_watcher.test.ts`; source watcher remained untouched.
- Replaced `import.meta.dirname` with portable `fileURLToPath(import.meta.url)` + `dirname` resolution.
- Fixed invalid poll-ms test so each bad case actually mutates `process.env` before dynamic import and restores previous values afterward.
- Fixed required-env side-effect test so the failing import actually runs with empty required env vars and then restores prior env.
- Replaced malformed source-audit regexes with safe literal-string checks / safe regexes.
- Preserved semantic bridge-rejection case as observed behavior only; no mission-law reinterpretation.
- Panda did not run verification, mark tasks complete, or transition to Review. Work State remains Build 0/5.
- Token-efficiency decision reinforced: use Panda as reference/orchestration quarry; move routine build/verify to local OTHRYS machinery as soon as practical.

### 2026-08-28 — V2-006F external verification on T590
- Panda final watcher + repaired test suite were reconstructed in `/tmp/othrys-panda-006f` only; canonical T590 checkout was not mutated.
- T590 runtime: Node `v22.23.2`, Git `2.53.0`.
- Panda candidate test suite run with Node native TS stripping: **10/10 PASS**, ~145 ms total.
- Existing canonical `runtime/command-deck/intent_bridge.test.ts`: **2/2 PASS**.
- Existing canonical Trust Canal suites `admission.test.ts` + `talos-gate.test.ts`: **11/11 PASS**.
- Combined external evidence: **23/23 PASS** across candidate + 006D bridge + Trust Canal boundary suites.
- No shell/child_process/Hephaestus/Talos/Worker/accept/reject/release path was introduced by the watcher candidate.
- Semantic-rejection observation remains explicit: a later syntactically valid intent rejected by strict 006D can leave an earlier valid intent admitted. This is documented behavior, not silently promoted to a stronger batch-atomicity law.
- Verification verdict: `CANDIDATE_EXTERNALLY_VERIFIED_WITH_DOCUMENTED_SEMANTIC_BEHAVIOR`.
- Important boundary: Legion/T590 checkout divergence still exists; this PASS does not authorize copying 006F into canonical T590 until reconciliation decides the authoritative execution trail.

### 2026-08-28 — OTHRYS OS Alpha shell begins after Panda harvest
- Tablet session renewed both Remote Desktop Commander nodes: Legion online as builder; T590 online as independent verifier.
- Decision executed: stop spending Panda quota on routine labor and begin reconstructing the useful cockpit patterns directly over the V2 motor.
- Legion checkout inspected at HEAD `7c1e7fd`; it contains execution history through V2-006E plus untracked Panda V2-006F candidate/test files.
- First Alpha mutation is intentionally surface-first: evolve the existing Command Deck rather than create a parallel application.
- Added OTHRYS OS navigation surface: Overview, Missions, Titans, Blocks, Models, Nodes, Oroi.
- Existing Refine intent boundary remains unchanged: no Accept/Reject/Emergency authority added; Trust Canal still owns admission.
- Backend status now exposes a bounded `osSurface` summary of proven V2 systems, Block stock, and local-first model policy.
- Initial mutation caused Command Deck test failures (server syntax + innerHTML violating existing XSS discipline); both were repaired immediately.
- Legion verification after repair: `runtime/command-deck/deck.test.mjs` = 5/5 PASS.
- Harvest consequence: OTHRYS OS Alpha is now being built as a cockpit over V2, with existing motor laws acting as regression gates.
## 2026-08-28 — OTHRYS OS Alpha Panda-shell reconstruction
- User direction: make OTHRYS OS look like PandaOS for now so reconstruction can accelerate learning before divergence.
- Implemented directly over existing Command Deck surface; no parallel app/rewrite created.
- Visual pattern harvested: left work/project sidebar, black central workspace, centered project/branch top strip, bottom composer, right persistent Progress/Plan work panel, subdued borders, compact cards, Panda-like density.
- OTHRYS branding/semantics retained; Panda proprietary code/assets/branding not copied.
- Existing control laws preserved: Refine intent only; Accept/Reject/Emergency Stop remain disabled; Trust Canal still owns admission; no execution authority added.
- Regression result on Legion: runtime/command-deck/deck.test.mjs = 5/5 PASS.
- Strategic classification: HARVEST_PATTERN + EXPOSE_OUR_STOCK. Next divergence point should be real Mission/Work State data and local/free model routing, not cosmetic invention.

### 2026-08-28 — local reconstruction sprint: 006F + OTHRYS OS Alpha
- Panda token use stopped for routine engineering; Legion/T590 became the build/verify pair.
- V2-006F was transplanted from the Panda candidate, independently proven on T590 (23/23), installed as an active+enabled user-space admission watcher, committed and closed without execution authority.
- V2-007A reconstructed the Panda-style shell over the existing Command Deck and exposed canonical Work State; Legion 5/5 + T590 5/5.
- V2-007B added a real local-first model selector: Legion qwen3-builder PRIMARY, T590 llama3.2 ADVISORY ONLY, remote escalation GATED; selection remains browser-local preference only.
- V2-007C made Titans, Blocks, Models, Nodes and Oroi sidebar views functional; only Hephaestus and Talos are presented as proven Titans.
- V2-007D replaced incomplete chat/GPT_STATE recent history with a canonical read-only mission trail derived from missions/*.result.json.
- V2-007E replaced hard-coded Plan/Build/Review/Ship visuals with evidence-derived phase projection; PASS evidence still does not imply Ship/closeout.
- Every 007 candidate was pushed, verified from the exact commit on the other machine, then closed in a separate result/state commit.
- T590 Command Deck and admission watcher services remain active; watcher is enabled at user startup.
- T590 and Legion main were reconciled to the same pushed HEAD; only Panda project metadata remains untracked on Legion.
- Temporary HTTP transfer server, verification worktrees, patch scripts, transfer directories and reconciliation stash were removed.
- Harvest result: the Panda workflow patterns are now becoming native OTHRYS OS surfaces while V2 laws remain the motor and proof boundary.
