# Component Contract: The Book of Switchyard

**ID:** `switchyard`
**Book:** `books/book-of-switchyard/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Deterministic capability and model-labor selection over predeclared legal qualified candidates.
**Inputs:** strict model request plus finite candidate facts already grounded by provider-health/certification/capability evidence
**Outputs:** SELECTED, APPROVAL_REQUIRED, or NO_LEGAL_CANDIDATE with explicit rejection reasons
**Dependencies:** project model policy; provider-health evidence; builder certification evidence; current capability declarations
**Allowed touch:** deterministic filtering/ranking and read-only selection evidence
**Forbidden touch:** credentials; provider mutation; capability invention; Trust Canal authority; worker launch; paid auto-approval
**Authority:** NO_SELF_GRANT -- selection evidence never becomes execution or approval authority
**Evidence:** V2-010U; .othrys/project.json#systems/switchyard; runtime/os/switchyard.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: bounded model/capability selection request
- INPUT: strict request plus predeclared legal candidate roster
- STATE: none required; selection is deterministic and reconstructible
- BUDGET: one bounded deterministic ranking pass over the supplied finite roster
- EXIT CONDITION: selected legal route, paid approval candidate, or explicit no-legal-candidate result
- EVIDENCE: V2-010U; runtime/os/switchyard.test.mjs
- STALL/FAILURE: unknown, unhealthy, untested engineering, privacy-incompatible or over-budget candidates are rejected; no speculative fallback
