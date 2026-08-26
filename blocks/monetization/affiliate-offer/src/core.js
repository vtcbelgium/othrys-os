/**
 * Provider-neutral construct path.
 *
 * Known Bridges are a static dispatch table of proven adapters (currently one).
 * This is not a provider registry, loader, plugin host, or config database.
 */

import { AffiliateOfferError, ERROR_CODES } from "./errors.js";
import {
  BLOCK_ID,
  LISTING_INTENTS,
  PLACEMENT_ID_PATTERN,
  REL_HINTS,
} from "./config.js";
import { buildEbayOffer, EBAY_PROVIDER_ID, EBAY_BRIDGE_DEFAULTS } from "./bridges/ebay.js";

const BRIDGES = Object.freeze({
  [EBAY_PROVIDER_ID]: buildEbayOffer,
});

const ALLOWED_HOSTS_BY_PROVIDER = Object.freeze({
  [EBAY_PROVIDER_ID]: EBAY_BRIDGE_DEFAULTS.allowedHosts,
});

/**
 * Construct a truthful monetisable outbound marketplace offer.
 *
 * @param {{ query: string, providerId: string, listingIntent?: string, placementId?: string }} request
 * @param {{ attribution?: object }} [options]
 * @returns {Readonly<{
 *   href: string,
 *   providerId: string,
 *   monetized: true,
 *   disclosureRequired: true,
 *   relHints: readonly string[],
 *   placementId: string | null,
 *   listingIntent: string,
 *   configurationStatus: "ok",
 *   blockId: string,
 * }>}
 */
export function constructAffiliateOffer(request, options = {}) {
  const req = validateRequest(request);
  const attribution = options && typeof options === "object" ? options.attribution : undefined;

  const bridge = BRIDGES[req.providerId];
  if (!bridge) {
    throw new AffiliateOfferError(
      ERROR_CODES.unknown_provider,
      `No proven Bridge for providerId "${req.providerId}".`,
    );
  }

  if (!attribution || typeof attribution !== "object") {
    throw new AffiliateOfferError(
      ERROR_CODES.missing_attribution_config,
      "Host attribution config is required. The Block will not guess a campaign or emit a fake monetised URL.",
    );
  }

  const built = bridge(req, attribution);
  const href = assertSafeHref(built.href, req.providerId);

  return Object.freeze({
    href,
    providerId: req.providerId,
    monetized: true,
    disclosureRequired: true,
    relHints: REL_HINTS,
    placementId: req.placementId,
    listingIntent: req.listingIntent,
    configurationStatus: "ok",
    blockId: BLOCK_ID,
  });
}

function validateRequest(request) {
  if (!request || typeof request !== "object") {
    throw new AffiliateOfferError(ERROR_CODES.invalid_request, "Request must be an object.");
  }
  if (typeof request.query !== "string") {
    throw new AffiliateOfferError(ERROR_CODES.invalid_request, "query must be a string.");
  }
  const query = request.query.trim();
  if (!query) {
    throw new AffiliateOfferError(ERROR_CODES.invalid_request, "query must be a non-empty string.");
  }
  if (typeof request.providerId !== "string" || !request.providerId.trim()) {
    throw new AffiliateOfferError(
      ERROR_CODES.invalid_request,
      "providerId is required. The Block will not guess a merchant.",
    );
  }
  const listingIntent = request.listingIntent == null || request.listingIntent === ""
    ? "active"
    : String(request.listingIntent);
  if (!LISTING_INTENTS.includes(listingIntent)) {
    throw new AffiliateOfferError(
      ERROR_CODES.invalid_request,
      `listingIntent must be one of: ${LISTING_INTENTS.join(", ")}.`,
    );
  }
  let placementId = null;
  if (request.placementId != null && String(request.placementId).trim() !== "") {
    placementId = String(request.placementId).trim();
    if (!PLACEMENT_ID_PATTERN.test(placementId)) {
      throw new AffiliateOfferError(
        ERROR_CODES.invalid_request,
        "placementId must match [A-Za-z0-9._:-]+. Do not pass PII.",
      );
    }
  }
  return {
    query,
    providerId: request.providerId.trim(),
    listingIntent,
    placementId,
  };
}

function assertSafeHref(href, providerId) {
  if (typeof href !== "string" || !href) {
    throw new AffiliateOfferError(ERROR_CODES.unsafe_url, "Bridge returned an empty href.");
  }
  const lower = href.trim().toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("http:")
  ) {
    throw new AffiliateOfferError(ERROR_CODES.unsafe_url, "href uses a refused protocol.");
  }
  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    throw new AffiliateOfferError(ERROR_CODES.unsafe_url, "href is not a valid URL.");
  }
  if (parsed.protocol !== "https:") {
    throw new AffiliateOfferError(ERROR_CODES.unsafe_url, "href must be https.");
  }
  const allowed = ALLOWED_HOSTS_BY_PROVIDER[providerId] || [];
  if (!allowed.includes(parsed.hostname)) {
    throw new AffiliateOfferError(
      ERROR_CODES.unsafe_url,
      "href hostname is not in the selected Bridge allowlist.",
    );
  }
  if (parsed.username || parsed.password) {
    throw new AffiliateOfferError(ERROR_CODES.unsafe_url, "href must not include credentials.");
  }
  return href;
}
