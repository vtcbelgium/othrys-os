# Cursor + Grok Left Hand for GPT Control

Status: ACTIVE / PROVEN on 2026-09-26.

## Purpose

Cursor and Grok Bot form GPT Control's external execution arm. GPT Control remains the controller and decision-maker; Cursor/Grok are bounded workers. OTHRYS state, governance, Aegis policy, Keymaster and Mnemosyne remain authoritative.

The core rule is simple:

`Jeroen -> GPT Control -> frozen task packet -> Cursor/Grok worker -> evidence -> GPT Control -> Jeroen`

Cursor never selects the next mission, silently changes architecture, or gains production authority.

## Proven control paths

1. **Direct Cursor CLI — primary left hand**
   - GPT Control reaches Legion through Remote Desktop Commander.
   - Cursor Agent CLI is installed and authenticated as the Cursor account already in use.
   - Headless Composer 2.5 and Grok 4.7 calls were both smoke-tested successfully.
   - `tools/gpt/cursor_left_hand.py` packages one bounded task and returns evidence.
   - Read-only work uses Ask/Plan mode. Mutation work uses a Cursor Git worktree by default.

2. **Grok Bot through QuickDesk — GUI/research hand**
   - Proven route: GPT Control -> Remote Desktop Commander -> QuickDesk MCP -> Grok Bot.
   - Screen OCR, click, keyboard, verification and response extraction are working.
   - Grok's permanent roster is Dispatcher, Architect, Builder, Sentinel, Scout, Aegis Auditor and Study Coach.

3. **Cursor My Machines via WSL — proved, secondary**
   - Native Windows worker currently fails on a Cursor package/Node ABI mismatch; do not patch managed Cursor binaries.
   - WSL Ubuntu 24.04 worker was installed and registered successfully as `OTHRYS-Legion-WSL`.
   - Clean worker checkouts exist under `/home/othrys/cursor-workers/` for `othrys-os` and `othrys-web`.
   - My Machines is useful when Cursor Cloud should run tool calls on Legion, but it is not the default route because the current WSL user also contains operator credentials. Keep this route supervised/on-demand until it has a dedicated low-privilege worker identity or container.

4. **Cursor-managed Cloud Agents — off-machine fallback**
   - Use when Legion is unavailable or a task should survive local disconnects.
   - Cloud Agents run in isolated Cursor VMs, can build/test, use browser/computer tools, work across repositories, and return PRs/artifacts.
   - Prefer this over exposing local machines or local secrets merely to keep a task running.

## Delegation router

Default routing from GPT Control:

- Fast repository inspection, formatting, small tests, mechanical implementation: **Composer 2.5**.
- Difficult multi-file debugging, architectural analysis, long tasks, ambiguous failures: **Grok 4.7 High**.
- Web reconnaissance and broad tool research: **OTHRYS Scout / Grok Bot**, followed by GPT review.
- Implementation: **Cursor CLI / OTHRYS Builder**.
- CI/staging diagnosis: **OTHRYS Sentinel**, read-only first.
- Security review: **Aegis Auditor** or Cursor read-only review, then GPT/Aegis decides.
- GUI/browser workflows: **QuickDesk + Grok Bot** when a terminal/API route is inferior.
- Third-party frontier models: escalation only; do not burn the Other Models pool just because a model is available.

## Token and model discipline

The Cursor subscription is capacity, not permission to waste capacity. Cheap-first is mandatory.

