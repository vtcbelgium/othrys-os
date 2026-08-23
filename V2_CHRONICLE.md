# OTHRYS V2 CHRONICLE

**Owner:** GPT Control  
**Mode:** append-only accepted history.  
**Rule:** tool-level noise belongs in `GPT_LOG.jsonl`; Chronicle records only accepted milestones, incidents and lessons.

## CH-0001 — Clean V2 begins under external control

OTHRYS V2 was separated into its own repository rather than inheriting the old Hub runtime wholesale. The old estate became quarry/reference stock.

Primary lesson carried forward: capability must be earned one bounded loop at a time.

## CH-0002 — Control Feedback becomes the first specimen

The first V2 functional work established a machine-readable mission receipt path with immutable run receipts, `LATEST.json`, validation, atomic writes and secret screening.

The delegate environment could not push to GitHub. It stopped and recorded `NOT_SYNCED` rather than claiming success.

Lesson: **host capability is not delegate capability**.

## CH-0003 — Missing Book of GPT triggers fail-closed behaviour

A later mission required `BOOK_OF_GPT.md` before it existed. The delegate refused to proceed.

Lesson: a missing prerequisite is a successful control stop, not an invitation to improvise.

## CH-0004 — GPT control law and golden legacy inventory

`BOOK_OF_GPT.md` was established as the top V2 control law.

`LEGACY_INVENTORY.md` was established as GPT's golden reuse index so new code must be preceded by an inventory/source check.

Lesson: OTHRYS had already solved many problems conceptually and in code; V2 must harvest before inventing.

## CH-0005 — State/log/Chronicle rails established

GPT Control recovered Jarvis's strongest operational disciplines and compared them with current agent-control/security guidance.

V2 now separates:

- `GPT_STATE.json` — current control snapshot;
- `GPT_LOG.jsonl` — append-only machine event history;
- `V2_CHRONICLE.md` — accepted human history;
- receipts — mission evidence;
- `LEGACY_INVENTORY.md` + `inventory/*` — reuse map.

The mandatory loop is:

`STATE -> INVENTORY -> FREEZE -> ADMIT -> ACT -> VERIFY -> LOG -> RECEIPT -> SYNC -> STATE -> WAIT_GPT`

Lesson: **drift prevention starts before the prompt, not after a bad result.**

## CH-0006 — The control log caught its own integrity defect

While tightening the rails, GPT recomputed the canonical SHA-256 for each existing `GPT_LOG.jsonl` event and found that sequence 3's stored `entry_hash` did not match its content.

The historical line was not rewritten. The discrepancy was recorded as a new `LOG_CHAIN_INTEGRITY_REPAIR` event, the hash algorithm was frozen in `GPT_RAILS.md`, and the chain resumes from the recomputed content hash.

Lesson: **a control rail is not trustworthy because it exists. The rail itself needs a proving mechanism and negative controls.** This is why V2 records `PROVEN`, `IMPLEMENTED_UNPROVEN`, `DOCUMENTED_ONLY`, `PROVEN_ABSENT`, and `NOT_OBSERVED` separately.

## CH-0007 — Legacy anti-drift stock recovered before invention

The Jarvis control files and OTHRYS Core `.claude` control estate were inspected before designing further rails. Existing stock already contained state-first boot discipline, read-only auditors, governance/test role separation, deterministic PreToolUse guards, negative-control tests, mission-close discipline, verification-at-SHA rules, and repository sanity/governance checks.

These mechanisms are now indexed for reuse rather than being rediscovered piecemeal.

Lesson: **inventory is an active control mechanism, not documentation.**
