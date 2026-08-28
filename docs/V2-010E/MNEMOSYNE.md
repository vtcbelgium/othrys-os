# V2-010E — Mnemosyne

Mnemosyne is the OTHRYS OS project knowledge service. It follows the useful Panda Atlas separation: the project declares explicit knowledge sources, while a service performs lifecycle operations over them.

## Lifecycle
`CAPTURE -> CLASSIFY -> REVIEW -> SEARCH -> MAINTAIN -> EXPORT`

Capture is inbox-only. Review can recommend `PROMOTE` or `REJECT`, but a review record carries `promoted:false`; this mission intentionally does not create a promotion executor.

## Project law
`.othrys/project.json` now declares `knowledgePolicy`:
- explicit files are source-of-truth;
- capture is inbox-only;
- promotion requires review;
- search is local and deterministic;
- export is reconstructible;
- opaque model memory is forbidden.

Every declared project source is projected with path, classification, presence and SHA-256 content digest.
## Service boundary
The Command Deck exposes only authenticated read operations:
- `GET /api/knowledge-search?q=...`
- `GET /api/knowledge-export`

There is deliberately no `/api/knowledge-write`. Maintenance reports missing sources and unreviewed inbox items but performs zero mutations.

## Panda dogfood
The Panda quarry finding that Atlas is a separate service over a declared knowledge path was captured as `inbox-cc73e3f2f89c185c325391e8`, then reviewed as `RESEARCH` in `review-a2b5a801ab4239ba83141044`. The review remains `promoted:false`.

## Proof
- Mnemosyne unit lifecycle: 7/7 PASS.
- Targeted service/API integration: 20/20 PASS.
- Full Legion runtime after integration: 209/209 PASS.
