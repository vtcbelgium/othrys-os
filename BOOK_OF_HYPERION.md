# BOOK OF CRIUS

**Titan of Product Readiness, Commercial Qualification, and Financial Gates**

Crius is the OTHRYS Titan that stands between **a thing that exists** and **a thing OTHRYS is permitted to commercialize**.

He does not build products. He does not decide what the operator should want. He does not turn popularity into permission. He does not collect money because money appears available.

Crius exists to make one distinction impossible to blur:

> **A product can be interesting, popular, public, useful, technically working, or commercially promising without being ready or authorized to earn money.**

OTHRYS may spend months building value before a single financial gate opens. During that period Crius does not sleep. He observes product health, accumulates evidence, models commercial paths, identifies blockers, prepares revenue machinery behind disabled gates, and tells the operator which products are becoming commercially qualified.

When the time comes to earn, OTHRYS must not begin from scratch. It should already know which products are operational, which have real demand, which revenue channels fit them, what they cost to operate, what risks remain, and exactly what must be enabled.

Crius is therefore not merely a finance component. He is the **commercial boundary of OTHRYS**.

---

## 1. NORTH STAR

The Crius north star is:

> **BUILD VALUE FREELY. PROVE IT RIGOROUSLY. PREPARE COMMERCE QUIETLY. OPEN MONEY ONLY DELIBERATELY.**

A successful OTHRYS product journey is not:

`IDEA -> CODE -> TRAFFIC -> ADS`

It is:

`IDEA -> BUILD -> PROVE -> OPERATE -> EXPOSE -> VALIDATE -> QUALIFY -> AUTHORIZE -> MONETIZE -> SUSTAIN`

Crius owns the qualification boundary from **PROVE** onward and the financial gates from **QUALIFY** onward.

The purpose is not bureaucracy. The purpose is to prevent premature commercialization from degrading a good experiment, creating obligations before a product can carry them, or causing OTHRYS to mistake attention for value.

---

## 2. THE FIRST LAW OF CRIUS

> **POPULARITY IS A SIGNAL, NEVER A PERMISSION.**

A sudden rise in traffic, downloads, registrations, mentions, stars, shares, requests, or attention may be valuable evidence. It may justify faster commercial preparation. It may increase a product's review priority. It may cause Crius to model pricing, capacity, margins, or revenue opportunities immediately.

It never opens a financial gate by itself.

A product that becomes viral while unfinished remains unfinished.

A product with ten thousand users but corruptible data remains unqualified.

A product with excellent retention but no legal or administrative ability to receive revenue remains financially locked.

A product with attractive affiliate opportunities but misleading recommendations remains blocked.

The correct automatic response to popularity is:

`POPULARITY_SPIKE -> MEASURE -> VERIFY -> PREPARE -> REVIEW`

Never:

`POPULARITY_SPIKE -> MONETIZE`

---

## 3. OPERATOR AUTHORITY

The operator is root authority over financial opening.

Crius may:

- observe;
- measure;
- classify;
- calculate;
- simulate;
- recommend;
- prepare disabled commercial infrastructure;
- declare a product or channel `GATE_ELIGIBLE`;
- refuse qualification when evidence is missing;
- automatically close or suspend a financial gate when a defined safety, reliability, compliance, quality, or economic guard is violated.

Crius may **not** independently open a financial gate.

The asymmetry is intentional:

> **Opening requires explicit operator authority. Closing may be automatic when continued monetization would violate policy or product health.**

This is fail-closed commercialization.

No future autonomous agent, builder, model, popularity detector, marketing loop, affiliate scanner, recommendation engine, deployment job, or revenue optimizer inherits authority to open a Crius gate merely because it can technically do so.

Any later delegation of opening authority must itself be an explicit operator decision recorded as policy. Silence, precedent, convenience, or prior approval for another product is not delegation.

---

## 4. WHAT CRIUS OWNS

Crius owns the OTHRYS commercial control plane for products.

His canonical responsibilities are:

1. product commercial-state classification;
2. operational-readiness evidence intake;
3. public-validation evidence intake;
4. commercial-opportunity analysis;
5. commercial-readiness qualification;
6. global, product, and revenue-channel financial gates;
7. monetization-preparation tracking while gates remain closed;
8. unit-economics and cost-envelope evaluation;
9. commercial risk and blocker tracking;
10. operator approval records;
11. commercial kill switches;
12. post-opening sustainment review;
13. commercial incident state;
14. gate decision audit history;
15. portfolio-level monetization readiness reporting.

Crius does **not** own product architecture, product vision, implementation, security engineering, legal interpretation, accounting execution, marketing creativity, or payment-provider internals. He consumes evidence from the systems and owners responsible for those concerns and refuses to manufacture evidence when it is absent.

Crius is a **judge of readiness and guardian of permission**, not the source of every fact he judges.

---

## 5. THE THREE-LEVEL FINANCIAL LOCK

OTHRYS financial authority is hierarchical.

```text
GLOBAL FINANCIAL LOCK
        |
        v
PRODUCT FINANCIAL GATE
        |
        v
REVENUE CHANNEL GATE
        |
        v
TRANSACTION / REVENUE EVENT
```

All levels must permit the action.

### 5.1 Global financial lock

The global lock is the highest financial boundary.

Canonical states:

`LOCKED | UNLOCKED`

When `LOCKED`, no OTHRYS product may begin live revenue activity through a Crius-governed channel, regardless of product popularity or local configuration.

A product-level switch cannot override it.

A channel-level switch cannot override it.

A deployment environment cannot override it.

A payment provider being configured cannot override it.

A developer accidentally setting a UI feature flag cannot override it.

The backend must fail closed.

### 5.2 Product financial gate

Every commercializable product receives its own financial gate.

Canonical states:

`CLOSED | ELIGIBLE | OPEN | SUSPENDED`

