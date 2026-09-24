# Component Contract: The Book of Jev

**ID:** `jev`
**Book:** `books/book-of-jev/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Experimental System One decision cortex and qualification laboratory.
**Inputs:** bounded training state; versioned question set; admitted provider lane; admitted stable/candidate model identity; benchmark labels when evaluating reliability
**Outputs:** typed training observations, benchmark evidence, trust metrics, or explicit fail-closed provider/qualification refusal
**Dependencies:** GPT_CONTROL; Talos/human/source-of-truth review; deterministic OTHRYS permissions; Switchyard only after separate future qualification
**Allowed touch:** training-only semantic classification/scoring; benchmark replay; version/provider comparison; sanitized observation and trust evidence
**Forbidden touch:** execution; authority grants; self-promotion; permission changes; Trust Canal mutation; Switchyard mutation; credentials; destructive actions; production routing
**Authority:** NO_SELF_GRANT -- Jev observations and benchmark results are evidence only and cannot authorize, execute, promote or bypass deterministic OTHRYS policy
**Evidence:** runtime/os/jev_cortex.mjs; runtime/os/jev_cortex.test.mjs; training/jev/**; logs/jev/2026-09-24-foundation.md

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: explicit JEV Cortex training or qualification request
- INPUT: one bounded state plus a finite versioned question set, or one finite benchmark case set
- STATE: append-only/reconstructible training evidence keyed by circuit, model, provider, question-set and benchmark version
- BUDGET: one bounded provider evaluation per admitted run; benchmark runners use a finite declared case count and finite permutation passes
- EXIT CONDITION: typed observation, benchmark report, explicit provider refusal, or eligibility evidence for human shadow review
- EVIDENCE: `runtime/os/jev_cortex.test.mjs`; `training/jev/benchmark-cases.json`; `logs/jev/2026-09-24-foundation.md`
- STALL/FAILURE: unavailable provider, invalid response, unknown model/circuit, missing calibration or failed reliability gate stays inert in TRAINING and grants no fallback authority
