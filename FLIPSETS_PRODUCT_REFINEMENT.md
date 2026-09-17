# FLIPSETS PRODUCT REFINEMENT

> **Status:** BINDING REFINEMENT TO `BOOK_OF_FLIPSETS.md` FOR PR #10
> **Date:** 2026-09-17
> **Commercial state:** MONEY GATE CLOSED
> **Purpose:** refine the first customer, free product, account model, niche experiments, and the deliberate monetization switch without expanding the MVP into a reseller ERP.

This refinement does not replace the Book. It sharpens several decisions inside it. Where this file conflicts with the current Book on the first customer, free tier, account requirement, or monetization-state design, **this refinement wins until folded into the canonical Book before merge**.

---

## 1. REFINED POSITIONING

The strongest first niche is not the professional LEGO reseller.

Professional resellers are already served by increasingly broad tools such as BrickReseller, StudFinder, BrickPicker, BrickLink tooling and general ecommerce software. Competing immediately on repricing, marketplace sync, retailer scraping, fulfillment, tax reporting and team inventory would force FlipSets into a feature race before its distinctive value is proven.

The preferred first niche is the **HOBBY-FUNDING FLIPPER**.

This person:

- is primarily a LEGO collector/builder or enthusiast;
- occasionally buys duplicates, clearance, discounted or retiring sets;
- may sell a few sets a month rather than hundreds;
- wants the hobby to partially or fully pay for itself;
- does not identify as a professional ecommerce operator;
- uses local marketplaces, BrickLink, eBay or similar channels;
- often calculates profit informally and underestimates fees, packaging, shipping, holding time or storage;
- may happily keep a set if the resale case becomes unattractive;
- values simplicity more than enterprise automation.

The emotional promise is therefore not:

> Get rich investing in LEGO.

It is:

> **Enjoy the hobby. Know what your flips are really paying for.**

Supporting positioning:

> **FlipSets — Know the flip before you buy.**
>
> **Buy smart. Sell smart. Let the hobby help pay for itself.**

This is narrower, more credible and less saturated than “professional LEGO reseller operating system.”

---

## 2. WHY THIS NICHE IS WORTH TESTING

Community evidence repeatedly shows collectors buying a second copy, clearance stock or selected retirement candidates specifically to subsidize their own LEGO purchases. At the same time, people report that the apparent returns become much less impressive after fees, shipping, storage, sourcing time and slow inventory are counted.

That creates a useful tension for FlipSets:

- the behavior already exists;
- the user has real financial motivation;
- the user is underserved by enterprise-style reseller tooling;
- the product can help without pretending LEGO is a superior financial investment;
- the product becomes useful from the first transaction rather than only after a large inventory exists.

The niche also gives FlipSets a distinctive statistic no generic reseller ERP naturally owns:

## THE HOBBY OFFSET

`HOBBY_OFFSET = REALIZED_NET_FLIP_PROFIT / PERSONAL_LEGO_SPEND`

Example:

```text
2026 PERSONAL LEGO SPEND       €1,240
REALIZED FLIP PROFIT             €418
HOBBY OFFSET                      34%

Your flips have paid for 34% of your LEGO hobby this year.
```

This must only use **realized net profit**, never unrealized portfolio appreciation.

A user who reaches 100% has made the hobby cash-flow neutral for the selected period before tax treatment. The UI must not label this as tax-free income or investment return.

This is both useful and emotionally satisfying without requiring badges or game mechanics.

---

## 3. ACCOUNT IS PART OF THE PRODUCT

The public landing page may explain FlipSets and show a static/demo Deal Card, but actual persistent use requires an account.

This is deliberate, not growth hacking.

The product's advantage depends on knowing the user's own reality:

- home market and currency;
- preferred selling marketplace;
- fee assumptions;
- shipping defaults;
- saved Deal Checks;
- actual purchases;
- actual sales;
- predicted-vs-realized error;
- hobby spending and hobby offset where the user chooses to track it.

Without an account, FlipSets is just another disposable calculator.

### Account onboarding must remain tiny

Required:

1. email/passkey/social auth;
2. country/market;
3. currency;
4. default selling route/profile.

Optional later:

- hobby budget;
- monthly target;
- preferred themes;
- marketplaces;
- storage limit.

