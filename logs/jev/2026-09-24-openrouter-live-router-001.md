# JEV OpenRouter live Router qualification — 2026-09-24

Status: **TRAINING / authority 0**

## Live call

One bounded Router evaluation was executed through:

`Legion Keymaster DPAPI vault -> OPENROUTER_API_KEY -> OpenRouter Decisions API -> typesafe/jev-1.13 -> OTHRYS Router -> Chase execution planner`

No secret value was exposed.

### Input intent

Bounded repository repair:
- fix one OTHRYS repository bug;
- run focused tests;
- prepare a verified change;
- do not deploy production.

### Provider result

- resolved model: `typesafe/jev-1.13-20260917`
- latency: **565.13 ms**
- input tokens: **595**
- output tokens: **125**
- billed cost: **$0.00002499**

Typed answers:
- task type: `build` — probability 1.00
- needs repo: 0.92
- needs web: 0.22
- needs execution: 0.87
- risk score: 1.19
  - level 1 probability: 0.81
  - level 2 probability: 0.19

### Planner result

- lane: **DEEP**
- authorization required: true
- authorization granted: false
- verification required: true
- authority granted: false
- execution started: false
- action applied: false

The result matched the expected routing class for this case.

## Optimization harvested from the live call

The original preflight estimator predicted 500 input tokens while OpenRouter reported 595 input tokens. The estimate was therefore about 19% low.

The transport was tightened immediately:

- raw token estimate retained for observability;
- safety factor added: **1.35**;
- revised estimate for the same request: **675 tokens**;
- revised estimated cost: **$0.00002835**;
- hard per-call ceiling remains **$0.00005**;
- any estimate over the ceiling is refused before `fetch()`;
- actual provider cost is now recorded after every successful call;
- postflight status records `WITHIN_CAP`, `BREACHED`, or `UNKNOWN`;
- a postflight breach never grants authority.

For the first live qualification:
- actual: $0.00002499
- revised guarded estimate: $0.00002835
- hard maximum: $0.00005

## Conclusion

The OpenRouter Jev transport is now proven live for one Router case and remains suitable for controlled TRAINING qualification.

This single call is evidence of transport correctness, not sufficient evidence for SHADOW promotion or production authority.
