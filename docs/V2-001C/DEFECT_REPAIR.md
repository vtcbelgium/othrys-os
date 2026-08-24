# V2-001C — Block #1 defect repair, candidate `0.1.1`

Bounded repair of the two defects proven by the V2 aggressive QA suite
(`qa/block.media.image-prep/AGGRESSIVE_TEST_EVIDENCE.md`). Two defects, two
implementation hunks, one PATCH bump. Nothing else.

## Versioning authority

`othrys-blocks/docs/CONVENTION.md` defers Block semver to Hub **Book of Blocks §9**,
which reads: *"**PATCH:** compatible correction; no declared contract change."*
Both repairs make the implementation conform to the contract **already declared** in
`BLOCK.md` — SVG rejected as `unsupported_type`, and a valid raster producing a valid
output. Neither alters the declared contract. Therefore `0.1.0 → 0.1.1`, PATCH.
Verified against the governing text, not assumed from the mission's expectation.

## `0.1.0` is preserved

| | |
|---|---|
| Old version | `0.1.0` |
| Old digest | `32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b` |
| New version | `0.1.1` (candidate — **not admitted**) |
| New digest | `48afa7ac082db75b40278bf71ff552f6ff0ca4e1429006f759dec4c37b3b55bd` |

### A digest correction worth recording

An intermediate digest, `db22a401…e787bd5a`, was computed part-way through this
mission and is **not** the answer. The cause: regression tests were appended to
`tests/node/contract.test.js` with a shell heredoc, which writes LF, leaving that one
file with mixed line endings inside an otherwise CRLF Windows working tree. Once every
specimen file was normalised to CRLF — the state a Windows checkout actually
materialises, and the state the `0.1.0` digest was computed over — the digest settled
at `48afa7ac…7b3b55bd`. Only `tests/node/contract.test.js` differed between the two
computations. The intermediate value is recorded here rather than quietly replaced.

This exposes a real property of the admitted digest procedure: it hashes **working-tree
bytes**, so it is reproducible only on a checkout with the same line-ending
materialisation. `0.1.0`'s digest has the same dependency — its `reproduce` command was
run from WSL against the Windows filesystem. Worth a decision from GPT eventually;
not this mission's to make.

`admissions/block.media.image-prep@0.1.0.json` is **unmodified** — the mission's §0
requirement and FOUNDATION_LAWS §20. The 0.1.0 bytes remain recoverable from legacy
git at `09efbc7088c320a8bb0ae6de0566a764e502115c`, which this mission did not touch.
No admission record was created for `0.1.1`: FOUNDATION_LAWS §7 makes admission a
deterministic gated decision requiring passing tests and evidence, and §20 says a new
version must be admitted **explicitly**. Admission is GPT's call, not a side effect of
a repair. This document is the candidate record; `admissions/` stays as it was.

## Defect A — parameterized SVG MIME

**Before** (`src/prepareImage.js:225`) — exact string comparison:

```js
const mime = source.type || "";
if (mime === "image/svg+xml") {
```

A Blob typed `image/svg+xml;charset=utf-8` never matched, so SVG was decoded and
normalized instead of refused.

**Fix** — compare the MIME *essence* (WHATWG: everything before the first `;`,
trimmed, lowercased). No dependency added, rejection not weakened:

```js
const mime = source.type || "";
// MIME essence per WHATWG: everything before the first ";", trimmed, lowercased.
// Parameters such as ";charset=utf-8" must not defeat the rejection.
const mimeEssence = mime.split(";", 1)[0].trim().toLowerCase();
if (mimeEssence === "image/svg+xml") {
```

**After** — proven fail→pass on the delegate's Node runtime:

```
BEFORE  not ok 6 - SVG MIME "image/svg+xml;charset=utf-8" ...
        not ok 7 - SVG MIME "image/svg+xml; charset=utf-8" ...
        not ok 8 - SVG MIME "IMAGE/SVG+XML; charset=UTF-8" ...
        # tests 10  # pass 7  # fail 3
AFTER   # tests 10  # pass 10  # fail 0
```

Negative controls added and green both before and after, proving the fix does not
over-reject: `image/png;charset=binary` and `image/jpeg; foo=bar` still pass the type
gate (they reach `canvas_unavailable` in Node, which is the gate having let them by).

## Defect B — zero raster dimension

**Before** (`src/prepareImage.js:168-169`, `composeDownscale`):

```js
const width = Math.round(img.width * scale);
const height = Math.round(img.height * scale);
```

A `4096x1` source with `longEdge: 1200` gives `scale ≈ 0.29297`, so
`Math.round(1 * 0.29297) === 0` — a zero-height canvas, `toBlob` returns `null`,
surfaced as `encode_failed`.

**Fix** — floor every dimension at one pixel. `Math.max(1, …)` is the identity for
every value ≥ 1, so normal images are untouched and nothing is upscaled:

```js
const width = Math.max(1, Math.round(img.width * scale));
const height = Math.max(1, Math.round(img.height * scale));
```

**After** — arithmetic proof over the same formula (canvas not required):