- Start with the **Cursor Models pool**: Composer 2.5 first, then Grok 4.7/4.6/4.5 only when the task needs more reasoning. These are the included first-party pool on the current Pro plan. Default Grok escalation uses **4.7 Medium**; High/XHigh require an explicit model choice when Medium is not enough.
- Prefer standard/non-Fast variants. Fast variants consume the included pool much faster and require an explicit exception.
- Third-party OpenAI/Anthropic/Google/etc. models use the separate Other Models pool and require explicit GPT Control approval.
- Composer 2.5 is the default worker because it has the lowest listed Cursor-model token cost while retaining the Cursor agent harness.
- Keep a task to one feature/problem per run. Large mixed prompts cause unnecessary context growth and make verification worse.
- Cap normal parallel delegation at two workers. Use more only when tasks are genuinely independent and the expected value justifies the usage.
- Do not enable Cursor on-demand billing automatically. When included usage is exhausted, stop or fall back unless Jeroen explicitly changes the spending policy.
- **Cloud/My Machines cost caveat (observed/researched 2026-09):** Cursor currently has known cases where Cloud Agent helper/subagents can select a different or Fast model even when the parent was created with a cheaper Cursor model. Settings > Models does not fully constrain those cloud helpers. Therefore local Cursor CLI is the default whenever predictable model spend matters. Cloud/My Machines prompts must explicitly require the same standard Cursor-pool model for every worker/subagent and avoid browser/computer helpers unless needed, but this is mitigation rather than a hard guarantee.
- Every mutation result is independently checked by GPT Control: inspect scope/diff, run or verify deterministic checks, and use positive/negative controls for guards and security boundaries. A worker saying "done" is never acceptance.
- The live model inventory is queried with `agent --list-models`; do not hard-code the entire catalogue into OTHRYS.
- Cursor desktop manual use is currently set to **Grok 4.6 Medium, non-Fast**. The desktop picker exposed Composer 2.5 as a Fast option rather than the standard Composer 2.5 variant, so the GUI is not the cheap automation path. GPT Control uses the CLI wrapper for standard Composer 2.5 and treats the desktop app as manual/interactive fallback.

## Task packet contract

Every meaningful delegation freezes:

`objective | repo | mode | scope | forbidden | verification | stop condition | model profile`

The permanent project rule is `.cursor/rules/othrys-left-hand.mdc`.
The reusable skill is `.cursor/skills/othrys-left-hand/SKILL.md`.

Mutation policy:
- Preserve all unrelated dirty work.
- No delegated mutation directly on main/master.
- Use isolated worktrees or a dedicated branch.
- No production deploy, destructive operation, secret handling, permission/auth change, purchase, billing action or external message without explicit approval.
- Never weaken Aegis/Labyrinth, approval gates, audit controls or recovery systems to make an agent succeed.

## Recovery and offline fallback order

Run `python tools/gpt/cursor_left_hand_health.py` before relying on the left hand after a reconnect or failure.

Fail over explicitly; never silently substitute authority:

1. **Native Cursor CLI on Legion.** Primary bounded delegation path.
2. **Cursor My Machines / WSL.** Use only when its worker security boundary is acceptable for the task.
3. **Grok Bot through QuickDesk.** Good for research, GUI work and delegation into Cursor.
4. **Cursor-managed Cloud Agent.** Preferred if Legion is offline; the task continues in Cursor's isolated cloud VM and does not depend on the Legion.
5. **GPT Control directly through GitHub + Remote Desktop Commander.** Cursor is optional, not a single point of failure.
6. **Jev / approved free remote models / local model path.** Use OTHRYS's own model routing when Cursor is unavailable or its quota is exhausted.
7. **Private GitHub control relay.** Existing fail-closed lifeline for command/evidence exchange when interactive remote control is degraded.
8. **Peer recovery (PC/T590), SSH and Recovery Agent.** Restore the Legion control stack without granting another AI authority.
9. **Operator break-glass.** Exact frozen instructions only.
10. If no verified execution route exists: `LEFT_HAND_DOWN -> GPT CONTROL CONTINUES READ/PLAN ONLY; STOP MUTATION`.

Important distinction: if only Legion is offline, Cursor-managed Cloud Agents can still work. If Cursor itself is offline, GPT Control falls back to OTHRYS/Jev/local/GitHub/remote tools. If Remote Desktop Commander is offline but QuickDesk is alive, use the GUI path only for recovery-safe actions. If both primary hands are down, use the existing recovery stack before resuming ordinary work.

## My Machines security rule

