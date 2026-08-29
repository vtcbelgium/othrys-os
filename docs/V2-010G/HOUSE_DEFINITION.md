# V2-010G — OTHRYS OS House Definition

**Status:** HOUSEKEEPING BASELINE / derived from live repo evidence.

OTHRYS OS is one house over the proven V2 motor. This document does not add residents, capabilities, authority, or future architecture. It names only what already exists and separates residents from quarry stock.

## House law

- Mission + Trust Canal + Talos remain the execution truth chain.
- Hephaestus is engineering authority; Talos is independent evidence authority.
- Mnemosyne governs institutional knowledge; Atlas is a derived read-only map.
- Mycelium routes the colony; models are replaceable labor, never authority.
- Factory builds/refines Oroi candidates from admitted capabilities.
- Command Deck is the operator workstation; presentation never becomes authority.
- Blocks are reusable capability units; Project/Oros manifests are declarative composition.
- Work is a durable orchestration projection over Mission evidence, never a second execution engine.
- Work-record task entries are immutable definition placeholders (`OPEN`); live progress is read from Mission evidence and append-only Work transitions, not by mutating the compiled task definition.

## Control and execution spine

`GPT Control -> Mission/Work -> Trust Canal -> bounded execution -> Talos evidence -> canonical closeout`

Hephaestus may perform bounded engineering inside that spine. Factory may compose product work inside it. No Book, model, UI, Atlas node, or Mnemosyne record may bypass it.

## Current residents

| Surface | Class | Current proof |
|---|---|---|
| GPT Control | control owner | `BOOK_OF_GPT.md`, `GPT_STATE.json` |
| Hephaestus | engineering authority | `V2-002F` |
| Talos | verification authority | `V2-002B` |
| Trust Canal | admission/authority system | `V2-002E`, `V2-010D` |
| Factory | product construction system | `V2-005D` |
| Mycelium | colony routing system | `V2-004D` |
| Command Deck | operator workstation | `V2-006E`, `V2-009B` |
| Mnemosyne | knowledge governance service | `V2-010E` |
| Atlas | derived read-only workspace | `V2-010F` |
| Missions + Work | execution intent + durable projection | `V2-010B` |
| Blocks | admitted capability units | `V2-001F/G/I` |
| Oroi / Projects | project-local composition objects | `V2-010A/C` |
| Models / labor policy | replaceable labor declarations | `V2-002C`, `V2-004D` |

The machine-readable resident inventory remains `.othrys/project.json`; the Book coverage registry is `books/BOOK_REGISTRY.json`.

## Not in the house yet

These are preserved in Mnemosyne quarry/estate evidence but are **not** current V2 residents merely because older OTHRYS code exists:

- **Prometheus** — substantial Core/Hub stock exists; no current V2 house admission in `.othrys/project.json`.
- **Rhea / Care** — legacy CareCase/Rhea stock exists; not admitted into current V2 house.
- **Switchyard** — partial 010F prototype is preserved in scratch/deferred evidence; current model policy exists, Switchyard system does not.
- **Visual Control autonomy** — concept is documented/gated; it is not a current execution resident.
- Other legacy Titans/offices — quarry only until a separate repo-grounded admission mission proves their place.

A future admission must update implementation, evidence, `.othrys/project.json`, Atlas projection, Book coverage and Mnemosyne provenance together. Documentation alone cannot move a surface into the house.

## Knowledge wing

Mnemosyne's official project-local home is `.othrys/knowledge/`. V2-010G adds a SHA-256 content-addressed estate archive plus a Git-readable catalog. Duplicate bytes across worktrees collapse to one object with multiple provenance references. Secret-shaped bytes are excluded before archive write.

Atlas consumes Mnemosyne/V2 truth as a derived read model. It never becomes a second knowledge authority.