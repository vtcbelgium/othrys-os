# Component Contract: The Book of GPT Control

**ID:** `gpt`
**Book:** `BOOK_OF_GPT.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Roadmap/control owner that issues bounded missions and preserves the next legal action.
**Inputs:** operator intent; live repo truth; prior mission evidence
**Outputs:** bounded mission; state; build order; next legal action
**Dependencies:** Git truth; Trust Canal; Talos; Mnemosyne
**Allowed touch:** control files, mission envelopes, state and planning records
**Forbidden touch:** self-verify; bypass Trust Canal; invent repo truth; execute outside mission scope
**Authority:** NO_SELF_GRANT -- GPT controls planning but cannot ratify its own implementation
**Evidence:** BOOK_OF_GPT.md; GPT_STATE.json; GPT_RAILS.md

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: operator instruction or verified next legal action
- INPUT: operator intent; live repo truth; prior mission evidence
- STATE: GPT_STATE + mission + front-door files
- BUDGET: one mission rule; bounded tool attempts
- EXIT CONDITION: bounded mission issued/closed or human-only decision required
- EVIDENCE: BOOK_OF_GPT.md; GPT_STATE.json; GPT_RAILS.md
- STALL/FAILURE: stop when evidence is ambiguous or action would widen authority