`CLOSED` means the product cannot earn through governed channels.

`ELIGIBLE` means Crius has sufficient evidence to recommend opening, but the operator has not opened it.

`OPEN` means operator authorization exists and one or more separately approved revenue channels may operate.

`SUSPENDED` means prior commercial authority is temporarily withdrawn because a required condition no longer holds or an incident demands containment.

### 5.3 Revenue-channel gates

Each commercial mechanism is independently governed.

Canonical states:

`DISABLED | PREPARING | READY | ENABLED | SUSPENDED`

One product may have subscriptions enabled while ads remain disabled. Another may allow B2B licensing while the consumer version remains free. Another may use an affiliate channel without introducing paid tiers. Crius never assumes that opening one commercial path grants permission to all others.

A revenue event is legal inside OTHRYS only when:

```text
GLOBAL_LOCK == UNLOCKED
AND PRODUCT_GATE == OPEN
AND CHANNEL_GATE == ENABLED
AND REQUIRED_RUNTIME_GUARDS == PASS
```

Otherwise the revenue action fails closed.

---

## 6. COURSE MODE — THE GREAT CLOSED GATE

During the operator's course, OTHRYS adopts a deliberate commercial posture:

```yaml
crius:
  course_mode: true
  global_financial_lock: LOCKED
  live_revenue: forbidden
  commercial_preparation: allowed
  commercial_analysis: allowed
  gate_qualification: allowed
  operator_opening: blocked_by_global_lock
```

The purpose is not to avoid thinking about business. It is the opposite.

The course year should accumulate **commercially legible, operationally proven assets** without requiring premature monetization.

A product may during Course Mode:

- become fully operational;
- be publicly available for free;
- gain real users;
- become highly popular;
- collect non-financial product telemetry with appropriate consent;
- accumulate validation evidence;
- be tested at realistic scale;
- have its commercial models researched and simulated;
- have pricing hypotheses prepared;
- have subscription, entitlement, billing, ad, affiliate, API, or licensing architecture designed or implemented in disabled/sandbox form;
- have commercial landing-page copy prepared but not activated as a live paid offer;
- have legal, privacy, tax, support, accounting, disclosure, and provider checklists prepared;
- be ranked by commercial potential;
- become `GATE_ELIGIBLE` beneath the global lock.

A product may not bypass the global lock merely because the opportunity looks unusually good.

If a product explodes in popularity during Course Mode, Crius should become **more active analytically, not more permissive financially**.

That distinction is foundational.

---

## 7. PRODUCT LIFECYCLE AND GATES

Crius recognizes the following canonical lifecycle.

```text
CONCEPT
  -> BUILDING
  -> OPERATIONAL
  -> PUBLIC
  -> VALIDATED
  -> GATE_ELIGIBLE
  -> COMMERCIAL
```

Side states are:

`BLOCKED | SUSPENDED | RETIRED`

A product may move backward when evidence changes. Gate progression is not an irreversible graduation ceremony.

### G0 — BUILD GATE

State: `CONCEPT / BUILDING`

Purpose: create and learn without commercial pressure.

At this gate:

- functionality may be incomplete;
- interfaces may change;
- data models may migrate;
- assumptions may be wrong;
- failures may be expected;
- testing is still proving the basic product;
- no public commercial promise exists;
- live monetization is prohibited.

Exit condition: the defined core user journey is actually complete enough to enter operational qualification.

### G1 — OPERATIONAL GATE

State target: `OPERATIONAL`

This is the gate the operator explicitly wanted to be hard: **a product is not monetization-worthy merely because a demo works.**

Operational means the product can perform its intended core purpose end to end under defined conditions without constant developer rescue.

Operational evidence is product-specific, but Crius expects explicit proof for all material concerns.

At minimum, where relevant, qualification asks:

- Does the primary user journey work end to end?
- Are critical paths tested rather than assumed?
- Do failures degrade safely?
- Is recovery possible and tested?
- Is authentication/authorization correct where required?
- Is critical data integrity protected?
- Are backup and restore requirements defined and exercised where applicable?
- Is deployment repeatable?
- Is rollback possible?
- Is monitoring present for material failure modes?
- Are logs useful enough to diagnose failures without exposing secrets?
- Are performance and latency within a product-specific acceptable envelope?
- Is expected concurrency/capacity known?
- Is infrastructure cost measurable?
- Is there an owner or response path for operational incidents?
- Are critical security and privacy requirements satisfied?
- Are known defects classified?
- Are critical defects at zero or explicitly blocking the gate?
- Can the system continue operating without hidden manual rituals known only to its builder?

Crius does not accept `looks good`, `worked once`, `AI says done`, or `the happy path passed` as operational evidence.

Operational thresholds belong in a versioned product policy. A tiny static utility and a data-bearing SaaS product should not be forced through identical SLOs. The standard is proportional but never imaginary.

### G2 — PUBLIC GATE

State target: `PUBLIC`

A product may be operational before real users have touched it. Public exposure exists to test reality.

During this stage the product can remain free while Crius watches:

- actual usage patterns;
- activation;
- completion of the value-producing action;
- repeat usage;
- retention;
- failure rates under real traffic;
- support burden;
- abuse patterns;
- infrastructure behavior;
- cost per meaningful action;
- feedback;
- unexpected use cases;
- demand concentration;
- organic acquisition;
- capacity pressure.

Public does not mean commercially ready.

Public is where OTHRYS learns whether its internal definition of value survives contact with users.

### G3 — VALIDATION GATE

State target: `VALIDATED`

Crius distinguishes **attention** from **validated value**.

Raw traffic alone does not qualify a product.

Validation may include combinations of:

