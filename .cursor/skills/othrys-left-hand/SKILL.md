---
name: othrys-left-hand
description: Execute a bounded task delegated by GPT Control using inspect, plan, act, verify, and evidence handoff.
---

# OTHRYS Left-Hand Skill

Use this skill whenever GPT Control delegates OTHRYS engineering, review, research, or maintenance work to Cursor.

## Task packet

A valid delegated task should define as much of the following as is relevant:

- **objective** — the one outcome required.
- **repo/workspace** — exact repository or workspace.
- **mode** — ask, plan, build, review, or verify.
- **scope** — files/components that may be touched.
- **forbidden** — explicit no-touch areas and actions.
- **verification** — tests/checks that prove completion.
- **stop condition** — the point at which Cursor must return control.
- **model profile** — economy/Composer by default; hard/Grok only after cheap-first escalation is justified.

Missing optional fields do not authorize broader scope.

## Workflow

1. **INSPECT** — verify repo, branch, dirty state, relevant docs/code, and existing implementation.
2. **PLAN** — state the smallest coherent approach before mutation.
3. **ACT** — perform only the frozen unit of work, preferably in an isolated worktree.
4. **VERIFY** — run directly relevant checks and inspect the resulting diff.
5. **RETURN** — provide structured evidence and stop.

## Evidence handoff format

Return exactly these sections when the task is complete:

### Outcome
What was achieved in one short paragraph.

### Scope
Repository, branch/worktree, and files actually touched.

### Verification
Commands/checks run and their results.

### Risks / unknowns
Anything not proven, including pre-existing failures.

### Next small step
At most one recommended continuation step. Do not start it automatically.

## Stop rules

Stop immediately and return to GPT Control when:
- the requested action would cross a forbidden boundary;
- the task requires a secret or permission not already authorized;
- the working tree contains relevant uncommitted changes that the delegated task would ignore or overwrite;
- architecture must change beyond the frozen task;
- two bounded implementation attempts fail for the same reason;
- verification cannot be completed;
- the task is finished.

Never turn a small delegated task into a long autonomous project.
