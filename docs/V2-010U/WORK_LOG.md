# V2-010U Work Log

Status: COMPLETE / PASS

Resumed Switchyard from the deferred V2-010F validator and older Auto Frugal/provider-health/builder-health stock. Added a strict deterministic resolver under `runtime/os/switchyard.mjs`.

The resolver consumes already-grounded candidate facts only. It separates provider health from engineering certification, filters capability/privacy/locality/cost/latency, chooses the cheapest qualified legal route, uses locality/task trust only as deterministic tie-breakers, and surfaces paid-only routes for approval without auto-selecting them.

Proof: Legion 350/350 Node + 78/78 Mycelium + 10/10 workers; T590 exact commit same. Dogfood selected `qwen3-builder`; advisory and unavailable remote candidates were rejected for explicit reasons. Authority and execution remain false.
