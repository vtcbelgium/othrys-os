# BOOK OF FRUGALITY

**Hyperion doctrine for cost intelligence, resource substitution, and cheap proof**

> **FRUGAL FIRST. ALWAYS.**

OTHRYS must become exceptionally good at producing useful work with resources that are already owned, free, open, local, idle, reusable or cheaper than the obvious default.

Frugality is not a temporary Course Mode restriction and it is not merely an attempt to spend less money. It is a permanent competitive capability.

A system that needs expensive models, premium APIs, large cloud instances and paid SaaS for every ordinary task is economically fragile. A system that can solve most work locally or cheaply and escalate only the irreducible remainder has structural advantage.

Hyperion therefore treats cost as an architectural variable.

> **DO NOT ASK FIRST: WHAT IS THE BEST TOOL? ASK: WHAT IS THE CHEAPEST RELIABLE PATH THAT MEETS THE REQUIRED OUTCOME?**

---

## 1. THE FRUGALITY NORTH STAR

`REQUIRED OUTCOME -> CHEAPEST CREDIBLE PATH -> VERIFY -> ESCALATE ONLY ON PROVEN DEFICIT`

The target is not the cheapest execution regardless of quality.

The target is:

**minimum total resource cost for sufficient verified outcome quality.**

Cost includes more than euros:

`MONEY + TOKENS + COMPUTE + LATENCY + ENERGY + HUMAN ATTENTION + SUPPORT + MAINTENANCE + LOCK-IN + FAILURE RISK + SWITCHING COST`

A free service that consumes hours of repair is expensive. A local model that repeatedly produces unusable work is expensive. A paid API that reliably eliminates days of engineering may be frugal.

Frugality therefore requires measurement, not ideology.

---

## 2. THE FIRST LAW — FRUGAL FIRST

Every eligible OTHRYS execution begins at the cheapest credible tier.

Canonical search order:

`REUSE -> CACHE -> DETERMINISTIC CODE -> LOCAL -> OWNED/IDLE COMPUTE -> OPEN SOURCE -> FREE ALLOWANCE -> CHEAP PROVIDER -> PAID SPECIALIST -> PREMIUM ESCALATION`

This is a search order, not a blind routing table. Security, privacy, reliability, latency and task requirements may disqualify tiers.

The burden of proof is on escalation.

> **EXPENSIVE IS AN ESCALATION STATE, NOT A DEFAULT.**

---

## 3. THE FRUGAL LADDER

### F0 — DO NOTHING
Before computing anything, ask whether the work is necessary. Avoid duplicate summaries, repeated indexing, redundant agent calls, unnecessary polling and vanity generation.

### F1 — REUSE
Use an existing verified result, Block, artifact, template, answer, dataset, embedding, build or capability when still valid.

### F2 — CACHE
Reuse previous computation when freshness requirements permit. Cache at useful boundaries and invalidate deliberately.

### F3 — DETERMINISTIC
Prefer code, rules, SQL, search, parsing, transforms and ordinary algorithms when they can solve the problem reliably. Do not spend model tokens on arithmetic or deterministic plumbing merely because an LLM is available.

### F4 — LOCAL
Use local models and local compute when outcome quality is adequate and total cost is favorable.

### F5 — OWNED / IDLE
Exploit already-owned machines and idle capacity where energy, reliability and orchestration make sense. Idle hardware is potential capital, not automatically free capital.

### F6 — OPEN / FREE
Use legitimate open-source systems, free tiers, credits and allowances when their terms, limits and reliability fit the job.

### F7 — CHEAP PAID
Choose the least expensive paid provider/model that meets the contract.

### F8 — SPECIALIST
Escalate to stronger or specialized paid machinery when cheaper tiers fail the defined outcome or when the expected value of superior performance justifies the delta.

### F9 — PREMIUM
Premium compute/models/services are reserved for work where evidence shows that the additional capability materially changes the outcome.

The ladder may be entered above F0 when policy already proves lower tiers unsuitable, but that proof should be reusable rather than rediscovered on every execution.

---

## 4. ESCALATION MUST BE EVIDENCE-BASED

A task escalates because a lower tier failed a measurable requirement, not because a premium tool feels safer.

Possible escalation triggers:

- quality below threshold;
- verification failure;
- context/window requirement unavailable below;
- latency deadline missed;
- local capacity unavailable;
- specialist modality/capability required;
- security/compliance requirement;
- repeated retries make cheap path more expensive;
- expected economic value materially exceeds escalation cost;
- benchmark proves premium tier superior for this task class.

Every recurring escalation should teach OTHRYS something.

`CHEAP FAILURE -> CLASSIFY -> RECORD -> IMPROVE ROUTER / TOOL OLYMPICS / SWITCHYARD`

