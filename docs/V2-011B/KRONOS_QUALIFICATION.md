# V2-011B — Kronos Resident Qualification

**Verdict:** QUALIFIED_FOR_ADAPTATION / NO LIFE AUTHORITY
**Great Harvest:** ADAPT

## Proven prior stock
- `core/titan/kronos/src/lifecycle.ts` — fail-closed global lifecycle adjacency.
- `heartbeat.ts` — canonical heartbeat evidence schema and honesty invariant.
- `execution-semantics.ts` — at-least-once, idempotent boot-step contract; no exactly-once claim.
- `cancellation.ts` — graceful vs forced cancellation; graceful requires compensation.
- `child-termination.ts` — explicit child termination policy, default `propagate`.
- `supervision.ts` — heartbeat + lease distinction so silent is not confused with slow.
- ADR-0069 — Kronos owns LIFE, never WORK; no second workflow, policy, sandbox or work replay engine.

## Proof
- Old Core Kronos contract suite: **11/11 PASS**.
- Focused Hub Life/Kronos proof: **25/25 PASS**.
- Hub Life proof itself states `platform_life = NOT_ACTIVE` / `hub_life_authorized = false`; this is evidence against pretending the old UI/runtime was a finished platform kernel.
## V2 ownership reconciliation
Current V2 already owns durable Work, Talos execution verification/retry evidence, Trust Canal authority, operating modes, Rhea Care, Mycelium placement, and Housekeeping loops. Kronos must not duplicate any of these.

Rhea may emit a typed LIFE escalation request; Kronos remains the named decision domain, but no actual `safe_mode`, `halt`, `boot`, `valve`, or composition-root mutation is admitted by this mission. Talos remains verifier of any future lifecycle effect.

The old ADR's `PID-1 equivalent` is architectural intent, not current V2 runtime proof. V2 must separately prove any composition-root migration before claiming it.

## Reuse / adapt / reject
**REUSE AS LAW:** lifecycle state vocabulary/adjacency; heartbeat honesty; heartbeat+lease distinction; at-least-once/idempotent semantics; graceful/forced cancellation distinction; child-termination policy; LIFE-not-WORK boundary.

**ADAPT FIRST:** a pure native Kronos contract kernel that validates lifecycle transitions, constructs/validates authority-free heartbeat evidence, evaluates finite supervision evidence, and constructs cancellation/lifecycle proposals only.

**DEFER:** signed boot records and Constitution activation until current V2 identity/Keymaster-equivalent custody is separately qualified.

**REJECT FOR RESIDENT ADMISSION:** Hub Life UI, MemoryCirculation, durable Life store, scheduler/daemon, Mission Control duplication, Runtime discovery, product-work execution, automatic recovery, boot/shutdown orchestration, emergency action execution, old composition-root swap.
## Smallest legal resident seam
1. Pure lifecycle transition guard over the qualified state graph.
2. Pure heartbeat evidence constructor/validator; heartbeat can never claim healthier state than supplied mandatory-component evidence.
3. Pure supervision evaluator over explicit finite component health + lease facts.
4. Pure graceful/forced cancellation request contracts.
5. Every output: `authorityGranted=false`, `executionStarted=false`.

No emitter loop, no process control, no scheduler, no automatic state mutation, no runtime boot and no LIFE action belongs in the first resident.

## Next legal action
A separate House-admission mission may adapt that pure contract kernel and admit it through manifest + Book + component contract + Atlas/Mnemosyne proof. Actual platform LIFE execution remains a later separately governed mission.