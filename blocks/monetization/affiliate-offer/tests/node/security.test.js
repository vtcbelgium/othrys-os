import { test } from "node:test";
import assert from "node:assert/strict";
import {
  constructAffiliateOffer,
  AffiliateOfferError,
  ERROR_CODES,
  EBAY_PROVIDER_ID,
} from "../../src/index.js";

const ATTR = { campaignId: "5339157657", categoryId: "220" };

test("javascript:, data:, file:, http: never appear in a successful href", () => {
  const offer = constructAffiliateOffer(
    { query: "Bumblebee", providerId: EBAY_PROVIDER_ID },
    { attribution: ATTR },
  );
  const lower = offer.href.toLowerCase();
  assert.equal(lower.startsWith("https:"), true);
  assert.equal(lower.includes("javascript:"), false);
  assert.equal(lower.includes("data:"), false);
  assert.equal(lower.includes("file:"), false);
});

test("placement breakout characters are refused before URL build", () => {
  assert.throws(
    () =>
      constructAffiliateOffer(
        { query: "Bumblebee", providerId: EBAY_PROVIDER_ID, placementId: "wiki&campid=1" },
        { attribution: ATTR },
      ),
    (err) => err instanceof AffiliateOfferError && err.code === ERROR_CODES.invalid_request,
  );
});

test("spaces in placement are refused (must be encoded tokens, not raw text)", () => {
  assert.throws(
    () =>
      constructAffiliateOffer(
        { query: "Bumblebee", providerId: EBAY_PROVIDER_ID, placementId: "wiki buy" },
        { attribution: ATTR },
      ),
    (err) => err.code === ERROR_CODES.invalid_request,
  );
});
