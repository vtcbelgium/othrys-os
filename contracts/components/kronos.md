# Component Contract: The Book of Kronos

**ID:** `kronos`
**Book:** `books/book-of-kronos/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Lifecycle, heartbeat and supervision contracts for platform LIFE evidence.
**Inputs:** explicit lifecycle states, timestamped component health evidence, finite lease facts, cancellation compensation plans, and bounded LIFE review requests
**Outputs:** fail-closed lifecycle transition evidence, honest heartbeat artifacts, supervision verdicts, cancellation contracts, or non-executing LIFE proposals
**Dependencies:** Trust Canal authority boundary; operating modes; Talos independent verification; Rhea escalation evidence; current Work remains separate
**Allowed touch:** pure lifecycle validation, heartbeat evidence construction, finite supervision evaluation, cancellation contract construction, LIFE proposal construction
**Forbidden touch:** boot/halt/safe-mode/recovery/shutdown execution; scheduler/daemon; product WORK; Talos verification; Trust Canal approval; composition-root mutation; credentials
**Authority:** NO_SELF_GRANT -- lifecycle semantics and heartbeat evidence never authorize or execute lifecycle effects
**Evidence:** V2-011B; .othrys/project.json#systems/kronos; runtime/os/kronos.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: bounded lifecycle/heartbeat/supervision/cancellation evaluation request
- INPUT: finite explicit evidence only; no hidden process, scheduler, sensor or authority state
- STATE: none required by the resident kernel; outputs are reconstructible from supplied evidence
- BUDGET: one bounded deterministic evaluation per call
- EXIT CONDITION: legal transition evidence, honest heartbeat, supervision verdict, cancellation contract, LIFE proposal, or fail-closed validation error
- EVIDENCE: V2-011B; runtime/os/kronos.test.mjs
- STALL/FAILURE: dishonest ALIVE claims, illegal transitions, malformed lease/health facts, or direct LIFE-action attempts fail closed; no speculative execution fallback
