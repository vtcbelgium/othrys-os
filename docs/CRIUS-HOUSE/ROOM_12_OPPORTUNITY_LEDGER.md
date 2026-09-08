# ROOM 12 — OPPORTUNITY LEDGER

Mission: persist every commercially interesting signal without confusing capture with authorization.

## Opportunity schema

```yaml
id: CRIUS-OPP-XXXX
captured_at: <timestamp>
source: <product / conversation / benchmark / user signal / market observation>
room: <primary room>
asset: <canonical OTHRYS asset>
user: <who gets value>
buyer: <who could pay>
pain: <job/pain>
value_hypothesis: <economic value>
revenue_hypotheses:
  - <model>
indirect_value:
  - <distribution / data / lead / moat / partnership>
evidence:
  - <proof ref>
score:
  value: 0-5
  reuse: 0-5
  distribution: 0-5
  margin: 0-5
  defensibility: 0-5
  proofability: 0-5
  legal_ambiguity: 0-5
  trust_risk: 0-5
  support_burden: 0-5
state: OBSERVED | HYPOTHESIS | SCORED | EXPERIMENTABLE | EVIDENCE_BACKED | CANDIDATE | PARKED | KILLED
financial_gate: CLOSED | ELIGIBLE | OPEN | SUSPENDED
next_experiment: <bounded experiment>
review_at: <date/event>
notes: <short context>
```

## Initial opportunity ledger seeds

### CRIUS-OPP-0001 — Repo Health -> Repair Funnel
Asset: Repo Health / Great Harvest
Hypothesis: free/cheap diagnostic proves pain and creates qualified repair/modernization leads.
Revenue paths: deep audit, fixed repair batch, monitoring, modernization, enterprise estate scan.
State: `HYPOTHESIS`
Priority: VERY HIGH.

### CRIUS-OPP-0002 — Builder Arena Intelligence Flywheel
Asset: Builder Arena / Tool Olympics
Hypothesis: controlled benchmark work creates simultaneously useful product data, public media, SEO, newsletter content, affiliate/sponsor inventory, API stock and enterprise private benchmark capability.
State: `HYPOTHESIS`
Priority: VERY HIGH.

### CRIUS-OPP-0003 — Agent Driving Licence
Asset: Capability Qualification Harness + Evidence Gate
Hypothesis: standardized agent/tool qualification could become a trusted public benchmark and paid private/certification service.
State: `HYPOTHESIS`
Priority: HIGH / LONGER HORIZON.

### CRIUS-OPP-0004 — AI Bill Optimizer
Asset: Switchyard + provider test history
Hypothesis: companies will pay to identify and capture model/API savings; shared-savings could outperform SaaS pricing where attribution is strong.
State: `HYPOTHESIS`
Priority: VERY HIGH.

### CRIUS-OPP-0005 — Prometheus Commercial Intelligence
Asset: Prometheus
Hypothesis: useful free AI/dev intelligence can grow owned audience while deeper watchlists, history, alerts, sponsorship, affiliate and enterprise vendor/competitor intelligence monetize different layers.
State: `HYPOTHESIS`
Priority: VERY HIGH.

### CRIUS-OPP-0006 — Study Buddy Free-to-Institution
Asset: Study Buddy
Hypothesis: free student utility can validate product while future Pro, resource affiliates and school/teacher licensing capture value without crippling students.
State: `HYPOTHESIS`
Priority: HIGH.

### CRIUS-OPP-0007 — SME Automation Scan
Asset: OTHRYS reporting + workflow analysis
Hypothesis: a bounded automation opportunity report is easier to sell/prove than an open-ended automation consultancy and generates implementation work.
State: `HYPOTHESIS`
Priority: VERY HIGH.

### CRIUS-OPP-0008 — Failure Dataset Foundry
Asset: execution receipts, incident ledger, builder tests
Hypothesis: structured failure/recovery history becomes proprietary intelligence for routing, qualification, reliability reports and research.
State: `OBSERVED`
Priority: HIGH strategic moat.

### CRIUS-OPP-0009 — White-label Diagnostic Engine
Asset: repo audit / SME scan / benchmark engines
Hypothesis: agencies and consultants may pay to put their brand/front door on OTHRYS-produced diagnostics and reports.
State: `HYPOTHESIS`
Priority: HIGH.

### CRIUS-OPP-0010 — Tiny Tool Fishing Fleet
Asset: future OTHRYS software factory
Hypothesis: many cheap, genuinely useful niche tools provide low-cost demand discovery; CRIUS expands only those showing quality organic traction.
State: `HYPOTHESIS`
Priority: HIGH after factory reliability.

### CRIUS-OPP-0011 — Collector OS Affiliate/Pro
Asset: personal manager/collection tooling
Hypothesis: collection catalogue can remain useful free while marketplace discovery, valuation reports, Pro tools, club/dealer tiers create revenue.
State: `OBSERVED`
Priority: MEDIUM.

### CRIUS-OPP-0012 — Project Handover / Archaeology Service
Asset: Mnem + Great Harvest
Hypothesis: organizations will pay for a reliable reconstructed project memory when staff leave or old systems must be revived.
State: `HYPOTHESIS`
Priority: HIGH.

## Ledger law

The ledger is deliberately greedy in capture and conservative in promotion.

CRIUS should rather record 100 plausible opportunities and kill 90 by evidence than lose the one asymmetric opportunity because it looked too strange initially.