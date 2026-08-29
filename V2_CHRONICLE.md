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

## CH-0011 — The first control component is frozen

Before any Capability Block is admitted, Control Feedback was audited file by
file at base `e9e8b33`: eleven tracked files, stdlib only, no network, clock,
environment, subprocess, thread or timer anywhere in the service.

The fifteen hard control laws were each given a verdict with evidence rather than
a claim. Eight negative controls were added — corrupt and schema-invalid
`LATEST.json`, duplicate sync stamp, secret-shaped sync blocker, equal-but-
malformed SHAs, malformed input file, and a simulated `os.replace` failure — plus
an ALLOW suite proving the secret guard does not block ordinary control prose. A
guard that blocks normal work gets switched off. Thirty tests, all green.

Two real defects were fixed, both small: a corrupt `LATEST.json` or a malformed
input file used to escape as an unhandled `JSONDecodeError` instead of a clean
refusal, so both now exit 2. One piece of accidental complexity was deleted, and
nothing was added — no dependency, no abstraction, no subsystem.

Two limits are now stated rather than hidden: a crash between writing the
immutable run receipt and updating the pointer leaves evidence intact and the
pointer lagging, and the same holds between a sync stamp and its pointer update.
Neither can fabricate success.

Lesson: **the control loop earns trust by being boring, and by proving what it
refuses — not only what it accepts.**

## CH-0012 — Canonical Capability Block #1 admitted

Base `75098688a4ab72ec29ac352862a7afa7dd85206f`, gate exact.

Ten candidate directories were surveyed in `othrys-blocks/blocks`. Eight carry no
`BLOCK.md` Passport at all — no canonical id, no maturity, no provenance — so
none is admissible today. Two were real candidates. `block.monetization.affiliate-offer`
lost on risk rather than quality: it is network-facing, and Book of Blocks §17
calls high-risk capabilities poor first-block candidates.

**Admitted: `block.media.image-prep` `0.1.0`**, tree digest
`32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b` over 14 files.

The selection was evidence-driven, not taken from the prompt's hint. Provenance
was verified against the origin repository rather than believed: commit
`032a47ca` and blob `b3f9bbe6` both exist in `vtc-platform`, and
`git rev-parse 032a47ca:src/whiteSquare.js` returns exactly that blob. The second
consumer was verified from source — `oros-image-prep-transplant` depends on the
canonical `file:` path and ships a same-source test, so REUSABLE rests on shared
source, not on a copy.

The Block's own node contract suite ran unmodified and passed 4/4, two of them
negative controls. The Playwright Chromium suite was **not run** — the dev
dependency is absent and the delegate has no egress — so it is recorded
`NOT_OBSERVED` rather than claimed. Recorded maturity is inherited from the legacy
evidence and corroborated, not re-proven end to end by V2.

No implementation entered V2. The Block stays in `othrys-blocks`; V2 owns one
admission record. The digest was identical before and after the test run, and a
single added newline in a throwaway copy changed it — the record binds.

Block #2 stays **FORBIDDEN**, and not by invention: admission is not composition,
V2 is not an Oros, and FOUNDATION_LAWS' exit question "Where is it mounted in the
Oros?" still has no answer.

Lesson: **admission is identity plus evidence plus reconstructibility — not
possession of the code.**

## CH-0013 — Block #1 admitted but not mounted; the runtime boundary holds twice

V2-001B set out to mount canonical Block #1 into Oros Zero and prove it end to
end. It stopped at its own §3, and the bridge to LEGION dropped before its
evidence could be committed. V2-001B.R recovered that state.

The recovery found the interruption had been atomic in effect: the failed call
wrote nothing — `GPT_STATE.json` was still at sequence 13 and no Chronicle entry
existed — while the mission envelope, result and run receipt were complete and
the receipt validated. It is preserved unmodified. Nothing was rewritten to
pretend the failure had not happened.

The specimen was rechecked twice across both missions and is frozen: the tree
digest still equals the admitted `32b34548…d363d7b`.

The runtime boundary then held a second time, and more precisely than before. The
delegate has **no Windows shell at all** — `uname` reports Ubuntu, `/mnt/c` does
not exist, `powershell.exe` is not on `PATH`, WSL interop is absent. Its Linux VM
turns out to be one download away: `@playwright/test 1.62.1` is already installed
in `othrys-blocks/node_modules` and the CLI runs, with zero Windows-only packages.
Only the Chromium binary is missing, and `cdn.playwright.dev` answers `403`, as
does npm. Installation requires network; network is denied. The mission's own rule
says stop rather than substitute another environment, so the cloud container —
which does have Chromium — was deliberately not used.

