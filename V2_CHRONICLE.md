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

## CH-0008 — GPT becomes a detachable intelligence controller

The controller doctrine was refined from Jarvis's strongest memory practices, OTHRYS North Star material and current agent-control guidance.

GPT now runs two distinct loops: a strict control loop for action and an intelligence loop for conversation-derived signals. Workflow state, episodic history, semantic knowledge and transient context are explicitly separate. Raw ideas are captured without promotion; important old knowledge is contradiction-checked before reuse; context is retrieved narrowly rather than dumped wholesale.

A temporary `GPT_INBOX.md` holds unpromoted signals until the canonical Garden/Mnemosyne path is available.

North Star: OTHRYS is a trustworthy operating system for autonomous work, able over time to compose proven capabilities for a new world without depending on any one controller model.

Lesson: **the controller should help OTHRYS remember, connect and compound while remaining fully replaceable.**

## CH-0009 — Empty-house foundation laws frozen before Block #2

Before adding a second Block, GPT reconciled the recovered OTHRYS Block/Oros canon with external standards for admission, immutable versioning, content identity, provenance and secure updates.

`FOUNDATION_LAWS.md` now requires exact Block version+digest+provenance, deterministic admission, the existing OTHRYS maturity ladder, default-deny authority, declared Socket/Port communication, explicit Oros composition truth, loud failure on unmount, replacement proof and reconstructibility.

The earlier idea of immediately building a universal Block Registry was corrected: V2 may keep a readable index, but no resolver/registry/package-manager authority is created without repeated composition evidence.

Lesson: **Block #2 is an architectural test, not merely another feature. If it cannot plug in without changing the house rules, the first foundation was wrong.**

## CH-0010 — Two histories reconciled; Control Feedback is not Block #1

The delegate could not reach GitHub, so its mission evidence (V2-000C, V2-000C.R,
V2-000D) accumulated locally while GPT built the control, foundation and
inventory layer directly on `origin/main`. Both were real. Neither was complete.

V2-000E merged them with ordinary Git ancestry: merge base `66c4563`, ten local
commits, thirty remote commits, one overlapping file (`BOOK_OF_GPT.md`). No
receipt was rewritten, no history discarded, no force push.

The merge also carried in the corrections V2-000C.R had already ratified but
`origin/main` had never seen. `CH-0002` said Control Feedback became "the first
specimen"; that reading is now corrected rather than erased — Control Feedback is
`SHARED_SERVICE` / `PLATFORM_ONLY`, not a Capability Block and not Block #1.
`CH-0009` recorded "declared Socket/Port communication"; the recovered
repositories contain no `SOCKET` or `CAPSULE` in Block or Oros doctrine, so the
canonical terms are Port and the Block directory.

No Capability Block is admitted into V2. Block #2 is therefore not merely
premature — it has nothing to attach to.

Lesson: **two truthful histories are still a divergence.** One canonical history,
reconciled before new work, is now law 30 of the Book of GPT.
