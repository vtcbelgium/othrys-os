/**
 * Config is not Block identity. Origin VTC catalog-tile values are documented
 * defaults so a caller can omit config and still get that proven compose.
 * Consumers SHOULD pass explicit values for product-specific knobs.
 *
 * Classification (VTC-BLOCK-EXTRACT-001R):
 *   size 800            — B VTC product config (capability default for square)
 *   subjectFill 0.86    — B VTC product config
 *   fill #ffffff        — B VTC product config (not universal; downscale fill is optional)
 *   jpegQuality 0.88    — B VTC product config (origin also uses 0.85 on other paths)
 *   alphaThreshold 20   — A capability default for opaque-bbox trim
 *   longEdge 1200       — B VTC product config (800 is catalog-quick, also B)
 *   upscale false       — C implementation detail of downscale (origin compressImage)
 */

export const BLOCK_ID = "block.media.image-prep";
export const BLOCK_VERSION = "0.1.1";

/** Capability defaults. Overridable via options.config. */
export const CAPABILITY_DEFAULTS = Object.freeze({
  longEdge: 1200,
  size: 800,
  fill: "#ffffff",
  subjectFill: 0.86,
  jpegQuality: 0.88,
  alphaThreshold: 20,
  upscale: false,
});

/**
 * Named profiles matching origin VTC sites. Optional convenience, not a registry.
 * Hosts may ignore profiles and pass operations + config directly.
 */
export const PROFILES = Object.freeze({
  "catalog-tile": Object.freeze({
    operations: Object.freeze(["square"]),
    size: 800,
    subjectFill: 0.86,
    fill: "#ffffff",
    jpegQuality: 0.88,
    alphaThreshold: 20,
  }),
  "catalog-quick": Object.freeze({
    operations: Object.freeze(["downscale"]),
    longEdge: 800,
    fill: "#ffffff",
    jpegQuality: 0.88,
    upscale: false,
  }),
  "upload-1200": Object.freeze({
    operations: Object.freeze(["downscale"]),
    longEdge: 1200,
    jpegQuality: 0.85,
    upscale: false,
  }),
  "avatar-reencode": Object.freeze({
    operations: Object.freeze(["normalize.jpeg"]),
    jpegQuality: 0.85,
  }),
});

export const OP = Object.freeze({
  downscale: "prepare.downscale",
  jpeg: "prepare.normalize.jpeg",
  square: "prepare.square",
});
