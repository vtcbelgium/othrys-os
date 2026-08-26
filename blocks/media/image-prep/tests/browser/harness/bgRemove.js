/**
 * VTC host stub for the origin-proof harness.
 * Core Block must not import @imgly. The real VTC bgRemove.js stays in VTC.
 * This stub preserves "bg-remove skipped / identity" so toWhiteSquare can load.
 */
export async function removeBackground(fileOrBlob) {
  return fileOrBlob;
}
