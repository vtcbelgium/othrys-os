# BLOCK.md — block.monetization.affiliate-offer

Documentation / evidence. Not a runtime schema. Not CERTIFIED. Not GOLDEN.

## ID

`block.monetization.affiliate-offer`

## VERSION

`0.1.0`

## VISIBILITY

PRODUCT

## MATURITY

REUSABLE (BLOCK-002-TRANSPLANT-001). Origin VTC + second consumer `oros-affiliate-offer-transplant`. Not CERTIFIED. Not GOLDEN.

Package version remains **0.1.0**. Maturity is evidence, not a contract change (Book of Blocks §7 / §9). Implementation was not mutated for this promotion.

## PURPOSE

Construct a truthful, provider-backed, monetisable outbound marketplace offer from host commercial intent and attribution config, so an Oros can send a user to a merchant network without encoding that network into product identity. Host renders disclosure. Offer construction is not revenue evidence.

## PROVIDES

- Port `monetization.affiliate.offer@1` operation `construct`
- `constructAffiliateOffer(request, options) → AffiliateOffer`
- Normalized `AffiliateOffer`: `href`, `providerId`, `monetized`, `disclosureRequired`, `relHints`, `placementId`, `listingIntent`, `configurationStatus`
- Fail-closed typed errors: `missing_attribution_config`, `unknown_provider`, `unsafe_url`, `invalid_request`, `invalid_provider_config`

## OPERATIONS

One: `construct`. No click, convert, report, or render operations.

## REQUIRES

- Explicit provider Bridge (`providerId`). Absence is an error, not a guessed vendor.
- Host attribution config required by that Bridge (eBay: `campaignId`).
- Host UI that can render an `<a>` and visible disclosure when `disclosureRequired`.
- JS string / URL encoding runtime (browser or Node). No DOM for construct.

## OPTIONAL

- `listingIntent=sold` (eBay Bridge supports; unknown intents refuse).
- `placementId` (encoded onto eBay `customid` when present).
- Category / marketplace host / rotation / tool overrides on eBay Bridge config.
- Additional Bridges — **none proven besides eBay**.
- Host CI health check (origin `check-affiliate.mjs`).

## STATE OWNERSHIP

NONE. Stateless construct. No localStorage, cookies, files, DB, click tables, or conversion logs.

## RUNTIME

Proven: Node (construct + typed errors) and Chromium page (Playwright DOM inspection of host-rendered disclosure). No Canvas. Bridge does not require DOM.

## NETWORK

NONE during construction. User navigation after host render is not Block I/O. No eBay Partner Network HTTP APIs.

## SECRETS

NONE. Campaign ids are public host config, not credentials.

## PERMISSIONS

NONE. The Block cannot grant payments, catalog writes, or provider account access.

## CONFIG

Not identity.

| Knob | Origin value | Class |
| --- | --- | --- |
| campaignId / campid `5339157657` | VTC EPN campaign | **HOST CONFIG** |
| categoryId / `_sacat=220` | Toys & Hobbies | **HOST CONFIG** |
| placementId / customid | `wiki-buy`, `cat-grid`, … | **HOST CONFIG** |
| rotationId / mkrid `711-53200-19255-0` | EPN US Toys & Hobbies rotation | **BRIDGE DEFAULT** (host override allowed) |
| toolId `10001` | EPN custom-link tool | **BRIDGE DEFAULT** |
| mkevt / mkcid `1` / `1` | EPN protocol | **BRIDGE CONSTANT** |
| marketplaceHost `www.ebay.com` | origin hardcoded | **BRIDGE DEFAULT** (allowlist; no arbitrary redirect host) |

Do not hardcode VTC identity into Bridge defaults. The campid above is VTC's and lives in VTC host config.

## PROVIDER BOUNDARY

Core is provider-neutral. First Bridge: eBay Partner Network (`ebay-epn`) at `src/bridges/ebay.js`. Catawiki is **not** a proven Bridge. Known Bridges are a static dispatch table — not a registry, loader, or plugin host.

## DISCLOSURE CONTRACT

