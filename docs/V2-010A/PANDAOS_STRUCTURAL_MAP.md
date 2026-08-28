# PandaOS -> OTHRYS OS structural map

**Mission:** V2-010A  
**Purpose:** harvest PandaOS workstation/orchestration structure into an original OTHRYS OS layer over the proven V2 motor.

## Architectural decision

PandaOS is used as a reference specimen, not a runtime dependency. The useful split is:

`OTHRYS OS workstation` -> `declarative project + durable Work projection` -> `existing V2 governed motor`

V2 remains responsible for authority, execution, independent verification and canonical evidence. OTHRYS OS makes those mechanisms composable and legible at project level.

## Directly observed Panda project structure

The controlled Panda specimen exposes project-local `features`, `knowledge`, `logs`, `rules`, `skills`, `team`, `ux` and configuration. Default Planner, Designer, Builder and Reviewer are on-demand personas with declarative skill/model bindings, not independently running persistent agents.

The Panda feature export separates Objective, Problem, Scale, Out of scope, Risks, Slices, Tasks and Phases. It also states that the exported Markdown is a projection while the Work record remains authoritative.
## Structural mapping

| Panda pattern | OTHRYS OS implementation | V2 authority beneath it |
|---|---|---|
| Project configuration | `.othrys/project.json` | Repo canon + GPT Control law |
| Work State | `runtime/os/work_projection.mjs` | Missions, results, receipts, Talos |
| Persona/role | `roleBindings` | Titan/control authority identity |
| Skill binding | capability references | admitted Blocks and proven services |
| Model tier / effort | model request/policy | Switchyard / certified workers |
| Approval gate | operating policy | Trust Canal |
| Evidence gate | Work evidence projection | Talos / independent verifier |
| Atlas project context | knowledge source declarations | future Mnemosyne admission/review |
| Apps/integrations | integration declarations | bounded adapters / Mycelium tools |
| UX/design artifacts | future `.othrys/ux/` | declared artifact contracts |

The mapping deliberately keeps `role != capability != model != authority`. A Builder role may bind Hephaestus, request an engineering capability and prefer Qwen, but none of those facts independently grants execution.

## Technology harvest

Panda's project package directly depends on the OpenCode plugin package. Its installed dependency graph also exposes typed schemas, Effect-style workflow/persistence/worker primitives, YAML/TOML configuration and AI provider abstractions. These are research references, not dependencies adopted by V2-010A.
## OTHRYS OS layers established by V2-010A

1. **Project substrate** — one portable, Git-readable `.othrys/project.json` describes the project without granting authority.
2. **Work projection** — canonical Mission/result evidence becomes one stable Work object for the workstation.
3. **OS projection** — Titans, systems, capabilities, models, integrations and knowledge are produced from project declarations plus V2 evidence.
4. **Governed motor** — existing Trust Canal -> Hephaestus -> Talos -> Mycelium/Worker -> verified apply chain remains untouched.
5. **Workstation** — Command Deck consumes the projections; UI can evolve independently of the motor.

## Next structural slices

- V2-010B: durable Work object/transition ledger with feature -> slice -> stage -> task identities, built as a projection/controller over Missions rather than a second Talos.
- V2-010C: project creation/materialization from `.othrys/project.json`, including role/capability/model presets.
- V2-010D: permission/operating-mode policy mapped to Trust Canal (`OBSERVE`, `PLAN`, `SUPERVISED_EXECUTE`, `AUTONOMOUS_EXECUTE`).
- V2-010E: Mnemosyne project knowledge registry, source classes, Inbox/Review, export/reconstructibility and local-search contract.
- V2-010F: Switchyard request contract for capability/tier/locality/privacy/cost rather than provider names.
- V2-010G: integration registry and bounded tool/app adapters with explicit authority class.

The goal is not a Panda clone. It is a Panda-class workstation whose backend is stronger because every consequential transition can remain bound to V2 authority and proof.
