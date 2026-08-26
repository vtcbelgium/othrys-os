import { test, expect } from "@playwright/test";

const ORIGIN_SOLD_HEALTHCHECK =
  "https://www.ebay.com/sch/i.html?_nkw=Test%20Figure%20Test%20Line&_sacat=220" +
  "&LH_Sold=1&LH_Complete=1&mkevt=1&mkcid=1&mkrid=711-53200-19255-0" +
  "&campid=5339157657&toolid=10001&customid=healthcheck";

async function inspectFixture(page, fixture) {
  const root = page.locator(`[data-fixture="${fixture}"]`);
  await expect(root).toBeVisible();
  const link = root.locator("a[data-affiliate-offer='true']").first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  const rel = (await link.getAttribute("rel")) || "";
  const disclosure = root.locator("[data-affiliate-disclosure='true']");
  await expect(disclosure).toBeVisible();
  const text = (await disclosure.innerText()).toLowerCase();
  return { href, rel, text };
}

test("MarketLinks wiki placement discloses and uses sponsored rel", async ({ page }) => {
  await page.goto("http://127.0.0.1:4188/");
  const { href, rel, text } = await inspectFixture(page, "market-links");
  expect(href).toContain("campid=5339157657");
  expect(href).toContain("customid=wiki-sold");
  expect(href).toContain("mkrid=711-53200-19255-0");
  expect(href).toContain("toolid=10001");
  expect(href.startsWith("https://www.ebay.com/")).toBe(true);
  expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer", "sponsored"]));
  expect(text).toMatch(/affiliate/);
  expect(await page.locator("[data-fixture='market-links'] a[data-affiliate-offer='true']").count()).toBe(2);
});

test("Wishlist-type placement discloses", async ({ page }) => {
  await page.goto("http://127.0.0.1:4188/");
  const { href, rel, text } = await inspectFixture(page, "wishlist");
  expect(href).toContain("customid=wishlist");
  expect(href).toContain("campid=5339157657");
  expect(rel).toContain("sponsored");
  expect(text).toMatch(/affiliate|#ad/);
});

test("Database cat-grid-type placement discloses", async ({ page }) => {
  await page.goto("http://127.0.0.1:4188/");
  const { href, rel } = await inspectFixture(page, "cat-grid");
  expect(href).toContain("customid=cat-grid");
  expect(rel).toContain("sponsored");
});

test("BlogFigureStrip-type placement keeps disclosed sponsored link", async ({ page }) => {
  await page.goto("http://127.0.0.1:4188/");
  const { href, rel, text } = await inspectFixture(page, "blog");
  expect(href).toContain("customid=blog-buy");
  expect(rel).toContain("sponsored");
  expect(rel).toContain("nofollow");
  expect(text).toMatch(/affiliate/);
});

test("links remain navigable descriptors; do not click out to eBay", async ({ page }) => {
  await page.goto("http://127.0.0.1:4188/");
  const href = await page.locator("a[data-affiliate-offer='true']").first().getAttribute("href");
  expect(href).toBeTruthy();
  const u = new URL(href);
  expect(u.protocol).toBe("https:");
  expect(u.hostname).toBe("www.ebay.com");
  expect(u.pathname).toBe("/sch/i.html");
});

test("pre/post origin-equivalent sold+healthcheck URL", async ({ page }) => {
  await page.goto("http://127.0.0.1:4178/");
  await page.waitForFunction(() => window.__affiliateOfferReady === true);
  const href = await page.evaluate(() => {
    const offer = window.constructAffiliateOffer(
      {
        query: "Test Figure Test Line",
        providerId: window.EBAY_PROVIDER_ID,
        listingIntent: "sold",
        placementId: "healthcheck",
      },
      { attribution: { campaignId: "5339157657", categoryId: "220" } },
    );
    return offer.href;
  });
  expect(href).toBe(ORIGIN_SOLD_HEALTHCHECK);
});