`monetized === true` ⇒ `disclosureRequired === true` and `relHints` include `sponsored` (plus `noopener`, `noreferrer`). Host owns visible wording. This Passport is not FTC/DSA/EPN legal compliance.

## SECURITY

https-only href. Bridge hostname allowlist. `encodeURIComponent` on query and placement. Refuse `javascript:`, `data:`, `file:`, `http:`. Placement charset `[A-Za-z0-9._:-]+`. Descriptor fields are data, not HTML.

## PRIVACY

**LOW.** Personal data required: **NO**. Host must not pass emails or account ids as `placementId` / query. Construct does not log queries globally.

## OBSERVABILITY

Return-value metadata only. No telemetry framework. Do not log queries, campaign business data, or clicks as a product.

## EVENTS

NONE REQUIRED. Future click / conversion events are out of scope.

## SOURCE PROVENANCE

Extracted from VTC `src/affiliate.js` `ebaySearchUrl` (blob `7eaef04c0a20ef1eb840b6384b8fc1564e38c9d9`) plus fail-closed / disclosure behaviour the origin helper did not own.

- Origin product: `vtc-platform`
- Origin SHA at extraction base: `c3085689e0255f836eaa6b270e6e8bd7f0c945cf` (image-prep consumption; `affiliate.js` identical to original `032a47ca0fa0731febdf47f45607983ac9b721b4`)
- `catawikiSearchUrl` stays in VTC. NOT INCLUDED.
- `api/ebay.js` Browse API stays in VTC. NOT INCLUDED.

## ORIGIN CONSUMER

VTC extraction worktree `C:\Users\othry\Projects\vtc-block-affiliate-extract-001` commit `54088ed03736309ea7de3b222dcc5a41194344d9` via local `file:../othrys-blocks/blocks/monetization/affiliate-offer`. Host owns campaign config, placement vocabulary, disclosure copy, and Catawiki plain links.

## SECOND CONSUMER

`oros-affiliate-offer-transplant` at `C:\Users\othry\Projects\oros\oros-affiliate-offer-transplant` commit `79062a11dcc9333382746cc1c912cba56ef3492a`. Find This Item: generic query, dummy campaign `9990000001`, no VTC category/placement/helpers. Disposition **KEEP_AS_PORTABILITY_FIXTURE**. Not a commercial Oros.

## PROVEN CONSUMERS

2 (VTC origin `54088ed0…` + `oros-affiliate-offer-transplant` `79062a11…`).

## PORTABILITY

Proven. Provider-neutral core + eBay Bridge consumed **unchanged** (0.1.0) by two independent Oroi. Local `file:` proof only. REMOTE_PENDING — REUSABLE here means two Oroi consume the same canonical local source, not GitHub/npm/external distribution.

## DISCLOSURE

Both proven consumers must implement visible host disclosure when `disclosureRequired`. Host owns wording. Block owns `disclosureRequired` + `relHints` including `sponsored`.

## INTEGRATION EDGE

Oros Host → `monetization.affiliate.offer@1` `construct`.
INPUT: normalized request (`query`, explicit `providerId`, optional `listingIntent` / `placementId`).
PROVIDER: explicit Bridge selection (`ebay-epn` proven).
CONFIG: host campaign attribution + optional placement.
OUTPUT: `AffiliateOffer` descriptor.
HOST DUTY: visible disclosure + rel semantics.
FAILURE: typed refusal. No graph system.

## TEST EVIDENCE

Hub `docs/BLOCK-002-TRANSPLANT-001/` plus extract `docs/BLOCK-002-EXTRACT-001/TEST-EVIDENCE.md`. This package `npm test`. Second Oros `npm test`.

## KNOWN LIMITATIONS

- eBay only proven Bridge. Do not claim Catawiki support.
- no click evidence
- no conversion evidence
- no revenue evidence
- remote distribution unresolved (REMOTE_PENDING)
- Locale / multi-domain eBay routing is **not** implemented (origin had none).
- Offer construction is not revenue, click, or conversion evidence.
- Local `file:` consumption is proof-only. Publishing is not authorised.
- Disclosure wording is host-owned; this Block does not freeze `#ad`.
