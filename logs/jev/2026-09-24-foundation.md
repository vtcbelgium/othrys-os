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


### 2026-09-24 — full runtime/os suite, second pass

Result: **356/356 passed**.

The new Jev component contract restored the exact Book/component shelf invariant without changing the invariant itself. No existing runtime test was relaxed, skipped or rewritten.

Verification environment:
- device: VTC-t590;
- isolated Git worktree under `/tmp`;
- source: `origin/jev-cortex-foundation`;
- canonical `/home/jeroen/othrys-os` checkout left on `main`;
- existing untracked mission/runtime evidence in the canonical checkout left untouched.

Foundation verification status: **GREEN at OS runtime level**.
Live Jev model reliability remains **UNMEASURED** until provider credentials are configured and the benchmark corpus is executed.


### 2026-09-24 — free-route investigation

Searched official provider documentation and current Jev integrations.

Result:
- Vercel is the strongest immediate route because OTHRYS Web already deploys there and Vercel supports automatic deployment OIDC authentication for AI Gateway.
- Cloudflare exposes Jev and offers 10,000 free Workers AI neurons/day.
- Netlify exposes Jev with zero provider-key setup and a hard-limited $0 free plan.
- OpenRouter Jev is not free, though it remains extremely cheap.
- No permanent public TypeSafe-direct free tier was established from reviewed documentation.

Machine credential-name checks on T590 and Legion found no existing TypeSafe, AI Gateway, OpenRouter, Cloudflare, Netlify, or Vercel token values. No secret values were read or printed.

Decision: adapt the Web broker to use Vercel's platform-managed `VERCEL_OIDC_TOKEN` before asking the operator to create any secret.


### 2026-09-24 — local challenger benchmark

Two legitimate open System-One challengers were installed in isolated Legion labs and evaluated against the same 10-case OTHRYS Router synthetic seed (50 decisions).

Laya:
- Node ONNX base model ran locally; single smoke case misrouted build work as research.
- Official Python `typed-decisions` checkpoint was then used for the full seed.
- result: 29/50 = **58%**.
- package emitted an out-of-range temperature/calibration warning.
- disposition: NOT QUALIFIED.

Von 1.2:
- Windows uv-managed Python 3.12 was blocked by existing Windows Application Control at `_ctypes`; security policy was not weakened.
- WSL Ubuntu 24.04 was used instead with CUDA-enabled Torch on the Legion RTX 5070.
- result: 31/50 = **62%**.
- warm GPU calls were generally ~130-180 ms after initialization.
- it still missed repository/web/execution signals and could be confident on wrong task labels.
- disposition: NOT QUALIFIED.

Detailed evidence is preserved in `books/book-of-jev/CHALLENGERS.md`.

This is useful negative evidence: free/local does not imply trustworthy. Neither challenger is wired into the JEV Cortex runtime. Hosted Jev through the free Vercel OIDC lane remains the next model to run on the identical seed.
