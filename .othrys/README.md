# .othrys — project-local OTHRYS OS control surface

`.othrys/` is the Git-readable project description consumed by OTHRYS OS.
It is configuration and durable work context, never an execution authority by itself.

Current canonical object:
- `project.json` — project identity, Work policy, role bindings, capabilities, model policy, integrations and knowledge sources.

Planned project-local structure as the OS grows:
- `work/` — durable Work objects and transition history projected from canonical Mission evidence.
- `knowledge/` — project-scoped Mnemosyne source declarations and review state.
- `rules/` — project-local policy layered under canonical OTHRYS law.
- `capabilities/` — references to admitted Blocks; never copied skill implementations.
- `ux/` — approved design decisions/prototypes and stable handoff references.
- `logs/` — human-readable implementation/review projections; receipts remain canonical evidence.

Hard boundary: editing `.othrys/` cannot bypass Trust Canal, Talos, mission admission, execution leases, or verified apply gates.