- meaningful active users;
- repeat use;
- retention by cohort;
- successful completion of the product's core value event;
- referrals or organic sharing;
- repeated direct user requests;
- users asking for more capability;
- users asking whether a paid version exists;
- credible willingness-to-pay evidence;
- recurring use by organizations or teams;
- strong usage of a specific capability;
- low abandonment after activation;
- acceptable support burden;
- evidence that acquisition is not mostly bots, accidental clicks, incentives, or one-off publicity.

Crius records the quality of validation evidence, not merely its quantity.

A viral weekend can be an important signal. It is not the same as durable product-market evidence.

### G4 — COMMERCIAL READINESS GATE

State target: `GATE_ELIGIBLE`

At this gate Crius asks a different question:

> **Even if people want this, are we actually ready and permitted to accept money or commercial value for it?**

The product must pass a Commercial Readiness Review covering, where relevant:

- operator's legal and administrative ability to earn;
- business/entity setup if required;
- tax and VAT handling;
- bookkeeping/accounting path;
- payment-provider readiness;
- refund/cancellation behavior;
- pricing and packaging;
- entitlement behavior;
- terms of service;
- privacy policy;
- cookie/consent requirements;
- affiliate disclosures;
- advertising disclosures and standards;
- sponsorship disclosures;
- invoicing requirements;
- data-processing implications;
- user support obligations;
- commercial support escalation;
- abuse and fraud handling;
- chargeback risk;
- cost-of-goods/service measurement;
- gross/contribution margin expectations;
- capacity at expected paid load;
- third-party vendor risks;
- commercial analytics;
- kill-switch and rollback capability;
- incident response for payment and revenue systems.

Crius is not a lawyer or accountant. Where a fact requires qualified external confirmation, the gate remains blocked until that evidence exists. `UNKNOWN` is not interpreted as `PASS`.

### G5 — FINANCIAL GATE

State target: `OPEN`

This is an authority gate, not an intelligence prediction.

Even a fully qualified product remains closed until operator approval exists and the global lock permits opening.

Opening must identify at least:

```yaml
product_id: <canonical product>
approved_by: OPERATOR
product_gate: OPEN
channels:
  <channel>: ENABLED | DISABLED
policy_version: <version>
evidence_packet: <reference>
effective_at: <timestamp>
rollback: <defined path>
```

The action must be auditable.

### G6 — SUSTAINMENT GATE

State: `COMMERCIAL`

Opening the gate is not graduation from scrutiny.

A commercial product continues to prove that it deserves to remain commercial.

Crius continuously or periodically evaluates:

- product reliability;
- security/privacy posture;
- payment health;
- refund/chargeback behavior;
- support burden;
- unit economics;
- infrastructure cost;
- capacity;
- commercial complaints;
- fraud/abuse;
- legal/compliance blockers;
- product quality;
- user trust;
- third-party dependency risk.

If a material guard fails, Crius may suspend the affected channel or the whole financial gate.

---

## 8. THE DEFINITION OF "FULLY OPERATIONAL"

The phrase **fully operational** must never become ceremonial language.

Crius requires a product-specific operational contract.

The contract identifies:

```yaml
product_id: example
core_value_event: "the thing the user came here to accomplish"
critical_journeys:
  - ...
required_services:
  - ...
reliability_target: ...
performance_envelope: ...
data_integrity_requirements: ...
recovery_requirements: ...
security_requirements: ...
privacy_requirements: ...
capacity_envelope: ...
cost_envelope: ...
critical_bug_policy: ...
monitoring_requirements: ...
rollback_requirements: ...
proof_refs:
  - ...
```

"Fully" therefore means **fully against its declared operational contract**, not perfect in every imaginable dimension.

This prevents two opposite errors:

- lowering the standard until a prototype is called production-ready;
- demanding infinite perfection and preventing any product from ever graduating.

Crius wants explicit, bounded, evidence-backed readiness.

---

## 9. COMMERCIAL PREPARATION BEHIND A CLOSED GATE

A closed financial gate does not prohibit commercial intelligence.

Crius should use closed time productively.

Permitted preparation includes:

- identifying plausible revenue models;
- ranking revenue models by fit;
- estimating price ranges;
- testing pricing assumptions without charging users;
- calculating unit economics;
- estimating infrastructure costs at different scales;
- estimating support cost;
- building base/upside/downside forecasts;
- researching affiliate categories and partner fit;
- researching ad suitability without injecting ads prematurely;
- preparing plan/entitlement models;
- implementing payment flows exclusively in sandbox/test mode;
- preparing billing abstractions behind server-side disabled controls;
- preparing API metering;
- preparing licensing structures;
- preparing B2B packaging;
- preparing commercial analytics;
- preparing conversion funnels without deceptive dark patterns;
- preparing disclosure mechanisms;
- documenting legal/admin questions that must later be answered;
- load testing likely paid tiers;
- preparing support runbooks;
- preparing commercial incident paths;
- measuring cost per user, request, inference, file, job, or value event;
- building a commercial opportunity dossier.

The distinction is simple:

> **Preparation may become extremely sophisticated while permission remains zero.**

Crius should make the eventual opening boring.

---

## 10. REVENUE CHANNELS

Crius treats monetization as a set of independent channels rather than a single `make_money=true` switch.

Canonical channel families include:

- subscriptions;
- one-time purchases;
- paid upgrades;
- usage-based billing;
- paid API access;
- B2B licensing;
- enterprise contracts;
- services tied to a product;
- affiliate revenue;
- advertising;
- sponsorship;
- commissions or marketplace fees;
- commercially significant donations/tips;
- data or intelligence products where lawful, ethical, consented, and explicitly approved.

New revenue types may be added, but each receives its own readiness requirements and gate.

A channel may be commercially attractive and still be rejected because it damages the product.

Crius does not optimize **revenue at any cost**.

---

## 11. CHANNEL FIT

Before recommending a channel, Crius asks whether the channel matches the product's value relationship.

Examples:

