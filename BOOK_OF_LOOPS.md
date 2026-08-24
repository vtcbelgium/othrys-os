# BOOK OF LOOPS

**Status:** CONTROL DOCTRINE / TOOLBOX  
**Owner:** GPT Control  
**Scope:** OTHRYS V2 control, delegation, verification, recovery, learning and compounding  
**Authority:** subordinate to `BOOK_OF_GPT.md` and `FOUNDATION_LAWS.md`  
**Trigger:** read when a mission needs iteration, retry, delegation, correction, recovery, reflection, search, recurring work, or autonomous continuation.

This book defines the loop toolbox. It does **not** create a loop engine, scheduler, daemon or orchestration subsystem. At the empty-house stage the existing Control Feedback Block records loop decisions and evidence; later Blocks may implement mechanisms only when repeated use proves the need.

## NORTH STAR

A loop exists to make progress under bounded authority.

> **No loop may continue merely because an AI wants another turn.**

OTHRYS owns state, budgets, evidence and permission to continue. Models are replaceable workers inside those boundaries.

The default is not `LOOP`. The default is **one atomic attempt -> external evidence -> STOP or explicitly authorized next attempt**.

## 1. CANONICAL LOOP STACK

Use the smallest loop that can solve the problem.

### L0 — KRONOS / PULSE
Purpose: decide **when** a loop may wake.  
Trigger: explicit event, authorized schedule, condition, or health pulse.  
Rule: a heartbeat creates observation opportunity, never authority to mutate.

### L1 — GPT CONTROL LOOP
`STATE -> INVENTORY -> RETRIEVE -> FREEZE -> DELEGATE -> VERIFY -> RECORD -> SYNC -> WAIT_GPT`

Purpose: preserve operator intent and choose the correct loop/tool. GPT owns scope and escalation, not implementation truth.

### L2 — BOUNDED RALPH / MISSION LOOP
`FRESH CONTEXT -> ONE ATOMIC TASK -> EXECUTE -> VERIFY -> RECEIPT -> DISCARD CONTEXT`

Purpose: make iterative engineering resistant to context rot. Persistent truth lives in source, tests, receipts and state, not the worker's conversation. Another iteration requires the outer controller's authorization.

### L3 — REACT / EXECUTION LOOP
`OBSERVE -> DECIDE -> ACT ONCE -> OBSERVE`

Purpose: keep one attempt grounded in real tool/environment feedback. ReAct is an inner execution technique, never mission authority.

### L4 — CRITIC / VERIFICATION LOOP
`CLAIM -> EXTERNAL CHECK -> EVIDENCE -> ACCEPT / REJECT`

Purpose: correct against reality. Preferred verifier order:
1. deterministic executable proof;
2. independent verifier/evaluator;
3. implementing model's self-critique only when stronger proof is unavailable.

### L5 — VERIFIED REFLEXION / LEARNING LOOP
`SURPRISE -> EVIDENCE -> ROOT CAUSE -> LESSON -> REVIEW -> PROMOTE / PARK`

Purpose: learn between episodes. Reflection is not automatically truth and cannot silently become policy or semantic memory.

### L6 — COMPOUNDING LOOP
`REPEATED PROVEN SUCCESS -> GENERALIZE -> BLOCK CANDIDATE -> ADMISSION -> MATURITY`

Purpose: turn repeated successful work into reusable OTHRYS capability. The system should become better by accumulating proven Blocks, not ever-longer prompts.

### SEARCH MODE — LATS-LIKE BRANCHING
`PROBLEM -> BOUNDED ALTERNATIVES -> TEST/EVALUATE -> SELECT OR STOP`

Use only when ambiguity remains after simpler methods, multiple plausible approaches materially differ, or two bounded attempts fail for different causal reasons. Search Mode is exceptional because it multiplies cost and state.

## 2. LOOP SELECTION LADDER

Escalate only when evidence requires it:

0. deterministic operation — no AI;
1. one atomic ReAct attempt;
2. ReAct + external Critic;
3. one fresh-context bounded Ralph retry;
4. independent evaluator/optimizer cycle;
5. bounded branch/search mode;
6. GPT/operator architecture decision.

