# Component Contract: The Book of Missions and Work

**ID:** `missions-work`
**Book:** `books/book-of-missions-work/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Mission is canonical execution intent; Work is its durable OS orchestration projection.
**Inputs:** canonical mission envelope; result evidence; GPT state
**Outputs:** durable Work definition and append-only phase observations
**Dependencies:** Mission files; GPT state; Talos result evidence
**Allowed touch:** .othrys/work records derived from canonical mission truth
**Forbidden touch:** replace Mission authority; mutate immutable task definitions as progress theater; regress phase history
**Authority:** NO_SELF_GRANT -- Work organizes execution state but never authorizes it
**Evidence:** V2-010B; missions/**; .othrys/work/**

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: mission materialization or evidence/state change
- INPUT: canonical mission envelope; result evidence; GPT state
- STATE: immutable Work definition + append-only transitions
- BUDGET: one derived observation per evidence state; idempotent replay
- EXIT CONDITION: current phase observation recorded or regression rejected
- EVIDENCE: V2-010B; missions/**; .othrys/work/**
- STALL/FAILURE: unchanged evidence replays idempotently with no new transition
