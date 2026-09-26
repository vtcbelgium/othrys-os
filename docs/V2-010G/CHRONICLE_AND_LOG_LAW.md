# Chronicle, Storage and Log Law — Canonical

**Status:** CANONICAL OTHRYS OS persistence law. This supersedes the V2-010G research-candidate wording without rewriting historical evidence.

OTHRYS OS must be observable, reconstructible and searchable without turning every byte into memory or doctrine.

## One fact, one layer

1. **State** says what is true now.
2. **Event/log** says what happened.
3. **Evidence/receipt** proves a bounded claim.
4. **Work** records mission/work lifecycle and transitions.
5. **Knowledge** stores reviewed reusable meaning in Mnemosyne.
6. **Chronicle** records curated milestones, incidents, corrections and lessons.
7. **Projection** is a human-readable view of canonical sources; it is never authority.

State is not history. A log is not memory. Evidence is not admission. A projection is not truth.

## Canonical project-local persistence map

| Layer | Canonical path | Rule |
|---|---|---|
| Current state | `.othrys/runtime/` | Mutable current state, heartbeats, bindings and health. Reconstructible where possible. |
| Operational events | `.othrys/logs/` | Append-only JSONL event streams. All new live event writers route here. |
| Knowledge | `.othrys/knowledge/` | Mnemosyne inbox, reviews, catalogs, admitted/reusable knowledge and source archives. Raw operational telemetry does not enter automatically. |
| Evidence | `.othrys/evidence/` | Durable proof artifacts and run receipts for bounded claims. |
| Work | `.othrys/work/` | Durable Work objects and transition history. |
| Human projections | `.othrys/projections/` | Generated/readable views. Obsidian belongs under `.othrys/projections/obsidian/` and never becomes runtime or Git authority. |

Project configuration such as `.othrys/project.json`, future `rules/`, capability references and UX decisions may coexist beside these layers but must not blur their semantics.

## Event ledger law

The canonical OS event envelope is `othrys.os.event.v1`.

Every canonical event contains at least:
- `occurredAt`
- `source`
- `type`
- `severity`
- `status`
- `missionId` and `workId` when applicable
- `correlationId` when applicable
- `evidenceRef` when proof exists
- secret-free structured event data
- `authorityGranted: false` unless a separate authority mechanism explicitly proves otherwise

Current channel vocabulary:
- `system` — GPT/control, Kronos, Themis, Keymaster, housekeeper and other OS services
- `agents` — Jev, Qwen and other model/builder actors
- `security` — Aegis and security controls
- `recovery` — recovery/lifeline events
- `training` — Learning & Development / benchmark execution events

Canonical stream path:

`.othrys/logs/<channel>/<stream>.jsonl`

Use stable event names for meaningful transitions and outcomes. Correlate related events rather than duplicating whole payloads. Secret values, private keys and credentials never enter the ledger.

The implementation owner is `runtime/os/event_ledger.mjs`. Domain/product event buses may reuse event concepts but do not replace this OS ledger.

## Evidence law

Evidence is durable proof for a bounded claim. New project-local evidence belongs under `.othrys/evidence/`.

Training/evaluation run receipts, for example, belong under `.othrys/evidence/training/`; their compact operational event belongs under `.othrys/logs/training/`.

Existing root `receipts/`, Mission results and other established evidence locations remain valid until a dedicated migration proves replacement safe. They are compatibility roots, not permission for new subsystems to invent more evidence homes.

## Mnemosyne admission law

Mnemosyne may search, reference, summarize and promote information derived from logs or evidence, but raw logs do not become knowledge automatically.

The flow is:

`EVENT / EVIDENCE -> MNEMOSYNE CAPTURE -> REVIEW -> PROMOTE / REJECT / PARK`

Failures and recurring patterns may be marked review-recommended. That recommendation grants no authority and performs no automatic promotion.

## Obsidian law

Obsidian is downstream only:

`OTHRYS SOURCES -> MNEMOSYNE + ATLAS -> OBSIDIAN PROJECTION`

Obsidian is a human-readable Great Library/workspace projection. It is never runtime authority, never a second Git truth and never the only copy of important knowledge.

## Chronicle law

The Chronicle contains accepted milestones, incidents, corrections and durable lessons. It never becomes a dump of tool chatter.

Operational telemetry is not authority. A passing log line does not prove success; Talos/evidence gates still decide verification. A Chronicle entry does not make an architecture current. A Mnemosyne search hit does not grant execution permission.

## Drift and compatibility

Corrections append; history is not silently edited. Every current claim should remain reconcilable against newer evidence.

Historical paths remain readable. In particular, existing material under:
- `GPT_LOG.jsonl`
- root `logs/`
- `.othrys/runtime/**/*.log`
- `.othrys/knowledge/archive/operations/`
- `.othrys/knowledge/archive/training/`

is preserved as historical/compatibility evidence. New writers must use the canonical map unless an explicit migration or compatibility adapter proves otherwise.

No bulk move or deletion is implied by this law. Migration is incremental, tested and reference-safe.
