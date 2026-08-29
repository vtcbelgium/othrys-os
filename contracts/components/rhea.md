# Component Contract: The Book of Rhea

**ID:** `rhea`
**Book:** `books/book-of-rhea/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Care and vitality stewardship over explicit system evidence and governed repair requests.
**Inputs:** explicit timestamped health observations, evidence references, CareCase state, Prometheus/Mnemosyne evidence references, and governed repair/lifecycle request facts
**Outputs:** care assessments, authority-free CareCase transitions, care plans, repair-request envelopes, vitality verification evidence, or Kronos escalation requests
**Dependencies:** current Work/Talos evidence; Prometheus; Mnemosyne; Hephaestus request boundary; Kronos LIFE ownership boundary
**Allowed touch:** deterministic vitality interpretation, anti-noise assessment, case-state transition, request/envelope construction, post-change vitality judgment
**Forbidden touch:** private health store; scheduling; engineering execution; Trust Canal approval; Talos verification authority; research ownership; memory admission; credentials; LIFE actions
**Authority:** NO_SELF_GRANT -- Care can request, interpret and escalate but cannot approve, execute, verify engineering, schedule, or control lifecycle
**Evidence:** V2-010Z; .othrys/project.json#systems/rhea; runtime/os/rhea.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: bounded evidence-backed vitality observation or explicit CareCase progression request
- INPUT: finite explicit evidence and current case state; no hidden sensor, memory, provider or scheduler state
- STATE: caller-supplied CareCase evidence only; resident kernel persists nothing
- BUDGET: one bounded deterministic interpretation or transition per call
- EXIT CONDITION: explicit care judgment, legal case transition, governed request envelope, vitality result, escalation request, or fail-closed validation error
- EVIDENCE: V2-010Z; runtime/os/rhea.test.mjs
- STALL/FAILURE: malformed evidence, skipped lifecycle state, secret-shaped input, or authority confusion fails closed; Care unavailability never becomes system-down authority