- A utility with rare one-off use may fit one-time purchase better than subscription.
- A repeated professional workflow may fit subscription or B2B licensing.
- A high-cost machine workload may require usage-based pricing or quotas.
- A trusted recommendation product may be commercially harmed by aggressive affiliate incentives.
- A focused consumer tool may be damaged by ads even if ads technically produce revenue.
- An API may be monetizable before the consumer interface, or vice versa.

Crius therefore evaluates not only **can this channel earn?** but:

> **Will this channel preserve or improve the reason users value the product?**

If not, the correct decision can be `DISABLED` forever.

---

## 12. ECONOMIC TRUTH

Revenue is not profit.

Traffic is not value.

A paying user is not automatically a profitable user.

Crius maintains economic evidence appropriate to the product, potentially including:

- revenue;
- cost of goods/services;
- infrastructure cost;
- model/inference cost;
- storage cost;
- bandwidth cost;
- payment fees;
- affiliate or ad platform fees;
- support cost;
- refund cost;
- chargeback cost;
- gross margin;
- contribution margin;
- average revenue per user/account;
- conversion rate;
- churn;
- retention;
- customer acquisition cost where applicable;
- lifetime value where the underlying assumptions are mature enough to make it meaningful;
- payback period;
- cost per active user;
- cost per core value event;
- cost per query/job/inference/file where relevant.

Crius must label estimates as estimates.

A forecast carries assumptions and confidence. It is not transformed into truth because it appears in a dashboard.

Every serious commercial candidate should eventually receive at least three scenarios:

`DOWNSIDE | BASE | UPSIDE`

The downside case matters because products fail under optimistic economics when nobody modeled what happens if usage becomes expensive faster than revenue grows.

---

## 13. THE GATE PACKET

Every material Crius decision is backed by a **Gate Packet**.

The Gate Packet is the compact evidence dossier that allows a future operator, controller, or reviewer to understand why the current gate state exists.

Canonical shape:

```yaml
crius_gate_packet:
  product_id: "..."
  product_version: "..."
  policy_version: "..."
  reviewed_at: "..."

  lifecycle_state: "OPERATIONAL | PUBLIC | VALIDATED | GATE_ELIGIBLE | COMMERCIAL"

  locks:
    global_financial_lock: "LOCKED | UNLOCKED"
    product_financial_gate: "CLOSED | ELIGIBLE | OPEN | SUSPENDED"

  operational:
    status: "PASS | FAIL | UNKNOWN"
    evidence: []
    blockers: []

  validation:
    status: "PASS | FAIL | INSUFFICIENT | UNKNOWN"
    evidence: []
    caveats: []

  commercial_readiness:
    status: "PASS | FAIL | UNKNOWN"
    evidence: []
    blockers: []

  channels:
    subscription:
      state: "DISABLED | PREPARING | READY | ENABLED | SUSPENDED"
      evidence: []
      blockers: []
    affiliate:
      state: "DISABLED | PREPARING | READY | ENABLED | SUSPENDED"
      evidence: []
      blockers: []

  economics:
    measured_costs: {}
    assumptions: []
    downside: {}
    base: {}
    upside: {}

  risks: []
  incidents: []

  decision:
    status: "NOT_READY | BLOCKED | READY_FOR_VALIDATION | GATE_ELIGIBLE | OPEN | SUSPENDED | RETIRED"
    reason: "..."
    approved_by: null
    next_required_evidence: []
```

The schema may evolve. The invariant is that important gate states remain **explainable from recorded evidence**.

---

## 14. DECISION STATES

Crius uses explicit language.

`NOT_READY` — product has not satisfied the next required gate.

`BLOCKED` — a known requirement prevents progression.

`READY_FOR_VALIDATION` — operational proof is sufficient to seek real-user evidence.

`GATE_ELIGIBLE` — all required qualification evidence exists; operator may open when global policy allows.

`OPEN` — explicit commercial authority exists.

`SUSPENDED` — previously allowed commercial activity is temporarily blocked.

`RETIRED` — product or commercial path has been intentionally ended.

No ambiguous `probably ready`, `mostly green`, or `should be fine` status enters the control plane.

Narrative can be nuanced. Permission must be crisp.

---

## 15. THE QUALITY KILL SWITCH

Crius has a duty that outranks revenue preservation:

> **OTHRYS MUST NOT CONTINUE TAKING COMMERCIAL VALUE THROUGH A CHANNEL IT KNOWS HAS BECOME UNFIT TO OPERATE.**

Kill-switch triggers may include:

- a serious security incident;
- a material privacy incident;
- critical data corruption;
- payment processing malfunction;
- entitlement failures that unfairly deny paid access;
- materially broken refunds/cancellations;
- sustained severe reliability degradation;
- inability to deliver the paid core value;
- runaway infrastructure cost;
- strongly negative unit economics beyond an approved experimental envelope;
- legal or compliance uncertainty that requires suspension;
- deceptive, unsafe, or inappropriate ad behavior;
- affiliate behavior that compromises recommendation integrity;
- fraud or abuse outside the controllable envelope;
- support overload severe enough that paid obligations cannot be met;
- vendor failure that makes the paid promise unavailable.

Containment should be proportional.

If one revenue channel is faulty while the product remains safe and useful, disable that channel rather than necessarily taking down the entire product.

If commercial operation is the unsafe part, preserve free functionality where safe and feasible.

If the whole product is unsafe, product containment belongs to the broader OTHRYS operational authority as well as Crius.

Canonical containment sequence:

```text
DETECT -> VERIFY -> SUSPEND AFFECTED GATE -> PRESERVE SAFE SERVICE -> RECORD INCIDENT -> DIAGNOSE -> RE-PROVE -> OPERATOR REAUTHORIZE IF REQUIRED
```

Reopening after a material commercial suspension requires evidence. A toggle flip is not recovery proof.

---

## 16. FAIL-CLOSED IMPLEMENTATION LAW

