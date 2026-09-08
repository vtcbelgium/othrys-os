# HYPERION HUNT WAVE 002 — ENTERPRISE CONTROL PLANE

> Status: RESEARCH / OPPORTUNITY HUNT
> Date: 2026-09-08
> Authority: Hyperion
> Financial state: research and preparation only; no monetization permission.

## Thesis

Wave 001 identified Proof + Cost + Control as the strongest commercial cluster. Wave 002 narrows that thesis into an enterprise wedge:

> **Do not try to become every enterprise agent. Become the independent control and evidence layer that helps an enterprise decide what agents may do, proves what they did, measures whether it worked, and determines what it cost.**

This is strategically attractive because it can reuse OTHRYS's own internal requirements: evidence-backed execution, capability qualification, containment, provider routing, incident history, trust, cost measurement, recovery and operator authority.

## External evidence pulse — September 2026

Research reviewed for this wave indicates:

- AI evaluation and observability has become a recognized product category because nondeterministic AI and agentic systems require repeatable testing and reliability measurement.
- Enterprise agent governance increasingly emphasizes identity, scoped permissions, audit records, human oversight, runtime policy, lifecycle management and accountability.
- Enterprise procurement increasingly evaluates AI agents on governance, observability, economics, integration, vendor maturity and operational outcomes rather than model capability alone.
- Multi-model routing is increasingly relevant to cost governance because not every task economically justifies the same model.
- Coding-agent evaluation is moving toward real-repository/workflow evaluation rather than generic benchmark scores alone.

These are market signals, not proof that OTHRYS currently implements the required product.

---

## H-011 — AGENT CONTROL PLANE

**Concept:** vendor-neutral registry and control layer for enterprise agents.

Core objects:

`AGENT -> OWNER -> PURPOSE -> IDENTITY -> PERMISSIONS -> TOOLS -> DATA -> MODEL/HARNESS -> POLICY -> EVIDENCE -> COST -> INCIDENTS -> QUALIFICATION`

Possible capabilities:
- agent inventory;
- accountable human/business owner;
- environment and deployment inventory;
- capability declaration;
- permission envelope;
- approved tool/data boundaries;
- model/provider/harness inventory;
- current qualification state;
- evidence receipts;
- incident history;
- cost attribution;
- kill/suspend state;
- expiry/requalification date.

Payers: enterprise platform engineering, security, AI governance, architecture, procurement, regulated teams.

Commercial routes: hosted control plane, enterprise self-hosted licence, per-agent pricing, implementation, policy packs, audit exports, managed qualification.

OTHRYS reuse hypothesis: Capability Registry + Themis + Keymaster + Evidence Gate + Incident Ledger + Talos + Atlas.

Cheap proof: model OTHRYS's own agents as if they belonged to a company and determine whether the registry catches authority/capability ambiguity that current docs miss.

Kill condition: merely duplicates generic CMDB/GRC inventory without runtime/evidence advantage.

Priority: P0 RESEARCH.

---

## H-012 — AGENT PASSPORT

A portable machine-readable identity and qualification dossier for an agent.

Possible passport fields:
- canonical agent ID;
- owner;
- purpose;
- version;
- model/harness dependencies;
- allowed environments;
- approved capabilities;
- forbidden capabilities;
- data classifications;
- tool permissions;
- benchmark/eval results;
- evidence schema support;
- known failure classes;
- incident count/severity;
- last qualification;
- expiry;
- revocation/suspension state.

Business wedge: a neutral interchange object between builders, buyers, governance systems and qualification services.

Revenue possibilities later: validation API, enterprise registry, signing/verification, private passport server, qualification services.

Moat: passport becomes more useful when backed by real longitudinal evidence rather than vendor declarations.

Risk: standards play too early. Start as internal OTHRYS format, prove utility before claiming universality.

Priority: P1.

---

## H-013 — CAPABILITY LICENCE / AGENT DRIVING LICENCE

Turn the existing Agent Driving Licence concept into capability-scoped qualification rather than one simplistic pass/fail certificate.

Example classes:

`L0 OBSERVE`
`L1 READ`
`L2 DRAFT`
`L3 MODIFY REVERSIBLY`
`L4 EXECUTE BOUNDED ACTIONS`
`L5 DEPLOY / EXTERNAL ACTION`
`L6 HIGH-CONSEQUENCE AUTONOMY`

Qualification should be task/environment specific. An agent may be L4 for repository work and L1 for email, rather than globally “safe.”

Products:
- open methodology;
- private enterprise testing;
- continuous requalification;
- signed qualification evidence;
- vendor comparison;
- expiry/regression monitoring.

