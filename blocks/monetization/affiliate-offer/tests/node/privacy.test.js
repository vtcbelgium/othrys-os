import { test } from "node:test";
import assert from "node:assert/strict";
import { constructAffiliateOffer, EBAY_PROVIDER_ID } from "../../src/index.js";

test("construct writes no cookies, localStorage, fetch, or files", () => {
  const calls = [];
  const track = (name) => (...args) => {
    calls.push(name);
    return args;
  };

  const ls = {
    getItem: track("localStorage.getItem"),
    setItem: track("localStorage.setItem"),
    removeItem: track("localStorage.removeItem"),
  };
  const cookieDesc = Object.getOwnPropertyDescriptor(globalThis, "cookie");
  const hadFetch = "fetch" in globalThis;
  const origFetch = globalThis.fetch;
  const hadLS = "localStorage" in globalThis;
  const origLS = globalThis.localStorage;

  globalThis.localStorage = ls;
  globalThis.fetch = track("fetch");
  Object.defineProperty(globalThis, "cookie", {
    configurable: true,
    get: () => {
      calls.push("cookie.get");
      return "";
    },
    set: () => {
      calls.push("cookie.set");
    },
  });

  try {
    constructAffiliateOffer(
      { query: "public catalog term", providerId: EBAY_PROVIDER_ID, placementId: "wiki-buy" },
      { attribution: { campaignId: "5339157657", categoryId: "220" } },
    );
    assert.deepEqual(calls, []);
  } finally {
    if (hadFetch) globalThis.fetch = origFetch;
    else delete globalThis.fetch;
    if (hadLS) globalThis.localStorage = origLS;
    else delete globalThis.localStorage;
    if (cookieDesc) Object.defineProperty(globalThis, "cookie", cookieDesc);
    else delete globalThis.cookie;
  }
});

test("construct does not require user identity fields", () => {
  const offer = constructAffiliateOffer(
    { query: "public catalog term", providerId: EBAY_PROVIDER_ID },
    { attribution: { campaignId: "5339157657" } },
  );
  assert.equal(offer.monetized, true);
  assert.equal("userId" in offer, false);
  assert.equal("email" in offer, false);
});
