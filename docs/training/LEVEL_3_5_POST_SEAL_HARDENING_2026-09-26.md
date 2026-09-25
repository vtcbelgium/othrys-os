# OTHRYS Level 3.5 — Post-Seal Hardening Audit

**Date:** 2026-09-26  
**Baseline:** `cc8d568`  
**Scope:** post-seal verification and runtime hygiene only  
**Authority granted:** false  
**Automatic level advance:** false  
**Level 4:** LOCKED

## Findings and corrections

- The primary T590 checkout was clean and synced at `cc8d568`.
- The canonical runtime checkout was nine commits behind at `673dd1f`; it was safely fast-forwarded to `cc8d568` and the gateway was restarted.
- Twelve runtime-only Brain command/plan artifacts were preserved; none collided with tracked upstream files.
- A leftover recovery-seal server on port 8878 was stopped; the canonical gateway remains on port 8780.
- Retired Deck PWA assets and the superseded standalone intent CLI were removed from runtime source.
- The Deck extinction test now prevents those retired UI assets from returning.
- Web HTTP tests were writing Brain plans into the real checkout. A separate `OTHRYS_WEB_STATE_ROOT` seam now isolates test state while production defaults remain unchanged.
- Gateway ordering referenced nonexistent `othrys-mycelium.service`; it now targets the active `othrys-mycelium-node.service`.
- Front-door routing no longer mistakes planned/built `status page/site/dashboard` work for a live system-status operation; PLAN/BUILD and OPERATION remain separately regression-tested.
## Verification

Current-system whole-body verification now covers all tracked runtime Node/TS tests, Blocks tests, Theia tests, Mycelium, workers, and active auxiliary Python/QA/Mnemosyne tests.

- runtime Node/TS: 649 / 649
- Blocks Node: 536 / 536
- Theia: 9 / 9
- Mycelium: 78 / 78
- workers: 29 / 29
- auxiliary Python/QA/Mnemosyne: 36 / 36
- **whole-body total: 1337 / 1337 PASS**
- checkout mutation drift during whole-body: none
- package distribution imports: PASS

Frozen training/Forge evidence was audited separately: 496 / 498 passed. The two failures are historical Level-3 browser proofs whose Playwright dependency is not installed in the old resolution context; they are not part of the current operational gate.

## Boundary

This hardening pass changes verification quality and runtime hygiene only. It grants no execution authority, no automatic admission, no automatic training progression, and does not unlock Level 4.
