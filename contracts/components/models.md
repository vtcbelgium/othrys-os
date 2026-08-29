# Component Contract: The Book of Models and Labor

**ID:** `models`
**Book:** `books/book-of-models/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Replaceable model labor exposed through current project model policy.
**Inputs:** model request class; current model policy; qualified availability evidence
**Outputs:** replaceable labor binding metadata or gated unavailability
**Dependencies:** project modelPolicy; proven local/advisory routes; Trust Canal for execution requests
**Allowed touch:** model policy and labor selection metadata only
**Forbidden touch:** equate model with role/authority; hardwire provider identity into architecture; auto-execute from selection
**Authority:** NO_SELF_GRANT -- model is labor, never authority
**Evidence:** V2-002C; V2-004D; .othrys/project.json#modelPolicy

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: component requests model labor under an existing authorized action
- INPUT: model request class; current model policy; qualified availability evidence
- STATE: declarative model policy + availability evidence
- BUDGET: bounded selection/evaluation; no autonomous model-churn loop
- EXIT CONDITION: eligible labor route identified or no qualified route reported
- EVIDENCE: V2-002C; V2-004D; .othrys/project.json#modelPolicy
- STALL/FAILURE: unknown/unqualified models remain unavailable; no speculative fallback
