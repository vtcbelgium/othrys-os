# V2-011F — Hermes Resident Qualification

## Verdict
**ADAPT** — Hermes fills a real missing V2 infrastructure seam: provider-neutral communication acceptance, conversation/message identity, idempotency, lifecycle visibility and delivery evidence.

Hermes is infrastructure, not a Titan and not an authority layer.

## Great Harvest proof
Old Hermes Core/storage/dispatcher/channel/adversarial corpus was exercised before V2 admission work. The frozen spine is strongly proven (167 focused checks passed in qualification work). Nyx Mission 045 also remains useful evidence (9/9) but its standalone role overlaps current V2 Talos/Housekeeping/Mnemosyne/Hecatoncheires surfaces, so Nyx is MERGE/NO STANDALONE RESIDENT.

## REUSE semantics
- durable-before-acknowledge acceptance
- actor-scoped idempotency and message identity
- conversation-local monotonic ordering
- explicit visible message lifecycle; no silent limbo
- processing lifecycle distinct from delivery lifecycle
- provider-neutral channel boundary
- default-deny identity/capability intent
- bounded/sanitized failure evidence

## ADAPT to V2 ownership
- Trust Canal remains the only consequential intent admission/authority boundary. Old Hermes approval ladders do not become a second authority system.
- Work remains canonical orchestration projection. Hermes messages are transport/evidence, never WORK truth.
- Talos remains execution verification, retry and dead-letter truth. Hermes may report delivery/processing state but cannot certify execution.
- Keymaster owns credential health/policy. Hermes stores/carries no raw secret, token, locator or credential resolver.
- Mycelium/workers remain execution transport. Hermes does not directly invoke Titans, shell, Talos or workers.
- V2 resident should begin as a pure deterministic contract kernel; durable storage/adapters can bind later to existing V2 persistence/evidence seams.

## REJECT / DEFER from old backend
- private Hermes database/store as an automatic V2 architecture choice
- local dispatcher as a parallel worker/orchestrator
- governed mutation executor/approval engine
- Event Bus/read-model stack until cross-process replay ownership is explicitly solved
- live Telegram/ChatGPT/email/webhook/network adapters
- embedded credential lookup or provider configuration
- autonomous scheduler/recovery daemon

## Minimum legal resident seam
Pure message/conversation acceptance contracts + deterministic idempotency identity + legal lifecycle transitions + separate delivery evidence + no-limbo assessment. All outputs remain `authorityGranted:false` and `executionStarted:false`.

## PandaOS experience law
PandaOS remains an experience quarry, not a backend dependency. Great Harvest already proves V2 has a Panda-style Command Centre specimen (`437c913...`) and the local Panda Atlas is inventoried.

For Hermes and later Command Deck work, copy useful Panda experience patterns where they fit: one obvious conversational/control surface, low-friction project context, visible activity/progress, compact status, useful history/continuity, and tablet-friendly operation. Do **not** duplicate Panda's backend, authority, storage or orchestration. Canonical V2 truth remains LIVE = LEDGER = REPLAY = CANVAS.

## Admission gate
House admission may begin only with the minimum pure resident seam above, scoped tests, manifest/Book/component contract/Atlas/Mnemosyne derivation, full regression, and exact T590 proof. No live channel is required for resident admission.

## Additional focused proof
Historical Mission 044 Hermes event-bus suite: **7/7 PASS**. Its old cross-process replay limitation remains a defer gate; the pass does not promote the old event bus into V2 runtime.
