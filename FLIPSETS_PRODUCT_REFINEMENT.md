# FLIPSETS PRODUCT REFINEMENT

> **Status:** BINDING REFINEMENT TO `BOOK_OF_FLIPSETS.md` FOR PR #10
> **Date:** 2026-09-17
> **Commercial state:** MONEY GATE CLOSED
> **Purpose:** refine the first customer, free product, account model, niche experiments, and the deliberate monetization switch without expanding the MVP into a reseller ERP.
> **Marketplace law:** see `FLIPSETS_MARKETPLACE_LAW.md`; FlipSets classifieds/contact never handles user-to-user transaction money.

This refinement does not replace the Book. It sharpens several decisions inside it. Where this file conflicts with the current Book on the first customer, free tier, account requirement, or monetization-state design, **this refinement wins until folded into the canonical Book before merge**.

## CORE REFINEMENT SUMMARY

- First niche: **hobby-funding flipper** — collector/builder who sells duplicates, clearance, selected retirement stock or opportunistic buys to offset the cost of the hobby.
- Account required for actual use; onboarding stores country, currency and selling defaults.
- Core personal areas: **Collection**, **Want List**, **My Flips**, and **Marketplace/Classifieds**.
- Collection tracks owned sets and intent: `KEEP | BUILD | MAYBE_SELL | FLIP`.
- Want List tracks wanted sets, target prices, priorities and optional flip-funding goals.
- My Flips tracks cost basis, expected outcome, realized outcome, days held and Hobby Offset.
- Marketplace is **classifieds/contact only**: listing -> discovery -> contact -> exit FlipSets. No checkout, payments, escrow, shipping, refunds, payouts, commission or transaction adjudication.
- Signature metric: `HOBBY_OFFSET = REALIZED_NET_FLIP_PROFIT / PERSONAL_LEGO_SPEND`; unrealized appreciation never counts.
- Free must remain genuinely useful: account, Collection, Want List, classifieds/contact, Deal Check, break-even, basic evidence, My Flips, manual purchase/sale entry, own-data export and basic statistics.
- Basic free stats include capital locked, acquisition cost, realized revenue/profit, active/sold count, realized ROI, average days held, predicted-vs-realized delta and Hobby Offset.
- Monetization law: **FREE = truth and habit; PAID = freshness, automation, scale and deeper decision support.** Correctness is never premium-only.
- Pro hypothesis: fresher evidence, alerts, multiple fee profiles, larger scale where cost-justified, receipt OCR, barcode/bulk tools, inventory aging, capital velocity, richer analytics, advanced saved searches and later Benelux retailer intelligence.
- Initial price hypothesis to test only after legal/commercial unlock: approximately **€4.99/month or €39.99/year**.
- Money switch: `CLOSED -> PREVIEW -> OPEN`, server-side and auditable. Deployment never silently opens monetization.
- Opening FlipSets subscription monetization does **not** authorize marketplace transaction handling.
- `OPEN -> CLOSED` kill switch disables commercial charging while preserving the useful free product.

## NICHE EXPERIMENTS

1. **Hobby Funding — preferred first wedge.** Make the hobby partially self-funding through realized flips.
2. **Exit Coach.** Help users free cash/space from stale inventory.
3. **Benelux Clearance Scout.** Local retailer/deal economics when legitimate data rights are proven.
4. **Used Lot Decoder.** Photo/listing -> conservative recoverable value -> maximum buy price; technically harder but potentially differentiating.
5. **Buy Two / Keep One.** Scenario tool for effective personal-copy cost.
6. **GWP Offset.** Apply realized GWP sale proceeds to effective cost of the personal purchase.

## FROZEN DECISIONS

Until explicitly superseded:

1. FlipSets is for collectors who may flip, not only professional resellers.
2. Account is part of the product.
3. Collection and Want List are core surfaces.
4. My Flips stays distinct from personal Collection intent.
5. Marketplace is classifieds/contact only.
6. FlipSets never handles user-to-user transaction money under the current model.
7. Free tier stays useful indefinitely.
8. Basic personal statistics stay Free.
9. Correct Deal Check math is never degraded for Free.
10. Pro sells automation/freshness/scale rather than access to truth.
11. Hobby Offset counts realized net profit only.
12. Money Gate governs FlipSets' own subscription/revenue only; it is not permission to become a transaction intermediary.