The closeout push is blocked by the same wall. Under the new hard law that makes
this `SYNC_BLOCK` rather than PASS, and it exposes something GPT should decide:
the delegate has never had GitHub egress, so read literally, no delegate mission
can ever reach PASS. Either the host push becomes the explicit final step of the
protocol, or the delegate gets egress to the one repository.

`oros/oros-zero` was inspected and left untouched. Its blueprint still binds a
version *range* and neither the digest nor the admission reference; binding those
was not done, because a mount recorded but never executed is a claim, not a proof.

Foundation state: **`BLOCK_1_NOT_READY`**. Block #2 remains FORBIDDEN.

Lesson: **a recovery's first duty is to find out what actually happened, not to
tidy it away.**

## CH-0014 — The runtime question, asked alone, and still unanswerable here

GPT narrowed the mission to a single question — can admitted Block #1 run its own
existing tests on LEGION? — and stripped every downstream ambition from it. That
narrowing was the right instinct, and it did buy something: with nothing else in
the way, the boundary is now described precisely enough to be acted on.

One thing had changed. The base gate **passed** — `HEAD == origin/main ==
`a6d75aad``. The host had pushed V2-001B and V2-001B.R. This is the first mission
in the family to start from a synced base, and it is the proof that the
host-push protocol works when it is actually run.

The specimen held. Recomputed by the admission record's own procedure, the tree
digest is still `32b34548…d363d7b`, with all fourteen per-file hashes matching the
manifest one for one, at mission start and again at mission end. Block #1 remains
admitted, unchanged, frozen.

The node contract suite passed **4/4**. But it passed in the delegate's Linux VM,
and section 3 asked for Windows. So it is filed as an observation, not as the
proof — the distinction the whole mission turns on.

The browser suite **never ran**, and that is the exact word for it. Not failed:
NOT_OBSERVED. There is no Windows shell here — no `/mnt/c`, no `powershell.exe`,
no WSL interop — which is the first causal blocker, and the only shell that does
exist cannot fetch Chromium: one bounded `playwright install chromium` returned
`403 'Connection blocked by network allowlist'`. That wording is new. The earlier
missions saw `403 from proxy after CONNECT` and could still read it as a network
condition; this one names it as policy, which means no amount of retrying is the
answer. The cloud container has Chromium and was deliberately not used.

`othrys-blocks` was not even mounted this session and had to be granted on
request — worth recording, because it means the specimen is not automatically in
view and a future mission must ask for it before it can verify anything.

Runtime verdict `RUNTIME_BLOCKED`; sync verdict `PUSH_PENDING`. GPT was right to
split those: one of them is a real gap in the proof, the other is just a machine
that cannot reach GitHub, and conflating them made earlier missions look worse
than they were.

Foundation state: **`BLOCK_1_NOT_READY`**. Block #2 remains FORBIDDEN.

Lesson: **"it did not run" and "it ran and failed" are different findings, and a
receipt that blurs them is worse than no receipt.**

## CH-0015 — The host ran it, and Block #1 is runtime-proven

The operator ran the two suites on LEGION and returned the numbers. Node: 4 of 4.
Playwright against real Chromium: **20 of 20**, one worker, about 4.8 seconds. Not
mocked, not cloud Chromium, no repair needed. Foundation question 4 — *is there
real runtime evidence?* — is answered.

CH-0014 said the difference between "it did not run" and "it ran and failed"
matters. This entry is the third case: **it ran, elsewhere, and someone else
watched.** The delegate observed none of it and does not pretend otherwise. The
evidence is filed as `HOST_SUPPLIED_TRUSTED`, and the record says on its face that
this proof is exactly as strong as the host's attestation — which, under law 29, is
the competent authority for host runtime. Recording it any other way would have
been the same sin as faking it, one step removed.

What the delegate could check, it checked, and both checks are worth having. The
specimen digest matched exactly for the **fourth** consecutive time, so the suites
that ran are the suites that were admitted. And the frozen spec file declares
exactly twenty `test(` cases, the contract file exactly four, against exactly one
`chromium` project — the reported 20/20, 4/4 and single worker are the numbers this
Block would produce and not some other tree's. Neither check proves the runs
happened; together they close off the ways the numbers could have been wrong.

`V2-001B.S` was not touched. Its `RUNTIME_BLOCKED` verdict was correct when it was
written and it stays on the record, verified byte-identical against the hashes it
recorded for itself. A history that edits its own failures is not a history.

