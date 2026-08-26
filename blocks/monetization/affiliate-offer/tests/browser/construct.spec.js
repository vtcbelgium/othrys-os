import { test, expect } from "@playwright/test";

test("harness exposes canonical Block identity and construct", async ({ page }) => {
  await page.goto("http://127.0.0.1:4178/");
  await page.waitForFunction(() => window.__affiliateOfferReady === true);
  const id = await page.evaluate(() => window.BLOCK_ID);
  expect(id).toBe("block.monetization.affiliate-offer");

  const result = await page.evaluate(async () => {
    const offer = window.constructAffiliateOffer(
      {
        query: "Test Figure Test Line",
        providerId: window.EBAY_PROVIDER_ID,
        listingIntent: "sold",
        placementId: "healthcheck",
      },
      { attribution: { campaignId: "5339157657", categoryId: "220" } },
    );
    return {
      href: offer.href,
      monetized: offer.monetized,
      disclosureRequired: offer.disclosureRequired,
      relHints: [...offer.relHints],
    };
  });
  expect(result.monetized).toBe(true);
  expect(result.disclosureRequired).toBe(true);
  expect(result.relHints).toContain("sponsored");
  expect(result.href).toContain("campid=5339157657");
  expect(result.href.startsWith("https://www.ebay.com/")).toBe(true);
});

test("browser construct fails closed without attribution", async ({ page }) => {
  await page.goto("http://127.0.0.1:4178/");
  await page.waitForFunction(() => window.__affiliateOfferReady === true);
  const code = await page.evaluate(() => {
    try {
      window.constructAffiliateOffer(
        { query: "Optimus", providerId: window.EBAY_PROVIDER_ID },
        { attribution: {} },
      );
      return "NO_THROW";
    } catch (err) {
      return err.code;
    }
  });
  expect(code).toBe("missing_attribution_config");
});
