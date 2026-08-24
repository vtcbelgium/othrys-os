# V2-001B.T — Block #1 runtime proof, recorded

Recording mission. The delegate executed nothing, installed nothing and touched
nothing in `othrys-blocks`. The runtime evidence below was produced on the LEGION
Windows host and supplied through GPT; this file is the V2 record of it.

## Verdict

`RUNTIME_PROVEN` for `block.media.image-prep@0.1.0`.
Admission status unchanged: `ADMITTED` (from V2-001A.R).

## Evidence provenance — read this before trusting the numbers

| | |
|---|---|
| Class | `HOST_SUPPLIED_TRUSTED` |
| Produced by | operator, on the LEGION Windows host |
| Relayed by | GPT_CONTROL, current conversation |
| Observed by the delegate | **no** |
| Verified by the delegate | specimen identity and suite cardinality only (below) |

The delegate has no Windows shell (proven three times: V2-001B, V2-001B.R,
V2-001B.S), so it cannot and does not claim first-hand observation of these runs.
Under Book of GPT law 29 the host is the competent authority for host runtime, and
this record is exactly as strong as that attestation — no stronger. What the
delegate *can* check, it checked.

## What the delegate independently verified

**1 — The specimen is the admitted one.** Recomputed by the admission record's own
`sha256-of-manifest` procedure over the 14-file tree:

```
32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b
```

Exact match to the admitted digest — the fourth consecutive match, across
V2-001B, V2-001B.R, V2-001B.S and now V2-001B.T. `othrys-blocks` HEAD is still
`09efbc7088c320a8bb0ae6de0566a764e502115c`. The suites that ran are the suites
that were admitted.

**2 — The reported counts match the frozen suites' declared cardinality.**

| Suite | Declarations in the specimen | Host reported |
|---|---|---|
| `tests/node/contract.test.js` | 4 `test(` | 4 tests, 4 passed |
| `tests/browser/image-prep.spec.js` | 20 `test(` | 20 tests, 20 passed |
| `playwright.config.js` projects | 1 (`chromium`) | 1 worker, Chromium |

Both totals and the worker count are consistent with the admitted specimen, not
with some other tree. This is a consistency check, not a re-execution — it cannot
prove the runs happened, only that the numbers could only have come from this
Block.

## NODE_RUNTIME

```
host        LEGION (Windows)
cwd         C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
command     npm.cmd run test:node
result      4 tests / 4 passed / 0 failed / 0 skipped / 0 cancelled
verdict     PASS
```

## BROWSER_RUNTIME

```
host        LEGION (Windows)
cwd         C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
command     npm.cmd run test:browser
runner      Playwright
browser     Chromium (real, host-installed)
result      20 tests / 20 passed / 0 failed
workers     1
duration    ~4.8 s
verdict     PASS
```

Attested by the host: not mocked, not substituted with cloud Chromium, no Block
repair required.

## The earlier blocker

V2-001B.S recorded `RUNTIME_BLOCKED` and it was correct at the time. It is
preserved unmodified — `docs/V2-001B.S/RUNTIME_SMOKE.md` still hashes to
`266525c8deb6de3858a3e7a4e27cac2282b47352c955e3ebd4406a36f10cd14d`, and the
V2-001B and V2-001B.R receipts are byte-identical too. Nothing was rewritten to
make the history look cleaner than it was.

```
PREVIOUS_BLOCKER    no Windows shell reachable from the delegate; the delegate's
                    Linux VM could not obtain Chromium (cdn.playwright.dev 403,
                    'Connection blocked by network allowlist')
BLOCKER_RESOLUTION  RESOLVED_BY_HOST_PROOF
```

Precisely: the blocker was never a defect in the Block. It was the delegate's
inability to reach the runtime. The host reached it. The blocker is resolved for
*this proof* — it is **not** resolved for the delegate, which still has no Windows
shell and still cannot install Chromium. Any future mission needing host runtime
will hit the same wall and must be routed to the operator the same way.

## What this does and does not establish

Establishes: Block #1's own node and browser suites pass on real LEGION runtime,
against the exact admitted specimen. Foundation question 4 (real runtime evidence)
is answered.

Does **not** establish: any Oros mount, any composition, any end-to-end
fixture-to-output proof, any reconstruction. Foundation question 5 (exact Oros
mount) remains unresolved. **Block #2 remains FORBIDDEN.** Nothing was mounted in
this mission and no architecture was created.