Do not ask for business registration, VAT status, address, phone number or seller credentials merely to create a free account.

---

## 4. FREE FLIPSETS MUST BE A REAL PRODUCT

The free tier is not a demo and not a crippled calculator.

### FREE ACCOUNT — PERMANENT CORE

Free users receive:

- account and personal defaults;
- set search / set-number input;
- Deal Check;
- transparent fee calculation;
- break-even calculation;
- conservative/base/optimistic net outcome when supported by evidence;
- one default selling/fee profile;
- saved Deal Checks;
- My Flips with a generous free limit;
- manual purchase entry;
- manual sale entry;
- basic realized P&L;
- basic evidence provenance;
- data export of their own records;
- basic statistics dashboard.

### BASIC STATISTICS — FREE

At minimum:

- current capital locked;
- total acquisition cost;
- realized sales revenue;
- realized net profit;
- number of active flips;
- number sold;
- average realized ROI;
- average days held when enough data exists;
- best realized flip;
- worst realized flip;
- predicted-vs-realized profit delta;
- Hobby Offset, when personal LEGO spending is supplied.

These statistics make the free account sticky and useful while simultaneously improving FlipSets' future personalization.

### Free limits should protect cost, not manufacture pain

Good limits:

- cached rather than real-time market evidence;
- lower refresh frequency;
- one fee profile;
- a generous cap on active inventory if necessary;
- limited alert slots;
- manual entry rather than OCR/bulk automation.

Bad limits:

- hiding break-even;
- deliberately inaccurate prices;
- locking the user's own realized profit behind Pro;
- preventing export of the user's own data;
- making the free calculator too weak to trust;
- charging for every Deal Check when the marginal calculation cost is negligible.

### Core monetization law

> **FREE = truth and habit.**
> **PAID = freshness, automation, scale and deeper decision support.**

Correctness is never a premium feature.

---

## 5. PRO — WHAT SHOULD ACTUALLY BE PAID

Pro becomes useful when the user is doing enough activity that FlipSets can save meaningful time or find meaningful opportunity.

Candidate **FlipSets Pro** features:

- fresh/live evidence refresh instead of cached snapshots;
- automatic price monitoring;
- saved target-buy thresholds;
- deal alerts;
- multiple marketplace/fee profiles;
- larger/unlimited My Flips inventory;
- advanced predicted-vs-realized analytics;
- theme / price-band / marketplace performance;
- capital velocity;
- inventory aging and stale-stock warnings;
- richer sell-through/liquidity evidence;
- receipt OCR;
- barcode rapid-entry mode;
- bulk acquisition entry;
- bulk sales entry/import;
- advanced export;
- personalized “your actual results” calibration;
- later Benelux retailer intelligence where provider rights allow it.

Potential launch price to test after Money Gate unlock:

- **Free:** €0
- **FlipSets Pro:** approximately **€4.99/month or €39.99/year** as an initial willingness-to-pay hypothesis.

This is not frozen pricing. It is deliberately positioned below the $19.99–$29.99 full-suite competitor tier because the first paid product is for hobby/side-hustle users, not ecommerce businesses.

A higher future reseller tier may exist only if the product genuinely grows into multi-channel automation.

---

## 6. THE MONETIZATION SWITCH

The previous Money Gate remains. It is refined into an explicit runtime state machine.

Canonical server-side setting:

`MONEY_STATE = CLOSED | PREVIEW | OPEN`

No client parameter may override this state.

### CLOSED

Purpose: incubation, course work, internal testing, free beta.

Allowed:

- full free product;
- account creation;
- analytics;
- mock pricing page;
- Pro feature markers labelled “planned” or “beta”;
- willingness-to-pay research;
- Stripe test mode;
- simulated entitlements;
- free beta access to future Pro features.

Forbidden:

- live charges;
- paid subscriptions;
- affiliate commissions;
- ads/sponsorship revenue;
- transaction commissions;
- paid data resale.

Every live revenue endpoint must return `MONEY_GATE_CLOSED`.

### PREVIEW

Purpose: commercialization has been legally/operationally prepared but the operator has not yet switched revenue on.

Allowed:

