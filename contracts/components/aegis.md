# Component Contract: The Book of Aegis

**ID:** `aegis`
**Book:** `books/book-of-aegis/README.md`
**Owner:** `AEGIS`
**Purpose:** Security authority: monotonic observation, restriction, veto and lockdown over existing governed authority.
**Inputs:** normalized security event; Trust Canal authority state; Hecatoncheires posture; endpoint/security sensor evidence
**Outputs:** PASS/OBSERVE/WARN/RESTRICT/DENY/LOCK security verdict plus evidence reasons
**Dependencies:** Trust Canal; Talos; Keymaster; Hecatoncheires; host security telemetry
**Allowed touch:** Aegis policy/evidence surfaces and explicitly admitted containment adapters only
**Forbidden touch:** grant Mission authority; approve execution; reveal secrets; self-certify; weaken a stronger security verdict; bypass Trust Canal or Talos
**Authority:** NO_SELF_GRANT -- NEGATIVE_ONLY; Aegis may preserve or reduce existing authority, never create or expand it
**Evidence:** runtime/os/aegis.mjs; runtime/os/aegis.test.mjs; docs/AEGIS/SECURITY_MODEL.md; docs/HECATONCHEIRES_POSTURE.json; .othrys/project.json#authorities/aegis

## Loop contract
- OWNER: `AEGIS`
- TRIGGER: event-driven security evidence or consequential action gate
- INPUT: normalized event + existing governed authority + current security posture
- STATE: bounded security verdict, reasons, correlation id and tamper-evident event-chain state
- BUDGET: one deterministic evaluation per event; stateful correlation is separately bounded and cannot de-escalate the current verdict
- EXIT CONDITION: PASS/OBSERVE/WARN/RESTRICT/DENY/LOCK verdict emitted with reasons
- EVIDENCE: runtime/os/aegis.test.mjs; docs/AEGIS/SECURITY_MODEL.md
- STALL/FAILURE: malformed or unbound consequential evidence fails closed; internal uncertainty never grants authority
