# FLIPSETS MARKETPLACE LAW

> **Status:** BINDING PRODUCT LAW — INCUBATOR
> **Applies to:** FlipSets marketplace/contact functionality
> **Core rule:** FlipSets may help users discover each other and make contact. FlipSets does **not** intermediate the transaction.

## 1. CLASSIFIEDS, NOT COMMERCE INFRASTRUCTURE

FlipSets may provide a marketplace-style classifieds layer where authenticated users can indicate that a set is available, wanted, open to swap, or otherwise available for contact.

FlipSets must not become the merchant, broker, escrow provider, payment processor, shipping platform, fulfillment service, or transaction adjudicator.

Canonical transaction boundary:

`LISTING -> DISCOVERY -> CONTACT -> EXIT FLIPSETS`

Everything after contact is between the users or through an external marketplace/service they independently choose.

## 2. ALLOWED

FlipSets may provide:

- user-created listings;
- set reference and catalogue metadata;
- asking price as informational listing data;
- condition and quantity;
- location at a privacy-safe level chosen by the user;
- wanted / available / swap classification;
- seller profile and basic reputation indicators where justified;
- listing search and filters;
- matching a user's Want List against another user's available sets;
- matching duplicate Collection items against other users' Want Lists;
- contact button / internal message thread;
- report listing / report user;
- listing moderation;
- save/watch listing;
- external marketplace links supplied by the user;
- mark listing inactive / sold / traded manually;
- statistics based on the user's own manually entered realized transaction outcome.

## 3. FORBIDDEN

FlipSets must not provide or hold:

- checkout;
- cart;
- payment collection;
- card data;
- wallet balance for purchasing sets;
- escrow;
- deposits;
- buyer/seller fund custody;
- payout rails;
- shipping labels sold by FlipSets;
- fulfillment;
- transaction commission;
- mandatory transaction fee;
- automatic order creation;
- automatic purchase execution;
- automatic bidding;
- refund handling;
- chargeback handling;
- buyer protection administered by FlipSets;
- seller protection administered by FlipSets;
- dispute adjudication over the underlying sale;
- guarantees that a listing or counterparty is safe, authentic, solvent, or trustworthy;
- forced off-platform payment methods;
- hidden affiliate preference in marketplace ranking.

No later monetization phase may silently weaken this boundary. Changing it requires an explicit new operator decision and a separate legal/product review.

## 4. PRODUCT RELATIONSHIPS

Collection, Want List, Flips and Marketplace should connect without collapsing into one thing.

### Collection

Tracks LEGO the user owns for personal use, display, building, storage, or undecided intent.

A collection copy may be marked:

`KEEP | BUILD | MAYBE_SELL | FLIP`

### Want List

Tracks sets the user wants and optional target prices/priorities.

Want List may surface matching FlipSets classifieds, but the result is still only a contact opportunity.

### My Flips

Tracks sets intentionally acquired for resale, the user's cost basis, expected economics, manually recorded sale outcome, realized P&L, holding time and Hobby Offset.

My Flips does not require the sale itself to happen through FlipSets.

### Marketplace

Tracks what users say they have available or want to find and creates a route to contact.

Marketplace is not the accounting source of truth. The user manually confirms what happened afterward if they want statistics.

## 5. CONTACT FLOW

Preferred simple flow:

1. User opens a listing.
2. FlipSets shows the set, condition, asking information, seller profile and relevant collection/deal context.
3. User taps **Contact**.
4. FlipSets opens a simple message thread or reveals the contact method the listing owner chose.
5. Users negotiate independently.
6. FlipSets does not participate in payment, shipping or completion.
7. Listing owner may later mark the item sold/traded/withdrawn.
8. Either user may independently record the transaction in My Flips / Collection if desired.

## 6. SAFETY / MODERATION SCOPE

Even without payments, classifieds still require basic moderation.

FlipSets should support:

- report listing;
- report user;
- block user;
- remove prohibited/spam/scam-looking listings;
- rate limits for messages/listings;
- clear warning that users transact independently;
- privacy-safe messaging;
- no public home address requirement;
- no claim that FlipSets has verified payment or shipment.

Moderation protects the community surface. It does not turn FlipSets into transaction arbitration.

## 7. MONETIZATION RELATIONSHIP

The Marketplace itself should remain usable on Free.

Possible Pro value may include convenience around the classifieds layer, such as:

- more saved marketplace searches;
- instant matching alerts;
- richer filters;
- more watch rules;
- advanced analytics around the user's own listings/flips;
- bulk listing management for high-volume users;
- optional profile/listing cosmetics or visibility only if they do not corrupt recommendation quality.

Forbidden monetization remains:

- percentage of sale price;
- per-transaction commission;
- payment-processing margin;
- mandatory paid contact;
- charging users merely to complete a transaction through FlipSets.

## 8. CORE PRODUCT LOOP AFTER THIS LAW

FlipSets should connect four durable user objects:

`COLLECTION <-> WANT LIST <-> FLIPS <-> CLASSIFIEDS/CONTACT`

The central intelligence layer can then answer useful questions without owning commerce:

- "You own two copies; one matches three current Want Lists."
- "A user has listed a set on your Want List."
- "Selling this duplicate at your entered price would fund 42% of your next wanted set."
- "You marked this as MAYBE_SELL; there are active wanted signals from other users."
- "You sold it elsewhere; enter the realized numbers to update Hobby Offset."

That is the intended marketplace role: **discovery and connection, not transaction handling.**

## 9. MONEY GATE INTERACTION

The Marketplace/contact layer may be developed and tested while the Money Gate is CLOSED because it does not itself collect transaction money.

Any paid FlipSets subscription or paid convenience feature still obeys the product-wide Money Gate (`CLOSED -> PREVIEW -> OPEN`).

The existence of Marketplace listings must never be treated as permission to enable payment or commission rails.

## 10. FROZEN DECISION

Until explicitly superseded by the operator:

> **FlipSets may help people find each other. FlipSets never buys, sells, holds money, ships goods, or takes a cut of user-to-user LEGO transactions.**
