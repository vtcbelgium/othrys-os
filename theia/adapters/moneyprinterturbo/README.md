# MoneyPrinterTurbo adapter

**Canonical type:** Theia provider adapter / execution limb. It is not a new Arm.

MoneyPrinterTurbo satisfies Theia faculties used by Explainer, Clipping and future production graphs:
- local/stock/generated media ingestion;
- voice/audio generation;
- subtitles/captions;
- video assembly/rendering;
- asynchronous task status and artifact retrieval.

## Boundary

Theia/Opsis owns intent, production contracts, graph planning, rights, QA, budgets and authority.
MoneyPrinterTurbo owns only the provider-bound execution requested through this adapter.

It must not become:
- property identity;
- a source of publication authority;
- a replacement for Opsis;
- a credential store;
- the canonical script/story/continuity brain.

## Runtime

The supplied Compose definition binds API and diagnostic WebUI to localhost only.
The real runtime config and storage live outside Git under `~/.othrys/theia/moneyprinterturbo/`.
The adapter reads:
- `MPT_BASE_URL` (default `http://127.0.0.1:18080`);
- `MPT_API_KEY` for authenticated API calls.

The runtime config contains the same API key but is never committed.

## Capability

Active registry capability: `theia.video.moneyprinterturbo`.

Default admitted operations:
1. health check;
2. local material upload/list;
3. local BGM upload/list;
4. standalone audio;
5. standalone subtitles;
6. local video composition/render;
7. task list/status/polling;
8. authenticated artifact download;
9. task deletion.

AI-backed script, search-term and social-metadata endpoints are exposed by the adapter but fail closed until `allowAiTasks: true` is explicitly supplied.

The adapter admits only the local video source by default. Other MPT media providers must be explicitly admitted through adapter configuration after cost/credential review; this prevents an ordinary render request from silently reaching a paid generator.

Publication is deliberately excluded from the adapter surface. A rendered file is not permission to publish.

## Verification

Run:

```bash
node --test theia/adapters/moneyprinterturbo/adapter.test.mjs
```

Runtime certification requires a healthy `/ping` plus one completed no-cost local-material render.
Only after that evidence should readiness move from UNVERIFIED to READY.

Live status for System Manager/operations:

```bash
node theia/adapters/moneyprinterturbo/status.mjs
```

The status probe is secret-free and reports certified readiness separately from live provider health.

See `../../appendices/MONEYPRINTERTURBO.md` for the canonical Theia appendix, Legion/T590 host roles, System Manager integration and absorption strategy.
