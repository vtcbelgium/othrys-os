# V2-001B — BLOCKED at §3: the browser runtime cannot be executed by the delegate

Base gate PASS: clean tree, `HEAD == origin/main == 53ef6b19616aadfcf1f898b26b8a8a21352d334d`.

## §2 — the specimen is unchanged

Recomputed `package_tree_digest` over `othrys-blocks/blocks/media/image-prep`:

```
32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b   recomputed
32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b   admitted (V2-001A.R)
```

Match. Block #1 is frozen and intact. Nothing was re-admitted, repaired or updated.

## §3 — first causal blocker

The mission asks whether the Block's own Playwright/Chromium harness can run **on
the Windows host**. Three environments, three findings:

| Environment | Reachable from this session | Playwright | Chromium | Verdict |
|---|---|---|---|---|
| Windows host (LEGION) | **no** — the delegate has no shell on Windows | — | — | `NOT_OBSERVED` |
| Desktop Linux VM (the delegate's only shell) | yes | `@playwright/test` **not installed** | **absent**; no `~/.cache/ms-playwright` | `PROVEN_ABSENT` |
| Anthropic cloud container | yes | installable | pre-installed | available, **but a different environment** |

Installing on the VM is blocked by policy, not by omission:

```
$ npm ping
npm error 403 a package version that is forbidden by your security policy, or
npm error 403 on a server you do not have access to.
```

`npm install` and `npx playwright install chromium` both require the registry and
the browser CDN. **Network access is required and denied.** §3 says: *"If
network/payment/authority is required: STOP and report BLOCKED. Do not substitute
a fake runtime proof."* That is this case exactly.

### PENTA-001 already hit this wall, and said so

`othrys-hub/docs/PENTA-001/RUNBOOK.md` (lines 44–52):

> Two things could not be executed from the cloud session and are yours to run on
> LEGION: 1. the green run and the failure run (they need Chromium / Playwright)…
> this session's only shell on LEGION is the desktop Linux VM. It has Node 22 but
> **no network**, and `othrys-hub/core/node_modules` is Windows-installed
> (`@esbuild/win32-x64`), so `node core/bin/*.mjs` aborts before running.

This is not a new limitation and not a regression. It is the same environment
boundary, recorded by the mission that built Oros Zero.

## §6 is blocked by the same boundary, independently

Oros Zero's declared execution path is `othrys-hub/core/bin/oros-zero.mjs`, which
bundles the Hub's Talos engine with esbuild. The Hub's `node_modules` are
Windows-installed, so that runner cannot execute in the Linux VM regardless of
Chromium. Oros Zero has **never been run**: `var/`, `out/` and `evidence/` do not
exist under `oros/oros-zero/`.

So even a green browser suite would not have let §6 pass from here.

## Deliberately not done

Per LOOP_LAWS §7 (first causal blocker) nothing downstream was attempted:

- no mount record written, and `oros/oros-zero` was **not modified** — its
  `blueprint.json` currently binds `block_id`, a version *range*, `package`,
  `path` and `maturity_at_resolution`, but **not** the digest and not the V2
  admission reference. Adding those means editing a legacy artifact, which is an
  authority question that should not ride along inside a mission already blocked;
- no end-to-end run, no negative mount test, no reconstruction test;
- no Block #2, no Oros, no registry, resolver or orchestrator;
- Control Feedback untouched;
- Block implementation untouched — digest identical at mission end.

## What unblocks it — decision for GPT

**Option A — run it on LEGION (what the mission actually asks for).** The
operator runs, in Windows PowerShell:

```powershell
cd C:\Users\othry\Projects\othrys-blocks
npm install
npx playwright install chromium

cd C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
npm test                                  # node contract 4 + Playwright Chromium 20

cd C:\Users\othry\Projects\othrys-hub
node core\bin\oros-zero.mjs --correlation-id oros-zero-green-001 --json
```

Expected: `verdict: PASS`, state `SUCCEEDED`, durable evidence in
`oros\oros-zero\var\ledger\oros-zero\` and a report at
`oros\oros-zero\evidence\oros-zero-green-001.report.json`. Paste those back and
V2-001B can be completed from real evidence.

**Option B — a real Chromium run in the delegate's cloud container.** The
container has Chromium and network. The Block's unmodified suite could be staged
and executed there, producing genuine browser evidence.

It is offered, not taken. Doing it unilaterally would be a silent change of
machine (Book of GPT law 8), and it would answer a different question than the
one asked: it proves the Block runs in *a* real Chromium, not that LEGION can run
it, and Book of GPT law 29 exists precisely because those are not the same claim.
It also cannot produce §6's Oros run, which needs the Hub on Windows.

**Option C — authorise a documented environment change** (Linux `node_modules`
for the Hub, or an egress allowance for the VM). The RUNBOOK records that the
operator already declined placing Linux binaries on the machine, and calls that
the correct call.

## Foundation exit test — unchanged

Question 5, *"Where is it mounted in the Oros?"*, remains unresolved. Nothing was
mounted. **Block #2 stays FORBIDDEN**, and `BLOCK_1_NOT_READY` is the honest
foundation state: admitted, verified, frozen — not yet mounted, not yet proven in
its declared runtime.
