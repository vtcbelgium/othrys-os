# Component Contract: The Book of Hephaestus

**ID:** `hephaestus`
**Book:** `books/book-of-hephaestus/README.md`
**Owner:** `HEPHAESTUS`
**Purpose:** Engineering authority for bounded construction under mission scope.
**Inputs:** admitted mission/build request; exact touch allowlist; proven capability stock
**Outputs:** candidate implementation/artifact plus build evidence
**Dependencies:** Trust Canal; builders; Blocks; Talos
**Allowed touch:** only paths explicitly permitted by the active engineering contract
**Forbidden touch:** touch out-of-scope paths; ratify evidence; alter mission authority; silently expand dependencies
**Authority:** NO_SELF_GRANT -- engineering authority is bounded by admitted mission scope
**Evidence:** V2-002F; .othrys/project.json#authorities/hephaestus

## Loop contract
- OWNER: `HEPHAESTUS`
- TRIGGER: admitted engineering/build request
- INPUT: admitted mission/build request; exact touch allowlist; proven capability stock
- STATE: engineering plan + attempt evidence + bounded workspace
- BUDGET: mission-defined attempts; default hard cap inherited from Talos/build path
- EXIT CONDITION: candidate produced for independent verification or causal blocker proven
- EVIDENCE: V2-002F; .othrys/project.json#authorities/hephaestus
- STALL/FAILURE: stop at first causal blocker or exhausted attempt budget
