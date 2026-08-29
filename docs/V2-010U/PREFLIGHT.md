# V2-010U Preflight — Switchyard / Frugal Heart

**Status:** RUNNING / HARVEST-FIRST

Disposition: **ADAPT**. Switchyard already has a deferred strict request validator in V2, a proven V2-007B local-first model projection, and older Hub evidence for frugal builder tiers, provider health, builder health and certification. The new mission resumes those laws against current V2 rather than treating the deferred prototype as shipped runtime.

Smallest safe contract: strict request + finite predeclared candidate roster → deterministic `SELECTED` or `NO_LEGAL_CANDIDATE`. Selection may filter on capability, availability, certification, privacy/locality, cost ceiling and latency ceiling. It may use locality and measured task trust only as deterministic tie-breakers after legality/capability/cost filtering.

Provider-health and builder-certification evidence remain separate. Unknown/untested candidates are not silently upgraded. Remote escalation cannot bypass LOCAL_ONLY / LOCAL_REQUIRED and is never automatically paid. Selection grants no authority and starts no execution.

PandaOS remains surface/orchestration reference only: explain why a candidate won or was rejected, but do not create Panda-owned provider state or a second routing backend.

## Harvested selection laws admitted

The old Hub Auto Frugal selector confirms the same useful shape: cheapest eligible tier first, readiness filtering before execution, measured evidence only reorders within an already legal cheap pool, and paid tiers require approval. Historic provider-health work is kept distinct from engineering certification. The V2-010F deferred prototype contributes only its strict request vocabulary; it was never shipped authority.

The first V2 implementation therefore keeps candidate evidence explicit at the call boundary. Switchyard does not discover provider health, certify builders, read credentials, or launch work. It consumes those already-grounded facts, rejects unknown/unsafe candidates, and returns only selection evidence.
