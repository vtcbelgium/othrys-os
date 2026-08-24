# Block #1 aggressive test evidence

Date: `2026-08-24`  
Host: Legion Windows  
Scope: `block.media.image-prep@0.1.0` only

## Canonical anchors

- V2 base and pushed state at start: `29f47a402728e9ec91b74856f4b0522205458785`
- Legacy repository HEAD: `09efbc7088c320a8bb0ae6de0566a764e502115c`
- Canonical path: `C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep`
- Admitted digest: `32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b`
- Recomputed digest before and after testing: exact match, 14 files
- Runtime: Node `24.18.1`, Playwright `1.62.1`, Chromium `151.0.7922.34`

The isolated QA sources live in V2. Exact copies were executed from the canonical
Block's `node_modules/.othrys-aggressive` directory so Playwright could resolve its
existing dependency while the directory remained excluded by the admission digest.
No admitted Block file was changed.

## Commands and results

All runtime commands below were executed through `cmd.exe` on Legion Windows.

```text
cd /d C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
node.exe --version
npm.cmd --version
npm.cmd run test:node
```

Result: `4 tests / 4 passed / 0 failed / 0 skipped / 0 cancelled`.

```text
cd /d C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
npx.cmd playwright --version
npm.cmd run test:browser
```

Result: `20 tests / 20 passed / 0 failed`, Chromium, one worker.

```text
cd /d C:\Users\othry\Projects\othrys-v2
node.exe --test qa\block.media.image-prep\digest.test.mjs
```

Result: `3 tests / 3 passed / 0 failed`. This verifies the complete per-file
manifest, repeats the digest ten times, and proves that a one-character hash
tamper changes the tree digest without touching the canonical Block.

```text
cd /d C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
npx.cmd playwright test --list --config node_modules\.othrys-aggressive\playwright.config.js
npx.cmd playwright test --config node_modules\.othrys-aggressive\playwright.config.js
```

Result: `18 tests / 16 passed / 2 failed`, Chromium, one worker, approximately
`3.2 s`. The failures are repeatable contract defect proofs, not harness failures.

```text
cd /d C:\Users\othry\Projects\othrys-blocks\blocks\media\image-prep
node.exe node_modules\.othrys-aggressive\browser-version.mjs
npm.cmd test
```

Result: Chromium `151.0.7922.34`; final unchanged baseline `4/4` Node and `20/20`
Chromium passed.

Digest command (WSL read-only view of the same Legion filesystem):

```text
find <block> -type f \
  -not -path '*/node_modules/*' \
  -not -path '*/test-results/*' \
  -not -path '*/.git/*' -printf '%P\n' |
LC_ALL=C sort |
while read -r f; do
  printf '%s  %s\n' "$(sha256sum "<block>/$f" | cut -d' ' -f1)" "$f"
done | sha256sum
```

Result before and after: `32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b`.

## Coverage added

The isolated suite covers default normalization, operation aliases and deduplication,
unknown operations/profiles, empty/corrupt/truncated data, parameterized SVG MIME,
fully transparent PNGs, the alpha-threshold boundary, exact and just-over dimension
boundaries, a `4096x1` extreme aspect ratio, a `1x1` source, a `5000x3000` source,
re-normalization idempotence, ten repeated runs, eight concurrent transforms, and
source/options immutability. Existing coverage supplies the remaining square,
portrait/landscape, JPEG, transparent PNG, malformed data, and adapter cases.

## Concrete defects proven

1. **Parameterized SVG MIME bypasses rejection.** A Blob with type
   `image/svg+xml;charset=utf-8` is decoded and normalized successfully. The contract
   says SVG is rejected as `unsupported_type`; the implementation only compares
   `source.type === "image/svg+xml"`.
2. **Extreme aspect downscale can create a zero-height canvas.** A valid `4096x1`
   PNG with `longEdge: 1200` computes height `0` through `Math.round`, after which
   JPEG encoding returns `null` and surfaces `encode_failed`. A raster dimension must
   remain at least one pixel.

No implementation repair was attempted. Either repair changes the content-bound
specimen digest and therefore requires an explicit new-version/admission decision.

## First causal blocker

The first isolated browser attempt staged its config under `test-results/aggressive`.
Playwright owns and cleans `test-results` at run start, deleting the staged config and
producing a pre-test launcher/config failure (`spawn ... cmd.exe ENOENT`, followed by
an explicit `playwright.config.js does not exist`). No Block test ran in that attempt.
Restaging the identical files under digest-excluded `node_modules/.othrys-aggressive`
resolved the harness blocker; all 18 tests then executed in Chromium.

## Scope integrity

- Legacy Block implementation and its 14 admitted files: unchanged.
- Oros, Block #2, Control Feedback, architecture, registry/resolver: untouched.
- Legacy working tree: clean for tracked files at end.
- Verdict: baseline runtime remains proven; aggressive coverage proves two defects.
- Next state: `WAIT_GPT`.