- final public pricing page;
- plan comparison;
- “notify me when Pro launches”;
- live entitlement architecture with zero paid members;
- production webhook dry-runs that cannot capture money;
- grandfather/beta entitlement assignment;
- final checkout smoke tests using provider-supported non-charging/test flows.

Still forbidden:

- charging a real customer;
- earning affiliate revenue;
- activating revenue-producing links.

PREVIEW exists to avoid a chaotic launch-day deployment.

### OPEN

Purpose: real commercialization.

Requires the existing Book's legal/provider/privacy/security/accounting prerequisites plus explicit operator authorization.

When set to OPEN:

- live checkout endpoints may function;
- paid entitlements may be issued;
- allowed affiliate features may activate individually;
- commercial metrics begin;
- invoices/refunds/support paths become operational.

### One deliberate switch

The revenue launch should be an explicit auditable event:

```text
operator_decision = APPROVED
money_state_before = PREVIEW
money_state_after = OPEN
opened_at = timestamp
opened_by = operator
commercial_version = version/hash
```

No scheduled job, deployment accident, environment inheritance or third-party webhook may automatically transition the state to OPEN.

### Kill switch

`OPEN -> CLOSED` must be possible immediately without disabling the free informational product or deleting user data.

A payment outage or compliance concern should stop monetization, not destroy FlipSets.

---

## 7. FREE-TO-PAID CONVERSION SHOULD BE NATURAL

Do not constantly nag free users.

The ideal conversion moment is contextual.

Examples:

- user saves the sixth price alert -> “Pro monitors more sets automatically.”
- user records 20 sales -> “You now have enough history for advanced performance analysis.”
- user manually enters a large receipt -> “Pro can import this automatically.”
- user checks the same set repeatedly -> “Pro can watch this price for you.”
- user has stale inventory -> “Pro can monitor exit opportunities.”

Do **not** put an upgrade modal in front of the first Deal Check.

The free product should create the desire for automation by proving its usefulness manually first.

---

## 8. FIRST DASHBOARD

After login, the home screen should be small enough to understand at a glance.

```text
FLIPSETS

[ CHECK A DEAL ]

THIS YEAR
Realized profit            €284
Capital locked             €612
Active flips                  8
Sold                          14
Average ROI                  24%
Average hold               46 days
Hobby offset                 31%

RECENT
75379   Bought €61   Current deal check €18–€26 net
10327   SOLD         +€34 realized
42154   81 days      Review exit
```

This is more compelling for the target user than a stock-market-style portfolio chart.

---

## 9. REFINED BUILD ORDER

### Phase 0 — Truth engine

Unchanged:

- deterministic economics;
- evidence provenance;
- fee fixtures;
- test dataset.

### Phase 1 — Account + Deal Check + Basic Stats

This replaces the Book's ambiguity around local storage versus auth.

Build:

- authentication;
- minimal onboarding;
- set lookup;
- manual buy price;
- one default fee profile;
- Deal Card;
- save Deal Check;
- convert Deal Check to purchase;
- manual sale entry;
- tiny dashboard with basic stats;
- data export.

The account and learning loop exist from the start.

Do **not** yet build:

- retailer crawler;
- alerts;
- OCR;
- shelf scanner;
- seller API sync;
- accounting suite;
- payment checkout.

### Phase 1B — Hobby Funding mode

Add only the small layer required to test the niche:

- optional personal LEGO spend entry;
- Hobby Offset;
- monthly/yearly hobby-spend versus flip-profit view;
- “this flip paid for…” optional comparison using the user's own purchases.

No gamified pressure to buy or speculate.

### Phase 2 — Validation-driven automation

Choose the first automation from observed pain, not the roadmap fantasy:

- price watch;
- barcode speed entry;
- receipt OCR;
- simple inventory aging;
- one local deal source.

Only one should become the next primary experiment at a time.

### Phase 3 — PREVIEW monetization

When legal/business prerequisites are satisfied:

- implement entitlements;
- implement pricing page;
- implement checkout architecture without revenue;
- grandfather beta users appropriately;
- measure which Pro features users actually attempt to use.

### Phase 4 — OPEN monetization

Operator deliberately changes `MONEY_STATE` from PREVIEW to OPEN.

Launch only the already-proven paid value. Do not invent features merely to justify charging.

---

