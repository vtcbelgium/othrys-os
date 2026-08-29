# OTHRYS OS Knowledge Zones

**Status:** CURRENT POLICY / ZERO EXECUTION AUTHORITY
**Owner:** Mnemosyne
**Storage law:** one Mnemosyne substrate; zones are logical policy/read-model classifications, not separate databases.

## Current zones

| Zone | Current meaning | Storage / authority posture |
|---|---|---|
| Great Library | current admitted/navigational knowledge and evidence references | derived navigation; inherits source authority only |
| Source Vault | content-addressed archived source evidence with SHA-256 identity and provenance refs | existing Mnemosyne archive; evidence only; no second store |
| Blueprint Vault | current Blueprint/constitutional architecture class | derived classification only; protected mutation/export gate is not yet implemented |
| Hall of Echoes | superseded, diverged, missing, rejected or retired knowledge | historical; never current-first |
| Garden | explicit ideas, seeds and possibilities | zero authority; no automatic promotion |
| R&D Centre | research, experiments, prototypes and benchmarks | zero production authority until explicit admission |
| Chronicle | curated institutional milestones/incidents/lessons | historical narrative, not raw telemetry |
| Quarantine | excluded/unsafe source metadata whose bytes are not archived | zero retrieval authority; review only |

## Source Vault facet

Source Vault is a facet over archived evidence, not an exclusive navigation room. A source can be immutable Source Vault evidence while being navigated through Great Library, Blueprint Vault, Hall of Echoes, Garden, R&D or Chronicle.

Current Source Vault proof is **PARTIAL** against the long-term vault ideal: SHA-256 identity, exact archived bytes, byte-integrity verification and provenance refs are proven; acquisition timestamp, media-type/classification envelopes, sensitive access grants, encryption and export lockdown are not yet fully implemented.
## Retrieval and lifecycle law

`CAPTURE -> CLASSIFY -> QUARANTINE/REVIEW -> ADMIT | GARDEN | R&D | HALL_OF_ECHOES`

Classification changes navigation and currentness only. It never changes the underlying source bytes, grants execution authority or rewrites historical evidence. Hall-of-Echoes routing wins over Blueprint/Garden/R&D path hints when live source currentness proves supersession/divergence/missing state. Quarantine wins before every navigation zone.

Blueprint classification is currently **path-derived navigation evidence**, not proof of architectural approval. Existing governance/evidence remains the authority for whether a Blueprint is approved.

Search relevance and zone membership are separate concerns: a search for ?Blueprint? may correctly return Great Library documents that merely discuss blueprints. Zone-filtered projection is the explicit primitive for asking for matching evidence inside one chamber; zone classification must never distort general relevance ranking.

## Security relationship

Hecatoncheires is the security posture around these chambers, not another service. Current status is machine-readable in `docs/HECATONCHEIRES_POSTURE.json`. Any `PRESENT_AND_TESTED` claim must be backed by current V2 mechanism and test evidence; `PARTIAL` and `ABSENT` are valid outcomes and must not be cosmetically upgraded.
