# The Book of Hermes

**Status:** OTHRYS OS housekeeping edition — evidence-bound, non-authoritative by itself.

## Purpose
Provider-neutral communication contracts, message lifecycle and delivery evidence.

## Current house law
Hermes gives OTHRYS one canonical communication contract seam for normalized messages, conversation identity, actor-scoped idempotency, processing/delivery lifecycle truth, default-deny channel binding and no-limbo evidence.

No durable receipt means no ACK. Processing and delivery are distinct. Trust Canal remains consequential admission authority; Work remains orchestration truth; Talos remains execution verification/retry truth; Keymaster owns credential semantics. Hermes carries no raw secret or credential locator and never directly invokes Titans, shell or workers.

The current resident is pure and deterministic. It owns no database, provider, scheduler, live channel, dispatcher, retry worker or mutation engine. PandaOS may be copied for useful communication UX patterns, never for backend/storage/orchestration.

## Canonical evidence
- `V2-011F`
- `.othrys/project.json#systems/hermes`
- `runtime/os/hermes.mjs`

## Preserved quarry / provenance
- `othrys-core/hermes/**`
- Mission 044 and old Hermes protocol/storage/channel evidence preserved by the Great Harvest

## Book rule
This Book must never become a second Trust Canal, Work/Talos engine, credential broker, live provider backend, or execution authority.
