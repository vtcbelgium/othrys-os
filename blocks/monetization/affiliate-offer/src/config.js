/**
 * Config is not Block identity. Campaign / rotation / tool / category / host
 * belong to host attribution or the selected Bridge. Core only names the
 * capability, Port, and disclosure semantics.
 */

export const BLOCK_ID = "block.monetization.affiliate-offer";
export const BLOCK_VERSION = "0.1.0";

/** Documentation Port name only. No Port Registry. */
export const PORT = "monetization.affiliate.offer@1";

export const OP = Object.freeze({
  construct: "construct",
});

/** Semantic rel hints for monetised offers. Host joins them. Do not own "#ad" copy. */
export const REL_HINTS = Object.freeze(["noopener", "noreferrer", "sponsored"]);

export const LISTING_INTENTS = Object.freeze(["active", "sold"]);

/** Opaque placement tokens. Origin uses wiki-buy, cat-grid, healthcheck, etc. */
export const PLACEMENT_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

/** eBay Partner Network campaign ids are numeric. Host CI used /^\d{6,}$/. */
export const CAMPAIGN_ID_PATTERN = /^\d{6,}$/;
