# Chronicle and Log Law — Research Candidate

**Status:** V2-010G housekeeping proposal; no authority beyond existing control law.

OTHRYS OS must be observable without turning every byte into doctrine.

## Four layers
1. **Event/log** — append-only machine/control occurrence: actor, action, target, time, mission/work ID, outcome, evidence pointer, correlation ID where available.
2. **Evidence/receipt** — immutable proof artifact for a bounded claim. Hash/provenance required when material.
3. **Chronicle** — curated milestone, incident, correction or lesson accepted into institutional history. Never tool chatter.
4. **Knowledge** — reviewed reusable meaning in Mnemosyne; may cite all layers but cannot silently rewrite them.

## Semantic discipline
Use stable event names for meaningful state transitions and outcomes. Correlate related events rather than copying payloads. Preserve raw source bytes where needed, but retrieve summaries/references by default.

Operational telemetry is not authority. A passing log line does not prove success; Talos/evidence gates still decide verification. A Chronicle entry does not make an architecture current. A Mnemosyne search hit does not grant execution permission.

## Drift rule
Every current claim should be reconcilable against newer evidence. Superseded claims remain reachable through the Hall of Echoes but lose current-first ranking. Corrections append; history is not silently edited.