Law: **PAY TO TEST, NEVER PAY TO PASS.**

Priority: P0 RESEARCH.

---

## H-014 — SHADOW AGENT DISCOVERY

Problem: companies may accumulate agents, coding CLIs, automations and API-based workers without a reliable inventory.

Concept: discover likely agentic workloads from approved telemetry/configuration sources, then reconcile them against the Agent Control Plane.

Possible signals:
- repository configs/workflows;
- approved cloud/API billing metadata;
- CI integrations;
- internal service manifests;
- installed enterprise integrations;
- model endpoint traffic metadata where lawful and authorized;
- scheduled automation registries.

Output:
`KNOWN | UNKNOWN | UNOWNED | OVERPRIVILEGED | STALE | DUPLICATE | UNQUALIFIED`

Commercial routes: enterprise scan, recurring monitoring, governance module.

Risk: privacy/security boundaries. No unauthorized surveillance or bypassing controls.

Priority: P1.

---

## H-015 — AGENT BILL OF MATERIALS (A-BOM)

Software has SBOMs; agentic systems need an operational dependency picture.

A-BOM candidate components:
- model/provider;
- prompts/policies;
- harness/runtime;
- tools/connectors;
- retrieval sources;
- memory stores;
- credentials/permission classes;
- external APIs;
- evaluators;
- fallback routes;
- human approval points;
- deployment environment;
- cost centers.

Uses:
- vendor lock-in analysis;
- incident blast-radius analysis;
- migration planning;
- procurement;
- security/governance;
- cost attribution;
- dependency-change alerts.

OTHRYS reuse: Great Harvest + dependency inventory + Keymaster + Switchyard + capability registry.

Priority: P0/P1.

---

## H-016 — AGENT CHANGE IMPACT / REGRESSION GATE

Any change to model, prompt, tool, permission, retrieval source, policy or harness can alter behavior.

Concept:
`CHANGE -> DEPENDENCY IMPACT -> REQUIRED EVALS -> CANARY -> EVIDENCE -> PASS/BLOCK`

Commercial wedge: CI/CD gate for agents.

Differentiator: correlate technical changes not only with benchmark score but with cost, latency, recovery, incidents and real value-event success.

Possible integrations later: GitHub checks, deployment pipelines, agent registries.

Priority: P0.

---

## H-017 — AI PROCUREMENT LAB

Enterprise buyer submits a real workflow instead of asking “which agent is best?”

Hyperion/OTHRYS produces:
- workload contract;
- candidate shortlist;
- controlled evaluation;
- success rate;
- reviewer burden;
- latency;
- cost per verified success;
- integration burden;
- governance fit;
- portability/lock-in risk;
- failure/recovery profile;
- recommendation with evidence.

Business model later: fixed-price procurement study, annual monitoring, custom benchmark, procurement API/data subscription.

This is a natural commercial packaging of Tool Olympics + Evidence Gate + Cost Optimizer.

Priority: P0 SERVICE WEDGE.

---

## H-018 — VERIFIED COST PER OUTCOME

Token cost is insufficient. Hyperion should measure:

`TOTAL COST / VERIFIED SUCCESSFUL VALUE EVENTS`

Total cost can include:
- model/API;
- retries;
- tool calls;
- compute;
- storage/retrieval;
- reviewer time where measurable;
- failed attempts;
- recovery;
- support/incident burden.

This creates a better economic comparison than price per token.

Example:
Model A costs €0.20/run at 55% verified success.
Model B costs €0.45/run at 95% verified success.
Naive routing picks A; outcome economics may pick B.

Product surfaces: dashboard, routing signal, procurement report, API, optimization service.

Priority: P0 CORE METRIC.

---

## H-019 — VENDOR EXIT / PORTABILITY SCORE

AI stacks can become operationally locked to model providers, harnesses, proprietary memory, tool schemas and workflow systems.

Score:
- model portability;
- prompt portability;
- tool portability;
- data exportability;
- eval portability;
- memory portability;
- observability portability;
- credential independence;
- fallback readiness;
- migration effort;
- commercial lock-in.

Product surfaces: free diagnostic, procurement report, enterprise monitoring, migration service.

OTHRYS dogfood: score OTHRYS itself and force Switchyard/provider abstractions to prove real portability.

Priority: P1.

---

## H-020 — AUTONOMY INSURANCE EVIDENCE PACK

Not insurance underwriting. Evidence infrastructure that could help an enterprise, auditor, risk team or future insurer understand an autonomous system's controls and history.

