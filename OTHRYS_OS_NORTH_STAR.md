# OTHRYS OS — NORTH STAR

**Canonical naming decision:** 2026-08-27  
**Status:** ACTIVE DIRECTION / NOT A REWRITE AUTHORIZATION  
**Former working name:** OTHRYS V2

## Decision
OTHRYS V2 is now product-facing and strategically named **OTHRYS OS**.

OTHRYS OS is the operating surface over the proven V2 machinery, not a new codebase invented beside it. Existing V2 implementation, evidence, receipts and history remain valid and must not be mass-renamed.

The current physical repository/path may remain `othrys-v2` until a dedicated migration proves a rename safe. Historical mission IDs such as `V2-001A` remain immutable provenance.

## North Star
Build OTHRYS OS into a coherent AI operating environment that makes OTHRYS understandable, controllable and increasingly autonomous: projects/Oroi, Missions, Titans, Blocks, Mnemosyne, models/routing, Mycelium nodes, Factory, Trust Canal, Talos evidence, Command Deck and Visual Control in one surface.
## PandaOS quarry strategy
PandaOS is the immediate high-value reference implementation and UX quarry. We will study and harvest it aggressively, including screenshots and controlled experiments, while preserving OTHRYS semantics and independence.

Working rule:
`Panda feature -> understand -> compare to existing OTHRYS stock -> expose existing capability / harvest principle / Garden candidate / reject`

Do **not** blindly clone PandaOS code, branding, proprietary assets or terminology. “Copy Panda” means reproduce useful interaction/architecture patterns with original OTHRYS implementation and extend them toward the OTHRYS North Star.

Priority quarry targets already observed:
- Projects/workspace UX -> Oroi/project surface.
- Work State -> Mission state machine and Progress surface.
- Planner/Designer/Builder/Reviewer handoffs -> explicit owner/mode transitions.
- Human approval gates vs machine evidence gates -> Trust Canal + Talos contracts.
- Declared completion artifacts and durable answered-decision audit cards.
- Intervention policies: run automatically / ask at consequential gates / ask each slice.
- Skills -> Blocks UX, without weakening Block admission/proof.
- Atlas -> Mnemosyne/Garden research: project memory, maintenance, review, export and local search.
- Model tier requests, Auto selection and quota failover -> Switchyard/Auto Frugal research.
- Local connections -> Mycelium/provider integration research.
- Apps/integrations and project-local declarative configuration.

## Build-with-Panda experiment
PandaOS may be used as a **builder/tool to help construct OTHRYS OS**, initially only through bounded, evidence-producing tasks. Panda is never canonical authority over OTHRYS. OTHRYS repository truth, Trust Canal authority, independent verification and receipts remain authoritative.

Tomorrow's first real experiment should be one tiny reversible OTHRYS task, using Panda Work State end-to-end and comparing its result, evidence, cost, failure handling and operator burden against the existing V2/OTHRYS machinery.