# The Book of Aegis

**Status:** ACTIVE TITAN — bounded negative security authority. This Book is non-authoritative by itself.

## Purpose
Aegis is the OTHRYS security authority: it observes security evidence and may only preserve, restrict, deny, quarantine, or lock authority already governed elsewhere.

## Current house law
Aegis is a Titan-class security authority with **negative authority only**. It cannot grant a Mission, approve execution, create credentials, certify evidence, or expand a capability.

Trust Canal remains the approval/admission authority. Talos remains the independent verification authority. Keymaster remains credential custody. Hecatoncheires remains the many-handed defensive posture/enforcement family under Aegis.

Aegis decisions are monotonic:
`PASS < OBSERVE < WARN < RESTRICT < DENY < LOCK`.

No Aegis reasoning layer, model, sensor, Book, UI, or policy hint may move a decision toward less restriction once a stronger decision exists.

## Core law
**Aegis may subtract authority. Aegis may never manufacture authority.**

## Defensive family
- **Labyrinth** — mandatory interception path for consequential agent actions as those paths are admitted.
- **Hecatoncheires** — existing eleven-hand defensive posture and bounded enforcement family.
- **Minotaur** — future stateful behavioral/anomaly correlation; a sensor, never an authority-granting oracle.
- **Keymaster** — secret custody and sealed credential use.
- **Tartarus** — future isolated/quarantine execution role, implemented with proven sandbox technology rather than a custom hypervisor.
- **T590 Sentinel** — independent witness/recovery node where practical.

## Hard boundaries
The following event classes are fail-closed `LOCK` classes:
- Aegis policy tampering;
- recovery-backup destruction;
- master-secret extraction;
- security-logging disablement;
- Sentinel takeover.

These are deterministic boundaries. Soft AI judgment may escalate them earlier but can never downgrade them.

## Identity doctrine
An AI's language style or “accent” is a behavioral biometric, not authentication.

High-confidence identity should progressively combine workload/process identity, content hashes, signed or hardware-backed session identity, model/runtime provenance, Mission binding, scoped capability, and behavioral history.

## Telemetry doctrine
Aegis normalizes security evidence from OTHRYS and existing endpoint controls. It does not replace antivirus, firewall, operating-system isolation, backup, or supply-chain verification.

Telemetry must be secret-minimized. Passwords, bearer tokens, API keys, cookies, and raw credential values are never legitimate Aegis ledger payloads.

Aegis event records are content-bound and may be chained so mutation or reordering is detectable. Durable off-host replication remains a later enforcement step.

## Present maturity
The first admitted runtime is intentionally pure and bounded:
- deterministic event normalization;
- recursive secret redaction;
- monotonic security decisions;
- hard-boundary LOCK semantics;
- authority composition that cannot create permission;
- tamper-evident event chaining;
- live Hecatoncheires posture inspection.

No autonomous process killing, firewall mutation, credential revocation, network isolation, or recovery action is granted by this admission.

## Canonical evidence
- `runtime/os/aegis.mjs`
- `runtime/os/aegis.test.mjs`
- `docs/AEGIS/SECURITY_MODEL.md`
- `docs/AEGIS/AEGIS_EVENT_SCHEMA.json`
- `docs/HECATONCHEIRES_POSTURE.json`
- `.othrys/project.json#authorities/aegis`

## Book rule
This Book may evolve only from inspectable implementation, tests, incident evidence, standards research, or reviewed Mnemosyne evidence. Security claims must state their trust assumptions. “Bulletproof” is not a valid evidence state.