Pack may contain:
- identity/ownership;
- capability class;
- permissions;
- eval history;
- incident history;
- recovery evidence;
- change history;
- evidence receipts;
- human oversight;
- kill switch proof;
- cost/exposure envelope;
- requalification status.

Potential future buyers/partners: enterprise risk teams, auditors, governance consultants, insurers/reinsurers if the market matures.

Keep as frontier research until actual demand/standards emerge.

Priority: P2 FRONTIER.

---

# COMMERCIAL STACK DISCOVERED

Wave 002 suggests these are not ten unrelated products. They can form one stack:

```text
AGENT PASSPORT / A-BOM
        |
        v
AGENT CONTROL PLANE
        |
        +--> CAPABILITY LICENCE
        +--> CHANGE / REGRESSION GATE
        +--> INCIDENT + EVIDENCE HISTORY
        +--> VERIFIED COST PER OUTCOME
        +--> PORTABILITY SCORE
        |
        v
TOOL OLYMPICS / PROCUREMENT LAB
        |
        v
ENTERPRISE DECISION INTELLIGENCE
```

This may be substantially stronger than selling each component separately.

## Potential product ladder

1. **Free:** Agent Passport schema, A-BOM schema, small scanners/calculators.
2. **Service:** AI Procurement Lab / Agent Readiness Audit.
3. **Developer:** Evidence/Regression Gate.
4. **Team:** Agent Registry + cost/outcome dashboard.
5. **Enterprise:** Control Plane + policies + audit + qualification + private benchmarks.
6. **Intelligence:** anonymized/controlled benchmark intelligence from OTHRYS-owned experiments, never raw private customer data.

---

# HYPERION PRIORITY AFTER WAVE 002

Highest combined strategic candidates:

1. Evidence Gate / Execution Receipts.
2. Tool Olympics / AI Procurement Lab.
3. Verified Cost Per Outcome.
4. Agent Control Plane.
5. Capability Licence / Agent Driving Licence.
6. Agent Change/Regression Gate.
7. Agent Bill of Materials.
8. AI Stack Waste Scanner / Router.
9. Agent Passport.
10. Portability Score.

## Important convergence

OTHRYS already needs most of this internally.

That creates a desirable pattern:

`BUILD INTERNAL CONTROL -> GENERATE REAL EVIDENCE -> IMPROVE OTHRYS -> PACKAGE NARROW OUTPUT -> TEST EXTERNAL VALUE`

rather than:

`INVENT SAAS -> BUILD LARGE PRODUCT -> HOPE SOMEONE WANTS IT`

---

# NEXT EVIDENCE MISSIONS

### HW2-E01 — OTHRYS Agent Passport
Inventory one real OTHRYS agent/component and see whether a passport can be populated from live evidence without invention.

### HW2-E02 — OTHRYS A-BOM
Map one actual agent/workflow end-to-end: model, harness, tools, permissions, data, evidence, fallback, cost.

### HW2-E03 — Cost Per Verified Outcome
Choose one repeated OTHRYS task and calculate provider/model cost per verified successful completion including retries.

### HW2-E04 — Change Gate
Take one harmless model/prompt/config change and determine which evidence should be required before accepting it.

### HW2-E05 — Procurement Simulation
Treat OTHRYS as an enterprise buyer and compare 3 candidate builders on one real workload.

### HW2-E06 — Portability Audit
Remove one provider from the hypothetical available set and identify exactly what breaks or degrades.

### HW2-E07 — Control Plane Gap Map
Compare current OTHRYS capability/authority/incident records with the proposed control-plane object model and enumerate missing proof.

---

# KILL DISCIPLINE

Hyperion must not build an enterprise platform merely because the diagram is attractive.

Stop or narrow if:
- existing tools already solve the exact problem better with little differentiation;
- OTHRYS cannot generate better evidence than vendor claims;
- integration burden dominates value;
- enterprise sales/support burden is incompatible with the operator's intended business;
- regulatory/compliance burden exceeds reasonable scope;
- internal dogfooding does not improve OTHRYS;
- buyers want services only and no repeatable product emerges.

The service outcome is not failure. A profitable future audit/benchmark service can be a valid endpoint and a data engine for later products.

---

# WAVE 002 LAW

> **THE AGENT IS NOT THE ASSET HYPERION NEEDS TO OWN. THE TRUSTWORTHY DECISION ABOUT WHICH AGENT MAY DO WHAT, WHETHER IT SUCCEEDED, AND WHAT THAT SUCCESS COST MAY BE THE MORE DURABLE ASSET.**
