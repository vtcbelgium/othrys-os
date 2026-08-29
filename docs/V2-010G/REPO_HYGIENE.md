# Repository Hygiene â€” V2-010G

**Rule:** classify before deleting. Git history is not a trash can and scratch is not architecture.

## Current classes
- **CANONICAL:** root Laws/Books/state/Chronicle, `runtime/`, `missions/`, admitted `blocks/`, `.othrys/project.json`, tracked evidence required by tests.
- **GENERATED LOCAL:** `.othrys/knowledge/archive/` and `.othrys/runtime/`; reconstructible or machine-local state; ignored by Git.
- **GENERATED TRACKED:** `.othrys/knowledge/catalog/`; deterministic provenance/index artifact intended for review and reconstruction.
- **HOUSEKEEPING TOOLS:** `tools/mnemosyne/`; keep only tools required to reproduce/verify the estate after 010G.
- **SCRATCH:** temporary repair/probe scripts. Must not survive 010G merely because they were useful once.
- **DEFERRED QUARRY:** `quarry/V2-010F-switchyard.partial.mjs` and other explicitly parked prototypes; preserve only if referenced from a durable quarry record, otherwise Hall of Echoes/archive then remove from working tree.
- **TOOL LOCAL STATE:** `.claude/`, `.pandaos/`; not OTHRYS OS canon unless separately admitted.

## Cleanup gate
For every untracked scratch helper ask: (1) is it required to reproduce a canonical artifact? (2) is it tested? (3) does a maintained tool already replace it? If no/no/yes-or-no, archive provenance if useful and remove it before closeout.

Tracked historical proof is not deleted merely for tidiness. Obsolete current-facing material is marked superseded/deprecated and routed to Hall of Echoes semantics before later physical cleanup.
