# V2-010N Work Log

## 2026-08-29 — repo-first quarry
- Scanned live V2 first, then VTC current tree/history, VTC Block extraction worktrees, Hub/Jarvis measured optimization evidence, and Core current/historical durability stock.
- VTC was read-only because unrelated user work is present. Dirty/behind Hub/Core worktrees were not updated; current Core comparisons used Git `origin/main` objects.
- Historical VTC OTHRYS Hephaestus/Prometheus/Talos symbols are preserved/superseded by current Core; no lost parallel VTC core should be revived.
- Durable ranked quarry recorded in `CROSS_REPO_GEM_HARVEST.md`.

## Context metabolism implementation
- Added deterministic `runtime/os/context_metabolism.mjs` after Mnemosyne selection; it does not alter search/ranking or knowledge authority.
- PINNED/ACTIVE stay full. Required/authority items cannot be evicted. Optional EVICTABLE may disappear. Reconstructible evidence may become a SHA-256 reference.
- Frozen identity skeleton rejects scope expansion. No AI/learned routing. No claimed compression without an actual reference or eviction.
- Mnemosyne retains its full inspectable context and derives a separate transport capsule.

## Measured live reduction
Complete serialized transport capsule versus current selected evidence payload:
- Mycelium: ~31% smaller
- Talos: ~43% smaller
- Mnemosyne: ~36% smaller
- Trust Canal: ~39% smaller
- Factory: ~37% smaller
- Hephaestus: ~42% smaller
- Atlas: ~38% smaller
Conservative current claim: **31–43% wire reduction**, identity selection unchanged.
## Estate-search hot-path optimization
- Profiling showed warm `assembleKnowledgeContext` cost was dominated by estate search: ~199–210 ms search versus ~13–15 ms Atlas and <1 ms maintenance; context metabolism itself ~0.07–0.09 ms.
- Added catalog-digest-keyed exact term-hit caches plus metadata cache and SHA->record map. First term observation still uses exact substring semantics; later queries examine only records already proven to contain the term.
- Catalog digest change resets all term/metadata/text-derived cache state.
- Persistent-process warm context benchmark, same live estate:
  - Mnemosyne ~214 ms -> ~37 ms (~5.8x)
  - Mycelium ~216 ms -> ~28 ms (~7.7x)
  - Talos ~232 ms -> ~36 ms (~6.4x)
- 16 live query families compared against a brute-force replica of the old full scan: 0 result/rank/matched-term mismatches.

## Hostile proof so far
- Context reducer focused + Mnemosyne/estate suite green after changes.
- 200,000 randomized context capsules: 0 evidence-loss / identity-expansion / fake-reference / authority failures.
- Cache regressions prove repeated semantic identity and catalog invalidation.
- Performance is derived/read-only only: cache state is reconstructible and cannot grant authority, promotion, truth or execution.
