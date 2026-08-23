# LEGACY INVENTORY — OTHRYS CORE CONTROL / ANTI-DRIFT STOCK

**Owner:** GPT Control  
**Source:** `vtcbelgium/othrys-core`  
**Baseline inspected:** `406fb3f26df16bc3d68fb929fabb3be9f7856b2a` tree  
**Purpose:** detailed supplement to `../LEGACY_INVENTORY.md`. Read before inventing guards, repository audits, mission closure, verification gates, agent roles, or policy checks.

Status markers: `[ ]` known stock not yet admitted to V2 · `[x]` principle admitted into V2 control law/rails · `[~]` useful but needs source-level review before reuse · `[!]` frozen/risky/context-sensitive.

## 1. Claude deterministic guard rail

- [ ] `.claude/hooks/guard.mjs`
  - PreToolUse deterministic rail; intentionally only three jobs.
  - blocks destructive git/history rewriting;
  - blocks transcript reads/writes of real secret-bearing files;
  - requires explicit confirmation before push to `main`;
  - recognises global git options such as `git -C`, `--git-dir`, etc. so trivial syntax does not bypass patterns;
  - blocks force push, destructive reset, clean, broad rebase, branch/ref deletion, `--no-verify`, reflog destruction, environment dumps and common interpreter-based secret reads;
  - explicitly states **rail != sandbox**;
  - deliberately silent on normal/happy-path work;
  - human bypass is outside the agent when genuinely intended.
  - [x] V2 principle harvested: high-confidence deterministic rails, silent happy path, explicit limitations, authority boundary outside model prompt.

- [ ] `.claude/hooks/guard.test.mjs`
  - negative-control suite for guard itself;
  - tests DENY cases for destructive git and secret access;
  - tests ASK cases for push-to-main;
  - tests ALLOW cases for normal git/test/source operations;
  - malformed input is required to fail safely/silently;
  - important doctrine in code comments: a guard that only ever proves it fires is not a tested guard; a noisy rail gets disabled.
  - [x] V2 principle harvested: every guard requires bad-case rejection + legitimate-work acceptance controls.

## 2. Read-only truth roles — separation of concerns

- [ ] `.claude/agents/repository-auditor.md`
  - read-only standing-repository truth auditor;
  - **measurement before conclusion**;
  - every claim requires command or `path:line` evidence;
  - claimed rails require negative controls, not file-existence claims;
  - distinguishes **PROVEN ABSENT** from **NOT OBSERVED**;
  - audits documentation↔reality drift, structure, claimed capability↔implementation/test, debt register truth;
  - never edits/fixes — routes findings.
  - [x] V2 principle harvested: reality vocabulary and docs-as-audit-target.

- [ ] `.claude/agents/governance-reviewer.md`
  - read-only change-vs-governance reviewer;
  - stays separate from correctness/testing and repo-wide structural audit;
  - checks authority boundaries, provider neutrality, frozen surfaces, dependencies, mission scope and documentation record;
  - explicit Active Mission / one bounded branch discipline;
  - flags weakened guards, path filters, skipped CI and silent debt dropping.
  - [x] V2 principle harvested: control/action/verification/audit roles must remain distinct.

- [ ] `.claude/agents/test-verifier.md`
  - read-only evidence-quality reviewer;
  - central question: **if this change were wrong, would anything here fail?**;
  - maps changed behaviour to proving tests;
  - rejects meaningless assertions and floating async paths;
  - requires negative controls for guards/default-deny mechanisms;
  - checks tests were not deleted, skipped, loosened or rewritten to bless output;
  - requires deterministic tests;
  - verdict is `PROVEN` or `UNPROVEN`, not “suite green therefore done”.
  - [x] V2 principle harvested: evidence-quality rule.

## 3. Mission lifecycle skills

- [ ] `.claude/skills/repo-sitrep/SKILL.md`
  - state/orientation from authority, not memory;
  - measure SHA, working tree, recent log, ahead/behind before conclusions;
  - health only if actually observed at a named SHA;
  - report what is proven absent separately from what was not examined;
  - a SITREP reports truth, not a new work plan.
  - [x] V2 principle harvested: STATE FIRST.

- [ ] `.claude/skills/verify-mission/SKILL.md`
  - one named verification authority in legacy Core: `npm run verify` exit 0;
  - verification tied to a named SHA/tree state;
  - run synchronously and retain exit code;
  - failure is isolated before repair;
  - weakening/skipping a rail to obtain green is a governance act, not a fix;
  - any known defect despite green verify is a gap in the gate and must be recorded.
  - [x] V2 principle harvested: no inferred pass, no unrun-stage pass.

