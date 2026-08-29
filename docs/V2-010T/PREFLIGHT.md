# V2-010T Preflight — Sclerotium / Clean-Root Recovery

**Status:** RUNNING / HARVEST-FIRST

First prove the recovery taxonomy and minimal trusted survival pack from current House + Great Harvest evidence. Do not build a backup daemon or copy secrets. Recovery material must be content/identity bound, secret-free, authority-free, and portable across Legion/T590.

PandaOS remains presentation/orchestration reference only: show recovery state clearly, but do not create Panda-owned backup state or a parallel backend.

## Great Harvest result

Disposition: **ADAPT**.

Relevant harvested stock exists and was inspected before implementation:
- historic `core/titan/hephaestus/src/mycelium/survival.ts`: durable state is replayed from evidence; corruption is quarantined; missing records are never invented; process-death recovery returns only to lawful durable checkpoints.
- historic `hub/hephaestus/recovery.py`: resume from last committed stage, abandon unsafe in-flight workspace, never claim process resurrection.
- historic `core/hermes/reliability/bootstrap-fallback.mjs`: persist before acknowledgement, reconcile idempotently, and never mask real validation failures.
- portable-bootstrap and recovery-integrity tests are present in the Great Harvest catalog and remain quarry evidence, not authority.

The V2 adaptation is deliberately smaller: a deterministic clean-root manifest, not a recovery daemon. It preserves only minimum current-House identity/evidence digests and instructions for REBUILD / REACQUIRE / REBIND / EXCLUDE classes. No source payload, secret value, automatic restore or authority is carried.

## First implementation boundary

`runtime/os/sclerotium.mjs` must prove portable text digests, exact current-House evidence preservation, wrong-body rejection, corrupt-evidence rejection, manifest-integrity rejection, secret-payload rejection and missing-evidence refusal. Cross-node equality is required before closeout.