## 10. NICHE OPTIONS TO KEEP ALIVE

The hobby-funding flipper is the preferred first niche, but FlipSets should retain explicit pivot candidates.

### OPTION A — HOBBY FUNDING — PREFERRED

**Job:** “Help my LEGO hobby pay for itself.”

Strengths:

- emotionally clear;
- broad enough for many collectors;
- does not require professional seller integrations;
- naturally uses realized P&L;
- differentiates from investment dashboards;
- supports a low-cost subscription.

Key feature: Hobby Offset.

### OPTION B — BENELUX CLEARANCE SCOUT

**Job:** “Tell me whether this Belgian/Dutch store deal is genuinely flippable.”

Potential differentiation:

- Belgian/Dutch retailer feeds;
- 2dehands/Marktplaats-aware selling profiles;
- EUR-native assumptions;
- BE/NL/DE/FR cross-border reality.

Current evidence: 2dehands states that selling is generally free and that it charges no commission/transaction fee in most cases, while its payment-request service costs are typically paid by the buyer. Marktplaats likewise has buyer-paid payment-request/service mechanisms in many ordinary flows. That makes local marketplace economics materially different from US-centric eBay/Amazon assumptions.

Risk: retailer inventory/price access and marketplace sold-data rights may be difficult. Treat this as a data-rights research problem before promising it.

### OPTION C — USED LOT DECODER

**Job:** “Is this messy local LEGO lot underpriced?”

Flow:

`LISTING/PHOTO -> IDENTIFIABLE SETS/MINIFIGURES -> CONSERVATIVE RECOVERABLE VALUE -> MAX BUY PRICE`

This may have unusually high user value because local lots are opaque and require knowledge.

Potential moat:

- image recognition + catalogue reconciliation + user's local selling economics.

Risk:

- technically harder;
- incomplete items create uncertainty;
- image/marketplace terms;
- requires careful conservative valuation.

Keep as an R&D candidate, not MVP.

### OPTION D — EXIT COACH

**Job:** “What should I sell now to free cash and space?”

Focus:

- stale stock;
- capital locked;
- storage burden;
- realistic liquidation range;
- hold-versus-exit comparison.

This solves a real pain repeatedly reported by LEGO resellers: storage and tied-up capital.

It may become an excellent Pro feature after enough My Flips data exists.

### OPTION E — EOL / BUY-TWO MODE

**Job:** “I want one to build and one to sell later — what would the second copy need to achieve to subsidize the first?”

Output example:

```text
BUILD COPY      €79.99
HOLD COPY       €79.99
TOTAL OUTLAY   €159.98

To make the built copy effectively cost €40,
the held copy must produce €39.99 net profit after selling costs.
Required sale price under your profile: €142.
```

This is intuitive for collectors, but future-price uncertainty means it should remain scenario analysis rather than a prediction engine.

### OPTION F — GWP / PROMO FLIP TRACKER

Promotional gifts can materially offset LEGO purchase cost for some hobby flippers.

Potential feature:

`ORDER COST - REALIZED GWP PROFIT - POINT VALUE = EFFECTIVE PERSONAL SET COST`

This is useful, but too narrow to be the core product and could drift into promotion-chasing behavior. Keep it as a later calculation module.

---

## 11. EXPERIMENT ORDER

Do not build all niche options.

Run them in this order:

1. **Hobby Funding** — lowest data complexity, clearest differentiated narrative.
2. **Exit Coach** — uses data FlipSets already owns once users have inventory.
3. **Benelux Clearance Scout** — only after a legal/technical source path is proven.
4. **Used Lot Decoder** — R&D spike after vision/catalogue capabilities mature.
5. EOL/Buy-Two and GWP remain small scenario modules unless usage proves otherwise.

A niche wins when users return to it voluntarily and it changes real decisions. Survey enthusiasm is not enough.

---

## 12. MONETIZATION EXPERIMENTS AFTER OPEN

Do not test every model simultaneously.

### Primary: subscription

Best fit because value repeats and does not bias recommendations.

Test:

- Free;
- Pro monthly;
- Pro annual with meaningful discount.

### Secondary: affiliate revenue

Only for retailer links where contractually allowed and only when recommendation ordering is independent of commission.

