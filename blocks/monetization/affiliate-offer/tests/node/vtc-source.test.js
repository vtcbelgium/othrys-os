import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const blockRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const vtcRoot = path.resolve(blockRoot, "..", "..", "..", "..", "vtc-block-affiliate-extract-001");

const CALLERS = [
  "src/components/MarketLinks.jsx",
  "src/components/BlogFigureStrip.jsx",
  "src/components/MarketValue.jsx",
  "src/tabs/WishlistTab.jsx",
  "src/tabs/DatabaseTab.jsx",
  "src/tabs/MarketplaceTab.jsx",
];

test("VTC origin worktree: no independent ebaySearchUrl algorithm remains", (t) => {
  if (!fs.existsSync(path.join(vtcRoot, "src"))) {
    t.skip("VTC extraction worktree not present beside othrys-blocks");
    return;
  }
  assert.equal(fs.existsSync(path.join(vtcRoot, "src", "affiliate.js")), false);
  const srcRoot = path.join(vtcRoot, "src");
  const hits = [];
  walk(srcRoot, (file, text) => {
    if (file.endsWith("affiliateConfig.js")) return;
    if (/\bebaySearchUrl\b/.test(text)) hits.push(file);
    if (/www\.ebay\.com\/sch\/i\.html/.test(text)) hits.push(file);
  });
  assert.deepEqual(hits, []);
});

test("every migrated VTC monetized caller uses host disclosure + Block glue", (t) => {
  if (!fs.existsSync(path.join(vtcRoot, "src"))) {
    t.skip("VTC extraction worktree not present beside othrys-blocks");
    return;
  }
  for (const rel of CALLERS) {
    const text = fs.readFileSync(path.join(vtcRoot, rel), "utf8");
    assert.match(text, /EbayAffiliateAnchor/, `${rel} must render via EbayAffiliateAnchor`);
    assert.match(text, /AffiliateNote/, `${rel} must show AffiliateNote`);
    assert.equal(/\bebaySearchUrl\b/.test(text), false, `${rel} must not call ebaySearchUrl`);
  }
  const check = fs.readFileSync(path.join(vtcRoot, "scripts", "check-affiliate.mjs"), "utf8");
  assert.match(check, /@othrys-blocks\/monetization-affiliate-offer/);
  assert.equal(/www\.ebay\.com\/sch/.test(check), false);
});

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (/\.(js|jsx|mjs)$/.test(entry.name)) {
      visit(full, fs.readFileSync(full, "utf8"));
    }
  }
}
