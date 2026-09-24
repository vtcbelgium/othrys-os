# JEV Router five-case live benchmark — 2026-09-24

Status: **TRAINING / authority 0**

## Scope

Five live Router cases were executed through the Keymaster-sealed OpenRouter transport with:
- per-call hard ceiling: $0.00005
- batch ceiling: $0.00025
- no authority grant
- no execution grant

## Aggregate

- cases: 5
- expected lane matches: 4/5
- actual total cost: $0.00012516
- projected guarded maximum: $0.000141792
- no call breached the per-call budget

Observed latencies:
- FAST status: 624.57 ms
- FAST discussion: 1310.79 ms
- LIGHT study: 365.70 ms
- LIGHT research: 284.57 ms
- DEEP build: 310.95 ms

## Results

1. FAST status
   - task: status
   - repo: true
   - web: false
   - risk: 0
   - initial needs_execution: 0.55
   - initial lane: LIGHT
   - expected lane: FAST
   - mismatch

2. FAST discussion
   - lane: FAST
   - match

3. LIGHT study
   - lane: LIGHT
   - match

4. LIGHT research
   - lane: LIGHT
   - match

5. DEEP build
   - lane: DEEP
   - match

## Root cause

The Router question for `needs_execution` said:

> The request asks for an external action or system change rather than advice only.

That wording was too broad. A read-only repository status request can require a command/query, so Jev assigned 0.55 execution probability even though the operation had no persistent side effect.

## Optimization

The question now asks whether the request requires a **persistent side effect or mutation** and explicitly defines read-only inspection, listing, searching, status checks, explanation and non-mutating queries as false.

A single live confirmation rerun of the failed case produced:
- task: status
- repo: 0.89
- web: 0.18
- needs_execution: **0.07**
- risk: 0
- lane: **FAST**
- latency: 506.62 ms
- cost: $0.00002667
- authority: false
- execution: false

This is a useful improvement signal, but one rerun is not sufficient evidence for reliability promotion.

## Durable benchmark

The exact read-only status case is now stored as `router-011` in `training/jev/benchmark-cases.json`.

No circuit promotion occurred.
