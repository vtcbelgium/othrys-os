# OTHRYS Training Mode — Level 3.5 HubToWeb

**Level:** 3.5 — HubToWeb  
**State:** PLANNED / LOCKED  
**Entry gate:** Level 3 COMPLETE + explicit operator transition  
**Level 4:** remains LOCKED until Level 3.5 is sealed and separately advanced

## Purpose

Level 3.5 retires the historical Hub/Command Deck as a human interface. OTHRYS OS remains the machine: runtime, organs, evidence, governance, APIs and authority boundaries. OTHRYS Web becomes the single human-facing interface on Legion, tablet, phone and ordinary browsers.

This is a migration and extinction level, not a redesign permission slip. No state or authority may be duplicated into Web. Web projects OS truth and sends governed requests back to OS.

## Architectural end state

- `othrys-os`: sole runtime/control-plane truth and governed API owner.
- `othrys-web`: sole canonical human/operator interface.
- `othrys-blocks`: reusable capability implementation owner.
- `vtc-platform`: product/Oros proving ground.
- no separate Hub UI, Hub authority, Hub state store or competing operator shell.

The Command Deck remains operational until Web parity is independently proven. Deletion is last, never first.
## Migration inventory

The current Deck exposes nine retained API families plus its shell. Every row must end in MERGED, RETAINED_AS_OS_GATEWAY, or RETIRED_WITH_PROOF before cutover.

1. Deck shell/UI -> `othrys-web /control` — merge and replace.
2. `/api/status` -> Web system/status adapter — retain OS API, extract from UI server.
3. `/api/atlas` -> `othrys-web /othrys/atlas` — merge.
4. `/api/knowledge-search` + `/api/knowledge-export` -> Web Garden/knowledge — merge.
5. `/api/mission` -> Web missions/control — merge.
6. `/api/work` -> Web Work — merge.
7. `/api/model-selection` -> Web execution/Forge — merge.
8. `/api/build-route` -> Web execution — merge.
9. `/api/chat` + `/api/intent` -> Web control ingress — merge while preserving non-executing/authenticated semantics.
10. `othrys-command-deck.service` -> `othrys-os-gateway.service` only after UI extinction and T590 rollback proof.

## Seven phases

**3.5-A Inventory and freeze.** Enumerate every Deck surface, endpoint, caller, service and existing Web counterpart. Freeze the parity matrix.

**3.5-B Gateway extraction.** Split OS API/auth/telemetry behavior from Deck HTML/CSS/JS without changing endpoint contracts or authority.

**3.5-C Web parity.** Implement only missing retained operator surfaces inside `othrys-web`; reuse existing `/control`, Atlas, Work, Garden and mission surfaces first.

**3.5-D Device proof.** Verify desktop plus tablet/phone viewport behavior and authenticated operator flows. No device-specific authority.

**3.5-E Cutover.** Make Web the canonical operator entry while the old Deck remains rollback-only.
**3.5-F Extinction.** Remove old Deck UI read paths, retire Hub/Deck interface naming, and prove no live caller depends on them. Preserve provenance only.

**3.5-G Seal.** Fresh-clone OS/Web verification, T590 gateway service proof, rollback drill, whole-body tests and final extinction receipt.

## Non-negotiable laws

Web never becomes a second control plane. It may render, submit, request and project; OS remains the source of governed truth. No API migration may widen permissions, bypass Trust Canal, create automatic execution, or weaken authentication.

No destructive Deck retirement happens before parity proof. Historical Hub references may remain only as Chronicle/archaeology/provenance or explicit anti-regression assertions.

No Level 4 feature is pulled forward to make this migration easier: no new external auth provider, remote database, paid API or secret-bearing integration is required.

## Exit gate

Level 3.5 is complete only when the parity matrix is terminal, Web is the proven canonical operator interface, OS gateway behavior survives independently of Deck UI code, T590 runs the canonical gateway service, old Hub/Deck UI paths are extinct, all four repos are clean and reproducible, and Level 4 remains locked pending a separate operator command.

Planning Level 3.5 grants no authority and does not interrupt Level 3 execution.

## Intelligence requirement

HubToWeb may not become a mechanical migration. Talos is the central verification-and-learning nexus for Level 3.5. Every migration slice must feed verified behavior, failure, latency, routing, recovery and parity evidence back through `TALOS_INTELLIGENCE_LAW.md`.

A phase is not considered learned merely because its receipt exists. Talos must synthesize the evidence and produce a bounded downstream adaptation for Hephaestus, Switchyard, Kronos, Rhea, Mnemosyne, Prometheus, Mycelium or its own oracle coverage. At least one observable future decision must change because of verified evidence before the Level 3.5 seal can pass.

Authority, admission, paid usage, Trust Canal policy and level progression remain operator-gated. Intelligence changes preference and diagnosis; it does not create permission.