Over time, OTHRYS should stop trying cheap routes known to fail and discover cheaper routes that newly succeed.

---

## 5. FRUGAL DOES NOT MEAN FREE

> **FREE IS ONE PRICE POINT. FRUGALITY IS AN OPTIMIZATION DISCIPLINE.**

Zero-price infrastructure can have hidden costs:

- poor reliability;
- severe rate limits;
- manual babysitting;
- provider churn;
- weak observability;
- migration burden;
- privacy tradeoffs;
- lock-in;
- unpredictable performance;
- engineering complexity.

Likewise, a paid service can be frugal when it reduces total cost.

Hyperion should compare **total cost of outcome**, not invoice price.

---

## 6. COST PER VERIFIED OUTCOME

The core unit is not `cost per call`.

It is:

`TOTAL COST / VERIFIED USEFUL OUTCOMES`

For AI work, a cheap model that needs four retries and premium review may cost more than one strong call. Conversely, sending every trivial task to the strongest model wastes money.

Measure where practical:

- cost per successful task;
- retries per success;
- verification cost;
- latency per success;
- human correction minutes;
- failure/recovery cost;
- marginal infrastructure cost;
- quality score at each tier.

Tool Olympics and Switchyard should eventually use these measurements directly.

---

## 7. THE FRUGAL ROUTER

OTHRYS should evolve toward a routing policy that knows task classes and their cheapest proven executor.

Conceptually:

```text
TASK
  -> classify requirements
  -> check reusable/cached result
  -> choose cheapest proven route
  -> execute
  -> verify
  -> PASS: record economics
  -> FAIL: escalate one justified tier
  -> verify
  -> learn route
```

The router should consider capability, cost, quality history, latency, availability, privacy, quota, context, energy and current machine/provider health.

It should not optimize price independently of correctness.

---

## 8. AUTO-FRUGAL

The long-term goal is **Auto-Frugal**: OTHRYS automatically discovers and maintains the cheapest verified execution path for recurring work.

Auto-Frugal should:

1. benchmark candidate executors;
2. maintain cost/quality evidence by task class;
3. prefer cheaper proven routes;
4. escalate on evidence;
5. exploit caches and deterministic shortcuts;
6. exploit local/owned capacity intelligently;
7. detect provider/model price changes;
8. detect free-tier/credit availability without abusing terms;
9. account for retries and verification;
10. periodically challenge expensive incumbents with cheaper candidates;
11. fall back safely when cheap providers degrade;
12. report savings and quality impact.

A premium provider should continuously have to **earn its place**.

---

## 9. THE CHEAPNESS CHALLENGE

No recurring expensive route becomes permanent merely because it once won.

Hyperion/Tool Olympics should periodically ask:

> **CAN WE NOW DO THIS CHEAPER WITHOUT LOSING THE REQUIRED OUTCOME?**

Triggers include:

- new local model;
- new open-source tool;
- new provider;
- provider price change;
- new hardware;
- better quantization;
- improved caching;
- deterministic replacement;
- new OTHRYS Block;
- workflow redesign;
- batching opportunity.

This turns ecosystem progress into automatic margin improvement.

---

## 10. FRUGAL ENGINEERING

Frugality must influence architecture before runtime.

Prefer systems that are:

- stateless where possible;
- cacheable;
- batchable;
- suspendable;
- portable;
- observable;
- provider-abstracted where justified;
- able to degrade gracefully;
- able to use local or remote executors;
- inexpensive when idle;
- easy to shut down;
- explicit about resource envelopes.

Avoid architectures whose basic existence creates permanent bills before value is proven.

> **FIXED COST BEFORE PROOF IS A TAX ON LEARNING.**

---

## 11. NURSERY FRUGALITY

The Hyperion Nursery is the proving ground for this doctrine.

Every specimen should begin with a **Frugal Plan**:

```yaml
frugal_plan:
  cheapest_test: defined
  reusable_assets: []
  local_options: []
  free_options: []
  paid_escalation: []
  max_experiment_cost: bounded
  escalation_trigger: defined
  cost_per_proof: measured_where_possible
```

The Nursery should actively seek ways to answer expensive questions cheaply.

Examples:

- test demand with a landing page before building backend capacity;
- benchmark on a representative sample before processing a full corpus;
- simulate load before buying permanent infrastructure;
- use synthetic/test data before paid data where valid;
- prototype with local/open models before premium inference;
- cache stable model outputs;
- use deterministic pre/post-processing to reduce model work;
- batch operations;
- shut down dormant experiments;
- ICE winners rather than paying to keep unnecessary production infrastructure alive.

Course Mode intensifies Frugal First, but does not create it.

---

## 12. FRUGALITY AND QUALITY

