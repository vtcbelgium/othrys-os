# Pollinations free-only arsenal — 2026-09-26

Status: **LIVE / SEALED / STRICT-ZERO POLICY**

## Credential custody

Pollinations is represented by one Keymaster credential. The credential remains in the encrypted Windows-backed vault and is never written to repository state, Books, model inventory or logs.

Provider-side key policy:
- Generate access only;
- account-management permissions disabled;
- 30-day expiry;
- 1 Pollen emergency budget ceiling;
- dashboard whitelist expanded to the free community arsenal.

## Authenticated provider truth

Authenticated discovery after the whitelist expansion currently returns **18 text models**.

All 18 returned models satisfy the OTHRYS strict-free rule:
- community model;
- not paid-only;
- no positive numeric Pollen price;
- blank community pricing normalized to zero.

The provider can hide selected free models when health filtering marks them unavailable, so dashboard whitelist size and authenticated live-model count are expected to differ.

## OTHRYS enforcement

Jev Pollinations transport now:
- treats blank community pricing as zero;
- allows explicit zero pricing;
- refuses every positive numeric price;
- refuses paid-only models;
- reports admitted calls as cost class ZERO;
- does not expose the credential.

Commit implementing strict-free enforcement: `19a2e93`.

## Live qualification

PASS:
- Cohere North Mini Code;
- Kilo Auto.

Not ACTIVE on current adapter:
- GT Agent v1 — HTTP 400;
- GLM 5.3 Flash FREE — HTTP 400.

Full runtime OS + Command Deck regression after strict-free patch: **425/425 PASS**.

Access is intentionally broader than qualification. Free but unqualified models remain reserve/quarantine labor until Talos qualification.