```
src         0.1.0 (w,h)    0.1.1 (w,h)
4096x1      1200x0         1200x1     <== was zero-sized (encode_failed)
1x4096      0x1200         1x1200     <== was zero-sized (encode_failed)
1x1         1x1            1x1
1200x800    1200x800       1200x800   (exact longEdge, unchanged)
1201x800    1200x799       1200x799   (just over, unchanged)
5000x3000   1200x720       1200x720   (unchanged)
32x24       32x24          32x24      (no upscale, unchanged)
```

`1x4096` was a second zero-dimension case the aggressive suite had not proven; the
same one-line floor covers it and it now has explicit regression coverage.

Aspect ratio is preserved as closely as integer raster dimensions allow: the clamp
engages only where the true ratio is unrepresentable (a short edge below half a
pixel), and there the choice is 1 px or a broken output.

`composeSquare` and `composeNormalize` were checked and need no change —
square output is always `size × size`, and normalize copies decoded dimensions,
which are ≥ 1 by construction.

## Exact implementation lines changed

`src/prepareImage.js` only — 2 hunks:

| Line(s) | Change |
|---|---|
| 168–169 | `Math.round(...)` → `Math.max(1, Math.round(...))`, both axes |
| 225 | exact-string SVG check → MIME-essence check (+2 comment lines, +1 `const`) |

No refactor. No other source file touched.

## Test coverage added

`tests/node/contract.test.js` (+6 tests, 4 → 10):
three parameterized SVG forms plus an uppercase variant, and two parameterized
raster negative controls.

`tests/browser/image-prep.spec.js` (+9 tests, 20 → 29, enumerated with
`playwright test --list`): the five required dimension boundaries — `4096x1`,
`1x4096`, `1x1`, exact `longEdge`, just over `longEdge` — each asserting
`width >= 1`, `height >= 1`, the exact expected pair, and no `encode_failed`;
plus the three SVG MIME forms in the real browser runtime and a parameterized
raster positive control.

## Test results

| Suite | Where | Result |
|---|---|---|
| Node contract (4 baseline + 6 new) | delegate Linux VM | **10/10 PASS** — observed |
| Playwright enumeration | delegate Linux VM | **29 tests listed**, spec parses — observed |
| Browser suite (20 baseline + 9 new) | LEGION Windows | **NOT RUN** — delegate blocked |
| Aggressive QA suite (18) | LEGION Windows | **NOT RUN** — delegate blocked |

The delegate still has no Windows shell and cannot install Chromium
(`cdn.playwright.dev` → 403, network allowlist). Unchanged since V2-001B.S; the
browser half of §5 is the operator's to run. **This repair is not browser-verified.**

## Finding: the aggressive suite's digest test now contradicts §0

`qa/block.media.image-prep/digest.test.mjs` pins the **live** canonical tree to the
**0.1.0** admission:

- test 1 asserts the live 14-file manifest deep-equals `admission.package_tree_digest.manifest`
- test 2 asserts the live digest equals the hardcoded `32b34548…d363d7b`

Both **must now fail**, because §0 required the repair to change the digest. These are
not regressions and not harness faults — they are the tamper detector working exactly
as designed, reporting that the specimen moved. Test 3 (relative tamper detection) is
version-independent and still passes.

§0 ("any repair must produce a new digest") and §5 ("all aggressive tests green")
cannot both hold while that file pins 0.1.0. **Nothing in `qa/` was changed** — it is
V2 defect evidence, and rewriting a test to match new behaviour is how a suite stops
being evidence. GPT decides: re-point those two tests at the admitted version of the
day, or re-scope them to a 0.1.0 checkout. Recorded, not resolved.

(Also worth noting: `digest.test.mjs` hardcodes `C:\Users\...` paths, so it is a
Windows-host test by construction and could not have run in the delegate VM either.)

## Scope integrity

Changed — 6 files, all inside `blocks/media/image-prep`, verified content-level
against legacy `HEAD` with CRLF normalized:

```
CHANGED  BLOCK.md              CHANGED  src/config.js
CHANGED  package.json          CHANGED  src/prepareImage.js
CHANGED  tests/node/contract.test.js
CHANGED  tests/browser/image-prep.spec.js
same     README.md, playwright.config.js, src/errors.js, src/index.js,
         tests/browser/{harness/bgRemove.js, harness/index.html,
         origin-oracle.js, serve.mjs}
```

Untouched: every other Block in `othrys-blocks`; Oros and `oros/oros-zero`; Block #2
(still FORBIDDEN); Control Feedback (`git diff HEAD -- blocks/` in V2 is empty); V2
architecture; registry, resolver, orchestrator (none exist and none created);
`admissions/`; `qa/`.

## Status

`0.1.1` is a **CANDIDATE**. Not admitted, not mounted, not composed.
Block #1's admitted version remains `0.1.0`; its `RUNTIME_PROVEN` status (V2-001B.T)
belongs to `0.1.0` and does **not** transfer to `0.1.1` until `0.1.1` runs on LEGION.
