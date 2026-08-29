# V2-010I Loop Inventory

**Status:** CODE-GROUNDED / AUTHORITY-FREE
**Law:** `LOOP_LAWS.md` + current component contracts.
**Rule:** a loop appears here only when current runtime source proves it exists.

| Loop | Kind | Owner | Current budget | Optimization verdict |
|---|---|---|---|---|
| Command Deck admission watcher | POLL | GPT Control | >=1s, default 5s, `--once` | EVENT-TRIGGER CANDIDATE: later prefer event + slow reconciliation; do not replace with fragile pure watch |
| Legion telemetry push | CADENCE | GPT Control/Mycelium | >=5s, default 10s; 4s request timeout | KEEP PERIODIC; later adapt cadence to stability/change rate rather than constant AI involvement |
| OTHRYS Housekeeper | CADENCE | GPT Control | >=60s, default 5m; full test every 12 cycles | KEEP CHEAP FAST PATH; this is already a good two-tempo loop |
| Talos retry/replay | RETRY | Talos | policy max attempts; bounded exponential backoff | REFERENCE LOOP: preserve semantic-vs-transient failure split and verifier-gated success |
| Factory build attempts | ATTEMPT | GPT Control | 3 attempts | TRACE/COMPRESSION TARGET after repeated proven build sequences |
| Factory refinement | GATED_REFINEMENT | GPT Control | mission bounded; no free-running loop | KEEP GATED; goal-gap evidence and operator acceptance prevent churn |
| Hephaestus repair attempts | ATTEMPT | Hephaestus | 1..5 attempts | ADD STRUCTURED DIAGNOSIS before correction; never blind retry |

## Core conclusion
There is no single OTHRYS loop. Polling, cadence, retry, repair and refinement have different semantics and should remain separate. A common registry/trace language should make them comparable without forcing them into one scheduler or one agent framework.

Talos is the current reference design: bounded retry policy, explicit semantic failure, deterministic backoff, external verifier, replayable state and a real dead-letter terminal condition.