Never jump to a more expensive loop because it sounds sophisticated.

## 3. THE SEVEN REQUIRED FIELDS

No loop is admitted unless these are explicit:

- **OWNER** — who controls continuation;
- **TRIGGER** — what wakes it;
- **INPUT** — exact bounded context/data;
- **STATE** — canonical persisted truth it may read/write;
- **BUDGET** — turns, time, cost, mutations and/or attempts;
- **EXIT CONDITION** — objective PASS/FAIL/STOP condition;
- **EVIDENCE** — what proves progress and completion.

If any field is unknown, STOP and resolve the contract before looping.

## 4. EVERY LOOP IS BOUNDED

Every executable loop must declare applicable hard limits:

- maximum iterations;
- maximum wall time;
- maximum model/tool cost;
- maximum mutations;
- maximum retries per causal failure;
- stall threshold;
- terminal failure state.

No unbounded `while true`. No hidden provider/model fallback. No budget reset by spawning a fresh worker.

## 5. NESTING LAW

> **An inner loop may produce evidence for an outer loop; it may never grant itself another outer-loop iteration.**

Therefore:

- ReAct may observe failure; it cannot authorize another mission attempt.
- Critic may reject an artifact; it cannot broaden scope.
- Ralph may complete an atomic task; it cannot choose a new architecture.
- Reflexion may propose a lesson; it cannot promote that lesson to law.
- Search may rank alternatives; it cannot grant deployment authority.
- GPT may recommend action; deterministic policy and explicit operator grants still govern authority.

Continuation authority always flows from outside inward. Evidence flows from inside outward.

## 6. PROGRESS MUST BE SEMANTIC

Tool activity is not progress.

Valid progress deltas include:

- a new valid source diff toward frozen acceptance;
- a previously failing relevant proof becoming green;
- a new artifact required by the contract;
- a causal hypothesis being proven or disproven;
- a dependency/blocker being resolved with evidence;
- a measurable state transition allowed by the contract.

Repeated reads, searches, restatements, plans, retries, token use, provider switches and unchanged test reruns are **zero progress** unless they produce new evidence.

A loop records a `progress_delta`. Repeated zero-delta iterations beyond the declared stall threshold -> `STALL -> STOP`.

Stall never silently triggers fallback.

## 7. FIRST CAUSAL BLOCKER

When verification fails:

1. identify the first causal blocker supported by evidence;
2. classify whether repair is inside the frozen mission contract;
3. if yes, authorize at most the next bounded correction attempt;
4. if no, STOP and return to GPT Control.

Do not fix downstream symptoms while the first causal blocker remains.

## 8. REACT LAW

ReAct is for local responsiveness, not wandering.

- Observe before acting.
- One tool/action should answer one concrete uncertainty or advance one frozen objective.
- After every action, incorporate the actual result before choosing the next.
- Reading the same truth repeatedly is stall, not caution.
- Finish as soon as acceptance evidence exists.
- A worker must have an explicit `finish` contract.

## 9. CRITIC LAW

External evidence outranks self-assessment.

Ask: **If this implementation were wrong, what would fail?**

A useful verification cycle must include the strongest practical proof: schema validation, compiler/type check, focused test, negative control, runtime observation, digest/state comparison, browser proof, or other deterministic evidence.

A worker's statement that it checked its own work is not independent verification.

Never weaken, skip or rewrite the gate merely to make the run green.

## 10. BOUNDED RALPH LAW

Fresh context is a hygiene tool, not permission to forget state.

Each iteration must:

1. reconstruct from canonical state;
2. receive one atomic objective and acceptance contract;
3. mutate only its authorized scope;
4. verify externally;
5. write a receipt/checkpoint;
6. terminate its context.

The next worker reads the receipt and repository truth, not the previous worker's narrative.

A fresh context does not reset mission budgets, retries or known failures.

## 11. EVALUATOR–OPTIMIZER LAW

Use when quality can be judged against explicit criteria but one pass is unlikely to be enough.

`WORKER -> ARTIFACT -> EVALUATOR -> bounded feedback -> WORKER`

The evaluator should be independent where practical. Maximum refinement cycles are declared before execution. If successive cycles do not create semantic progress, STOP.

