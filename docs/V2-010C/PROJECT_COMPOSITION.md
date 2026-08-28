# OTHRYS OS project composition

V2-010C establishes the backend equivalent of PandaOS New Project composition without copying Panda runtime code.

## Composition contract

A project starts from a typed template, then binds:
- project identity and kind;
- Planner / Designer / Builder / Reviewer role selections;
- only eligible proven Capability Block references;
- inherited local-first model policy;
- selected knowledge source references;
- selected integration references;
- explicit operating mode, defaulting to `PLAN`.

The generated workspace contains `.othrys/project.json` plus project-local Work, Knowledge, Rules, Capabilities, UX and Logs directories. It generates no application source code and launches no worker.
## Safety and trust rules

Unknown roles, capabilities, knowledge sources and integrations fail closed. A Block that exists but is not `PROVEN` is rejected for project composition. A pre-existing conflicting `.othrys/project.json` is never overwritten.

Role selection is not authority. The generated project keeps `authorityGranted=false` and `executionStarted=false`; the parent V2 motor remains the authority boundary.

## Why this matters

The workstation can now discover project templates from the OS projection instead of embedding product types in HTML. A future New Project wizard can therefore be a thin controller over this contract: choose template -> choose roles/capabilities/context -> review -> request governed materialization.