One thing deserves saying plainly, because it will otherwise be misread later:
`RESOLVED_BY_HOST_PROOF` does not mean the blocker went away. The delegate still
has no Windows shell and still cannot install Chromium. The blocker was never a
defect in the Block — it was a fact about who can reach the machine — and it will
recur on the next mission that needs host runtime. Route those to the operator.

Block #1 is now **admitted, frozen, runtime-proven — and still not mounted.**
Foundation question 5, *where is it mounted in the Oros?*, is untouched. Nothing
was mounted here, no composition was attempted, no architecture invented.
**Block #2 remains FORBIDDEN.**

Push is still pending; three delegate commits now wait on the host. The runtime
verdict and the sync verdict are separate, and this one is a pass.

Lesson: **evidence you did not witness is still evidence — provided you record who
witnessed it, and never launder it into something you saw yourself.**

## CH-0016 — Two defects, two hunks, and a test that now has to fail

The aggressive suite the operator built did what aggressive suites are for: it found
two real defects in a Block that had passed 24 of 24 tests and been declared
runtime-proven the same day. Parameterized SVG MIME walked straight past an exact
string comparison. A `4096x1` source rounded its short edge to zero and died on
`encode_failed`. Neither was exotic input.

The repair is two hunks in one file. `mime.split(";", 1)[0].trim().toLowerCase()`,
and `Math.max(1, Math.round(…))` on both axes. Six lines of implementation, fifteen
new tests, one PATCH bump to **`0.1.1`** — verified against Book of Blocks §9 rather
than assumed from the mission's expectation, because both fixes make the code conform
to the contract `BLOCK.md` already declares instead of changing it.

Defect A was proven properly test-first: three parameterized SVG regressions written
first, run against untouched `0.1.0`, three failures, then the fix, then ten of ten.
Negative controls on both sides of the change prove `image/png;charset=binary` is
still accepted — a rejection fix that over-rejects is a worse defect than the one it
replaces. Defect B could not be proven that way here, because it needs a canvas; it
rests on the operator's own LEGION failure plus direct arithmetic, and the record says
so. **The repair is not browser-verified.** Chasing the arithmetic also turned up
`1x4096`, a second zero-dimension case the aggressive suite had not caught. Same
one-line floor, now with its own regression.

`0.1.0` survives intact, and provably: eight of the fourteen specimen files still hash
byte-identically to entries in its admission record, which is a better scope proof
than any diff. No admission record was written for `0.1.1`. Admission is a gated
decision under FOUNDATION_LAWS §7 and an explicit act under §20 — not something that
happens as a side effect of fixing a bug, least of all before the browser evidence
exists.

Two things this mission had to report rather than tidy away.

