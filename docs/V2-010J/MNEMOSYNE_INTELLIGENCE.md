# V2-010J — Mnemosyne Intelligence

**Status:** implementation evidence, not authority.

This mission improves the existing Mnemosyne read path only. It does not add a second memory engine, embeddings, a vector database, an LLM reranker, autonomous promotion, or a new Greek subsystem.

## Added intelligence

- Estate evidence derives source currentness from live source bytes: `CURRENT`, `SUPERSEDED`, `DIVERGED`, or `MISSING`.
- Currentness is a warning/read model only; historical evidence remains retrievable and immutable.
- Context capsules use one total budget split across project truth, estate evidence and Atlas relations.
- House/project truth receives first claim on the budget; Atlas relations retain reserved space.
- Atlas neighbors expose concrete `relationKinds` and explain why they were selected.
- Derived warnings surface missing sources, review backlog, Atlas conflicts, stale estate sources and logical-source divergence.

## Retrieval optimization

The estate search now maintains a rebuildable in-process lexical cache keyed by the tracked catalog digest. A catalog change invalidates the cache automatically. The cache is derived and grants no authority.

Ranking no longer rereads original archive objects or live source files for every matched candidate. Lowercase search text is cached for ranking; original excerpts and live-source currentness are computed only for the final selected results.

Measured on Legion over the live ~8k-object estate after warm-up:
- `PandaOS Work State`: ~282 ms
- `Callimachus`: ~220 ms
- `Trust Canal`: ~270 ms
- repeated `Mnemosyne`: ~202 ms
- full `Mnemosyne` context capsule, 12/12 budget selected: ~221 ms

Before currentness/excerpt deferral, comparable context work was commonly ~1.4–2.6 s. No database or embedding dependency was introduced.
