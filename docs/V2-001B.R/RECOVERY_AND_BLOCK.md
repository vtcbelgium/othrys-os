# V2-001B.R — recovery complete, runtime still BLOCKED, closeout SYNC_BLOCK

## §0 Recovery state

Base is exactly where V2-001B left it. Nothing was committed before the bridge dropped.

```
HEAD        53ef6b19616aadfcf1f898b26b8a8a21352d334d
origin/main 53ef6b19616aadfcf1f898b26b8a8a21352d334d
expected    53ef6b19616aadfcf1f898b26b8a8a21352d334d
```

Working tree held only V2-001B interruption artifacts — no unrelated mutation, so
recovery continues rather than `DIRTY_UNRELATED_STATE`.

| Artifact | Classification |
|---|---|
| `docs/V2-001B/RUNTIME_BLOCK.md` | `PRESENT_COMPLETE` (5487 bytes) |
| `missions/V2-001B.json` | `PRESENT_COMPLETE` |
| `missions/V2-001B.result.json` | `PRESENT_COMPLETE` |
| `receipts/runs/V2-001B/20260824T181449Z.json` | `PRESENT_COMPLETE`, schema **VALID** |
| `receipts/LATEST.json` | `PRESENT_COMPLETE`, points at `V2-001B--20260824T181449Z` |
| `GPT_STATE.json` update | **ABSENT** — the failed call did not land (still sequence 13, `foundation_state` unset, active mission still V2-001A.R) |
| `V2_CHRONICLE.md` CH-0013 | **ABSENT** — not appended |

So the interrupted call was atomic in effect: it wrote nothing. The V2-001B
receipt is valid and is preserved unmodified as evidence of the failed attempt
(§1). This mission is recorded separately as V2-001B.R.

## §3 Specimen recheck — unchanged

```
recomputed  32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b
admitted    32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b
```

Block #1 is frozen and intact.

## §2 / §4 — the Windows LEGION proof cannot be executed by the delegate

§2 requires the real Windows LEGION environment and forbids every substitute.
The delegate has no Windows shell. Proven, not assumed:

```
uname -a                     Linux claude 6.8.0-136-generic … Ubuntu 22.04.5 LTS
ls /mnt/c                    No such file or directory
which cmd.exe powershell.exe (nothing)
/proc/sys/fs/binfmt_misc/WSLInterop   absent
mounts                       Projects, othrys-v2
```

There is no path from this session to a Windows command line. Claude-in-Chrome
drives a browser, not a shell, so it cannot run `npm`, `node` or the Oros runner.

**What the delegate's Linux VM can and cannot do — and it is closer than expected:**

| Fact | Evidence |
|---|---|
| `@playwright/test` **is** installed at `othrys-blocks/node_modules` | version `1.62.1`, and `npx playwright --version` runs fine here |
| the install is platform-neutral, not a Windows-only tree | zero `win32` packages, zero `.exe` files under `playwright-core` |
| the **Chromium browser binary** is missing | `playwright install --dry-run chromium` wants `Chrome for Testing 151.0.7922.34` from `cdn.playwright.dev` |
| that download is blocked | `curl https://cdn.playwright.dev/` → `403 from proxy after CONNECT` |
| npm is blocked too | `npm ping` → `E403 forbidden by your security policy` |

§4's own rule then applies exactly: *"If installation requires network and network
fails: BLOCKED. Do not substitute another environment."*

This is the second independent confirmation of the boundary PENTA-001 recorded in
`othrys-hub/docs/PENTA-001/RUNBOOK.md`.

## §5 / §6 — not attempted

`oros/oros-zero` was inspected read-only and **not modified**. It still has 7
files and no `var/`, `out/` or `evidence/` — it has never been executed. Its
blueprint binds `block_id`, `block_version_range`, `package`, `path`,
`maturity_at_resolution`, `runtime` — and **not** the digest, **not** the V2
admission reference.

Binding those is the §5 correction, and it was deliberately not made: §4 is the
first causal blocker, and LOOP_LAWS §7 forbids repairing downstream while it
stands. A mount recorded but never executed is a claim, not a proof — and §6 is
the thing that would have tested it.

## §9 — closeout push also blocked

```
git ls-remote origin main → fatal: HTTP 403 from proxy after CONNECT
```

One bounded probe, no retry. Under the new hard law this mission is therefore
`SYNC_BLOCK`, not PASS.

**A structural note for GPT, offered as evidence rather than as law.** The
delegate has never had GitHub egress and there is no sign it will get any. If
"no mission is complete until push + remote verify succeed" is applied literally,
then *no delegate mission can ever reach PASS* — the terminal state of every
future mission is decided by an actor outside the mission. Two coherent ways to
resolve that, both GPT's to choose:

1. make the host push the explicit final step of the mission protocol, so the
   delegate closes at `PUSH_PENDING` and the operator's verified `git ls-remote`
   is what promotes it to PASS; or
2. grant the delegate egress to the one repository.

Nothing was invented here; the law stands as written and this mission reports
`SYNC_BLOCK` under it.

## Foundation exit test — unchanged

Question 4 (real runtime evidence) and question 5 (exact Oros mount) remain
unresolved. Foundation state stays **`BLOCK_1_NOT_READY`** and **Block #2 remains
FORBIDDEN**.

## What unblocks this, exactly

On LEGION, in Windows PowerShell. Note the first `npm install` may already be
satisfied — `othrys-blocks/node_modules` already carries `@playwright/test 1.62.1`:

```powershell
cd C:\Users\othry\Projects\othrys-blocks
npx playwright install chromium

cd blocks\media\image-prep
node --test tests\node\*.test.js
npx playwright test

cd C:\Users\othry\Projects\othrys-hub
node core\bin\oros-zero.mjs --correlation-id oros-zero-green-001 --json

cd C:\Users\othry\Projects\othrys-v2
git push origin main
git ls-remote origin main
```

Paste back: the Playwright version, the Chromium version it installs, both suites'
pass/fail counts and durations, the Oros Zero `verdict`/`missionId`/state and the
report path, and the remote SHA. With that evidence V2-001B can be completed and
the mount recorded from proof rather than assumption.
