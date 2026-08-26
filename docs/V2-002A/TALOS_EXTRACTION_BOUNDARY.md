# V2-002A — Talos Extraction Boundary

## Source truth
Quarry: `C:\Users\othry\Projects\othrys-core-windows`
Source commit: `5f4d6d014a15ecf8db2ff60ac7647a13e789df52`.
The selected files are clean in that working tree.

## KEEP first
- `titan/talos/src/ops/lifecycle.ts` — 93 lines — SHA-256 `4b61ae5ea351be835f75d72fea7459b016d82c0f3d7d6eaeed95917504051551`
- `titan/talos/src/ops/retry.ts` — 54 lines — SHA-256 `d9f8a434d79c3eacb5049539b223497ea363a4299eff8104d82cef4462276ae5`
- `titan/talos/src/ops/events.ts` — 295 lines — SHA-256 `00f0023f0ccdfabc0ed485a33aeeafe4024b35c72cc255ff20052d51090d6ec9`

These are pure/domain-oriented and together provide frozen lifecycle law, bounded retry/dead-letter semantics, and deterministic event replay.

## DEFER
- `engine.ts` (854 lines)
- provider selection and registry
- Bridge adapters / orchestration
- Garden / Meliteus / introspection
- Mission Control / soak / scheduling
- file adapters and durable tick composition

V2 will earn these only when a real requirement appears.