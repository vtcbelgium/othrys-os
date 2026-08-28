# OTHRYS OS durable Work model

V2-010B introduces a durable project-local Work object inspired by PandaOS Work State while preserving V2 as the only execution/evidence authority.

## Identity hierarchy

`Project -> Work -> Slice -> Stage -> Task`

- Project identity comes from `.othrys/project.json`.
- Work identity is stable: `WORK-<canonical mission id>`.
- Slice, stage and task IDs are declared by the canonical Mission definition and survive restart/resume.
- A Work record never sets `authorityGranted` or `executionStarted` true.

## State rule

The Work definition is durable, but current phase/status is projected from canonical Mission/result evidence. The transition ledger records observations of that evidence; it does not drive Talos, Trust Canal, Hephaestus or workers.
## Transition ledger

Each transition observation is content-bound to:
- Work ID and canonical Mission ID.
- Projected phase and status.
- A digest of the Mission envelope, result evidence if present, and active control state.

Duplicate observations are idempotent. A transition whose phase is earlier than the latest recorded phase fails closed as `WORK_PHASE_REGRESSION`, even if that old transition existed historically.

This gives the workstation durable `Working`, `Waiting`, `Review`, `Complete` history without allowing UI state to manufacture completion.

## Next extension

V2-010C should materialize new project workspaces from `.othrys/project.json`: project identity, selected role bindings, capability requirements, model policy, knowledge scope and integrations. That is the structural equivalent of PandaOS New Project composition, backed by OTHRYS semantics.
