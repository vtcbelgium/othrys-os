# Component Contract: The Book of Oroi and Projects

**ID:** `oroi-projects`
**Book:** `books/book-of-oroi-projects/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Project-local OTHRYS OS objects composed from proven roles, capabilities, knowledge and integrations.
**Inputs:** project template; proven roles/capabilities; model/knowledge/integration declarations; bounded optimization profile
**Outputs:** project-local .othrys substrate, durable project identity, and portable authority-free optimization policy
**Dependencies:** project manifest schema; Blocks; model policy; Mnemosyne; Mission/Work
**Allowed touch:** declarative project-local OS substrate materialization
**Forbidden touch:** generate application source implicitly; admit unknown capabilities; grant authority from manifest fields; hardcode node identity into project optimization policy; let optimization policy override Trust/Talos
**Authority:** NO_SELF_GRANT -- project declarations constrain composition but cannot authorize execution
**Evidence:** V2-010A; V2-010C; .othrys/project.json

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: explicit project creation/materialization request
- INPUT: project template; proven roles/capabilities; model/knowledge/integration declarations
- STATE: project manifest + deterministic materialized substrate
- BUDGET: one deterministic materialization with idempotent replay
- EXIT CONDITION: matching substrate exists or conflict/unknown reference fails closed
- EVIDENCE: V2-010A; V2-010C; .othrys/project.json
- STALL/FAILURE: manifest conflict or unproven reference stops materialization
