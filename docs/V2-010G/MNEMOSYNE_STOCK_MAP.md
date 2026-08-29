# V2-010G — Mnemosyne Stock Map

**Scope:** housekeeping quarry only. This document classifies existing OTHRYS memory/knowledge code; it does not admit a new runtime subsystem.

The sweep found 3,476 unique source files with Mnemosyne-adjacent concepts across 38 Git workspaces. The strongest families are Core Mnemosyne/Great Library, Hub durable_memory, Hub Jarvis/Obsidian memory, Atlas, Talos composition and older deep-memory evidence missions.

## KEEP / USE NOW

| Stock | Why it belongs now | V2 disposition |
|---|---|---|
| SHA-256 source census + duplicate collapse | Makes one institutional object from repeated worktree bytes | Implemented by `tools/mnemosyne/estate_sweep.py` |
| Explicit provenance per source | Makes recall inspectable and reconstructible | Implemented in estate catalog |
| Exact leak-shape exclusion | Prevents credential-shaped historical bytes entering archive | Reused from Core `leak-screen.ts` |
| Nine Muses | Existing semantic routing law; no duplicate taxonomy needed | Already V2 Atlas/Mnemosyne law |
| Evidence ≠ admission | Indexed source must not silently become canon | Preserved: archive/catalog are source memory only |
| Callimachus inspection concepts | Duplicate/orphan/stale/book-drift/weak metadata are ideal housekeeping checks | Reused as read-only quality checks; no canon writes |
| Book Sidecar/Shelf law | Keeps Books aligned with implementation without making docs authoritative | Reused for OTHRYS OS house shelf |
| Immutable raw source + replaceable index | Lets retrieval evolve without rewriting evidence | Current archive/catalog separation |
| Project/Oros isolation as metadata | Prevents future project memory from becoming one undifferentiated store | Preserve in future catalog evolution |
| Source status / currentness vocabulary | Useful for drift and stale detection | Preserve as quality-report vocabulary, not a new DB |

## DEFER — HIGH-VALUE, NOT HOUSEKEEPING

| Stock | Evidence | Why deferred |
|---|---|---|
| SQLite FTS5 derivative index | Hub `durable_memory/store.py` | Current 115 MB archive search is already sub-second to ~1 s; database adds migration/state complexity without present need |
| Lexical-hash vector retrieval | Hub `durable_memory/store.py` / `retrieval.py` | Interesting local semantic fallback, but not required for consolidation |
| Ollama `embeddinggemma` semantic index | Hub-main `hub/jarvis_memory.py` | Proven local/private design, but adds model dependency explicitly out of scope for 010G |
| Incremental mtime/size embedding refresh | Jarvis memory | Excellent optimization if semantic indexing is later admitted |
| PostgreSQL + pgvector | `kronos_mnemosyne_life_001/schema.sql` | Infrastructure escalation; no measured housekeeping need |
| Version tables + `as_of` temporal recall | Hub `MemoryOffice` | Valuable future temporal truth; requires admission semantics beyond raw estate source history |
| Alias registry | Hub durable memory | Useful once logical knowledge identities exist beyond source hashes |
| Hybrid exact/alias/SQL/FTS/graph/vector fusion | Hub `retrieval.py` | Strong future retrieval pattern; current simple retrieval is sufficient and easier to verify |
| Governed context buckets | Hub `context_assembly.py` | Valuable future AI-context assembly; not storage housekeeping |
| Obsidian continuity packet | Hub-main Jarvis memory | Useful personal continuity pattern, but OTHRYS OS institutional memory must remain repo/evidence grounded |
| Source-backed virtual Great Library tree | Hub `library_tree.py` | Atlas already owns derived graph/workspace presentation; reuse ideas later without creating a parallel tree authority |

## REJECT AS OVERLAP / DRIFT

- A second canonical knowledge database beside explicit files and source archive.
- Any new Greek memory subsystem duplicating Mnemosyne, the Nine Muses, Callimachus, Clio, Melpomene, Erato, Thalia or Urania.
- A second graph authority beside Atlas; graph/search/indexes remain replaceable projections.
- Direct `MemoryOffice.remember()`-style canon writes from UI/models/builders without V2 review/admission gates.
- Treating source indexing as knowledge admission.
- Treating worktree copies as separate knowledge objects.
- Treating model memory, chat history, Obsidian, SQLite or embeddings as canonical OTHRYS OS truth.
- Re-activating Kronos LIFE, Prometheus harvest, Metis work creation or any legacy autonomous valve during this housekeeping mission.

## Measured decision

The first V2 estate contains roughly 115 MB of unique safe text evidence. Full content search on Legion measured roughly 0.2–0.6 s in the initial benchmark and ~0.7–1.1 s with richer provenance/result construction. That is already usable. The correct optimization at this point is **better ranking, provenance, deduplication and drift detection**, not another persistence stack.

`docs/V2-010G/MNEMOSYNE_CODE_QUARRY.json` preserves the complete code-quarry inventory for later missions.
