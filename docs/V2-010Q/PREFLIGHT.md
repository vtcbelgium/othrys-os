# V2-010Q Preflight — Artifact Reuse

**Date:** 2026-08-29
**Status:** FROZEN DESIGN BOUNDARY / IMPLEMENTATION NEXT

## Great Harvest disposition
**ADAPT**, not CREATE. Current OTHRYS already owns WorkKey identity (`runtime/mycelium/work_key.py`) and compatibility-gated Anastomosis Claims (`runtime/mycelium/anastomosis.py`). 010N harvested refusal memory, unknown-is-not-fresh, crash-window honesty, input-bound effect identity and narrow invalidation. 010L harvested the action-cache law: fingerprint command/inputs, reuse a verified artifact only while environment/capability/acceptance identity still matches. Mnemosyne must not become the build cache.

## Smallest native OTHRYS contract
`ArtifactRecord = WorkKey + compatibilityDigest + acceptanceDigest + producer/provenance identity + payload digest + verifier evidence + created evidence`.

Reuse decision is deterministic and one of:
- `HIT` — exact identity, provenance, freshness, integrity and compatibility all pass.
- `MISS` — no matching verified Artifact exists; recomputation is legal.
- `REFUSED` — a candidate exists but a named safety/evidence condition forbids reuse.
- `UNKNOWN` — reuse evidence is corrupt/torn/incomplete; recompute, never guess fresh.

Invalidation/refusal reasons must have durable identity. The Artifact payload/store is derived and disposable; refusal/invalidation evidence must survive cache cleanup. `INDEPENDENT_EXECUTION_REQUIRED` Claims bypass reuse by law.

## PandaOS reconstruction mapping
Panda contribution is UX/orchestration clarity only: persistent Work survives labor changes, Progress explains what happened, and failures do not become fake completion. OTHRYS should later show `reused verified artifact`, `cache miss`, or `reuse refused: <reason>` as evidence in the same Work/Progress surface. Do not create Panda-style backend state, a second Work engine, or a Panda dependency.

## Implementation slice
Add one local module under `runtime/os/` with tests. No server, daemon, distributed CAS, eviction scheduler, AI policy, or Command Deck mutation is required for the first slice. Prove exact hit plus changed-input, compatibility, acceptance, provenance/freshness, digest-corruption, torn-refusal and independent-verifier rejection before wiring any consumer.