Use primarily for bounded code repair, design/spec refinement and quality optimization. Do not use it to discover unlimited scope.

## 12. SELF-REFINE LAW

Self-refinement is weak evidence because generator and critic share assumptions.

Use at most a small bounded number of cycles, chiefly for prose, prompts, plans, specifications and presentation. For engineering truth, graduate quickly to external Critic evidence.

## 13. VERIFIED REFLEXION LAW

Reflection is **surprise-driven**, not ritual.

Trigger only on meaningful signals such as:

- unexpected failure;
- repeated causal failure;
- operator correction;
- detected drift;
- a negative control exposing a real defect;
- large prediction/reality mismatch;
- a genuinely novel successful technique.

A lesson must contain source evidence, scope, confidence/status and supersession path. Raw worker explanation is not a lesson. Store proposed lessons in the appropriate inbox/chronicle path until promoted under memory law.

## 14. SEARCH / LATS LAW

Branching is expensive. Before Search Mode, state why a linear bounded attempt is insufficient.

Each branch receives the same frozen objective and evaluation criteria. Branch count and depth are bounded before launch. Prefer cheap deterministic elimination. Preserve only evidence needed to explain the winning/failed alternatives.

If no branch wins under the frozen criteria, STOP; do not invent success.

## 15. COMPOUNDING / SKILL LAW

Repeated success should reduce future reasoning.

When a technique succeeds repeatedly, ask:

- Is it generalizable?
- Is its contract coherent and singular?
- Can it be isolated and tested?
- Does legacy inventory already contain it?
- Can it become or improve a Block?

If yes, route it as a Block/Garden candidate. Promotion still follows `FOUNDATION_LAWS.md`; successful repetition does not self-admit code.

## 16. EVENT-DRIVEN BEFORE POLLING

Prefer explicit events to constant AI polling.

Examples:

- receipt written -> wake GPT Control;
- verification failed -> wake correction decision;
- remote sync proven -> wake acceptance gate;
- authorized schedule/pulse -> health observation;
- new Garden signal -> queue intelligence review.

A timer or heartbeat may trigger observation but not fabricate work. AI should sleep when no decision needs intelligence.

## 17. THREE TEMPOS

### FAST LOOP
Milliseconds/seconds. Deterministic validation, state checks, policy, hashing, routing, tests and receipts. AI-free by default.

### THINK LOOP
Seconds/minutes. Bounded AI understanding, debugging, planning, writing and evaluation.

### LEARNING LOOP
Mission/day scale. Reflection, memory promotion, Garden linking, Block promotion and architectural learning. Never required to complete the critical execution path.

Do not mix these tempos into one giant agent loop.

## 18. RETRY IS NOT FALLBACK

A retry repeats the same authorized operation because evidence says the failure may be transient. A fallback changes implementation/provider/strategy and is a new decision.

- semantic/correctness failure: no blind retry;
- deterministic invalid input: no retry;
- environmental/transient failure: retry only if contract declares it and budget remains;
- provider exhaustion: STOP or use an explicitly pre-authorized fallback policy;
- unknown failure: STOP for classification.

Never disguise fallback as retry.

## 19. CONTEXT LAW

Give each worker the minimum sufficient context package:

- frozen objective;
- acceptance/forbidden conditions;
- exact relevant files/contracts;
- known causal evidence;
- allowed tools/authority;
- remaining budget;
- required receipt format.

Do not dump the repository, vault or chat history into a worker. Retrieve what the current decision needs.

## 20. LOOP RECEIPT

Every non-trivial loop attempt should make continuation reconstructible. The Control Feedback Block is the current V2 evidence seam and should carry or reference, as the schema evolves legitimately:

- mission/loop identity;
- loop type and owner;
- trigger;
- attempt number;
- budget before/after;
- input/state references;
- actions/mutations summary;
- progress delta;
- verifier/evidence references;
- terminal state;
- first causal blocker if failed;
- requested next action;
- whether continuation is authorized.

Do **not** mutate Block #1's released contract ad hoc merely to fit this book. Extend/version only through normal Block law when implementation reaches this requirement.

## 21. CONTROL FEEDBACK BLOCK TRIGGER

