# JEV Cortex Foundation Log — 2026-09-24

Status: **TRAINING FOUNDATION**

This log intentionally records the reasoning and implementation boundaries behind the first Jev integration work. It is not a claim that Jev is reliable in OTHRYS.

## Research captured

- TypeSafe Jev is a System One decision model with typed Noul, Choice and Score questions over shared state.
- Official direct endpoint: `POST https://api.typesafe.ai/v1/systemone`.
- Vercel AI Gateway supports TypeSafe-compatible Jev calls by pointing the TypeSafe client base URL at `https://ai-gateway.vercel.sh/typesafe`.
- Vercel and LangChain examples converge on a safe pattern: application code owns effects and permissions; Jev judges bounded decisions.
- Compatible questions should be batched when they inspect the same state, while trust remains separate per logical circuit.
- Jev confidence is distribution concentration, not proven correctness.
- Current Jev weaknesses that must become test families include irrelevant context, adversarial state, literal wording, numeric/date reasoning and choice instability.
- Choice order must be tested by permutation for consequential circuits.
- Provider parity and model-version regression are separate concerns.
- A new Jev version inherits zero OTHRYS trust.

## Architecture decisions

1. The experimental right hemisphere is named **JEV Cortex**.
2. Logical circuits: Router, Mission, Risk, Context, Verify, Study.
3. All circuits begin in `TRAINING`.
4. Jev grants no execution authority.
5. Passing benchmark gates produces only eligibility for human shadow review.
6. Risk has stricter gates than low-risk classification circuits.
7. Stable and candidate model identities are separate.
8. Candidate trust is always initialized to zero.
9. Internal question sets are versioned and written in English.
10. Provider identity, model identity, question-set version and benchmark version must be logged separately.
11. Direct TypeSafe and Vercel TypeSafe-compatible routes are the first runnable lanes.
12. OpenRouter remains a declared comparison lane until its adapter is separately qualified.

## Files laid down

- `runtime/os/jev_cortex.mjs` — fail-closed Cortex law.
- `runtime/os/jev_cortex.test.mjs` — mechanical proof that training cannot grant authority.
- `training/jev/question-sets.json` — versioned Router and Study question sets.
- `training/jev/benchmark-cases.json` — synthetic seed smoke cases.
- `training/jev/run-benchmark.mjs` — direct/Vercel benchmark runner with reversed-choice order pass.
- `training/jev/README.md` — laboratory boundary.

## Explicitly not done yet

- No Jev call has been granted operational influence.
- No production routing uses Jev.
- No risk decision can approve an action.
- No historical OTHRYS requests have yet been admitted as benchmark truth.
- No provider/model has earned a trust score.
- OpenRouter execution is not yet qualified.
- No automatic promotion exists.

## Next evidence required

1. Run unit tests for Cortex law.
2. Run the synthetic benchmark with a real Jev key.
3. Inspect every disagreement and high-confidence wrong answer.
4. Build a source-of-truth historical replay dataset from OTHRYS records.
5. Add adversarial, context-rot, paraphrase and multilingual variants.
6. Only after enough evidence, consider one circuit for SHADOW review.

Authority granted: **false**.


## Verification log

### 2026-09-24 — focused foundation suite

Ran in an isolated T590 Git worktree from the feature branch so the canonical checkout and its untracked mission evidence were not modified.

Result: 8/8 passed.

Covered:
- house Book coverage and non-authority invariants;
- all JEV Cortex circuits remain TRAINING;
- candidate version trust starts at zero;
- training runs and observations cannot apply actions;
- passing metrics cannot self-promote;
- Risk refuses shadow eligibility after any critical false negative.

### 2026-09-24 — full runtime/os suite, first pass

Result: 355 passed / 1 failed out of 356.

Failure: `component contract shelf exactly matches current Book registry`.

Cause: The Book of Jev was registered as a current Book before an explicit component contract existed. Existing OTHRYS law correctly refused that mismatch.

Resolution: added `contracts/components/jev.md` with a strict `NO_SELF_GRANT` contract. The test was not weakened or bypassed.

This failure is retained in the log because it is useful architectural evidence: a new Book must carry an operational boundary even when the component is experimental and non-authoritative.
