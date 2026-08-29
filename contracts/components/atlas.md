# Component Contract: The Book of Atlas

**ID:** `atlas`
**Book:** `books/book-of-atlas/README.md`
**Owner:** `MNEMOSYNE`
**Purpose:** Derived read-only knowledge/system map over Mnemosyne and V2 evidence.
**Inputs:** Mnemosyne knowledge plus current V2 evidence projections
**Outputs:** derived typed graph, lenses, gravity/heat and related context
**Dependencies:** Mnemosyne; Books; Mission/Work; Nine Muses
**Allowed touch:** deterministic read-model projection only
**Forbidden touch:** canonical knowledge writes; grant authority; become a Titan/registry; expose secret-shaped data
**Authority:** NO_SELF_GRANT -- Atlas is always derived and read-only
**Evidence:** V2-010F; .othrys/project.json#atlasPolicy

## Loop contract
- OWNER: `MNEMOSYNE`
- TRIGGER: read/query/visualization request or source-evidence refresh
- INPUT: Mnemosyne knowledge plus current V2 evidence projections
- STATE: rebuildable graph projection only
- BUDGET: bounded deterministic projection/query
- EXIT CONDITION: derived graph/context returned or source defect reported
- EVIDENCE: V2-010F; .othrys/project.json#atlasPolicy
- STALL/FAILURE: missing evidence remains absent; no speculative edge creation