A My Machines worker runs commands and edits on its OS account. Treat that account as an agent security boundary. Do not permanently expose Keymaster, recovery private keys, master GitHub credentials, production service-role secrets, or unrestricted home directories to it.

The original WSL worker proves the technology but runs under the existing `othrys` WSL user, so that legacy route remains supervised/on-demand.

A dedicated isolation foundation now exists under WSL user `cursorworker`:
- no sudo/admin group membership; password locked;
- home directory mode 700;
- separate Cursor Agent binary tree, with no copied Cursor login state;
- systemd unit `othrys-cursorworker.service`, currently disabled/inactive;
- `NoNewPrivileges`, empty capability bounding set, private devices/tmp, strict system protection;
- `/mnt/c`, `/home/othrys`, and `/root` are inaccessible inside the worker service sandbox;
- only `/home/cursorworker` is writable; this boundary was directly tested on 2026-09-26;
- authenticated directly to Cursor in its own home on 2026-09-27; no operator token files were copied;
- fresh public checkout exists at `/home/cursorworker/cursor-workers/othrys-os`;
- isolated Composer 2.5 read-only smoke returned `OTHRYS ISOLATED CURSOR OK — OTHRYS V2` and left the checkout clean;
- the My Machine worker registers as `OTHRYS-Legion-Isolated`; registration is proven, but the service stays disabled at boot and is stopped when not needed. A remote dispatch proof is intentionally deferred until model-cost containment is acceptable because current Cursor Cloud helpers can drift to Fast/other models.

Do not copy operator Cursor tokens, SSH keys, Git credentials, Keymaster secrets, recovery keys, or production credentials into this account. Private repositories require a separate least-privilege Git authentication design; do not reuse the operator's broad Git credentials.

## Operational commands

Read-only/economy delegation:

`python tools/gpt/cursor_left_hand.py "TASK" --mode ask --profile economy`

Hard planning/review:

`python tools/gpt/cursor_left_hand.py "TASK" --mode plan --profile hard --verify "WHAT PROVES THE PLAN"`

Bounded implementation on a clean base:

`python tools/gpt/cursor_left_hand.py "TASK" --mode build --profile economy --scope "FILES/COMPONENT" --verify "TESTS" --stop "ONE UNIT DONE"`

Health and fallback decision:

`python tools/gpt/cursor_left_hand_health.py`

The wrapper logs metadata only (task hash, model, repo, base state, return code and command shape) under the local OTHRYS state directory. It intentionally does not persist task prompts or model output, reducing accidental secret capture.

## Validation performed 2026-09-26

- Cursor Agent CLI installed and authenticated on Windows Legion.
- Composer 2.5 headless inference: PASS.
- Grok 4.7 headless inference: PASS.
- OTHRYS wrapper read-only smoke: PASS.
- Isolated worktree build created only the requested `hello.txt`: PASS; original checkout stayed unchanged.
- QuickDesk -> Grok Bot round-trip: PASS.
- WSL Cursor My Machines registration across `othrys-os` and `othrys-web`: PASS.
- Native Windows My Machines worker: BLOCKED by upstream Cursor Node/better-sqlite3 ABI mismatch; WSL is the proven workaround.

## Off-machine GitHub relay — PROVEN

On 2026-09-26 GPT Control created private GitHub issue #51 in `vtcbelgium/othrys-web`, then posted a read-only `@cursor` instruction using the GitHub connector. Cursor's bot answered the issue with the requested proof string and a Cloud Agent run, without any Legion/QuickDesk interaction in the dispatch path. The issue was then closed.

This is now a proven independent fallback:

`GPT CONTROL -> GitHub connector -> private issue/PR comment @cursor -> Cursor-managed Cloud Agent -> GitHub evidence -> GPT CONTROL`

Use it when Legion is offline, Remote Desktop Commander is down, or local Cursor execution is undesirable. Default relay tasks must remain read-only or PR-producing; direct production actions remain forbidden. A relay issue should state the scope and forbidden actions explicitly and be closed when the mission is complete.