Crius gates must be real control boundaries, not dashboard decorations.

A proper implementation should enforce commercial state on the server side or equivalent trusted execution boundary.

Required principles:

- UI hiding is never sufficient authorization control.
- A client cannot override the global financial lock.
- Revenue-provider production credentials should not be casually available to closed products.
- Course Mode should prefer sandbox/test credentials and environments for commercial integrations.
- Gate configuration changes require authenticated, authorized mutation.
- Gate mutations are audit logged.
- Unknown configuration resolves closed.
- Failed gate-state lookup resolves closed where a revenue action would otherwise occur.
- Stale or contradictory state resolves closed.
- Production revenue paths must be testable without requiring real charges during ordinary verification.
- Bypass attempts are explicit test cases.
- Revenue-channel code must not silently fall back to a different channel when one is disabled.

The most important negative test is:

> **Can a product earn when any required Crius gate says no?**

The expected answer must remain **no**, even under malformed requests, stale clients, deployment mistakes, direct endpoint calls, or disabled UI controls being bypassed.

---

## 17. VALIDATION WITHOUT SELF-DECEPTION

Crius protects against vanity metrics.

Potentially misleading signals include:

- page views without meaningful actions;
- registrations without activation;
- one-day spikes;
- bot traffic;
- paid or incentivized traffic misread as organic demand;
- social attention that does not convert into use;
- downloads with no repeat activity;
- survey enthusiasm with no observed behavior;
- a tiny number of enthusiastic users generalized to an entire market;
- raw model-generated market estimates with no external evidence.

Crius should always ask:

1. **What behavior proves users receive value?**
2. **Is it repeated?**
3. **Is the signal genuine?**
4. **How expensive is it to deliver?**
5. **What evidence would falsify our current optimism?**

Commercial confidence grows when independent signals converge.

---

## 18. COMMERCIAL OPPORTUNITY SCORE — ADVISORY ONLY

Crius may rank products to help the operator focus preparation effort.

A score may consider dimensions such as:

- operational maturity;
- validation strength;
- repeat usage;
- growth quality;
- willingness-to-pay signals;
- channel fit;
- margin potential;
- support burden;
- defensibility;
- distribution advantage;
- implementation effort to monetize;
- compliance burden;
- dependency risk;
- cost volatility.

The score is advisory.

It does not grant permission.

A 100/100 opportunity under a locked global gate earns €0.

A 60/100 opportunity with excellent strategic fit may be more worth pursuing than a 90/100 opportunity that damages the OTHRYS ecosystem.

Crius surfaces evidence; the operator chooses strategy.

---

## 19. PORTFOLIO VIEW

Crius should eventually present the OTHRYS product estate as a commercial readiness funnel.

Example:

```text
PRODUCTS BUILT                 12
OPERATIONAL                     7
PUBLIC                          6
VALIDATED                       4
GATE_ELIGIBLE                   2
COMMERCIAL                      0   <- Course Mode global lock
```

For each product the portfolio view should expose at least:

```text
Product
Lifecycle state
Operational status
Validation strength
Popularity / growth signal
Commercial opportunity
Global lock state
Product gate state
Channel readiness
Measured cost envelope
Estimated revenue scenarios
Key blockers
Current risk level
Last review
Next required evidence
```

This allows the end of the course to become a selection problem rather than an invention problem.

The question becomes:

> **Which already-proven assets should we commercialize first?**

not:

> **What could we possibly sell?**

---

## 20. END-OF-COURSE UNLOCK PROTOCOL

The end of Course Mode does not automatically open anything.

It makes opening **possible**.

Canonical sequence:

```text
1. Confirm operator is legally / administratively able to earn.
2. Resolve remaining tax, VAT, accounting, contractual, or registration requirements.
3. Operator explicitly changes GLOBAL_FINANCIAL_LOCK from LOCKED to UNLOCKED.
4. Crius re-runs qualification against current evidence for all candidate products.
5. Crius ranks products by readiness, opportunity, risk, cost, and strategic fit.
6. Operator selects a product.
7. Operator selects one or more revenue channels.
8. Crius confirms channel-specific readiness.
9. Open narrowly: canary, limited cohort, limited geography, limited plan, or other bounded launch where appropriate.
10. Observe reliability, economics, support, conversion, refunds, complaints, and abuse.
11. Expand only when evidence supports expansion.
12. Suspend or roll back if defined guards fail.
```

The global unlock is not a command to monetize everything.

It only removes the highest prohibition.

Every product and every revenue channel still has to earn its own permission.

---

## 21. CANARY COMMERCIALIZATION

Crius prefers reversible commercial openings.

Where feasible, a new paid channel should begin with bounded exposure:

- one product;
- one plan;
- one region;
- one user cohort;
- one affiliate category;
- one advertiser class;
- one API tier;
- one B2B customer type;
- one controlled traffic percentage.

The point is not timid growth. It is evidence-efficient growth.

A canary lets OTHRYS learn what changes when money enters the relationship.

Users behave differently when they pay. Support expectations change. Abuse incentives change. Refunds appear. Payment providers fail. Margins become real instead of theoretical.

Commercialization itself therefore produces new evidence and must be treated as an operational transition.

---

## 22. COMMERCIAL INCIDENTS

Crius maintains a dedicated commercial incident concept.

Examples:

- users charged twice;
- paid access not granted;
- cancelled subscriptions continuing to bill;
- incorrect affiliate disclosure;
- broken payout reporting;
- ad provider serving prohibited or trust-damaging content;
- unexpected cost explosion producing loss per transaction;
- fraud wave;
- refund path unavailable;
- tax/invoice configuration discovered to be wrong;
- commercial vendor outage.

An incident record should include:

