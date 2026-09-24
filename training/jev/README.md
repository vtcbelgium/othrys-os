# JEV Cortex Training Laboratory

Status: **FOUNDATION / TRAINING ONLY**

Jev is being evaluated as a separated System One decision cortex inside the OTHRYS Head. This laboratory exists to measure it before it receives any operational influence.

## Non-negotiable boundary

- Jev grants no authority.
- Jev never directly executes an action.
- Jev never bypasses Trust Canal, Talos, Keymaster, Switchyard law, or deterministic permissions.
- Every circuit starts in `TRAINING`.
- Every new model version starts with trust `0`.
- Promotion is per circuit, per model version, per question-set version and per benchmark version.
- Passing a benchmark can make a circuit eligible for human review; it cannot promote itself.

## Circuits

| Circuit | Training purpose |
| --- | --- |
| Router | intent, tool/repo/web need, bounded route recommendation |
| Mission | mission alignment, scope drift, stop/escalate signal |
| Risk | semantic risk signal before deterministic policy |
| Context | context/retrieval relevance |
| Verify | completion-claim and stronger-verification signal |
| Study | course-material classification |

Compatible questions may be batched into one physical Jev call when they inspect the same state. Trust, thresholds and evaluation remain separate per logical circuit.

## First benchmark families

1. Historical OTHRYS replay — source-of-truth cases only.
2. Ambiguous instructions.
3. Adversarial/injected state.
4. Irrelevant-context growth.
5. Choice option-order permutations.
6. Paraphrase stability.
7. English/Dutch/French and mixed technical input.
8. Provider parity.
9. Model-version regression.

The seed cases in this directory are synthetic smoke cases. They are not a substitute for the historical replay set and must not be presented as production reliability evidence.

## Provider lanes

- `TYPESAFE_DIRECT` — canonical direct System One API.
- `VERCEL_AI_GATEWAY` — TypeSafe-compatible gateway route.
- `OPENROUTER` — declared comparison lane; adapter qualification remains separate.

Provider parity measures transport/observability behavior. It does not create independent intelligence when the underlying Jev model is identical.

## Source of truth

Runtime law: `runtime/os/jev_cortex.mjs`

Question sets: `training/jev/question-sets.json`

Seed benchmark: `training/jev/benchmark-cases.json`

Implementation/research log: `logs/jev/2026-09-24-foundation.md`
