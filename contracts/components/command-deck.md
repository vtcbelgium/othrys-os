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
- TRIGGER: operator request, projection refresh, or admission-inbox polling cycle
- INPUT: read-only OS projections; operator gestures/intents; authenticated session
- STATE: read models + explicit pending/admitted intent state + local watcher error state
- BUDGET: admission watcher poll >=1000ms (default 5000ms), `--once` supported; polling performs no AI turn and process stop remains external
- EXIT CONDITION: projection rendered, intent handed to Trust Canal, `--once` completes, or watcher process is externally stopped
- EVIDENCE: V2-006E; V2-009B; .othrys/project.json#systems/command-deck
- STALL/FAILURE: stale/unavailable evidence is shown, not fabricated
