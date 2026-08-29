# Component Contract: The Book of Talos

**ID:** `talos`
**Book:** `books/book-of-talos/README.md`
**Owner:** `TALOS`
**Purpose:** Independent verification and evidence authority.
**Inputs:** candidate; mission contract; independent checks; receipts
**Outputs:** PASS/FAIL/BLOCKED evidence and replay-safe verification state
**Dependencies:** Mission/Work; verification adapters; Trust Canal
**Allowed touch:** verification evidence, test execution, receipts and bounded retry state
**Forbidden touch:** declare success from builder claims; silently repair while acting as verifier; grant mission authority
**Authority:** NO_SELF_GRANT -- evidence authority does not create execution authority
**Evidence:** V2-002B; .othrys/project.json#authorities/talos

## Loop contract
- OWNER: `TALOS`
- TRIGGER: candidate or due verification event
- INPUT: candidate; mission contract; independent checks; receipts
- STATE: verification ledger + retry/replay state
- BUDGET: `RetryPolicy.maxAttempts` (default 3) with deterministic exponential backoff (1s base, factor 2, 60s cap by default)
- EXIT CONDITION: verifier-gated SUCCEEDED, semantic FAILED, CANCELLED/BLOCKED equivalent, or DEAD_LETTERED when retry budget is exhausted
- EVIDENCE: V2-002B; .othrys/project.json#authorities/talos
- STALL/FAILURE: repeated checks without new evidence stop as zero progress