Frugality never authorizes silent quality collapse.

Every task class needs an outcome contract. The cheap path is valid only when it meets that contract.

Possible policy:

`CHEAPEST PASSING ROUTE WINS`

Not:

`CHEAPEST ROUTE WINS`

When outcome quality cannot be verified directly, use proxy evidence, sampling, stronger review, comparison tests or conservative routing until confidence improves.

---

## 13. FRUGALITY AND RELIABILITY

A cheap dependency with no fallback can be expensive during failure.

Critical paths may justify redundant providers or warm alternatives when expected outage cost exceeds redundancy cost.

Frugality therefore asks:

`EXPECTED TOTAL COST = NORMAL COST + FAILURE PROBABILITY * FAILURE IMPACT`

Resilience is not anti-frugal when it buys down material expected loss.

---

## 14. FRUGALITY AND HUMAN TIME

Operator attention is one of the most expensive OTHRYS resources.

A free workflow that requires Jeroen to repair it every day is not free.

Automation should prioritize repeated manual friction with favorable payback. Human-in-the-loop review should be placed where judgment adds value, not where poor machinery creates chores.

> **DO NOT SAVE CENTS BY SPENDING HOURS.**

---

## 15. FRUGALITY AND COMMERCIAL ADVANTAGE

Frugality becomes margin.

If OTHRYS can deliver the same useful outcome with lower cost than competitors, Hyperion gains options:

- lower price;
- larger free tier;
- higher margin;
- more experimentation;
- resilience against price competition;
- affordable niche products;
- pay-per-use where subscriptions would be excessive;
- profitable low-volume products;
- sponsor-funded/free surfaces;
- cheaper internal operations.

The point is not merely to survive the course cheaply. The point is to build an organism whose cost discipline remains an advantage when the financial gates eventually open.

---

## 16. FRUGALITY INCIDENTS

Hyperion should recognize:

**PREMIUM DEFAULT** — strongest/most expensive tool used without demonstrated need.

**TOKEN LEAK** — repeated unnecessary context, retries or agent chatter.

**IDLE TAX** — resources billed while producing no useful work.

**FREE-TOOL TRAP** — zero-price tool creates excessive maintenance or unreliability.

**RETRY TAX** — cheap executor becomes expensive through repeated failure.

**HUMAN SUBSIDY** — apparent savings are paid with operator time.

**LOCK-IN TAX** — cheap entry creates expensive future exit.

**CACHE MISS CULTURE** — stable work repeatedly recomputed.

**LLM-ALL-THE-THINGS** — probabilistic compute used for deterministic work.

**OVERPROVISIONING** — production-scale resources purchased before evidence requires them.

**FRUGALITY THEATRE** — optimizing tiny costs while ignoring dominant cost centers.

---

## 17. FRUGAL SCORECARD

For material recurring workloads track where feasible:

```text
TASK CLASS
REQUIRED QUALITY
CURRENT ROUTE
COST / VERIFIED OUTCOME
RETRY RATE
LATENCY
HUMAN MINUTES
LOCAL OPTION
FREE OPTION
CHEAPER CHALLENGER
LAST CHALLENGED
ESCALATION REASON
MONTHLY COST
ESTIMATED SAVINGS VS PREMIUM DEFAULT
```

Prometheus may discover challengers. Tool Olympics benchmarks them. Switchyard routes. Keymaster knows provider/key health and quota. Talos/Themis enforce authority and safety. Hyperion judges economics.

---

## 18. CORE LAWS

> **FRUGAL FIRST. ALWAYS.**

> **EXPENSIVE IS AN ESCALATION STATE, NOT A DEFAULT.**

> **THE CHEAPEST PASSING ROUTE WINS.**

> **FREE IS A PRICE POINT. FRUGALITY IS AN OPTIMIZATION DISCIPLINE.**

> **BUY INFORMATION, NOT VANITY.**

> **DO NOT SAVE CENTS BY SPENDING HOURS.**

> **FIXED COST BEFORE PROOF IS A TAX ON LEARNING.**

> **CACHE BEFORE COMPUTE. CODE BEFORE TOKENS. LOCAL BEFORE REMOTE WHEN IT PASSES. CHEAP BEFORE PREMIUM.**

> **EVERY PREMIUM ROUTE MUST KEEP EARNING ITS PLACE.**

> **MEASURE COST PER VERIFIED OUTCOME, NOT COST PER CALL.**

> **FRUGALITY THAT DESTROYS THE REQUIRED OUTCOME IS FAILURE, NOT SAVINGS.**

> **THE COURSE IS WHERE WE CRACK THE NUT. THE BUSINESS IS WHERE THE ADVANTAGE COMPOUNDS.**
