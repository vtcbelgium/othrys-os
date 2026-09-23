# APPENDIX A — MONEYPRINTERTURBO

**Status:** ACTIVE EXECUTION APPENDIX — verified on Legion and T590; Theia itself remains broader and intentionally incomplete.

MoneyPrinterTurbo (MPT) is a replaceable execution appendix of Theia. It is not a Titan, not an Arm, not Opsis, and not the creative brain.

Canonical placement:

```text
OTHRYS
└── THEIA
    ├── doctrine / properties / Arms
    ├── Opsis — media production control plane
    └── execution appendices
        └── MoneyPrinterTurbo — provider adapter + render worker
```

Theia decides what media should exist. Opsis plans and governs the production graph. MPT performs bounded media work behind Theia's adapter contract.

---

## 1. Runtime

Primary runtime:
- host: **Jeroen-Legion**;
- host OS: Windows 11 with Ubuntu 24.04 under WSL2;
- container runtime: Docker inside WSL2;
- GPU visible to WSL: NVIDIA GeForce RTX 5070 Laptop GPU, 8 GB VRAM;
- MPT API: `http://127.0.0.1:18080`;
- diagnostic WebUI: `http://127.0.0.1:18501`;
- runtime state: `~/.othrys/theia/moneyprinterturbo/` inside WSL;
- secrets remain outside Git.

Fallback runtime:
- VTC-t590 has an independently verified MPT deployment;
- its API is also localhost-only;
- fallback does not share the Legion API key.

## 2. Verified evidence

Legion verification on 2026-09-23:
- adapter unit tests passed;
- `/ping` returned healthy through Windows → WSL localhost forwarding;
- unauthenticated protected API access is refused;
- a local PNG was uploaded through the Theia adapter;
- MPT converted the still image into video material;
- narration timeline and subtitles were generated locally with `no-voice`;
- final 9:16 video render completed;
- artifact was downloaded again through the authenticated adapter;
- downloaded artifact SHA-256 was recorded.

Legion smoke task:
- task: `39a95d81-e732-437d-a892-96da1cd1bf0f`;
- state: complete;
- progress: 100%;
- artifact: `/tasks/39a95d81-e732-437d-a892-96da1cd1bf0f/final-1.mp4`;
- bytes: 142650;
- SHA-256: `1ae1d3bfd465ade55cad0a58e3fc47aaf4dd8e7548d9890b5e4b8bc952ee82af`.

This evidence proves the execution appendix. It does not prove every optional provider or publishing integration.

---

## 3. Current API surface

The running MPT OpenAPI exposes:
- health;
- complete video generation;
- standalone audio generation;
- standalone subtitle generation;
- task list/status/delete;
- music list/upload;
- video-material list/upload;
- task artifact stream/download;
- script generation;
- visual search-term generation;
- social metadata generation.

Theia's adapter deliberately exposes these through a smaller governed contract rather than leaking the upstream API everywhere.

## 4. Admission classes

### Available by default — local / bounded
- health;
- local material upload and inventory;
- local BGM upload and inventory;
- standalone audio;
- standalone subtitles;
- local image/video composition;
- task polling and recovery;
- authenticated artifact download;
- task deletion;
- 9:16 and other MPT-supported output formats.

### Explicit admission required
The following can invoke configured remote AI/providers and are fail-closed in the adapter unless explicitly enabled:
- script generation;
- visual search-term generation;
- social metadata generation;
- non-local video sources;
- generated image/video providers;
- paid TTS providers.

Admission must consider provider credentials, cost policy, rights, privacy and current Switchyard/Keymaster policy.

### Intentionally excluded from the Theia adapter
- automatic cross-posting;
- publication authority;
- platform credentials;
- unreviewed paid generation;
- property/world continuity decisions;
- Pemberton character canon;
- global OTHRYS mission authority.

MPT may contain upstream publishing features. Theia does not expose them merely because upstream can.

---

## 5. What Theia can use it for now

1. **Quick explainer** — script + local/generated assets → voice/subtitles → vertical or horizontal MP4.
2. **Study Buddy short** — course explanation → simple visuals → captioned short.
3. **OTHRYS explainer** — architecture or feature explanation → video artifact.
4. **Still-to-video** — one or more images → motion/zoom → narrated/captioned video.
5. **Local asset assembly** — existing clips/photos + audio/subtitles → finished media.
6. **Audio-only** — narration/timeline generation without final video.
7. **Subtitle-only** — SRT/timing generation for another renderer.
8. **Batch variants** — multiple video outputs from one production request.
9. **Prototype Pemberton output** — use MPT only for audio/subtitles/composition around externally produced character-consistent scenes.
10. **Render fallback** — MPT may remain the boring final compositor even when Theia-native storyboarding/generation replaces upstream creative logic.

## 6. Opsis integration law

Opsis should address the appendix through capabilities, not upstream implementation details.

Preferred graph nodes:

```text
SCRIPT / SCENE PLAN
      ↓
ASSET
      ↓
VOICE
      ↓
SUBTITLE
      ↓
ASSEMBLY / RENDER
      ↓
ARTIFACT
      ↓
QA / REVIEW
```

MPT may satisfy VOICE, SUBTITLE, ASSET-INGEST, ASSEMBLY and RENDER nodes.

A durable MPT task ID is checkpoint evidence. On retry, Opsis should query the existing task before creating a new paid or expensive job.

Artifacts remain Theia/Opsis artifacts even when MPT produced the bytes.

---

## 7. System Manager

System Manager consumes this appendix from repository truth.

The companion `system-manager.json`:
- identifies the appendix and capability;
- exposes Legion-local health and diagnostic links;
- provides safe command templates;
- never stores credentials;
- never claims publication authority.

System Manager actions prefill the existing governed OTHRYS command channel. They do not directly call MPT.

Local links only work from the machine hosting the runtime. Repository evidence remains visible everywhere.

---

## 8. Absorption strategy

Keep upstream MPT replaceable while progressively absorbing reusable ideas into Theia:
- task state and recovery;
- artifact manifests;
- provider interfaces;
- subtitle/timing logic;
- media ingestion;
- composition and render profiles;
- remote-job durability;
- generation history;
- Skill/capability packaging patterns.

Do not absorb:
- Streamlit as Theia's main UI;
- upstream product identity;
- provider-specific authority;
- monolithic service boundaries;
- automatic publishing policy.

The long-term success condition is not “MPT forever.” It is “Theia can use MPT fully today and replace any part tomorrow without changing Theia's contracts.”

## 9. Operator commands

From the OTHRYS repo:

```powershell
node --test theia\adapters\moneyprinterturbo\adapter.test.mjs
```

With the runtime environment loaded, the secret-free status probe is:

```text
node theia/adapters/moneyprinterturbo/status.mjs
```

Legion runtime is managed from WSL with the Compose file under:
`theia/adapters/moneyprinterturbo/docker-compose.yml`.

The diagnostic WebUI is an operator/debug surface only. Normal use should originate in Theia/Opsis/System Manager.

> **THE APPENDIX MAY EXECUTE MEDIA WORK. IT DOES NOT BECOME THEIA'S MIND OR OTHRYS'S AUTHORITY.**
