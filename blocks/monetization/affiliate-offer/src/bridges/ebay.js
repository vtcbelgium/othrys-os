/**
 * eBay Partner Network Bridge for block.monetization.affiliate-offer.
 *
 * This is provider logic, not Block identity. Do not import this module from
 * a host — hosts call constructAffiliateOffer with providerId "ebay-epn".
 *
 * Bridge owns: hostname, search path, query encoding, EPN parameter names,
 * sold-listing flags, protocol constants (mkevt/mkcid), rotation/tool defaults.
 * Host owns: campaignId, placementId, categoryId, optional rotation/tool/host override.
 */

import { AffiliateOfferError, ERROR_CODES } from "../errors.js";
import { CAMPAIGN_ID_PATTERN } from "../config.js";

export const EBAY_PROVIDER_ID = "ebay-epn";

/** Generic EPN protocol / site defaults. Not VTC identity. */
export const EBAY_BRIDGE_DEFAULTS = Object.freeze({
  marketplaceHost: "www.ebay.com",
  searchPath: "/sch/i.html",
  rotationId: "711-53200-19255-0",
  toolId: "10001",
  mkevt: "1",
  mkcid: "1",
  allowedHosts: Object.freeze(["www.ebay.com"]),
});

const SAFE_ID = /^[A-Za-z0-9._:-]+$/;

/**
 * @param {{ query: string, listingIntent?: string, placementId?: string }} request
 * @param {{ campaignId?: string, rotationId?: string, toolId?: string, categoryId?: string, marketplaceHost?: string }} attribution
 * @returns {{ href: string, providerId: string }}
 */
export function buildEbayOffer(request, attribution) {
  const campaignId = attribution && attribution.campaignId != null
    ? String(attribution.campaignId).trim()
    : "";
  if (!campaignId) {
    throw new AffiliateOfferError(
      ERROR_CODES.missing_attribution_config,
      "eBay Bridge requires host attribution.campaignId (EPN campid).",
    );
  }
  if (!CAMPAIGN_ID_PATTERN.test(campaignId)) {
    throw new AffiliateOfferError(
      ERROR_CODES.invalid_provider_config,
      "eBay campaignId must be a numeric EPN campaign id (6+ digits).",
    );
  }

  const rotationId = pickOverride(
    attribution.rotationId,
    EBAY_BRIDGE_DEFAULTS.rotationId,
    "rotationId",
  );
  const toolId = pickOverride(attribution.toolId, EBAY_BRIDGE_DEFAULTS.toolId, "toolId");
  const host = pickOverride(
    attribution.marketplaceHost,
    EBAY_BRIDGE_DEFAULTS.marketplaceHost,
    "marketplaceHost",
  );
  if (!EBAY_BRIDGE_DEFAULTS.allowedHosts.includes(host)) {
    throw new AffiliateOfferError(
      ERROR_CODES.unsafe_url,
      "eBay marketplaceHost is not in the Bridge allowlist.",
    );
  }

  const categoryId =
    attribution.categoryId == null || String(attribution.categoryId).trim() === ""
      ? ""
      : String(attribution.categoryId).trim();
  if (categoryId && !SAFE_ID.test(categoryId)) {
    throw new AffiliateOfferError(
      ERROR_CODES.invalid_provider_config,
      "eBay categoryId contains unsupported characters.",
    );
  }

  const intent = request.listingIntent || "active";
  if (intent !== "active" && intent !== "sold") {
    throw new AffiliateOfferError(
      ERROR_CODES.invalid_request,
      `eBay Bridge does not support listingIntent "${intent}".`,
    );
  }

  const q = encodeURIComponent(request.query);
  const soldParams = intent === "sold" ? "&LH_Sold=1&LH_Complete=1" : "";
  const categoryParam = categoryId ? `&_sacat=${encodeURIComponent(categoryId)}` : "";
  const placement = request.placementId
    ? `&customid=${encodeURIComponent(request.placementId)}`
    : "";
  const href =
    `https://${host}${EBAY_BRIDGE_DEFAULTS.searchPath}?_nkw=${q}${categoryParam}${soldParams}` +
    `&mkevt=${EBAY_BRIDGE_DEFAULTS.mkevt}&mkcid=${EBAY_BRIDGE_DEFAULTS.mkcid}` +
    `&mkrid=${encodeURIComponent(rotationId)}&campid=${encodeURIComponent(campaignId)}` +
    `&toolid=${encodeURIComponent(toolId)}${placement}`;

  return { href, providerId: EBAY_PROVIDER_ID };
}

function pickOverride(value, fallback, field) {
  if (value == null || String(value).trim() === "") return fallback;
  const next = String(value).trim();
  if (field === "marketplaceHost") {
    if (!/^[A-Za-z0-9.-]+$/.test(next)) {
      throw new AffiliateOfferError(
        ERROR_CODES.invalid_provider_config,
        "eBay marketplaceHost is malformed.",
      );
    }
    return next.toLowerCase();
  }
  if (!SAFE_ID.test(next)) {
    throw new AffiliateOfferError(
      ERROR_CODES.invalid_provider_config,
      `eBay ${field} contains unsupported characters.`,
    );
  }
  return next;
}
