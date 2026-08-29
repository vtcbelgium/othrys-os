# V2-010X — Prometheus External Evidence Qualification

Date: 2026-08-29
Verdict: QUALIFIED_FOR_ADAPTATION
Scope: already-registered public evidence sources only. No new provider, credentials, scheduler, admission, or authority.

## Live proof

- Reused existing `prometheus.run-knowledge-source` SAFE_EXTERNAL_READ seam.
- Probe source: registered `nvidia-api-catalog`; authentication=`none`, fetch=`allowed`, trusted, facts-only, free listing endpoint.
- Caller supplied `dryRun:false`; Hub guard forced `dryRun:true`.
- Live result: `OK`, Gate A ALLOW, Gate B granted, execution completed in ~314 ms.
- Current source returned 83 records in one request; 83 normalized; 0 candidates; 0 admitted; cost units 0.
- Evidence samples retained source id, endpoint provenance, publisher, field grades, run id and retrieval timestamps.
- Compare mode produced no intake handoff and no canonical mutation.

## Focused proof

- Gather route + live-gate tests: 34/34 PASS.
- Gather selection/execution/surface tests: 15/15 PASS.
- Proven invariants: no model-generation fallback, no Builder/Hephaestus fallback, refused/disabled sources stay unfetched, source ceilings are enforced, telemetry alone is not evidence, unsupported facts remain unknown/partial.
## Reuse decision

**ADAPT the source-policy/evidence contract; do not transplant Hub orchestration.**

Keep:
- declarative source manifests as data, with permission, allowed hosts, trust, rate/cost, extraction and attribution posture;
- fail-closed source eligibility;
- bounded source planning and deterministic relevance selection;
- dry-run / compare semantics that cannot silently promote findings;
- provenance-rich evidence with explicit grades and currentness;
- source failure/refusal as evidence, never as permission to invent a fallback answer.

Do not carry forward:
- Hub Python→Genesis subprocess composition;
- autonomous source scouting or self-registration;
- direct Prometheus→Mnemosyne admission;
- duplicate scheduler, event store, provider registry or credential store.

Observed source drift is healthy evidence, not an error: the historical registry note mentions 116 models, while the live 2026-08-29 catalogue returned 83. V2 must treat `reviewedAt` claims as historical evidence and the current run as current evidence, never silently rewrite one into the other.