```yaml
incident_id: ...
product_id: ...
channel: ...
detected_at: ...
severity: ...
customer_impact: ...
financial_impact: ...
gate_action: NONE | CHANNEL_SUSPENDED | PRODUCT_SUSPENDED
containment: ...
evidence: []
root_cause: ...
corrective_action: ...
reopen_proof: []
resolved_at: ...
```

Commercial incidents become institutional knowledge. Repeated mistakes should strengthen gates and tests rather than becoming folklore.

---

## 23. EVENTS AND CONTROL CONTRACT

Crius should eventually emit or consume explicit events instead of relying on hidden coupling.

Canonical event vocabulary may include:

```text
product.registered
product.operational.changed
product.public.changed
product.validation.updated
product.cost.updated
product.popularity.signal
crius.review.started
crius.review.completed
crius.blocker.created
crius.blocker.resolved
crius.gate_eligible
financial_gate.opened
financial_gate.closed
financial_gate.suspended
revenue_channel.preparing
revenue_channel.ready
revenue_channel.enabled
revenue_channel.disabled
revenue_channel.suspended
commercial_incident.opened
commercial_incident.contained
commercial_incident.resolved
```

Events carry references to evidence. They are not evidence merely because an event name claims success.

A `product.operational.changed: PASS` event without valid proof cannot satisfy the Operational Gate.

---

## 24. SEPARATION OF DUTIES

Crius must not become a self-certifying empire.

Commercial qualification should rely on evidence produced by the appropriate OTHRYS capabilities or verified external facts.

Conceptually:

```text
BUILD / PRODUCT SYSTEMS -> prove functionality
TEST / VERIFICATION      -> prove behavior
OBSERVABILITY            -> prove runtime health
SECURITY / PRIVACY       -> prove relevant controls
USAGE / ANALYTICS        -> prove real-world behavior
COST TELEMETRY           -> prove economics
LEGAL / ADMIN EVIDENCE   -> prove permission and obligations
CRIUS                    -> integrates evidence and governs commercial permission
OPERATOR                  -> authorizes opening
```

Crius may request missing evidence. He may not invent it.

If OTHRYS later assigns these roles to named Titans, Blocks, or services, those integrations should reference the canonical owners rather than duplicate their logic inside Crius.

---

## 25. NO COMMERCIAL CORRUPTION OF PRODUCT TRUTH

Once money becomes possible, incentives change.

Crius must actively resist several failure modes:

- recommending products because affiliate payout is higher rather than because they are better for the user;
- increasing ad density until the product becomes materially worse;
- locking previously essential functionality behind payment without deliberate product policy;
- creating artificial scarcity or deceptive urgency;
- hiding cancellation;
- making the free product intentionally unreliable to coerce upgrades;
- optimizing short-term conversion while destroying retention or trust;
- allowing sponsorship to rewrite evidence;
- treating high-paying customers as permission to bypass safety or reliability controls.

Commercial success is subordinate to the product's reason for existing and OTHRYS's evidence laws.

---

## 26. TRUSTED RECOMMENDATIONS AND AFFILIATES

Affiliate revenue deserves special scrutiny because it can silently corrupt recommendation systems.

If OTHRYS recommends a product, service, hotel, tool, course, provider, component, or partner and can earn from the recommendation, Crius should require clear separation between:

```text
RECOMMENDATION QUALITY
and
COMMERCIAL REWARD
```

The existence or size of an affiliate payout must not secretly determine ranking unless the experience explicitly declares that ranking logic and the operator approves it.

Where affiliate links are used, appropriate disclosure must be part of channel readiness.

A useful product that loses user trust to make cents per click has failed commercially even if nominal revenue rises.

---

## 27. ADS

Advertising is not a default monetization layer.

Before ads become `READY`, Crius considers:

- product context;
- user expectations;
- privacy implications;
- consent requirements;
- performance impact;
- interface degradation;
- inappropriate ad categories;
- brand and trust damage;
- expected revenue relative to harm;
- whether a cleaner commercial model fits better.

"We have traffic" is not sufficient ad strategy.

---

## 28. SUBSCRIPTIONS

Subscription readiness requires evidence that recurring payment matches recurring value.

Crius should challenge subscriptions when the underlying product is inherently one-off or sporadic.

A subscription channel needs, where relevant:

- clear recurring value;
- plan definition;
- entitlement logic;
- renewal behavior;
- cancellation path;
- failed-payment handling;
- grace policy;
- refunds;
- invoice/receipt handling;
- pricing tests;
- churn visibility;
- customer support path;
- sandbox-to-production transition proof.

Subscription metrics must not hide user pain behind MRR growth.

---

## 29. PAID API / USAGE-BASED CHANNELS

Usage-based products need economic controls close to runtime.

Crius should require:

- metering correctness;
- quota behavior;
- cost visibility;
- abuse controls;
- rate limits where appropriate;
- clear pricing units;
- protection against accidental user spend;
- protection against OTHRYS paying more upstream than it earns downstream;
- billing reconciliation;
- failure handling;
- usage visibility for the customer.

An AI-backed API with uncertain inference cost should not be commercially scaled until cost variance is understood.

---

## 30. B2B AND LICENSING

B2B opportunity may arrive before a mass consumer product proves itself.

Crius records such demand as strong commercial evidence but does not allow an unsolicited offer to bypass Course Mode or readiness rules.

B2B readiness may additionally require:

- contract scope;
- service expectations;
- data-processing terms;
- support commitments;
- deployment model;
- security requirements;
- invoicing;
- licensing boundaries;
- customer-specific cost;
- termination and data-return/deletion behavior;
- dependency and maintenance obligations.

The fact that a company is willing to pay does not make OTHRYS ready to promise enterprise service.

---

## 31. PRODUCT RETIREMENT

Not every qualified product should monetize forever.

Crius may recommend retirement when:

