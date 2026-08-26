import { test } from "node:test";
import assert from "node:assert/strict";
import {
  constructAffiliateOffer,
  AffiliateOfferError,
  ERROR_CODES,
  BLOCK_ID,
  PORT,
  REL_HINTS,
  EBAY_PROVIDER_ID,
} from "../../src/index.js";

const ATTR = Object.freeze({
  campaignId: "5339157657",
  categoryId: "220",
});

const VALID = Object.freeze({
  query: "Test Figure Test Line",
  providerId: EBAY_PROVIDER_ID,
  listingIntent: "sold",
  placementId: "healthcheck",
});

function expectError(fn, code) {
  assert.throws(fn, (err) => {
    assert.ok(err instanceof AffiliateOfferError);
    assert.equal(err.code, code);
    return true;
  });
}

test("BLOCK_ID and Port are the canonical identities", () => {
  assert.equal(BLOCK_ID, "block.monetization.affiliate-offer");
  assert.equal(PORT, "monetization.affiliate.offer@1");
});

test("valid request returns a frozen monetised offer", () => {
  const offer = constructAffiliateOffer(VALID, { attribution: ATTR });
  assert.equal(offer.monetized, true);
  assert.equal(offer.disclosureRequired, true);
  assert.equal(offer.providerId, EBAY_PROVIDER_ID);
  assert.equal(offer.placementId, "healthcheck");
  assert.equal(offer.listingIntent, "sold");
  assert.equal(offer.configurationStatus, "ok");
  assert.equal(offer.blockId, BLOCK_ID);
  assert.deepEqual([...offer.relHints], [...REL_HINTS]);
  assert.ok(offer.relHints.includes("sponsored"));
  assert.ok(offer.href.startsWith("https://www.ebay.com/sch/i.html?"));
  assert.equal(Object.isFrozen(offer), true);
  assert.equal("clickId" in offer, false);
  assert.equal("conversionId" in offer, false);
  assert.equal("commission" in offer, false);
  assert.equal("revenue" in offer, false);
  assert.equal("earnings" in offer, false);
  assert.equal("campid" in offer, false);
  assert.equal("mkrid" in offer, false);
});

test("missing providerId is invalid_request, not a guessed eBay URL", () => {
  expectError(
    () => constructAffiliateOffer({ query: "Optimus Prime" }, { attribution: ATTR }),
    ERROR_CODES.invalid_request,
  );
});

test("unknown providerId is unknown_provider", () => {
  expectError(
    () =>
      constructAffiliateOffer(
        { query: "Optimus Prime", providerId: "catawiki-partnerize" },
        { attribution: ATTR },
      ),
    ERROR_CODES.unknown_provider,
  );
});

test("missing attribution config fails closed with no monetised href", () => {
  expectError(
    () => constructAffiliateOffer({ query: "Optimus Prime", providerId: EBAY_PROVIDER_ID }),
    ERROR_CODES.missing_attribution_config,
  );
  expectError(
    () =>
      constructAffiliateOffer(
        { query: "Optimus Prime", providerId: EBAY_PROVIDER_ID },
        { attribution: {} },
      ),
    ERROR_CODES.missing_attribution_config,
  );
});

test("empty campaignId fails closed", () => {
  expectError(
    () =>
      constructAffiliateOffer(
        { query: "Optimus Prime", providerId: EBAY_PROVIDER_ID },
        { attribution: { campaignId: "" } },
      ),
    ERROR_CODES.missing_attribution_config,
  );
});

test("invalid request: empty query", () => {
  expectError(
    () =>
      constructAffiliateOffer(
        { query: "   ", providerId: EBAY_PROVIDER_ID },
        { attribution: ATTR },
      ),
    ERROR_CODES.invalid_request,
  );
});

test("invalid request: bad listingIntent", () => {
  expectError(
    () =>
      constructAffiliateOffer(
        { query: "Optimus Prime", providerId: EBAY_PROVIDER_ID, listingIntent: "auction" },
        { attribution: ATTR },
      ),
    ERROR_CODES.invalid_request,
  );
});

test("placementId is echoed and encoded; absent placement is still valid", () => {
  const withPlacement = constructAffiliateOffer(
    { query: "Starscream", providerId: EBAY_PROVIDER_ID, placementId: "wiki-buy" },
    { attribution: ATTR },
  );
  assert.equal(withPlacement.placementId, "wiki-buy");
  assert.match(withPlacement.href, /customid=wiki-buy/);

  const without = constructAffiliateOffer(
    { query: "Starscream", providerId: EBAY_PROVIDER_ID },
    { attribution: ATTR },
  );
  assert.equal(without.placementId, null);
  assert.equal(without.href.includes("customid="), false);
  assert.equal(without.monetized, true);
});

test("construct does not mutate the request object", () => {
  const request = {
    query: "Soundwave",
    providerId: EBAY_PROVIDER_ID,
    listingIntent: "active",
    placementId: "db-buy",
  };
  const snapshot = JSON.stringify(request);
  constructAffiliateOffer(request, { attribution: { ...ATTR } });
  assert.equal(JSON.stringify(request), snapshot);
});
