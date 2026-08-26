# block.monetization.affiliate-offer

Canonical implementation of **`block.monetization.affiliate-offer`**.

Package: `@othrys-blocks/monetization-affiliate-offer` `0.1.0`  
Filesystem: `blocks/monetization/affiliate-offer`  
Visibility: **PRODUCT**  
Maturity: **REUSABLE** (origin VTC + `oros-affiliate-offer-transplant`). Not CERTIFIED. Not GOLDEN.

## What it does

Construct a truthful, provider-backed, monetisable outbound marketplace offer.

```js
import { constructAffiliateOffer, EBAY_PROVIDER_ID } from "@othrys-blocks/monetization-affiliate-offer";

const offer = constructAffiliateOffer(
  {
    query: "Optimus Prime G1",
    providerId: EBAY_PROVIDER_ID,
    listingIntent: "sold",
    placementId: "wiki-sold",
  },
  {
    attribution: {
      campaignId: "YOUR_EPN_CAMPID",
      categoryId: "220",
    },
  },
);
// offer.href — host renders <a>
// offer.monetized / offer.disclosureRequired — host must disclose
// offer.relHints — join into rel="noopener noreferrer sponsored"
```

The Block does not navigate, scrape listings, settle commissions, or prove revenue. Offer construction is not a click and not earnings.

## What it does not do

Click tracking, conversion tracking, analytics, pixels, cookies, revenue, ads, inventory, eBay Browse/price API, Catawiki, disclosure copy (`#ad`), VTC UI, provider registry, config database, runtime loader.

## Provider model

Core is provider-neutral. **eBay Partner Network** is a Bridge (`providerId: "ebay-epn"`), not the Block name.

Catawiki is **not** a proven Bridge.

## Fail closed

Missing campaign / unknown provider / unsafe URL / invalid request → typed `AffiliateOfferError`. No silent plain-eBay fallback claiming `monetized: true`. No guessed campid.

## Runtime

Browser and Node. No DOM. No network during construct.

## Consumption

Local origin / transplant proof only:

```
"@othrys-blocks/monetization-affiliate-offer": "file:../othrys-blocks/blocks/monetization/affiliate-offer"
```

Second consumer (`oros-affiliate-offer-transplant`):

```
"@othrys-blocks/monetization-affiliate-offer": "file:../../othrys-blocks/blocks/monetization/affiliate-offer"
```

Requires the consumer to sit under `Projects/` so the relative `file:` path reaches this directory. Publishing is **not** authorised. REUSABLE here is two local Oroi, not remote distribution.

## Tests

```
npm test
```

Node contract + eBay Bridge + security + privacy tests, plus Playwright Chromium disclosure/construct checks.

See `BLOCK.md`.
