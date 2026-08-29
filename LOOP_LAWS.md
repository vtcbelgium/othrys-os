# OTHRYS LOOP LAWS

**Status:** ACTIVE PROCESSING LAW / TOOLBOX  
**Scope:** iterative processing, verification, correction, search, learning and compounding  
**Purpose:** define which loop patterns exist, when they are appropriate, how they are bounded, nested, verified and terminated.

These laws are deliberately separate from `BOOK_OF_GPT.md`. They do not define a manager, controller personality, operator relationship, Titan, scheduler or runtime implementation. They are a reusable processing toolbox.

## NORTH STAR

A loop exists to make measurable progress under bounded conditions.

> **No loop may continue merely because an AI wants another turn.**

Default posture:

`ONE ATOMIC ATTEMPT -> EVIDENCE -> STOP OR EXPLICITLY AUTHORIZED NEXT ITERATION`

## 1. LOOP TOOLBOX

Use the smallest loop that can solve the problem.

### Deterministic loop
Use when rules, state transitions or checks can be executed without AI.

Typical uses: validation, hashing, routing, policy checks, test execution, state comparison, schema checks.

### ReAct loop
`OBSERVE -> COMPARE STATE TO GOAL -> ACT ONCE -> VERIFY DELTA`

Use for responsive tool-grounded execution inside one bounded attempt. ReAct is local reasoning around real observations; it is not permission for indefinite continuation.

### External Critic loop
`CLAIM -> EXTERNAL CHECK -> EVIDENCE -> ACCEPT / REJECT`

Use whenever correctness can be tested by an external mechanism. Preferred evidence order:
1. deterministic executable proof;
2. independent evaluator/verifier;
3. implementing model self-critique only when stronger proof is unavailable.

### Evaluator-Optimizer loop
`WORKER -> ARTIFACT -> EVALUATOR -> BOUNDED FEEDBACK -> WORKER`

Use when quality has explicit criteria but likely needs more than one pass. Freeze the rubric and maximum cycles before starting.

### Self-Refine loop
`GENERATE -> CRITIQUE -> REFINE`

Use sparingly for prose, prompts, plans, specifications and presentation. Generator and critic share assumptions, so self-refinement is weak evidence for engineering truth.

### Bounded Ralph loop
`FRESH CONTEXT -> ONE ATOMIC TASK -> EXECUTE -> VERIFY -> CHECKPOINT -> DISCARD CONTEXT`

Use for longer engineering work where context rot is a risk. Persistent truth must live outside the worker context. Fresh context never resets budgets, known failures or acceptance criteria.

### Verified Reflexion loop
`SURPRISE -> EVIDENCE -> ROOT CAUSE -> LESSON -> REVIEW -> PROMOTE / PARK`

Use after meaningful episodes, not as ritual. Reflection is a candidate lesson until supported and reviewed.

### Search / LATS-like loop
`PROBLEM -> BOUNDED ALTERNATIVES -> TEST/EVALUATE -> SELECT OR STOP`

Use only when simpler linear approaches are insufficient and multiple materially different paths remain plausible. Branch count and depth are fixed before launch.

### Compounding loop
`REPEATED PROVEN SUCCESS -> GENERALIZE -> REUSABLE CAPABILITY CANDIDATE`

Use to turn repeated successful methods into reusable capability. Repetition alone does not grant promotion or authority.

## 2. LOOP SELECTION LADDER

Escalate only when evidence requires it:

0. deterministic operation;
1. one atomic ReAct attempt;
2. ReAct + external Critic;
3. one fresh-context bounded Ralph iteration;
4. evaluator-optimizer cycle;
5. bounded branch/search mode;
6. human/controller architecture decision.

Never choose a more expensive loop simply because it sounds sophisticated.

## 3. REQUIRED LOOP CONTRACT

Every admitted loop declares:

- **OWNER** — who controls continuation;
- **TRIGGER** — what wakes it;
- **INPUT** — exact bounded context/data;
- **STATE** — persisted state it may read/write;
- **BUDGET** — turns, time, cost, mutations and attempts;
- **EXIT CONDITION** — objective PASS/FAIL/STOP condition;
- **EVIDENCE** — what proves progress/completion.

If any field is unknown, do not run the loop.

## 4. EVERY LOOP IS BOUNDED

Declare applicable hard limits before execution:

- maximum iterations;
- maximum wall time;
- maximum cost;
- maximum mutations;
- maximum retries per causal failure;
- stall threshold;
- terminal failure state.

No unbounded `while true`. A new worker/context does not reset a parent budget.

## 5. NESTING LAW

> **An inner loop may produce evidence for an outer loop; it may never grant itself another outer-loop iteration.**

