# Component Contract: The Book of Prometheus

**ID:** `prometheus`
**Book:** `books/book-of-prometheus/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Intelligence and evidence evaluation over explicit, provenance-bound capability and research evidence.
**Inputs:** explicit capability facts, evidence facts, a bounded need, and an injected currentness timestamp
**Outputs:** explainable score/recommendation evidence or digest-bound external-evidence artifacts
**Dependencies:** current project evidence; qualified capability facts; Mnemosyne only as a downstream knowledge boundary
**Allowed touch:** pure deterministic intelligence evaluation and evidence-artifact construction
**Forbidden touch:** credentials; source self-registration; scheduling; knowledge admission; engineering execution; Talos verification; Trust Canal authority
**Authority:** NO_SELF_GRANT -- intelligence and evidence never become memory admission, execution, verification, lifecycle, or approval authority
**Evidence:** V2-010X; .othrys/project.json#systems/prometheus; runtime/os/prometheus.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: bounded intelligence/evidence request
- INPUT: explicit inspectable facts plus injected currentness; no hidden provider or memory state
- STATE: none required by the resident scoring/recommendation kernel; evidence artifacts are reconstructible from inputs
- BUDGET: one bounded deterministic pass over the supplied finite candidate/evidence set
- EXIT CONDITION: scored/recommended evidence, explicit rejection, or fail-closed validation error
- EVIDENCE: V2-010X; runtime/os/prometheus.test.mjs
- STALL/FAILURE: malformed, illegal, stale/suspect or below-floor inputs are rejected or downgraded explicitly; no speculative fallback or auto-promotion
