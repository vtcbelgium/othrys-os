# Component Contract: The Book of Blocks

**ID:** `blocks`
**Book:** `books/book-of-blocks/README.md`
**Owner:** `HEPHAESTUS`
**Purpose:** Admitted reusable capability units composed under exact identity and proof.
**Inputs:** candidate package; capability contract; admission and runtime proof
**Outputs:** exact reusable capability specimen with identity/digest/evidence
**Dependencies:** Hephaestus; Talos; admission records; Factory consumers
**Allowed touch:** canonical Block package and its admission/proof artifacts under mission scope
**Forbidden touch:** hide state/secrets/network authority; masquerade RAW stock as proven; fallback silently to quarry
**Authority:** NO_SELF_GRANT -- a Block provides capability, never authority
**Evidence:** V2-001F; V2-001G; V2-001I; blocks/**

## Loop contract
- OWNER: `HEPHAESTUS`
- TRIGGER: explicit quarry/qualification/admission/composition mission
- INPUT: candidate package; capability contract; admission and runtime proof
- STATE: versioned specimen + admission/proof lineage
- BUDGET: bounded qualification/admission attempts
- EXIT CONDITION: admitted maturity proven or blocker recorded without promotion
- EVIDENCE: V2-001F; V2-001G; V2-001I; blocks/**
- STALL/FAILURE: missing portability/authority/evidence proof stops admission