- [ ] `.claude/skills/mission-close/SKILL.md`
  - closure recovers acceptance/forbidden/stop contract defined in advance;
  - verifies before close;
  - updates only records genuinely touched — no ritual documentation churn;
  - discoveries not fixed must be routed rather than silently dropped;
  - one item → one commit → one verification → one report → stop;
  - agent proposes closure; human gate accepts.
  - [x] V2 principle harvested: one bounded mission + carry-forward + stop.

- [~] `.claude/skills/ci-observer/SKILL.md`
  - inspect before any new CI observation mechanism.
- [~] `.claude/skills/dependency-review/SKILL.md`
  - inspect before new dependency governance.

## 4. Core deterministic repository checks

Directory: `scripts/`.

Known checks observed at baseline:

- [ ] `check-artifact-currentness.mjs` — generated/artifact freshness.
- [ ] `check-composition.mjs` — composition constraints.
- [ ] `check-coverage.mjs` — coverage posture/gate.
- [ ] `check-dependencies.mjs` — dependency rules.
- [ ] `check-durability.mjs` — durable-state requirements.
- [ ] `check-env-format.mjs` — environment schema/format without dumping secrets.
- [ ] `check-governance.mjs` — governance consistency.
- [ ] `check-launcher.mjs` — launcher checks.
- [ ] `check-library-links.mjs` — knowledge/library link integrity.
- [ ] `check-provider-neutrality.mjs` — provider-neutrality law.
- [ ] `check-reconstruct.mjs` — reconstructability.
- [ ] `check-release-readiness.mjs` — release gate.
- [ ] `check-repo-sanity.mjs` — repository sanity.
- [~] remaining `scripts/` entries not yet catalogued individually; do not claim completeness.

**V2 rule:** before creating a new deterministic repository checker, inspect the corresponding legacy check and its tests/consumers. Extract the smallest proven rule rather than importing the entire legacy verification chain.

## 5. Git / CI / secret rails

- [~] `.githooks/pre-commit`
  - inspect before inventing V2 pre-commit checks.
- [~] `.gitleaks.toml`
  - existing secret-scanning configuration; inspect patterns/exemptions before reuse.
- [~] `.github/workflows/verify.yml`
  - CI verification pipeline; inspect before defining V2 CI.
- [~] `.github/workflows/publish.yml`
  - publication workflow; not V2 foundation.

## 6. Root control / engineering records

All are inventory/reference first; authority and freshness vary and must be verified before reuse:

- [~] `CLAUDE.md`
- [~] `AGENTS.md`
- [~] `ENGINEERING_RULES.md`
- [~] `ENGINEERING_CONTROL_CENTER.md`
- [~] `ENGINEERING-SCORECARD.md`
- [~] `ARCHITECTURE-INVENTORY.md`
- [~] `SYSTEM-INVENTORY.md`
- [~] `ARCHITECTURE.md`
- [~] `KNOWN-ISSUES.md`
- [~] `P2-EXECUTION-LEDGER.md`
- [~] `MISSION-CONTROL.md`
- [~] `MASTER-PLAN.md`
- [~] `MASTERPLAN-LIVE.md`
- [~] `EXECUTION-BACKLOG.md`
- [!] `FOUNDATION-1.0.md` — legacy governance treats as frozen; do not casually mine/mutate.

## 7. V2 anti-drift lessons harvested from this source

- [x] State must be measured before conclusions.
- [x] Documentation is not evidence of implementation.
- [x] `PROVEN_ABSENT` and `NOT_OBSERVED` are different facts.
- [x] Guards require negative controls and normal-work controls.
- [x] A guard must be quiet enough to remain enabled.
- [x] A rail is not a sandbox; authority boundaries need actual containment/permissions later.
- [x] Verification must bind to a specific revision/state.
- [x] An actor's own green narrative is not independent proof.
- [x] Scope/governance review, test verification and repository audit are separate responsibilities.
- [x] Closure conditions are frozen in advance, not invented at the end.
- [x] One item → one verification → one report → stop.
- [x] Never weaken the gate to make the run pass.

## 8. Gaps / next inventory work

- [ ] enumerate every remaining `.claude/skill` and `.claude/agent` file;
- [ ] enumerate the complete `scripts/` directory and map tests/consumers;
- [ ] inspect `.githooks/pre-commit`, workflows and gitleaks config line-by-line before V2 adoption;
- [ ] map each legacy deterministic guard to implementation + test + status;
- [ ] map local/unpushed Core differences from online `main` when host inventory becomes available.
