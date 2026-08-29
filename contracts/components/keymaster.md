# Component Contract: The Book of Keymaster

**ID:** `keymaster`
**Book:** `books/book-of-keymaster/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Sanitized credential metadata, health classification and inert lifecycle policy.
**Inputs:** metadata-only credential records and bounded structured health signals containing no credential material or locator
**Outputs:** validated metadata records, health states, sanitized readiness projections, inert validation policy, or non-executing remediation proposals
**Dependencies:** Trust Canal approval boundary; Switchyard consumes sanitized readiness; Rhea consumes sanitized health; Kronos may consume readiness evidence
**Allowed touch:** metadata validation, health classification, sanitized readiness aggregation, risk-policy projection, remediation proposal construction
**Forbidden touch:** secret values or locators; vault access; provider calls; raw provider bodies; store/replace/revoke/rotate; account/billing mutation; scheduler; UI authority
**Authority:** NO_SELF_GRANT -- Keymaster intelligence cannot authorize or execute credential use or lifecycle mutation
**Evidence:** V2-011D; .othrys/project.json#systems/keymaster; runtime/os/keymaster.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: bounded explicit credential-metadata or health-evaluation request
- INPUT: finite sanitized facts only; no hidden vault/provider/scheduler state
- STATE: none required by resident kernel; all outputs reconstruct from supplied sanitized evidence
- BUDGET: one deterministic validation/classification/projection per call
- EXIT CONDITION: sanitized result, remediation proposal, or fail-closed validation error
- EVIDENCE: V2-011D; runtime/os/keymaster.test.mjs
- STALL/FAILURE: secret-adjacent fields, secret-shaped values, malformed health signals, unknown risk/category, or direct credential-action attempts fail closed
