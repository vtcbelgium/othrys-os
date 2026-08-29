# Component Contract: The Book of Command Deck

**ID:** `command-deck`
**Book:** `books/book-of-command-deck/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Operator workstation and tablet-first control surface.
**Inputs:** read-only OS projections; operator gestures/intents; authenticated session
**Outputs:** operator presentation plus bounded intent records
**Dependencies:** Mission/Work; Trust Canal; Mnemosyne; Atlas; Mycelium
**Allowed touch:** UI projection and authenticated intent ingress only
**Forbidden touch:** direct execution; silent promotion; UI-derived authority; conceal evidence state
**Authority:** NO_SELF_GRANT -- presentation and intent capture never become authority
**Evidence:** V2-006E; V2-009B; .othrys/project.json#systems/command-deck

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: operator request or projection refresh
- INPUT: read-only OS projections; operator gestures/intents; authenticated session
- STATE: read models + explicit pending/admitted intent state
- BUDGET: event-driven; no unbounded polling or AI turn loop
- EXIT CONDITION: projection rendered or intent handed to Trust Canal
- EVIDENCE: V2-006E; V2-009B; .othrys/project.json#systems/command-deck
- STALL/FAILURE: stale/unavailable evidence is shown, not fabricated
