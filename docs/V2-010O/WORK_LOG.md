# V2-010O Work Log

## Operator decision
The repeated redesign problem is now treated as a knowledge-infrastructure defect: OTHRYS needs one permanent harvest of prior code, intent and evidence before new design begins.

## Repo-first harvest design
- Read current V2 front door, Mnemosyne manifest, External Harvest and Build Plan first.
- Reused old Hub `hub/harvest/` philosophy: inventory -> classify/reconcile -> memory projection; never a new authority.
- Added a new deterministic Git lineage scanner because the current Mnemosyne estate indexes documents/logs/books but not complete code history.
- Source code is **not copied** into Mnemosyne; Git remains the provenance store.

## Coverage model
- Recursively discovers Git workspaces under Projects while excluding build/vendor/disposable roots.
- Normalizes SSH/HTTPS GitHub origins and collapses worktrees by repository lineage.
- Indexes current + historical code/config blobs reachable from all locally available refs.
- Indexes commit SHA/date/subject as an intent ledger.
- Historical-only objects stay explicitly historical; generated Mnemosyne catalogs never self-index.
- Four stale WSL-pointer Hub worktrees are recovered through their still-live parent Hub refs instead of disappearing from coverage.
## Baseline census
- 40 non-disposable workspaces -> 12 repository lineages.
- 11,255 recoverable code/config objects.
- 5,147 current objects; 6,108 historical-only objects.
- 3,091 commits indexed.
- 1,439 cross-lineage duplicate Git objects.
- ~428.7 MB represented by Git object identity without source payload duplication.

## Defects caught during implementation
1. Initial scanner syntax typo stopped before catalog mutation.
2. Windows locale decoding failed on an old commit subject; Git metadata reads are now explicit UTF-8 with replacement.
3. `.lstrip('./')` accidentally made `.othrys/...` generated state indexable; synthetic regression caught it and exact prefix handling replaced it.
4. Top-level-only discovery missed nested Oroi; recursive discovery added them.
5. Four Hub worktrees had stale `/mnt/c/...` gitdir pointers; parent refs proved their commits remain recoverable and the scanner now counts them via lineage recovery.

## Permanent surfaces
- `docs/GREAT_HARVEST.md`
- `.othrys/knowledge/catalog/great-harvest-code.jsonl`
- `.othrys/knowledge/catalog/great-harvest-commits.jsonl`
- `.othrys/knowledge/catalog/great-harvest-summary.json`
- `tools/mnemosyne/great_harvest.py`
- `tools/mnemosyne/great_harvest_query.py`

## Implementation proof before checkpoint
- Two complete Harvest rebuilds produced identical code + commit catalog digests.
- Focused Mnemosyne/House contract set: 46/46 PASS.
- Full runtime: 308/308 Node PASS.
- Mycelium: 66/66 Python PASS.
- Workers: 10/10 Python PASS.
- Synthetic Great Harvest history/worktree/payload regression: PASS.
- Mnemosyne quality verifies both Great Harvest catalog digests cheaply and keeps authority false.
