# Component Contract: The Book of Trust Canal

**ID:** `trust-canal`
**Book:** `books/book-of-trust-canal/README.md`
**Owner:** `TRUST_CANAL`
**Purpose:** Admission and authority boundary for intents and execution progression.
**Inputs:** intent; actor; operating mode; mission/evidence binding
**Outputs:** admission or rejection bound to exact input digest
**Dependencies:** GPT Control; operating mode; Mission/Work; Talos evidence
**Allowed touch:** admission ledger and policy evaluation only
**Forbidden touch:** execute admitted work; infer missing authority; let mode/model/UI bypass policy
**Authority:** NO_SELF_GRANT -- default deny; authority must already exist and bind exactly
**Evidence:** V2-002E; V2-010D; .othrys/project.json#systems/trust-canal

## Loop contract
- OWNER: `TRUST_CANAL`
- TRIGGER: new governed intent or admission request
- INPUT: intent; actor; operating mode; mission/evidence binding
- STATE: append-only admission evidence + current policy
- BUDGET: one deterministic policy evaluation per request
- EXIT CONDITION: admit exact request or reject with evidence
- EVIDENCE: V2-002E; V2-010D; .othrys/project.json#systems/trust-canal
- STALL/FAILURE: missing/ambiguous binding fails closed immediately
