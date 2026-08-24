# V2-001B.S — Block #1 runtime smoke on LEGION

Mission issued as "V2-001B — BLOCK #1 RUNTIME SMOKE". Recorded as **V2-001B.S**
because `V2-001B` and `V2-001B.R` already exist with different objectives and
their receipts are append-only. Nothing prior was rewritten.

One question: **can `block.media.image-prep@0.1.0` run its existing real runtime
tests on LEGION?**

## Verdict

`RUNTIME_BLOCKED`. Same wall as V2-001B and V2-001B.R, confirmed a third time
with a sharper error string. Nothing was substituted, repaired or expanded.

## What changed since V2-001B.R

The **base gate now passes.** `origin/main` is `a6d75aad` and equals local `HEAD`,
so the host did push V2-001B and V2-001B.R. That is the one thing this mission
found different, and it is why the mission was legal to start at all.

`othrys-blocks` was not mounted in this session and was granted read access on
request. That is a session-scoped grant, not a repository change.

## Section 2 — specimen digest: MATCH

Recomputed by the admission record's own procedure (`sha256-of-manifest`,
14 files, `node_modules` / `test-results` / `.git` excluded, LC_ALL=C order):

```
32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b
```

Identical to the admitted value, and identical again when rechecked at mission
end. All 14 per-file SHA-256s match the admission manifest one for one. The
specimen is frozen. Block #1 remains admitted from V2-001A.R; nothing re-admitted.

## Section 3 — Node tests: 4/4 pass, but NOT on Windows

```
node --test tests/node/contract.test.js
# tests 4  # pass 4  # fail 0   (node v22.23.2)
```

Observed in the delegate's **desktop Linux VM on LEGION**, which is the only shell
this session has. This is recorded as an observation, not as the Windows proof the
mission asked for. The mission says "use the real Windows LEGION environment"; this
was not that environment, and the result is not claimed as satisfying section 3.

## Section 3/4 — browser suite: BLOCKED

**First causal blocker: there is no Windows shell reachable from the delegate.**

```
uname -a          -> Linux claude 6.8.0-136-generic ... Ubuntu 22.04.5 LTS
/mnt/c            -> does not exist
cmd.exe           -> ABSENT
powershell.exe    -> ABSENT
pwsh.exe          -> ABSENT
wsl.exe           -> ABSENT
/proc/sys/fs/binfmt_misc/  -> empty (no WSLInterop)
```

Second, dependent blocker: the only shell that does exist cannot obtain Chromium.

```
npx --no-install playwright --version   -> Version 1.62.1   (installed, platform-neutral)
chromium.executablePath()               -> ~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome
that path                               -> does not exist
npx playwright install chromium         -> Error: Download failed: server returned code 403
                                           body 'Connection blocked by network allowlist'.
                                           URL: https://cdn.playwright.dev/builds/cft/151.0.7922.34/linux64/chrome-linux64.zip
                                           Failed to install browsers   (exit 1)
```

One bounded install attempt. No retry loop. The browser suite was therefore never
executed and **no browser test result is claimed either way** — it is
NOT_OBSERVED, not "failed". Section 6 (record the first causal blocker of a
*failing* suite) does not apply, because the suite did not run.

The `403 'Connection blocked by network allowlist'` body is new wording; the
earlier missions recorded `403 from proxy after CONNECT`. Same wall, clearer sign:
this is an allowlist policy, not a transient network fault, so retrying is futile.

## What was NOT done

No mounting, no composition, no Oros, no Block #2, no reconstruction, no new
architecture. No Block code touched. Control Feedback untouched. The cloud
container — which does have Chromium and network — was **not** used: proving the
Block runs there answers a different question than "can LEGION run it"
(Book of GPT law 29) and using it silently would be a hidden fallback (law 8).

## Legacy mutation: NONE

`othrys-blocks` HEAD is `09efbc70`, unchanged. `git status` there reports every
tracked file as modified, but `git diff` shows equal insertions and deletions on
every file and no content change — a pre-existing CRLF/LF representation
difference between the Windows working tree and the index, present before this
mission. The authoritative check is the digest, computed over the working-tree
bytes: identical at mission start and mission end.

## Unblock — operator commands on LEGION (PowerShell)

```powershell
cd C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
npx playwright install chromium
npm run test:node
npm run test:browser
```

Return the two suite outputs plus `npx playwright --version` and the installed
Chromium version. That is the entire remaining input for a `RUNTIME_PROVEN`
verdict; nothing else in this mission is outstanding.
