/**
 * Canonical identifiers, limits, and schema constants for block.analytics.visit-tracking.
 */

export const BLOCK_ID = "block.analytics.visit-tracking";
export const BLOCK_VERSION = "0.1.1";

/** Illustrative Port contract name. No Port Registry. */
export const PORT = "analytics.visit_ingest@1";

export const OP = Object.freeze({
  ingest: "ingest",
});

export const SCHEMA_VERSION = "visit-record@1";

export const LIMITS = Object.freeze({
  maxPathLength: 200,
  maxReferrerHostLength: 100,
  hashLengthHex: 64,
});
