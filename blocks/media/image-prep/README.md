# block.media.image-prep

Canonical implementation of **`block.media.image-prep`**.

Package: `@othrys-blocks/media-image-prep` `0.1.0`  
Filesystem: `blocks/media/image-prep`  
Visibility: **PRODUCT**  
Maturity: **REUSABLE** (origin VTC + second Oros `oros-image-prep-transplant`, VTC-BLOCK-TRANSPLANT-001). Not CERTIFIED. Not GOLDEN. Version remains `0.1.0`.

## What it does

Prepare a user-supplied raster for consistent catalog/listing display:

- `prepare.downscale` — long-edge cap, optional fill, no upscale by default
- `prepare.normalize.jpeg` — JPEG re-encode (EXIF stripped as a canvas side effect)
- `prepare.square` — opaque square canvas, opaque-bbox trim, subject contain-fit with margin

One function. No plugins, loaders, registries, or discovery.

```js
import { prepareImage } from "@othrys-blocks/media-image-prep";

const result = await prepareImage(file, {
  operations: ["square"],
  config: {
    size: 800,
    subjectFill: 0.86,
    fill: "#ffffff",
    jpegQuality: 0.88,
    alphaThreshold: 20,
  },
});
// result.blob is image/jpeg
```

## What it does not do

Uploads, consent, storage, Supabase, catalog, marketplace, identity, auth, scan workflow, URLs, secrets. Background removal is **not** in the core (host may run `@imgly` / remove.bg *before* calling this).

## Runtime

Browser `CanvasRenderingContext2D` + `Image` + `FileReader` + `canvas.toBlob`.  
Node / jsdom without those APIs: throws `canvas_unavailable`. That is not a pass.

## Consumption

Local origin proof only:

```
"@othrys-blocks/media-image-prep": "file:../othrys-blocks/blocks/media/image-prep"
```

Requires the consumer to sit as a sibling of `othrys-blocks` under `Projects/`. Publishing to npm / GitHub Packages is **not** authorised. This `file:` path is not the final distribution architecture.

## Tests

```
npm test
```

Node contract tests + Playwright Chromium raster tests. Fixtures are generated in-page (Canvas fillRect). No remote images.

See `BLOCK.md`.
