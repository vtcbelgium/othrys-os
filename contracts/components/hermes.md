# Component Contract: The Book of Hermes

**ID:** `hermes`
**Book:** `books/book-of-hermes/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Provider-neutral communication contracts, message lifecycle and delivery evidence.
**Inputs:** finite secret-free envelopes, explicit durable receipt references, channel bindings, delivery/processing states, explicit timestamps
**Outputs:** normalized envelopes, idempotency identity, lifecycle decisions, default-deny binding decisions, non-executing delivery intents, limbo assessments
**Dependencies:** Trust Canal for consequential admission; Work for orchestration truth; Talos for execution verification/retry truth; Keymaster for credential semantics
**Allowed touch:** message normalization, conversation/order validation, actor-scoped idempotency, processing/delivery transition validation, binding eligibility, ACK eligibility, limbo reporting
**Forbidden touch:** live network channels; database/store ownership; raw secrets or credential locators; provider calls; product-work execution; mutation execution; approval authority; direct Titan/shell/worker invocation
**Authority:** NO_SELF_GRANT -- Hermes transport/evidence never authorizes consequential action
**Evidence:** V2-011F; V2-011G; .othrys/project.json#systems/hermes; runtime/os/hermes.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: bounded explicit communication-contract evaluation
- INPUT: finite supplied facts only; no hidden provider/store/scheduler state
- STATE: none required by resident kernel
- BUDGET: one deterministic evaluation per call
- EXIT CONDITION: normalized artifact, explicit allow/deny/transition result, limbo assessment, or fail-closed error
- EVIDENCE: runtime/os/hermes.test.mjs
- STALL/FAILURE: missing durability proof, denied binding, malformed identity/state, secret-bearing content, or illegal transition fails closed
