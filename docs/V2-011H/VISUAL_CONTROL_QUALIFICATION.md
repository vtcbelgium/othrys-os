# V2-011H — Visual Control Resident Qualification

**Verdict:** QUALIFIED_FOR_ADAPTATION / OBSERVE-ONLY FIRST RESIDENT  
**Start SHA:** `1f6d7ed2efc5181336a6efe0ce71df9403c9ad25`  
**Authority:** none granted by this qualification.

## Repo evidence inspected
- Current V2 `docs/V2-VISUAL-CONTROL/CONCEPT.md`: OBSERVE -> SUPERVISED -> AUTONOMOUS, verification separate from action.
- Great Harvest `1b94013...`: Studio `visual_proof.py`, real before/after PNG + computed-style proof.
- Great Harvest `b427539...`: Playwright browser visual-fidelity evidence and machine-readable screenshots.
- Harvest commits `466df95...` and `544660f...`: real DOM click/visual proof and browser load-truth repairs.

## Classification
**ADAPT.** V2 has no resident visual observation contract. Talos, Mycelium, Trust Canal and Command Deck already own verification, node routing, authority and operator projection; Visual Control plugs into those seams rather than duplicating them.

## Reuse as law
- nonblank image evidence and stable content digest
- explicit viewport/device/timestamp identity
- same-view before/after comparison
- pixel evidence plus semantic/UI metadata where available
- computed-state delta is stronger proof than navigation or source diff alone
- stale/blank/unknown evidence fails closed
- action and verification remain separate
- before/after evidence is attributable and inspectable

## Adapt first
The smallest resident is a pure observation/evidence kernel: validate a finite frame observation, classify freshness/blankness, derive a stable evidence digest, compare explicit before/after observations, and create a non-authoritative verification candidate for Talos. It does not capture screens itself.

Required observation facts: node identity, surface identity, captured-at timestamp, viewport dimensions, image digest/size, optional active-window/accessibility/UI metadata, and explicit capture source. No raw image bytes belong in the resident contract.

## Defer
- screenshot transport/capture endpoint
- tablet live-view wiring
- accessibility-tree acquisition
- 2–5 FPS streaming
- supervised pointer/keyboard intents
- autonomous observe/detect/act loops
- OCR/vision-model interpretation
- cross-node transport and retention backend

## Reject from first resident
- TeamViewer-style remote desktop backend
- direct mouse/keyboard execution
- action success inferred from click/keystroke
- second Talos verifier or second Mycelium router
- hidden mode escalation
- authority inferred from screen visibility
- PandaOS backend duplication

## Admission gate
A later House mission may admit only the pure OBSERVE contract kernel. Any capture adapter or input actuator requires a separate mission and proof. SUPERVISED/AUTONOMOUS remain closed.
