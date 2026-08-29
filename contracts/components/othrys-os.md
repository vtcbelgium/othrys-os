# Component Contract: The Book of OTHRYS OS

**ID:** `othrys-os`
**Book:** `books/book-of-othrys-os/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** The current house: one operating surface over proven V2 machinery.
**Inputs:** project manifest; GPT state; Books; Missions/Work; evidence
**Outputs:** current-house composition and bounded control context
**Dependencies:** GPT Control; Trust Canal; Talos; Mnemosyne; Atlas
**Allowed touch:** front-door and declarative house files under an active mission
**Forbidden touch:** grant runtime authority; silently admit residents; rewrite historical evidence
**Authority:** NO_SELF_GRANT -- operator authority and governed mission/evidence gates remain external
**Evidence:** OTHRYS_OS_NORTH_STAR.md; .othrys/project.json; V2-010A; V2-010F

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: operator-directed house mission or bounded Housekeeper cadence
- INPUT: project manifest; GPT state; Books; Missions/Work; evidence
- STATE: GPT_STATE + Mission/Work + repo truth; Housekeeper local state/logs remain non-canonical telemetry
- BUDGET: one active mission; explicit bounded attempts; Housekeeper interval >=60s (default 5m), fast proof each cycle and full proof every 12 cycles
- EXIT CONDITION: mission evidence satisfies scope or blocker is recorded; Housekeeper cycle ends after one bounded inspection/test pass
- EVIDENCE: OTHRYS_OS_NORTH_STAR.md; .othrys/project.json; V2-010A; V2-010F
- STALL/FAILURE: stop on ambiguous authority, stale truth, or zero semantic progress