Examples:
- ReAct may observe failure; it cannot authorize another mission.
- Critic may reject an artifact; it cannot broaden scope.
- Ralph may finish an atomic task; it cannot choose a new architecture.
- Reflexion may propose a lesson; it cannot promote that lesson to law.
- Search may rank alternatives; it cannot grant deployment authority.

Continuation authority flows from outside inward. Evidence flows from inside outward.

## 6. SEMANTIC PROGRESS LAW

Tool activity is not progress.

Valid progress deltas include:
- a valid source change toward frozen acceptance;
- a relevant failing proof becoming green;
- a required artifact being produced;
- a causal hypothesis being proven or disproven;
- a dependency/blocker being resolved with evidence;
- an allowed measurable state transition.

Repeated reads, searches, restatements, plans, retries, provider switches and unchanged reruns are zero progress unless they produce new evidence.

Repeated zero progress beyond the declared threshold -> `STALL -> STOP`.

## 7. FIRST CAUSAL BLOCKER LAW

When verification fails:
1. identify the first causal blocker supported by evidence;
2. record a structured diagnosis: failure class, causal evidence, changed assumption and allowed next action;
3. decide whether repair remains inside the frozen contract;
4. if yes, allow only the next bounded correction iteration;
5. otherwise STOP and re-plan outside the loop.

Do not repair downstream symptoms while the first causal blocker remains.

## 8. REACT LAW

- Observe before acting.
- Compare current state to the frozen goal/acceptance state before choosing the next action.
- One action should answer one concrete uncertainty or advance one frozen objective.
- Incorporate the actual result before the next action.
- Re-reading unchanged truth is stall, not caution.
- Finish as soon as acceptance evidence exists.
- The worker requires an explicit finish condition.

## 9. EXTERNAL CRITIC LAW

Ask: **If this implementation were wrong, what would fail?**

Use the strongest practical evidence: schema validation, compiler/type check, focused test, negative control, runtime observation, digest/state comparison, browser proof, or equivalent deterministic evidence.

Never weaken the verifier simply to make the result green.

## 10. BOUNDED RALPH LAW

Each iteration must:
1. reconstruct from persisted truth;
2. receive one atomic objective and acceptance contract;
3. mutate only authorized scope;
4. verify externally;
5. checkpoint the outcome;
6. terminate its context.

The next iteration reads persisted truth and evidence, not the previous worker's narrative. A worker-emitted DONE/NEXT/COMPLETE sentinel is only a proposal; external verification controls the actual transition.

## 11. EVALUATOR-OPTIMIZER LAW

Use only with explicit quality criteria and a predeclared maximum number of refinement cycles. Prefer an evaluator independent from the generator. If successive cycles do not create semantic progress, STOP.

## 12. SELF-REFINE LAW

Self-refinement is bounded and secondary. Use a small number of cycles. For engineering correctness, move quickly to external evidence.

## 13. VERIFIED REFLEXION LAW

Reflection is surprise-driven. Good triggers include:
- unexpected failure;
- repeated causal failure;
- operator correction;
- detected drift;
- a negative control exposing a real defect;
- large prediction/reality mismatch;
- genuinely novel successful technique.

A lesson records evidence, scope, confidence/status and supersession path. Raw explanation is not persistent truth.

## 14. SEARCH LAW

Branching requires an explicit reason why a cheap linear attempt is insufficient. Each branch receives the same objective and evaluation criteria. Branch count/depth are bounded. If no branch meets the frozen criteria, STOP.

## 15. COMPOUNDING LAW

Repeated successful processing should reduce future reasoning. Before turning a method into reusable capability, ask:
- is it generalizable?;
- can it be isolated?;
- can it be tested?;
- does an existing capability already cover it?;
- does reuse remove future reasoning rather than add coupling?


## 15A. TRACE COMPRESSION LAW

A mature loop should require less AI over time. Inspect execution traces for repeated, stable tool/action subsequences. When a sequence is repeatedly proven, bounded, generalizable and safe, qualify it as a deterministic recipe/meta-tool/Block candidate instead of asking a model to rediscover the same steps.

Compression requirements:
- same frozen intent shape or clearly parameterized family;
- repeated external PASS evidence;
- deterministic inputs/outputs and failure semantics;
- no hidden authority expansion;
- negative controls;
- measurable reduction in model/tool turns.

The goal of compounding is not a larger agent. It is a smaller future reasoning burden.

## 15B. CAPABILITY-GATED LOOP FREEDOM

Prescribed scaffolding is the default. A worker may choose among loop strategies only when its capability is explicitly qualified for that freedom. Even then, the outer controller freezes objective, permitted interactions, data boundary, total budget, evaluator and authority.

Weak/unknown labor receives a narrow prescribed loop. Strong qualified labor may choose the route, but never rewrite the destination or the proof standard.

## 16. EVENT-DRIVEN BEFORE POLLING