At the current empty-house stage, Loop Law belongs adjacent to GPT Control and is **recorded through Block #1**, not implemented inside it.

Trigger this book before GPT/delegates authorize any of:

`RETRY`, `CONTINUE`, `REFINE`, `REFLECT`, `FALLBACK`, `BRANCH`, `SEARCH`, `RECUR`, `REPEAT`, `SCHEDULE`, `AUTONOMOUS_CONTINUATION`.

Block #1 remains one capability: validated control feedback/receipt. It must not become an orchestrator. The receipt is the boundary by which a future loop-capable Block can report back to GPT Control.

## 22. LEGACY STOCK — REUSE BEFORE BUILD

The V2 inventory already identifies legacy anti-drift stock that loop implementation must inspect before creating equivalents:

- `.claude/hooks/guard.mjs` + tests — deterministic pre-action rail and negative/allow controls;
- `.claude/agents/repository-auditor.md` — measurement-before-conclusion;
- `.claude/agents/governance-reviewer.md` — scope/authority review;
- `.claude/agents/test-verifier.md` — evidence quality and `PROVEN`/`UNPROVEN` distinction;
- `.claude/skills/repo-sitrep/SKILL.md` — state-first orientation;
- `.claude/skills/verify-mission/SKILL.md` — revision-bound synchronous verification;
- `.claude/skills/mission-close/SKILL.md` — frozen acceptance, one item -> verify -> report -> stop;
- deterministic legacy repository checks under `scripts/check-*.mjs`;
- legacy Kronos/Talos/Trust/containment/ledger stock catalogued in `LEGACY_INVENTORY.md` must be inspected at source before extraction.

This book is doctrine. Existing proven code remains the first implementation quarry.

## 23. ANTI-PATTERNS — FORBIDDEN

- infinite agent loop;
- model decides its own continuation indefinitely;
- repeated reads counted as progress;
- retry without failure classification;
- silent model/provider/tool/repository/strategy fallback;
- self-critique accepted as proof when deterministic proof exists;
- context reset that erases budgets or known failures;
- reflection automatically written as truth;
- branching before a cheap linear attempt;
- polling AI when an event can wake it;
- worker broadens mission after discovering adjacent work;
- tests changed to bless implementation;
- outer authority hidden inside an inner worker;
- successful loop automatically promoted to reusable Block;
- new loop engine created before repeated real missions prove one is needed.

## 24. DEFAULT DECISION TABLE

| Situation | Default loop |
|---|---|
| Exact deterministic operation | No AI loop |
| Small known edit | ReAct, one attempt |
| Engineering edit | ReAct -> external Critic |
| First attempt polluted/stalled | Fresh-context bounded Ralph retry |
| Quality refinement with clear rubric | Evaluator–Optimizer |
| Prompt/spec/prose polish | bounded Self-Refine |
| Unexpected meaningful failure/success | Verified Reflexion after episode |
| Multiple genuinely plausible solutions | bounded Search/LATS mode |
| Repeated proven technique | Compounding/Block candidate |
| No new event or decision | Sleep |

## 25. TERMINAL STATES

Every loop ends explicitly as one of:

- `PASS` — acceptance proven;
- `FAIL` — acceptance disproven within contract;
- `BLOCKED` — prerequisite/authority/environment prevents proof;
- `STALL` — budget consumed without semantic progress;
- `CANCELLED` — outer authority stopped it;
- `WAIT_GPT` — evidence recorded; controller decision required.

`PARTIAL` may describe artifacts but is not permission to continue.

## 26. THE GOLDEN LOOP

For normal OTHRYS engineering, prefer this shape:

`STATE -> FREEZE -> FRESH WORKER -> OBSERVE/ACT -> EXTERNAL VERIFY -> RECEIPT -> GPT DECISION -> STOP`

Only if GPT explicitly authorizes another bounded attempt:

`NEW FRESH WORKER -> FIRST CAUSAL BLOCKER -> MINIMUM REPAIR -> VERIFY -> RECEIPT -> STOP`

The goal is not to make agents loop longer.

The goal is to make **each loop smaller, more observable, cheaper, replaceable and harder to drift** until repeated success can be turned into a proven Block.
