# Component Contract: The Book of Visual Control

**ID:** `visual-control`  
**Book:** `books/book-of-visual-control/README.md`  
**Owner:** `GPT_CONTROL`  
**Purpose:** Fail-closed visual observation and before/after evidence contracts.  
**Inputs:** finite frame facts: node/surface/source/time/viewport/image digest + bounded UI metadata  
**Outputs:** normalized observation, freshness/usability assessment, comparison, Talos verification candidate  
**Dependencies:** Talos verification; Mycelium node identity/routing; Trust Canal authority  
**Allowed touch:** finite evidence validation, digesting, freshness, blankness, comparable before/after deltas  
**Forbidden touch:** screenshot capture; image storage; mouse/keyboard; streaming; OCR/vision inference; node routing; execution verification; authority  
**Authority:** NO_SELF_GRANT -- seeing or detecting a visual change never authorizes or proves consequential action  
**Evidence:** V2-011H; V2-011I; .othrys/project.json#systems/visual-control; runtime/os/visual_control.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: explicit finite visual observation/comparison request
- INPUT: supplied facts only; no hidden capture/session state
- STATE: none required by resident kernel
- BUDGET: one deterministic evaluation per call
- EXIT CONDITION: observation/assessment/comparison/candidate or fail-closed error
- EVIDENCE: `runtime/os/visual_control.test.mjs`
- STALL/FAILURE: stale, future, blank, cross-node/surface/viewport or malformed evidence fails closed