- value has disappeared;
- maintenance burden dominates return;
- a better OTHRYS product supersedes it;
- dependency risk becomes unacceptable;
- commercial obligations are disproportionate;
- user trust would be better served by ending the paid path;
- the product no longer fits strategy.

Retirement must address existing customers and obligations cleanly.

Revenue already earned does not create eternal product life.

---

## 32. TEST SUITE — CRIUS MUST BE BORINGLY HARD TO BYPASS

Crius is not complete when its dashboard renders. It is complete when negative tests demonstrate that financial authority cannot leak around it.

Minimum scenario family:

### Scenario A — Viral broken prototype

Product gets massive traffic but has severe reliability defects.

Expected:

`POPULARITY_HIGH`

`OPERATIONAL_FAIL`

`PRODUCT_GATE_CLOSED`

Crius increases review priority and commercial analysis but refuses eligibility.

### Scenario B — Excellent free product during Course Mode

Product is operational, validated, cheap to run, and users ask to pay.

Expected:

`GATE_ELIGIBLE` may be reached.

`GLOBAL_FINANCIAL_LOCK=LOCKED`

No live commercial channel can enable.

### Scenario C — Affiliate opportunity during Course Mode

An attractive affiliate partner is identified.

Expected:

Channel may reach `PREPARING` or `READY` based on evidence.

No earning affiliate behavior goes live while the global lock is closed.

### Scenario D — Commercial product suffers outage

Paid core value becomes unavailable beyond policy threshold.

Expected:

Crius suspends the affected financial gate/channel according to policy, records an incident, and demands recovery proof.

### Scenario E — Negative economics

Usage grows but each transaction loses materially more money than approved.

Expected:

No automatic scaling because revenue is growing. Crius blocks/suspends expansion or channel according to economic guards.

### Scenario F — Early B2B offer

A company wants to pay before Course Mode ends.

Expected:

Demand is captured as evidence. Commercial preparation may accelerate. Global lock still wins until the operator deliberately changes governing policy when permitted.

### Scenario G — Security incident

Product remains popular but security qualification is invalidated.

Expected:

Commercial gate suspends or closes according to severity. Popularity is irrelevant to permission.

### Scenario H — Independent channels

Subscriptions are approved; ads are not.

Expected:

Subscription revenue can operate when all parent gates allow it. Ad endpoints remain disabled and cannot inherit subscription authority.

### Scenario I — UI bypass

Client hides a buy button while attacker calls payment endpoint directly.

Expected:

Backend gate refuses the request.

### Scenario J — Unknown gate state

Crius state store is unavailable during attempted revenue action.

Expected:

Fail closed.

### Scenario K — Stale deployment

An old frontend believes a channel is enabled after Crius suspended it.

Expected:

Trusted backend state wins; revenue action fails.

### Scenario L — Unauthorized configuration change

A worker or model tries to flip a channel state.

Expected:

Mutation rejected and audit event recorded.

---

## 33. CRIUS DASHBOARD

The eventual Crius interface should answer the operator's commercial questions in seconds.

At portfolio level:

```text
GLOBAL FINANCIAL LOCK: LOCKED / UNLOCKED
COURSE MODE: ON / OFF

Products built
Products operational
Products public
Products validated
Products gate-eligible
Products commercial
Products suspended

Potential monthly revenue: range, not fantasy precision
Measured monthly product cost
Highest opportunity
Highest commercial risk
Products approaching readiness
Products blocked and why
```

At product level:

```text
PRODUCT: Study Buddy
Lifecycle: VALIDATED
Operational: PASS
Reliability: PASS
Security: PASS / evidence date
Validation: STRONG
Growth: +...
Cost/user: ...
Commercial potential: ...
Global lock: LOCKED
Product financial gate: ELIGIBLE

Subscriptions: READY
Affiliate: DISABLED
Ads: DISABLED
B2B license: PREPARING
API: DISABLED

BLOCKERS:
- global Course Mode lock
- ...

NEXT ACTION:
- no revenue action
- continue evidence collection
```

The dashboard must distinguish facts, estimates, and recommendations visually and semantically.

---

## 34. CRIUS REVIEW CADENCE

Crius should not create pointless polling.

Review cadence should be event-driven where possible and periodic where useful.

A review may be triggered by:

- operational gate completion;
- public launch;
- meaningful traffic or growth threshold;
- retention milestone;
- significant cost change;
- user payment-interest signal;
- new commercial partner opportunity;
- regulatory/admin status change;
- product incident;
- product version with material commercial impact;
- planned gate opening;
- periodic portfolio review.

A product with no material change does not need expensive repeated analysis simply to produce activity.

---

## 35. EVIDENCE FRESHNESS

Commercial readiness evidence can expire.

Examples:

- an old load test may not cover a new architecture;
- pricing assumptions may become stale;
- provider fees may change;
- legal requirements may change;
- a new product version may invalidate operational proof;
- a security review may no longer describe the deployed system;
- usage economics may shift after a model/provider change.

Gate Packets therefore record timestamps and product/policy versions.

Before opening a gate, Crius checks whether evidence still describes the thing being opened.

---

## 36. CHANGES THAT REQUIRE REQUALIFICATION

Not every release resets commercial readiness, but material changes can.

Possible requalification triggers include:

- payment architecture change;
- authentication/authorization redesign;
- critical data-model migration;
- new AI provider with materially different cost or privacy behavior;
- significant pricing change;
- new monetization channel;
- new geography with different requirements;
- material product-purpose change;
- new data category;
- large infrastructure migration;
- dependency change affecting commercial reliability;
- major terms/privacy change.

Crius should requalify only affected dimensions rather than blindly restarting every gate.

---

## 37. PRODUCT POLICY, NOT ONE UNIVERSAL THRESHOLD

Crius supplies the framework; each product supplies calibrated thresholds.

For example:

A hobby-sized static reference tool may tolerate different availability than a paid automation service that performs time-critical actions.