Prefer explicit events over constant polling. A timer may trigger observation; it does not fabricate work. AI should sleep when no decision requires intelligence.

## 17. THREE TEMPOS

### FAST
Milliseconds/seconds. Deterministic validation, state checks, policy, hashing, routing and tests.

### THINK
Seconds/minutes. Bounded AI understanding, debugging, planning, writing and evaluation.

### LEARN
Mission/day scale. Reflection, knowledge promotion, reusable-method discovery and architectural learning.

Do not collapse the three tempos into one giant loop.

## 18. RETRY IS NOT FALLBACK

A retry repeats the same authorized operation because evidence says the failure may be transient. A fallback changes implementation/provider/strategy and therefore requires a new decision.

- deterministic invalid input: no retry;
- semantic/correctness failure: no blind retry;
- transient environmental failure: retry only if declared and budget remains;
- provider exhaustion: stop or follow an explicitly pre-authorized fallback policy;
- unknown failure: stop for classification.

## 19. CONTEXT LAW

Each worker receives the minimum sufficient context:
- frozen objective;
- acceptance and forbidden conditions;
- exact relevant files/contracts;
- known causal evidence;
- allowed tools/authority;
- remaining budget;
- required output/checkpoint format.

Do not dump entire repositories, histories or memory stores into a worker.

## 20. LOOP EVIDENCE

A non-trivial loop attempt should make continuation reconstructible. Record or reference:
- loop identity/type;
- owner;
- trigger;
- attempt number;
- budget before/after;
- input/state references;
- actions/mutations summary;
- semantic progress delta;
- verifier/evidence references;
- terminal state;
- first causal blocker if failed;
- requested next action;
- whether continuation is authorized.


## 20A. LOOP OPTIMIZATION TELEMETRY

Trace non-trivial loops so OTHRYS can reduce future reasoning. Useful measurements include:
- semantic-progress rate per iteration;
- verifier PASS yield per mutation;
- repeated/redundant tool-call ratio;
- identical-failure recurrence;
- time/token/cost per accepted state delta;
- context restart/compaction frequency;
- first-causal-blocker resolution rate;
- strategy-switch/fallback frequency;
- human intervention frequency and cause;
- recurring trace sequences suitable for deterministic compression.

Metrics optimize processing; they do not grant authority or prove correctness by themselves.

## 21. FORBIDDEN ANTI-PATTERNS

- infinite agent loops;
- worker authorizes its own indefinite continuation;
- repeated reads counted as progress;
- retry without failure classification;
- silent provider/model/tool/strategy fallback;
- self-critique treated as proof when external proof exists;
- fresh context erasing budgets or known failures;
- reflection automatically written as truth;
- branching before a cheap linear attempt;
- polling AI when an event can wake it;
- worker broadens objective after finding adjacent work;
- tests changed merely to bless output;
- hidden outer authority inside an inner loop;
- successful loop automatically promoted to reusable capability;
- worker self-reported completion accepted without external proof;
- ritual reflection after every turn when no surprise/state mismatch exists;
- capable optimizer allowed to rewrite its objective, evaluator or total budget.

## 22. DEFAULT DECISION TABLE

| Situation | Default processing pattern |
|---|---|
| Exact deterministic operation | No AI loop |
| Small known edit | ReAct, one attempt |
| Engineering edit | ReAct -> external Critic |
| First attempt polluted/stalled | Fresh-context bounded Ralph |
| Quality refinement with clear rubric | Evaluator-Optimizer |
| Prompt/spec/prose polish | bounded Self-Refine |
| Unexpected meaningful failure/success | Verified Reflexion after episode |
| Multiple genuinely plausible solutions | bounded Search/LATS-like mode |
| Repeated proven technique | Compounding candidate |
| No new event or decision | Sleep |

## 23. TERMINAL STATES

Every loop ends explicitly as one of:

- `PASS` — acceptance proven;
- `FAIL` — acceptance disproven within contract;
- `BLOCKED` — prerequisite/authority/environment prevents proof;
- `STALL` — budget consumed without semantic progress;
- `CANCELLED` — outer authority stopped it;
- `WAIT` — evidence recorded; an outer decision is required.

`PARTIAL` may describe artifacts but is not permission to continue.

## 24. GOLDEN PROCESSING SHAPE

For ordinary engineering:

`STATE -> FREEZE -> FRESH WORKER -> OBSERVE/ACT -> EXTERNAL VERIFY -> CHECKPOINT -> OUTER DECISION -> STOP`

If another bounded iteration is explicitly authorized:

`NEW FRESH WORKER -> FIRST CAUSAL BLOCKER -> MINIMUM REPAIR -> VERIFY -> CHECKPOINT -> STOP`

The objective is not to make agents loop longer.

The objective is to make each iteration **smaller, more observable, cheaper, replaceable and harder to drift**.