# V2 Worker Contract v0.1

A Worker is a bounded execution hand. It is not a scheduler, verifier, Titan, policy engine, or authority plane.

## Request

Required fields:
- `schema_version`: `othrys.worker-request.v0.1`
- `job_id`: unique durable job identifier
- `node_id`: requested/leased execution node
- `capability`: bounded capability, initially `engineering.patch`
- `workspace`: disposable or explicitly authorized workspace
- `task`: exact work instruction
- `allowed_paths`: paths the worker may mutate
- `timeout_sec`: wall-clock execution ceiling

Optional fields: `deny_paths`, `metadata`.

The request intentionally does not contain provider-routing authority. A node adapter may bind a certified local implementation for the requested capability.
## Result

Every job writes one atomic UTF-8 JSON result containing:
- request identity (`job_id`, `node_id`, `capability`)
- bound implementation identity (`worker_id`, `builder_id` when relevant)
- `ok`, `reason`, `started_at`, `completed_at`, `duration_sec`
- proposed/observed diff and git status where applicable
- runtime evidence and node telemetry sufficient for later verification

Worker `ok=true` means execution completed as the Worker understood it. It never means the mission is accepted. Talos/independent gates decide terminal success.

## Hard boundaries

- Mutations outside `allowed_paths` are failure evidence.
- Missing/unknown capability is refusal, never fallback.
- Remote-control disconnect must not erase a running job or its result.
- Node resource inventory is descriptive; advertised capacity is a separate owner/policy decision.
- The first adapter binds `engineering.patch` to Legion `qwen3-builder`; later nodes must implement the same request/result semantics rather than changing Talos mission semantics.