A product holding no accounts has different privacy/auth concerns than one holding personal study data.

A free public experiment has different support promises than an enterprise contract.

The gate framework is universal.

The evidence thresholds are product-aware.

This prevents both under-governance and cargo-cult enterprise bureaucracy.

---

## 38. COMMERCIAL MEMORY

Crius should preserve the history of commercial reasoning.

Future OTHRYS must be able to answer:

- Why was this product considered commercially promising?
- Why was this revenue model rejected?
- What did users actually do before monetization?
- What assumptions did the first price rely on?
- Why was the gate opened?
- What happened after opening?
- Why was a channel suspended?
- What did the incident teach us?
- Which commercial hypothesis failed?
- What should a future product reuse?

Commercial memory should compound across products.

A failed pricing model in one product can become useful prior evidence for another, provided Crius preserves scope and does not generalize blindly.

---

## 39. CRIUS AND THE PRODUCT ESTATE

Every OTHRYS product intended to become public or potentially commercial should be registrable with Crius from early development.

Registration does not mean "we will sell this."

It means:

> **If this becomes valuable, OTHRYS will know how mature it is and will not improvise permission under pressure.**

This is especially important for unexpectedly successful small tools.

A tiny course project may become more popular than a major planned product. Crius gives both the same disciplined path from attention to qualification.

---

## 40. COMMERCIAL READINESS IS NOT PRODUCT-MARKET FIT THEATER

Crius must not force startup vocabulary onto every project.

Some OTHRYS products may be:

- niche utilities;
- internal tools later licensed externally;
- APIs;
- datasets;
- automations;
- educational tools;
- consumer web products;
- B2B software;
- reusable code components;
- services produced from OTHRYS capabilities.

Validation should reflect the intended value model.

For a tiny paid utility, five highly credible users may teach more than fifty thousand drive-by visitors.

For an infrastructure API, repeated production calls may matter more than social attention.

For B2B, one serious design partner may carry more signal than a thousand free registrations.

Crius judges **evidence of value in context**.

---

## 41. THE CRIUS PROMISE

Crius makes four promises to the operator:

**First:** OTHRYS will never confuse "we can technically charge" with "we should charge now."

**Second:** while money is forbidden or premature, OTHRYS will not waste the commercial learning. It will quietly prepare.

**Third:** when the operator is ready to earn, the best candidates will already be visible, measured, ranked, and technically prepared.

**Fourth:** after money begins flowing, product health and user trust remain more important than preserving the flow at all costs.

---

## 42. DEFINITION OF DONE — CRIUS V1

Crius becomes operational only when the mechanism exists, not when this Book exists.

A future Crius V1 implementation should prove all of the following before it is called complete:

- one canonical global financial lock;
- Course Mode support;
- per-product financial gate state;
- independent revenue-channel gate state;
- product lifecycle state;
- versioned product readiness policies;
- evidence references for operational qualification;
- validation evidence model;
- commercial readiness checklist/policy;
- Gate Packet generation;
- economics/cost evidence intake;
- operator approval mechanism;
- server-side enforcement of revenue gates;
- sandbox/test-mode commercial integration path;
- commercial kill switch;
- suspension and reopening flow;
- commercial incident ledger;
- audit history of gate mutations;
- portfolio readiness view;
- product detail view;
- stale-evidence handling;
- requalification triggers;
- negative tests proving gate bypass fails;
- explicit proof that Course Mode cannot emit unauthorized live revenue.

Until those mechanisms are implemented and tested, this Book is **canonical doctrine and design authority**, not evidence that Crius already exists operationally.

OTHRYS must never confuse documentation with implementation.

---

## 43. CANONICAL LAWS OF CRIUS

These laws are the short form to preserve even if future implementation changes.

1. **Popularity is a signal, never permission.**
2. **Popularity triggers preparation, not monetization.**
3. **A demo is not an operational product.**
4. **Operational readiness is evidence-backed and product-specific.**
5. **The global financial lock outranks every product and channel switch.**
6. **Every product has its own financial gate.**
7. **Every revenue channel has its own gate.**
8. **Opening one channel never opens another.**
9. **Crius may prepare commerce behind closed gates.**
10. **Course Mode permits preparation and forbids live revenue.**
11. **Crius may declare eligibility; the operator opens gates.**
12. **Unknown readiness fails closed.**
13. **Commercial gates are enforced at a trusted boundary, never merely hidden in UI.**
14. **Evidence must describe the current product version and may expire.**
15. **Traffic is not validation.**
16. **Revenue is not profit.**
17. **Forecasts retain their assumptions and uncertainty.**
18. **A revenue channel must fit the product, not merely be available.**
19. **Commercial incentives may not silently corrupt product truth or recommendations.**
20. **Crius may automatically suspend revenue when defined guards fail.**
21. **Reopening after material suspension requires proof.**
22. **Commercial incidents become institutional memory.**
23. **Paid growth is initially reversible where practical.**
24. **The end of Course Mode unlocks consideration, not automatic monetization.**
25. **Documentation never counts as operational proof.**

---

## 44. FINAL FORMULA

The Crius formula is:

```text
VALUE
+ OPERATIONAL PROOF
+ REAL-WORLD VALIDATION
+ COMMERCIAL READINESS
+ LEGAL / ADMIN PERMISSION
+ HEALTHY ECONOMICS
+ OPERATOR AUTHORITY
= GATE MAY OPEN
```

Remove any required term and the gate remains closed.

And the inverse law is equally important:

```text
MONEY OPPORTUNITY
- READINESS
= PREPARATION, NOT PERMISSION
```

Crius exists so that OTHRYS can build ambitiously during the course without accidentally turning every promising experiment into a premature business, while ensuring that genuinely successful products are not commercially rediscovered from zero later.

**Build now. Prove continuously. Prepare intelligently. Open deliberately. Close without hesitation when trust requires it.**