Affiliate economics must never turn a mediocre set into a “better” FlipSets deal.

### Avoid initially

- ads;
- paid rankings;
- sponsored “hot set” placements;
- per-transaction commission;
- selling user transaction data;
- opaque lead generation.

They undermine the trust required for a financial-decision tool.

---

## 13. RETENTION LOOP

The account should become more useful without requiring addiction mechanics.

`CHECK -> BUY -> RECORD -> SELL -> SEE RESULT -> LEARN -> CHECK BETTER`

Retention surfaces:

- “You predicted €21; actual net was €17.”
- “Your shipping costs average €2.40 more than your saved assumption.”
- “Your Star Wars flips sell 19 days faster than your overall average.”
- “€420 has been locked for more than 90 days.”
- “Your hobby is 38% funded by realized flips this year.”

This is personalized evidence, not generic investment hype.

---

## 14. NEW FROZEN DECISIONS

Until explicitly superseded:

1. **Preferred first niche = hobby-funding flipper.**
2. **Account required for persistent/product use; landing demo may remain public.**
3. **Basic statistics are free.**
4. **The free tier must remain genuinely useful after monetization opens.**
5. **Correct calculations, break-even, basic evidence and user-owned data are never premium-only.**
6. **Paid value = freshness, automation, scale and advanced analysis.**
7. **Hobby Offset uses realized net profit only.**
8. **Monetization state is `CLOSED | PREVIEW | OPEN`, server-side and auditable.**
9. **Only the operator can deliberately move PREVIEW -> OPEN.**
10. **OPEN -> CLOSED kill switch must preserve the free product.**
11. **Initial paid-price hypothesis = approximately €4.99/month / €39.99/year, subject to validation.**
12. **No professional reseller feature race unless the casual/hobby wedge proves insufficient.**
13. **Benelux Clearance Scout, Used Lot Decoder and Exit Coach are explicit experiments, not hidden roadmap commitments.**
14. **Free-to-paid prompts occur at natural automation moments, not before first value.**

---

## 15. RESEARCH SOURCES ADDED BY THIS REFINEMENT

Research date: 2026-09-17. Changing commercial terms must be rechecked before implementation.

- BrickReseller — https://brickreseller.com/ — free plan includes unlimited inventory/catalogue, manual repricing, deal browsing, seven-day history and fee calculator; Starter $4.99/month; Pro $29.99/month at research date.
- StudFinder — https://studfinder.app/ and https://studfinder.app/subscribe — free browsing/catalog/collection tools; Pro $19.99/month at research date, with deal alerts, in-store search and reseller tooling.
- 2dehands help — https://help.2dehands.be/articles/nl_NL/Knowledge/hoeveel-kost-een-zoekertje-plaatsen — selling is generally free and the platform states it normally charges no commission/transaction fee, with exceptions/paid promotion options.
- Marktplaats help — https://help.marktplaats.nl/articles/nl_NL/Knowledge/servicekosten-voor-betaalverzoeken-met-ideal-via-marktplaats — payment-request service fee is described as buyer-paid by default.
- Community evidence: repeated LEGO/LEGO-investing discussions around buying duplicates or clearance to fund the hobby, and around underestimated time/storage/fee costs. Treat these as qualitative user-research signals, not market-size proof.

---

## 16. REFINED ONE-PAGE VERSION

**Who**

The collector who flips enough LEGO to want the numbers right, but not enough to want an ecommerce ERP.

**Promise**

> **Know the flip before you buy — and see how much of your hobby your realized flips actually pay for.**

**Free product**

Account + Deal Check + My Flips + manual sales + basic P&L + basic stats + Hobby Offset + own-data export.

**Paid product**

Fresh/live data, monitoring, alerts, multiple profiles, automation, OCR/bulk tools, deeper analytics and later local deal intelligence.

**Why pay**

Not for truth. For saved time, fresher opportunity and scale.

**Money state**

`CLOSED -> PREVIEW -> OPEN`

Revenue turns on only through one explicit, auditable operator decision after the legal/business/provider/privacy/security gates are satisfied.

**Preferred expansion order**

Hobby Funding -> Exit Coach -> Benelux Clearance Scout -> Used Lot Decoder.

**North star**

> **FLIPSETS — Know the flip before you buy.**