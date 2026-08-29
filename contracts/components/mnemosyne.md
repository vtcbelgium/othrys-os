# Component Contract: The Book of Mnemosyne

**ID:** `mnemosyne`
**Book:** `books/book-of-mnemosyne/README.md`
**Owner:** `MNEMOSYNE`
**Purpose:** Knowledge governance and institutional memory over explicit evidence.
**Inputs:** explicit project files; inbox captures; reviewed evidence; estate provenance
**Outputs:** search/context/export/quality/reconstructible knowledge views
**Dependencies:** Git/Mission evidence; Books; estate catalog; Nine Muses; Atlas read model
**Allowed touch:** governed knowledge inbox/review/catalog/archive operations under explicit mission law
**Forbidden touch:** research autonomously; build/execute; silently promote; let derived index replace source truth
**Authority:** NO_SELF_GRANT -- knowledge authority classifies/preserves but does not create execution authority
**Evidence:** V2-010E; V2-010G; .othrys/project.json#knowledgePolicy

## Loop contract
- OWNER: `MNEMOSYNE`
- TRIGGER: explicit capture/review/search/maintenance/export request or bounded housekeeping due event
- INPUT: explicit project files; inbox captures; reviewed evidence; estate provenance
- STATE: explicit sources + provenance + review records + reconstructible derived indexes
- BUDGET: bounded query/result limits; maintenance loop bounded by Loop Laws
- EXIT CONDITION: requested knowledge view/evidence produced or defect/blocker reported
- EVIDENCE: V2-010E; V2-010G; .othrys/project.json#knowledgePolicy
- STALL/FAILURE: conflict/staleness/secret ambiguity is surfaced and stops promotion
