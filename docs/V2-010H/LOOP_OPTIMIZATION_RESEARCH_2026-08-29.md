# OTHRYS Loop Optimization Research — 2026-08-29

**Status:** RESEARCH / NEXT-STEP EVIDENCE
**Authority:** none; informs Loop Weaving after V2-010H.
**Question:** how should OTHRYS make agent loops converge faster, cheaper and with less drift while preserving external authority/evidence?

## Executive finding
OTHRYS should not build one universal autonomous loop. It should use a small loop portfolio selected by evidence, with deterministic processing first, state-grounded reflection only after a failed/surprising transition, fresh-context workers for long horizons, and external verification controlling continuation.

The strongest new principle is **loop compression**: every repeated proven sequence should become less agentic over time. Trace recurring tool patterns, verify they are stable, then promote them into deterministic composite operations/meta-tools. The mature OTHRYS loop therefore shrinks as the house learns.

## Current external signals
- Microsoft AWO (2026): mine traces for redundant tool sequences and replace them with deterministic meta-tools; reported fewer LLM calls and higher task success.
- ReflAct (EMNLP 2025): reason explicitly about current state relative to goal state instead of merely planning the next action; large gains over ReAct in ALFWorld.
- ACL 2026 structured reflection: separate evidence-based error diagnosis from the corrected tool call; improves recovery and reduces redundant calls.
- Microsoft OEO (Aug 2026): strong optimizers can compose the optimization route online when objective, permitted interactions, budget, data boundary and evaluation stay externally fixed; weaker optimizers still need prescribed scaffolding.
- OPT-BENCH (ACL 2026): feedback-driven self-optimization is strongly capability-dependent; stronger base models exploit feedback better, but none remove the need for external evaluation.
- Current OpenAI production guidance: runs are loops with explicit exit conditions; use guardrails, tracing, evals, controlled sandboxes and deliberate state/compaction for long-horizon work.

## OTHRYS optimization model
1. **Freeze invariants outside the optimizer.** Objective, allowed tools/touch, data boundary, budget, evaluation and authority remain external even when a capable model may choose the route.
2. **Reflect on state delta, not prose.** Compare `current_state` to `goal_state`; diagnose the first evidence-backed gap; select one action that can change that gap.
3. **Separate Diagnose -> Correct.** A failed tool call creates a structured failure record before any retry/correction: failure class, causal evidence, changed assumption, permitted next action.
4. **Fresh context for long horizons.** Worker context is disposable; mission/Work/contracts/evidence/budget live outside it. Context restart never resets the parent budget.
5. **Verifier-gated completion.** A model saying DONE/NEXT/COMPLETE is a proposal. External criteria must prove the state transition.
6. **Compress successful traces.** Repeated stable tool-call subsequences become deterministic recipes/meta-tools after qualification; fewer LLM decisions is a maturity signal.
7. **Capability-gated freedom.** Low/medium labor gets explicit prescribed pipelines. Only certified high-capability optimizers may choose among loop strategies, while invariants stay frozen.
8. **Event-driven wakeups.** No intelligent polling. Timers/events wake a cheap deterministic observer; AI enters only when a decision or anomaly exists.
9. **Search only after linear failure.** Parallel/tree search is expensive; branches must be materially different and share the same evaluator.
10. **Learn from surprise, not every turn.** Persist verified failure signatures, successful repair patterns and measured trace optimizations; do not store generic self-talk.

## Loop telemetry OTHRYS should measure
- semantic-progress rate per iteration;
- verifier pass yield per mutation;
- redundant/repeated tool-call ratio;
- identical-failure recurrence;
- time/cost/token budget consumed per accepted state delta;
- context reload/compaction frequency;
- first-causal-blocker resolution rate;
- fallback/strategy-switch frequency;
- human intervention frequency and cause;
- candidate trace sequences suitable for deterministic compression.

These are optimization signals, not authority signals.

## Recommended OTHRYS loop stack
- **L0 Deterministic:** validators, hashing, state diff, routing, policy, exact tests. No model.
- **L1 Grounded action:** `OBSERVE -> GOAL-GAP -> ACT ONCE -> VERIFY`.
- **L2 Structured repair:** `FAILURE -> DIAGNOSE -> MINIMUM CORRECTION -> VERIFY`.
- **L3 Fresh-context execution:** one atomic task per worker; reconstruct from durable truth.
- **L4 Evaluator-optimizer:** only where a fixed rubric supports measurable refinement.
- **L5 Bounded search:** multiple distinct candidate strategies only after cheaper loops fail.
- **L6 Open-ended optimizer:** reserved for a certified strong optimizer; it may compose the route, never the objective/boundaries/budget/evaluator/authority.
- **L7 Compounding/compression:** successful trace families become qualified recipes/meta-tools/Blocks, reducing future model calls.

## What not to copy
- Unverified sentinel-based completion from generic Ralph implementations.
- Long shared-context loops that depend on the worker remembering governance.
- Self-reflection after every step; reflection should be triggered by failure, surprise or meaningful state mismatch.
- Multi-agent role multiplication when one agent plus tools/evaluator suffices.
- Automatic learning that writes model explanations directly into canonical knowledge.
- Unbounded search/test-time scaling justified only by model confidence.

## Proposed Loop Weaving acceptance
The next mission should not create a giant scheduler. It should machine-check existing recurring/AI-assisted flows against Loop Laws, emit trace metrics from existing evidence where cheap, add a structured failure/diagnosis shape, and identify the first one or two repeated deterministic subsequences worth compressing. Runtime authority remains unchanged.

## Sources
- Microsoft Research, *Optimizing Agentic Workflows using Meta-tools* (2026).
- Microsoft Research, *Rethinking Self-Evolving Agents: Do We Still Need Prescribed Optimization Pipelines?* (2026).
- EMNLP 2025, *ReflAct: World-Grounded Decision Making in LLM Agents via Goal-State Reflection*.
- ACL 2026, *Failure makes the agent stronger: Enhancing Accuracy through Structured Reflection for Reliable Tool Interactions*.
- ACL 2026, *OPT-BENCH: Evaluating the Iterative Self-Optimization of LLM Agents in Large-Scale Search Spaces*.
- OpenAI, *A practical guide to building agents*; Agents SDK 2026 guidance on controlled sandboxes, tracing, guardrails and long-horizon state.
- Anthropic, *Building Effective Agents*, evaluator-optimizer/orchestrator-worker baseline patterns.
