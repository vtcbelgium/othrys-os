# OTHRYS Learning & Development Lab

## Role

This is the permanent training and evaluation home for OTHRYS. It is deliberately separate from System Manager operations and from the Hall/Pantheon architecture map.

- **Hall / Pantheon:** what OTHRYS is — stable architecture, roles, relationships, configuration and readiness gates.
- **System Manager:** what OTHRYS is doing — live work, repositories, queues, builders, missions and operational controls.
- **Learning & Development:** what OTHRYS can prove — training, benchmarks, troubleshooting replay, JEV calibration, dual-brain comparison and Aegis security.
- **Head / Brain:** how OTHRYS decides — deep cognitive control and JEV laboratory.

## Active epoch

`dual-brain-2026-09-26`

The historical Level 1-3 corpus remains evidence and is never rewritten. New tests start a fresh epoch so changes in OTHRYS Core, JEV, routing and security remain comparable over time.

## Registration code

Tests use a human-readable dotted code:

`<domain>.<suite>.<case>`

Examples:
- `1.1.1` — OTHRYS curriculum, Level 1, case 1.
- `2.1.1` — JEV, Router circuit, case 1.
- `3.1.1` — Dual Brain, routing family, case 1.
- `5.9.1` — Aegis, Hecatoncheires Hand 9, case 1.

The dotted code is identity, not a semantic version. Test-definition version is recorded separately.

## Six lanes

1. OTHRYS Curriculum — the canonical ten levels.
2. JEV Trainer — six independent JEV circuits and their gates.
3. Dual Brain — Core versus JEV versus hybrid behavior.
4. Benchmarks — external and internal comparable task suites.
5. Aegis Security — Hecatoncheires/red-team/containment tests.
6. Troubleshooting & Recovery — incidents become permanent replayable regressions.

## Measurement law

Every serious run should record quality, latency, token usage, context size, provider/model identity, retries, tool calls, cost, artifacts, repo SHA and definition digest. Dual-brain runs also record disagreement and adjudication. Security runs record attack class, containment, isolation, secret exposure and unauthorized actions.

Target-model tokens, judge/JEV tokens and attacker/red-team tokens must remain separate when known. Unknown usage stays unknown; it is never estimated and presented as measured.

## Storage and Mnemosyne

Canonical run receipts are evidence and are stored under `.othrys/evidence/training/YYYY-MM-DD.jsonl`.

Each recorded run also emits a compact canonical event to `.othrys/logs/training/training-lab.jsonl` using `othrys.os.event.v1`.

A useful lesson may later be captured into Mnemosyne with source/provenance and normal review. The raw run receipt and raw event do not automatically become knowledge.

Historical training receipts already stored under `.othrys/knowledge/archive/training/` remain readable compatibility evidence; new runs do not extend that location.

No run result grants authority, admission, automatic promotion or automatic level advancement.