`qa/…/digest.test.mjs` pins the live canonical tree to the `0.1.0` admission. Two of
its three tests must now fail, because §0 of this very mission required the digest to
change. That is the tamper detector working, not a regression — but §0 and §5 ("all
aggressive tests green") cannot both be satisfied while that file pins a version.
Nothing in `qa/` was edited: a test rewritten to match new behaviour stops being
evidence. GPT decides.

And an intermediate digest existed. Appending tests with a shell heredoc wrote LF
lines into a CRLF working tree, and the mixed file produced `db22a401…` before
normalisation settled it at `48afa7ac…`. The wrong value is in the record next to the
right one. It exposed something worth knowing: the admitted digest procedure hashes
working-tree bytes, so it only reproduces on a checkout that materialises line endings
the same way — as true of `0.1.0` as of `0.1.1`.

A first commit attempt was also thrown away for swallowing a repo-wide CRLF change:
fourteen files touched to express six. The redone commit says exactly what changed.

`othrys-blocks` now holds real work and still has **no remote**. That was a footnote
while it was a read-only quarry. It is a blocker now.

Lesson: **a suite that only passes is not evidence of correctness — it is evidence of
what you thought to ask.**

## CH-0017 — The repaired specimen becomes the real one

`0.1.1` is now the active admitted Block #1. Node **10/10**, canonical browser
**29/29**, aggressive **18/18** on LEGION — Node 24.18.1, Playwright 1.62.1,
Chromium 151.0.7922.34, no failures.

The number that matters is the aggressive suite: **16/18 on `0.1.0`, 18/18 on
`0.1.1`.** The two that used to fail were the defect proofs. They pass now. A promotion
rarely gets a confirmation that clean — the same unmodified suite, the same harness,
one changed specimen, and exactly the two expected verdicts flipping.

The digest was checked before a single record was written, and matched. Beyond that the
delegate re-ran nothing, which is what a promotion mission should look like. It did
check what it could: the canonical suite enumerates exactly 29 tests and the aggressive
suite exactly 18, matching the reported totals, and the harness staged under
`node_modules/.othrys-aggressive` is byte-identical to the V2 sources — so the run used
V2's suite against V2's specimen. The browser runs themselves were witnessed by the
operator, not by the delegate, and the record is stamped `HOST_SUPPLIED_TRUSTED` so
nobody later reads it as first-hand.

`0.1.0` did not get erased for having been wrong. Its record is byte-unmodified, its
receipts unrewritten, its `RUNTIME_PROVEN` result from V2-001B.T still true *of
`0.1.0`*, and it stays reconstructible from `09efbc70`. **Superseded means "not the
specimen to mount" — not "wrong", not "gone".** Its status had to be written somewhere
other than inside the file it describes, since §1 forbade touching that file, so
`admissions/SUPERSESSION.md` holds two rows and an explanation. Two rows is not a
registry.

Two things were kept deliberately un-promoted. **Maturity stays `REUSABLE`** — a PATCH
repair is evidence of a fixed bug, not of broader reuse, and Book of Blocks §7 is
explicit that maturity is evidence rather than branding. And the **contract is recorded
as unchanged**, because both fixes made the implementation conform to what `BLOCK.md`
already declared. That is exactly what made the bump a PATCH, and writing it into the
record stops a future reader mistaking a bug fix for a contract revision.

`digest.test.mjs` was left alone, still failing two of three tests by design. The active
proof is a new file beside it. Both histories stand, which was the instruction and would
have been the right call anyway.

What is now uncomfortable, and should be said plainly: V2 records an **ACTIVE
admission whose canonical source exists on exactly one machine.** `othrys-blocks` still
has no remote. That was a footnote when the repository was a read-only quarry. It is
now the single point of failure under the only Block V2 has.

Foundation state: **`BLOCK_1_RUNTIME_PROVEN_NOT_MOUNTED`**, active specimen `0.1.1`.
Question 4 is answered. Question 5 — *where is it mounted in the Oros?* — is untouched,
and remains the only gate on Block #2. **Block #2 stays FORBIDDEN.**

Lesson: **the point of a repair is not that the bug is gone — it is that the same
adversary now returns a different verdict.**

## CH-0018 — A gate closes: where does a Block actually live?

V2-001E was told to bring Block #1's implementation into `othrys-v2`, and it stopped at
its own §0 gate without copying a byte. The gate asked one factual question — does law
already say where Capability Block implementation belongs inside V2? — and the answer is
no. Not "no, the law is silent." **No, the law says somewhere else.**

Book of Blocks, BLOCKS-HOME-001: reusable Capability Block *implementation* is owned by
`othrys-blocks`, named by repository and absolute path, followed immediately by *"Do not
copy Block source into VTC, Hub, Core, Studio, or `oros/*`."* Every V2 route to the
question — `FOUNDATION_LAWS` line 15, `BOOK_OF_GPT` law 24, the V2-000C.R decisions, the
inventory, the source map — terminates at `othrys-blocks/docs/CONVENTION.md`. And both
admission records say it in V2's own words: *"No implementation was copied into
othrys-v2."*

There is a sharper edge. Block #1 is admitted at maturity `REUSABLE`, which Book of
Blocks §7 defines as the same canonical source consumed by two Oros **without source fork
or copy**, and §14 lists *Copy-and-crown* and *Fork-per-Oros* as anti-patterns. Executing
the relocation as written would put the Block's recorded maturity in question. A mission
that quietly did it anyway would have traded a documentation defect for a doctrinal one.

None of which makes the controller wrong. The premise was checked before the law was, and
it is **correct**: the active admission's manifest is `{path, sha256}` — hashes, zero
bytes — and V2 contains no Block source at all. Its own record names `othrys-blocks`
`b4171d3` as the first thing needed to rebuild. V2 can *recognise* Block #1 and cannot
*rebuild* it, and with `othrys-blocks` still lacking a remote, the only admitted Block in
the estate exists in one directory on one machine. That is a real defect and it deserves
the mission it got.

So the disagreement is not about the problem. It is about the remedy colliding with law
that V2's own foundation cites as authority — and amending that law has exactly one route
(Book of Blocks line 709: a logged, evidenced governance mission), which sits above a
delegate. Three legal routes are written down for GPT. **The delegate chose none of
them**, which is the whole point of the gate.

There is precedent, and it is honourable: `VTC-BLOCK-EXTRACT-001` *"correctly stopped at
`BLOCK_CANONICAL_HOME_UNRESOLVED`"* (Book of Blocks line 588) and extraction resumed only
under separate authorisation. This is the second time the estate has halted on the
canonical-home question rather than guess at it.

The base gate passed and the specimen was verified first — digest `48afa7ac…` exact, at
start and end — so nothing here is a story about a bad specimen or a broken repository.
`othrys-blocks` was read and not written. `LEGACY_INVENTORY.md` and `TEMP_LIBRARY.md`
were deliberately left alone, because §6 and §8 permit ownership and inventory updates
only after success, and this was not success.

Lesson: **when an instruction and the law disagree, the delegate's job is to make the
disagreement legible — not to pick a winner.**

## CH-0019 — Block #1 comes home

V2-001F applied the operator-ratified V2 monorepo Block-home rule and copied exactly the active admitted `block.media.image-prep@0.1.1` specimen into `blocks/media/image-prep`. The source was not trusted by directory name: all fourteen per-file hashes matched the active admission manifest and the bytewise manifest digest recomputed to `48afa7ac…7b3b55bd` before copy and again after testing.

The V2-owned copy then earned its own runtime evidence on LEGION: Node contract **10/10**, canonical Playwright/real Chromium **29/29**, and the existing aggressive V2 harness **18/18**. The aggressive harness was staged temporarily under excluded `node_modules` and verified byte-identical to the canonical QA source; temporary dependencies/results were removed before the final digest check.

The V2-001D admission's original legacy source record remains historical provenance. V2-001F adds current canonical-home truth instead of rewriting where the specimen came from. `othrys-blocks` is now quarry/provenance for this Block, not a reconstruction dependency for active V2. Block #1 is still **not mounted in an Oros**, so Block #2 remains forbidden.

Lesson: **migration is complete only when the new canonical copy survives the same adversary and can reconstruct itself without the quarry.**

## CH-0020 — The first Block actually composes

V2-001G proved the composition boundary rather than adding a second capability. A disposable Oros Zero ran the existing Talos engine against the V2-canonical `block.media.image-prep@0.1.1`, bound by exact path and digest through a proof `oros.lock`. The real Chromium run reached `SUCCEEDED` and produced the prepared JPEG.

Removal and tamper controls failed closed before runtime; wrong lock version/digest were refused; and a deliberate Talos bypass with the V2 Block absent still failed while the legacy `othrys-blocks` quarry remained present. There is no ghost fallback. The Block bytes were reverified after the real run.

The local builder contributed one bounded repair but did not earn trust by assertion: its first claim was rejected, its second proposal fixed the package-root error, and deterministic review then corrected a CommonJS interop defect before the full matrix passed.

Foundation consequence: Block #2 is no longer forbidden by the composition gate, but selection/ingest remains a separate mission.

## CH-0021 — Block #2 selected from evidence, not appetite

V2-001H inventoried the real Block quarry and froze `block.monetization.affiliate-offer@0.1.0` as the Block #2 candidate. The choice is foundation-weighted: the second Block exists to test composition, so REUSABLE portability evidence outranks feature novelty.

Affiliate-offer has two independent consumers, Node and Chromium proof, same-source/copy-hunt evidence, no generic portability defect, no Block-owned state/secrets/network construction, and explicit fail-closed provider/config boundaries. `visit-tracking` remains RAW because scoped storage authority is unresolved; the seven Study Buddy harvest Blocks remain RAW transition stock.

Selection does not admit or ingest the Block. The exact 18-file quarry specimen is frozen at digest `f87bbdc437fb2f27e80f6e11cf9a9d327d7620218bc312505367dfa085e02c4e`; a separate mission must bring it home and prove it beside Block #1 without changing Foundation Laws.

## CH-0022 — Block #2 proves the house composes

V2-001I ingested and admitted the exact affiliate-offer specimen and proved it beside Block #1 with one two-Block lock. Removal, tamper and wrong-lock controls fail loudly, including with the legacy quarry still present; no fallback fired.

## CH-009B - Command Centre becomes a workstation, not a dashboard

V2-009B harvested PandaOS presentation patterns without importing Panda authority: compact left navigation, a chat-first central workspace, persistent right-side Work/Progress, and existing V2 gates/evidence underneath. Chromium visual probe 1600x900 PASS; Command Deck suite 123/123 PASS.

## CH-010A — OTHRYS OS becomes a structural layer

V2-010A replaces hard-coded Command Deck OS inventories and mission-prefix Work projection with a project-local .othrys/project.json, validated OS/Work projectors, explicit role/capability/model/integration/knowledge bindings, and zero new execution authority. PandaOS is retained as a structural quarry only; V2 remains the governed motor. Full Legion runtime suite: 186/186 PASS.


## CH-010B — Work becomes durable without becoming a second engine

V2-010B dogfoods a project-local Work record for itself: Project -> Work -> Slice -> Stage -> Task, deterministic definition digest, BUILD observation, PASS evidence, then SHIP observation. Transition replay is idempotent and regression fails closed. Work remains an evidence-bound orchestration record; V2 Mission/Trust/Talos remain authoritative.


## CH-010C — Projects become composable OS objects

V2-010C adds the first OTHRYS OS project template and deterministic materializer. New Oros workspaces can now be composed from role bindings, PROVEN capability references, model policy, knowledge and integrations into a project-local .othrys/ substrate. Unknown/unproven refs and conflicting manifests fail closed; no worker or app generation occurs.


## V2-010D — OTHRYS OS operating modes
Established OBSERVE / PLAN / SUPERVISED_EXECUTE / AUTONOMOUS_EXECUTE as enforced OS policy. Mode checks now occur before intent persistence and again at Trust Canal admission. Default remains supervised; mode never grants authority. Legion runtime: 200/200 PASS.

## V2-010E — Mnemosyne explicit project knowledge
Established an Atlas-class knowledge service over explicit project-local records: capture to inbox, classify/review without promotion, deterministic local search, zero-mutation maintenance and reconstructible export. Panda Atlas boundary was dogfooded through the real inbox/review lifecycle. No opaque memory and no Command Deck knowledge-write API. Legion runtime: 209/209 PASS.

## 2026-08-28 — V2-010F Atlas cognitive graph foundation

Operator reprioritised the planned Switchyard slice in favour of the OTHRYS OS knowledge-map foundation. Live Core/V2 quarry found Atlas already shipped historically as a derived system map and Mnemosyne already owned the Nine Muses as semantic gates. New overlapping Greek subsystems were rejected.

Ported the graph constitution into V2, added provenance/truth classes, deterministic graph digest, secret rejection, legacy-evidence calibration, Nine Muse routing, gravity/heat cognitive signals, real Mnemosyne Inbox/Review queue semantics, authenticated read-only `/api/atlas`, and a first-class Canvas Atlas room in the OTHRYS OS shell. Atlas remained OBSERVED until its own PASS result existed, then self-projected VERIFIED. Legion: 220/220 Node + 36/36 Python; browser script parse and diff check PASS. Switchyard prototype preserved outside runtime and remains deferred.


## 2026-08-29 — V2-010G OTHRYS OS housekeeping begins

The operator designated `othrys-v2` as the main OTHRYS OS polishing house and explicitly froze feature growth for this round. V2 is treated as one subsystem inside the wider OS house, not the whole product identity.

Housekeeping consolidated current residents into an evidence-bound Book shelf, centralized the cross-repo document/log estate under Mnemosyne by SHA-256, retained secret-shaped sources as exclusions only, and added a read-only Housekeeper pulse derived from the historic Kronos/Talos/Callimachus cadence pattern. The local daemon may inspect, test and journal; it grants no authority and performs no canon promotion or feature work.

The first final-estate sweep resolved two stale generated archive objects by adding deterministic garbage collection. Current estate baseline: 42,089 occurrences, 8,016 unique objects, 8,010 archived, 6 excluded, 1,218 log/evidence objects, 248 Book objects, 120,646,104 archived bytes. Mnemosyne quality returned zero defects after cleanup. Full Node runtime reached 228/228 PASS. Housekeeping remains RUNNING until repeated cross-language and independent-node verification becomes boring.


## 2026-08-29 — V2-010G front-door drift hardening checkpoint

Front-door control hardened without new authority: Internal Progress, Build Plan, External Harvest and Loop Laws are now explicit project knowledge; local .claude/.pandaos/.othrys runtime state is classified out of Git; stale quarry-path and hard-coded knowledge-count drift were repaired. Mnemosyne estate regenerated at catalog 721c5047f77c6c8961e42cdb8fd307570382f959e4602a78279abfa0cf72b0a0. Legion: 232/232 Node PASS, five core Python files exit 0, control-feedback 30/30 PASS, Mnemosyne quality 0 defects. No product capability, UI feature, Titan, model dependency or execution authority added.


## 2026-08-29 — V2-010G Library ownership reconciliation

Housekeeping retired stale bootstrap wording without creating a new Library subsystem. TEMP_LIBRARY.md is now explicitly a historical migration/index map: Mnemosyne owns the admitted knowledge substrate; Mission/Work/receipts remain source evidence; Quarry/External Harvest remains zero-authority stock; future Great Library/Vault/Garden/R&D names remain logical policy zones only. The External Harvest Switchyard pointer was corrected to its actual deferred quarry path. Three legacy Windows-1252 em-dash bytes in this Chronicle were normalized to UTF-8; no historical wording was rewritten. No authority, runtime capability, UI, model dependency, or storage engine was added.

## 2026-08-29 — V2-010G Work semantics reconciliation

Housekeeping resolved a false drift signal in the durable Work layer. Compiled task entries remain immutable `OPEN` definition placeholders by design; live mission progress is derived from Mission evidence and append-only Work transitions. The House definition now states this explicitly so future inspectors do not mutate Work definitions to imitate task tracking. No mission status, authority, execution state, product capability or closeout evidence changed.

## 2026-08-29 - V2-010G housekeeping closes boringly

Housekeeping closed only after the exact implementation commit was fast-forwarded to origin/main and independently verified on T590. Legion proved 236/236 Node and 36/36 Python; T590 proved 236/236 Node and the same 36 Python tests through native unittest. Mnemosyne estate generation was deterministic across repeated sweeps, archive verification passed, quality reported zero defects, and front-door/Book/Block-map drift guards were green. No new product capability, Titan, model dependency, UI authority or automatic promotion path was added. The front-door Build Plan now advances to Component Contracts as a separate bounded mission.

## 2026-08-29 ? V2-010H Component Contracts and loop-law hardening

Fourteen current-house component contracts now align Book identity, ownership, IO, dependencies, forbidden touch, authority, evidence and bounded Loop Laws fields. Loop research added goal-state reflection, structured diagnosis, verifier-gated completion, trace compression and capability-gated optimization. Estate scanning now excludes local `.othrys/logs` and `.othrys/runtime`; live Housekeeper activity cannot perturb Mnemosyne. Legion and T590: 244/244 Node + 36/36 Python PASS.

## 2026-08-29 - V2-010I Loop Weaving closes

Loop Weaving closed after source-grounding every current free-running runtime loop, adding authority-free normalized loop traces, Talos event-to-trace projection, processing-health/stall/compression analysis, runtime-wide unregistered-loop drift detection, and measured Housekeeper fast-path expansion. The five-minute fast path now covers the anti-drift spine in under one second on Legion. No scheduler authority, automatic continuation, chain-of-thought storage, or automatic Block promotion was added. Legion and T590 both proved 268/268 Node + 36/36 Python PASS on the exact implementation commit. Mnemosyne remained deterministic with zero defects. The front-door Build Plan advances to Mnemosyne Intelligence.

## 2026-08-29 - V2-010J Mnemosyne Intelligence closes

Mnemosyne now labels estate evidence as CURRENT, SUPERSEDED, DIVERGED or MISSING from live source bytes; context capsules enforce a total evidence budget, reserve space for Atlas relations, expose concrete relation kinds, and surface stale/conflict/source-divergence warnings without deleting historical evidence. A catalog-keyed in-process lexical cache plus deferred excerpt/currentness work reduced warm live estate recall to roughly 0.20-0.28 seconds and a 12-item Mnemosyne context capsule to roughly 0.22 seconds on Legion, without SQLite, vectors, embeddings, LLM reranking or new authority. Legion and T590 both proved 271/271 Node + 36/36 Python PASS on the exact implementation commit.

## 2026-08-29 - V2-010L Housekeeping Optimization closes

010L turned current OTHRYS OS around before adding more residents. Mycelium gained capacity-backed PACK/SPREAD and strict placement planning, optional saturation-aware routing, deterministic WorkKey identity, planning-only Anastomosis, and six portable per-project optimization phenotypes. Hephaestus gained an authority-free <=3 isolated-hand planner for disjoint slices or alternative candidates only; same mutable workspace parallelism remains forbidden.

Measured hardware evidence now shapes policy instead of intuition: Legion test throughput reaches its practical knee near concurrency 16, T590 near 4; wired Legion-to-T590 transport measured ~0-1 ms RTT and ~116 MB/s with curl; concurrent cross-node full-runtime verification reduced observed wall time by roughly 45% versus sequential proof. A large disposable-test-root leak was eliminated and the full suite now produces zero net OTHRYS temp-root growth on both machines.

The old Mycelium quarry proved the deeper law worth re-admitting next: REMOVE WORK BEFORE ACCELERATING WORK. 010L therefore stops before persistent CAS, learned route preference, autonomous fan-out or distributed state. Legion and T590 independently proved 297/297 Node + 50/50 Mycelium + 10/10 worker tests on the implementation. Work closes SHIP/COMPLETE with authorityGranted=false.

## 2026-08-29 - V2-010M Mycelium Metabolism closes

010M re-admitted the smallest safe part of OTHRYS's older Mycelium physiology rather than inventing a new scheduler. Current Mycelium now labels resource truth, selects seven metabolic modes, calibrates the smallest failure-free concurrency knee within 97% of best measured throughput, and produces authority-free GROW/HOLD/CONTRACT/QUIESCE plans under both project and measured ceilings. The historic 061F lesson is preserved in code: a contended workload may correctly prefer one lane over sixteen.

A deep biological-mycelium study reinforced the architecture without importing fungal-brain mythology. Hyphae are cheap exploratory tissue, Rhizomorphs are future evidence-qualified reinforced routes, and Sclerotium is future minimal survival tissue. Sparse cross-links, source/sink remodeling, paired reinforcement/retraction and local damage isolation are retained; speculative electrical-intelligence metaphors are rejected.

Anastomosis was hardened from WorkKey-only grouping to WorkKey + compatibility digest. Same computation identity is therefore insufficient to fuse incompatible environments, while independent Talos verification still never fuses. Compatibility hashes remain planning discriminators, never authenticity or authority proof.

Legion and T590 independently proved 297/297 Node + 66/66 Mycelium + 10/10 worker tests on the exact implementation commit. Randomized stress covered 500,000 metabolic decisions, 100,000 metabolic route plans and 100,000 compatibility Claims without invariant failure. Mnemosyne estate regenerated identically twice at 8,066 archived objects / 6 exclusions; archive verification passed and quality returned zero defects. Next build step is Context Metabolism: remove cognitive/evidence waste before adding more execution machinery.

## 2026-08-29 - V2-010N Context Metabolism and cross-repo quarry closes

Context Metabolism now sits after Mnemosyne selection: project truth remains pinned, reconstructible estate evidence may travel by digest reference, and required/authority evidence plus the frozen identity skeleton cannot be lost or expanded. Unlike legacy 061G, current V2 never models imaginary compression; only real serialized reference substitution or eviction counts.

The same mission profiled estate recall and found the warm context path was dominated by a repeated linear scan of ~8k cached objects. Catalog-digest-keyed exact term-hit caches preserve substring semantics while avoiding repeated scans. Measured warm context on Legion moved from roughly 214-232 ms to roughly 28-37 ms for Mycelium/Mnemosyne/Talos. Sixteen live query families matched a brute-force replica exactly, and 200,000 randomized context capsules produced zero evidence-loss, identity-expansion or authority failures.

A broad VTC/Hub/Core quarry was recorded rather than imported wholesale. VTC contributed rigid skeleton/enrichment, task-specific provider trust, evidence ladders, atomic quota/clamps, debt ratchets, privacy-minimal observers and Block extraction classification; Jarvis contributed measured stat/lazy/cache discipline; Core contributed refusal memory, crash-window honesty and input-bound idempotency. The next bounded step is verified Artifact reuse with durable invalidation/refusal evidence, not a distributed cache.

## 2026-08-29 - V2-010O The Great Harvest becomes permanent
OTHRYS now has one permanent Mnemosyne quarry over recoverable source-code/source-config Git lineage, commit intent, and fingerprinted live-only code. The final baseline spans 40 non-disposable Git workspaces collapsed to 12 lineages, 9,338 recoverable Git source/config objects of which 5,801 are historical-only, 3,094 commits, plus 180 live-only specimens: 22 filesystem-only, 50 modified tracked, and 108 untracked. Office Buddy Mini and active VTC WIP are now discoverable even without durable Git provenance. Git remains durable source provenance; live-only entries are locators/fingerprints, not payload archives; source payload is not copied into Mnemosyne. Future capability design must consult The Great Harvest first and record REUSE / ADAPT / REJECT when relevant prior stock exists. The quarry grants no authority or automatic promotion.
