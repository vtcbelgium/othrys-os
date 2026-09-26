# .othrys — project-local OTHRYS OS control surface

`.othrys/` is the Git-readable project description and persistence surface consumed by OTHRYS OS.
It is durable context, state and evidence; it never grants execution authority by itself.

Canonical object:
- `project.json` — project identity, Work policy, role bindings, capabilities, model policy, integrations and knowledge sources.

## Canonical persistence structure

- `runtime/` — current state only: health, heartbeats, bindings, active runtime status.
- `logs/` — append-only operational JSONL events using the canonical `othrys.os.event.v1` envelope.
- `knowledge/` — Mnemosyne inbox, reviews, catalogs, admitted/reusable knowledge and source archives.
- `evidence/` — durable proof artifacts and run receipts for bounded claims.
- `work/` — durable Work objects and transition history.
- `projections/` — generated/readable views, including optional Obsidian projection under `projections/obsidian/`.

Additional project-local configuration may include:
- `rules/` — policy layered under canonical OTHRYS law.
- `capabilities/` — references to admitted Blocks; never copied skill implementations.
- `ux/` — approved design decisions/prototypes and stable handoff references.

Hard semantic boundaries:
- state is not history;
- logs are not memory;
- evidence is not admission;
- Mnemosyne promotion requires review;
- Obsidian is a downstream human projection, never runtime authority or a second Git truth.

Canonical law: `docs/V2-010G/CHRONICLE_AND_LOG_LAW.md`.

Historical paths remain readable and migrate incrementally; this structure does not authorize bulk moves or deletions.

Hard authority boundary: editing `.othrys/` cannot bypass Trust Canal, Talos, Mission admission, execution leases or verified apply gates.
