import { test } from "node:test";
import assert from "node:assert/strict";
import {
  constructAffiliateOffer,
  AffiliateOfferError,
  ERROR_CODES,
  EBAY_PROVIDER_ID,
} from "../../src/index.js";

const ATTR = Object.freeze({
  campaignId: "5339157657",
  categoryId: "220",
});

function urlOf(query, extra = {}, attribution = ATTR) {
  return constructAffiliateOffer(
    { query, providerId: EBAY_PROVIDER_ID, ...extra },
    { attribution },
  );
}

test("eBay href is https www.ebay.com search path", () => {
  const offer = urlOf("Test Figure Test Line");
  const u = new URL(offer.href);
  assert.equal(u.protocol, "https:");
  assert.equal(u.hostname, "www.ebay.com");
  assert.equal(u.pathname, "/sch/i.html");
});

test("query is encodeURIComponent, not raw concatenation", () => {
  const offer = urlOf("Test Figure Test Line");
  assert.ok(offer.href.includes(`_nkw=${encodeURIComponent("Test Figure Test Line")}`));
  assert.equal(offer.href.includes("Test Figure Test Line"), false);
  const unicode = urlOf("Optimus Prime 超");
  assert.ok(unicode.href.includes(encodeURIComponent("Optimus Prime 超")));
});

test("campid maps from host attribution, not a guessed id", () => {
  const offer = urlOf("Megatron", {}, { campaignId: "999888777", categoryId: "220" });
  assert.ok(offer.href.includes("campid=999888777"));
  assert.equal(offer.href.includes("5339157657"), false);
});

test("mkrid and toolid use Bridge defaults when host omits them", () => {
  const offer = urlOf("Megatron");
  assert.ok(offer.href.includes("mkrid=711-53200-19255-0"));
  assert.ok(offer.href.includes("toolid=10001"));
  assert.ok(offer.href.includes("mkevt=1"));
  assert.ok(offer.href.includes("mkcid=1"));
});

test("host may override mkrid and toolid", () => {
  const offer = urlOf(
    "Megatron",
    {},
    { campaignId: "5339157657", rotationId: "711-53200-19255-1", toolId: "10002" },
  );
  assert.ok(offer.href.includes("mkrid=711-53200-19255-1"));
  assert.ok(offer.href.includes("toolid=10002"));
});

test("placement becomes encoded customid", () => {
  const offer = urlOf("Jazz", { placementId: "wiki-sold" });
  assert.ok(offer.href.includes("customid=wiki-sold"));
});

test("listingIntent=sold adds LH_Sold and LH_Complete", () => {
  const sold = urlOf("Jazz", { listingIntent: "sold" });
  assert.ok(sold.href.includes("LH_Sold=1"));
  assert.ok(sold.href.includes("LH_Complete=1"));
  const active = urlOf("Jazz", { listingIntent: "active" });
  assert.equal(active.href.includes("LH_Sold="), false);
  assert.equal(active.href.includes("LH_Complete="), false);
});

test("malformed campaign id is invalid_provider_config", () => {
  assert.throws(
    () => urlOf("Jazz", {}, { campaignId: "not-a-campaign" }),
    (err) => err instanceof AffiliateOfferError && err.code === ERROR_CODES.invalid_provider_config,
  );
});

test("origin-equivalent URL for VTC sample (sold + healthcheck + sacat 220)", () => {
  const offer = urlOf("Test Figure Test Line", {
    listingIntent: "sold",
    placementId: "healthcheck",
  });
  const expected =
    "https://www.ebay.com/sch/i.html?_nkw=Test%20Figure%20Test%20Line&_sacat=220" +
    "&LH_Sold=1&LH_Complete=1&mkevt=1&mkcid=1&mkrid=711-53200-19255-0" +
    "&campid=5339157657&toolid=10001&customid=healthcheck";
  assert.equal(offer.href, expected);
});

test("arbitrary marketplaceHost is refused", () => {
  assert.throws(
    () =>
      urlOf("Jazz", {}, { campaignId: "5339157657", marketplaceHost: "evil.example" }),
    (err) => err instanceof AffiliateOfferError && err.code === ERROR_CODES.unsafe_url,
  );
});
