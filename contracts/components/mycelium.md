# Component Contract: The Book of Mycelium

**ID:** `mycelium`
**Book:** `books/book-of-mycelium/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Colony and node routing across OTHRYS machines.
**Inputs:** node envelopes; capabilities; health; work resource requirements
**Outputs:** authority-free route selection and node telemetry
**Dependencies:** Legion/T590 node adapters; Talos; worker contracts
**Allowed touch:** routing/telemetry state and bounded node invocation through proven worker paths
**Forbidden touch:** treat presence as trust; create mission authority; hardcode a machine as semantic owner
**Authority:** NO_SELF_GRANT -- routing selects feasible labor only
**Evidence:** V2-004D; .othrys/project.json#systems/mycelium

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: work requires node/capability placement or periodic Legion telemetry observation
- INPUT: node envelopes; capabilities; health; work resource requirements
- STATE: node envelopes + health/quarantine + route evidence + authority-free telemetry samples
- BUDGET: bounded route attempts; telemetry interval >=5000ms (default 10000ms), POST timeout 4000ms, `--once` supported
- EXIT CONDITION: feasible route selected or no eligible node proven
- EVIDENCE: V2-004D; .othrys/project.json#systems/mycelium
- STALL/FAILURE: unreachable/quarantined nodes stop being retried without new evidence
