# Library, Vault and Safety Research — V2-010G

**Status:** RESEARCH / ZERO AUTHORITY. This is a design quarry, not an admission.

## Internal findings
The Temporary Library already defines the useful invariant `LIBRARY -> ROOMS -> SHELVES -> ITEMS`, distinguishes Books/Laws/Research/Inventory/Chronicle, and requires explicit migration with no silent duplication.

Recovered Mnemosyne stock is stronger than the temporary map: **Source Vault** for immutable evidence, **Blueprint Vault** for approved architecture, **Hall of Echoes** for superseded/rejected/deprecated history, and **Hecatoncheires** as defence-in-depth rather than one decorative service.

Old Hecatoncheires law names eleven independently provable controls: identity/mission authorization; least privilege; encryption; integrity/tamper evidence; append-only audit; anomaly/enumeration detection; cross-Oros isolation; provider-context minimization; prompt-injection quarantine; backup/restore drills; export approval/emergency lockdown.

Blueprint/Crown stock already contains governed Blueprint index/compiler, family hierarchy, validation and proposal patterns. It must be quarried before any new Blueprint Vault implementation.

## External findings
NIST AI RMF and the GenAI profile favour lifecycle risk governance and explicit testing/evaluation/verification/validation rather than treating model output as trustworthy by default.

NIST's 2026 deployed-AI monitoring work reinforces continuous post-deployment observation because nondeterminism and changing inputs create failures that pre-deployment tests cannot exhaust.

Sigstore Rekor demonstrates a useful pattern for OTHRYS evidence: append-only, tamper-resistant metadata plus independently verifiable integrity. OTHRYS should harvest the pattern, not add a Rekor dependency in housekeeping.

OpenTelemetry provides a mature separation of traces, metrics, logs and point-in-time events with common semantic naming. OTHRYS should converge its event vocabulary toward that separation while keeping its own authority model.
## Lean target model
Do **not** build five storage engines. Keep one Mnemosyne knowledge substrate and expose governed logical chambers over it:

- **Great Library** — the human/institutional navigation surface over admitted knowledge and evidence references.
- **Source Vault** — immutable/content-addressed source evidence; byte identity and provenance first.
- **Blueprint Vault** — a protected classification of approved architectural/Blueprint artifacts, deny-by-default for mutation/export.
- **Hall of Echoes** — currentness boundary for superseded, rejected, deprecated and retired material. Searchable, never ranked as current by default.
- **Garden** — unadmitted ideas/seeds. Zero execution authority.
- **R&D Centre** — bounded experiments/research packages with hypotheses, evidence and outcomes. Zero production authority until admitted.
- **Chronicle** — curated institutional milestones/lessons, not raw telemetry.

These are **logical policy zones**, not permission to create new databases or services. The present content-addressed archive + catalog remains the storage baseline until measurements prove it insufficient.

## Recommended security direction
Revive **Hecatoncheires as a security posture/checklist**, not as a new daemon. Each hand gets `PROVEN / PARTIAL / ABSENT / NOT_APPLICABLE`, evidence pointers, last verification and owner. A posture checker must reject claims without live proof.

Add no encryption or secret manager theatrically. First classify what is actually sensitive, prove current filesystem/Git boundaries, keep secrets out of Mnemosyne, and design restore drills before claiming a Vault is safe.

## External references consulted
- NIST AI RMF / GenAI Profile, current through 2026.
- NIST AI Resource Center TEVV guidance and 2026 deployed-AI monitoring paper.
- Sigstore Rekor transparency-log architecture and security model.
- OpenTelemetry log/event/trace semantic conventions and AI-agent observability work.

**Decision for 010G:** harvest principles and vocabulary only. No external runtime dependency is admitted.

## 2026-08-29 external standards cross-check

The current OTHRYS design is compatible with three useful modern patterns without adding dependencies:

- **OpenTelemetry log/event model:** distinguish named point-in-time events from broader log records; keep timestamp, severity/name, attributes and body explicit so local JSONL can later map cleanly to telemetry tooling.
- **Sigstore/Rekor transparency-log pattern:** append-only records become stronger when batches/tree heads are cryptographically digestible and independently verifiable. OTHRYS should harvest the pattern for important canonical evidence; do not require a public Rekor service for local OS operation.
- **SLSA provenance:** artifact evidence should identify what was produced, by which builder/environment, from which source/base, and bind outputs by cryptographic digest. Existing V2 base-SHA / worker / verifier receipts already point in this direction.

Decision for 010G: keep the runtime dependency-free. Record these as future hardening targets for Hecatoncheires / evidence law; do not introduce OpenTelemetry, Sigstore, or SLSA libraries during housekeeping.
