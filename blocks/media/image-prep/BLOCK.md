# BLOCK.md — block.media.image-prep

Documentation / evidence. Not a runtime schema. Not CERTIFIED. Not GOLDEN.

## ID

`block.media.image-prep`

## VERSION

`0.1.1`

### Version history

- `0.1.0` — extracted and transplanted (VTC-BLOCK-EXTRACT-001R / -TRANSPLANT-001).
  Admitted into OTHRYS V2 as Capability Block #1 by V2-001A.R; runtime proven on
  LEGION by V2-001B.T. Tree digest
  `32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b`.
  That specimen is immutable historical evidence and is not superseded by amendment.
- `0.1.1` — **PATCH** (Book of Blocks §9: compatible correction, no declared contract
  change). Repairs two defects proven by the V2-001C aggressive QA suite:
  parameterized SVG MIME bypassed rejection, and an extreme aspect downscale could
  round a raster dimension to zero. Both bring the implementation into line with the
  contract already declared below; neither changes it.

## VISIBILITY

PRODUCT

## MATURITY

REUSABLE (second independent Oros, VTC-BLOCK-TRANSPLANT-001). Not CERTIFIED. Not GOLDEN.

Package version remains **0.1.0**. Maturity is evidence, not a contract change (Book of Blocks §7 / §9). Implementation was not mutated for the transplant.

## PURPOSE

Prepare a user-supplied raster image for consistent product/catalog display: optional long-edge downscale, JPEG normalization, and optional square compose onto an opaque background. The Block does not upload, consent, or publish.

## PROVIDES

- `prepareImage(source, options) → Promise<PrepareResult>`
- Operations:
  - `prepare.downscale`
  - `prepare.normalize.jpeg`
  - `prepare.square` (former withdrawn identity `block.media.white-square-prep`)

## OPERATIONS

See PROVIDES. Absence of `prepare.square` is valid.

## REQUIRES

Browser `CanvasRenderingContext2D` + `Image` + `FileReader` + `canvas.toBlob` + `getImageData`. Host supplies a `Blob`/`File`.

## OPTIONAL

- Host-side background removal *before* `prepareImage`. Core never calls `@imgly` or remove.bg.
- Named profiles (`catalog-tile`, `catalog-quick`, `upload-1200`, `avatar-reencode`) are convenience, not a registry.

## STATE OWNERSHIP

NONE. Stateless transform. No localStorage, no Supabase, no catalog, no identity.

## RUNTIME

Proven: Chromium page with real Canvas 2D (Playwright).  
Unsupported: Node without Canvas; jsdom without real `toBlob`/`getImageData`.

## NETWORK

NONE on the core path.

## SECRETS

NONE.

## PERMISSIONS

NONE. Host owns file pickers and storage writes.

## CONFIG

Not identity. Origin VTC catalog-tile values are capability defaults and are overridable:

| Knob | Origin value | Class |
| --- | --- | --- |
| size | 800 | B VTC product config |
| subjectFill | 0.86 | B VTC product config |
| fill | `#ffffff` | B VTC product config (not universal) |
| jpegQuality | 0.88 | B VTC product config (origin also uses 0.85) |
| alphaThreshold | 20 | A capability default for bbox |
| longEdge | 1200 (also 800 on catalog-quick) | B VTC product config |
| upscale | false on downscale | C implementation detail |

VTC passes current values explicitly. White fill is not universal (ScanFlow.handleFile does not fill).

## OBSERVABILITY

Return-value metadata only: `width`, `height`, `format`, `bboxTrimmed`, `backgroundRemoved` (always false on core), `durationMs`, `operationsApplied`, `blockId`. No Event Bus. No pixel logs.

## SOURCE PROVENANCE

Extracted from VTC `src/whiteSquare.js` (compose + bbox + JPEG square), `src/App.jsx` `uploadAccPhoto` duplicate compose, and adjacent downscale behaviour in `CollectionTab.compressImage` / `uploadImage.js` (raster half only).

- Origin product: `vtc-platform`
- Origin SHA at extraction: `032a47ca0fa0731febdf47f45607983ac9b721b4`
- Origin blob `src/whiteSquare.js`: `b3f9bbe63864daa075e8b430bd40df2d27d66080`
- Background removal (`src/bgRemove.js`, `whiten-photo`) stays in VTC / parked. NOT INCLUDED IN CORE.

## ORIGIN CONSUMER

VTC (`vtc-platform` extraction worktree `vtc-block-extract-001r`) via local `file:../othrys-blocks/blocks/media/image-prep`. Host adapter `src/whiteSquare.js` maps typed errors → `null` and may run `@imgly` before the Block.

## SECOND CONSUMER

`oros-image-prep-transplant` at `C:\Users\othry\Projects\oros\oros-image-prep-transplant`. Independent catalog-image-prep utility. Consumes this package via `file:../../othrys-blocks/blocks/media/image-prep`. No VTC imports. No copied compose. Disposition: KEEP_AS_PORTABILITY_FIXTURE.

## PROVEN CONSUMERS

2 (VTC origin + `oros-image-prep-transplant`). Do not claim more.

## PORTABILITY

Contract portable as-is at 0.1.0. Second Oros used the Block unchanged. No classified portability defect (A–G unused). Runtime assumption holds: Chromium Canvas 2D outside VTC.

REUSABLE here means source-portable across independent Oroi in the **local canonical estate**. It does **not** mean remotely reproducible, npm-published, or externally distributable. othrys-blocks remains **REMOTE_PENDING**.

## INTEGRATION EDGE

Oros host → `media.image.prepared@1` (documentation name only; no graph system). Host runtime: browser Canvas. Consumption: ESM `prepareImage`. Input: `Blob`/`File`. Output: JPEG `PrepareResult`. Config: host-owned knobs. Failure: typed `ImagePrepError`. See Hub `docs/VTC-BLOCK-TRANSPLANT-001/INTEGRATION-EDGE.md`.

## TEST EVIDENCE

- Origin: Hub `docs/VTC-BLOCK-EXTRACT-001R/TEST-EVIDENCE.md`; this package `npm test` (node contract 4 + Playwright Chromium 20) re-run 2026-08-21 PASS.
- Second consumer: Hub `docs/VTC-BLOCK-TRANSPLANT-001/`; Oros `npm test` (same-source + Playwright Chromium 9) 2026-08-21 PASS.

## KNOWN LIMITATIONS

- JPEG encoder is not byte-deterministic across browsers. Contract compares dimensions, format, fill, subject placement — not bitwise identity.
- EXIF orientation is browser-dependent; canvas re-encode strips EXIF including GPS.
- HEIC is unsupported (decode_failed). Do not add support to make tests pass.
- SVG rejected as `unsupported_type`, matched on MIME **essence**, so parameters
  (`image/svg+xml;charset=utf-8`) cannot defeat the rejection. Fixed in `0.1.1`;
  `0.1.0` compared the full type string exactly and let parameterized SVG through.
- Full-resolution `getImageData` for bbox can be heavy; origin callers often downscale first.
- Every output raster dimension is floored at 1 px. Extreme aspect ratios therefore
  clamp rather than preserve the exact ratio at the limit (a `4096x1` source with
  `longEdge: 1200` yields `1200x1`, not `1200x0`). Fixed in `0.1.1`; `0.1.0` produced
  a zero-sized canvas and surfaced `encode_failed`.
- `backgroundRemoved` is always false here. Optional Bridge is host-owned.
- Local `file:` consumption is proof-only. REMOTE_PENDING for this repository. Publishing is not authorised.
