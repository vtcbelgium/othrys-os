# THE GREAT HARVEST

**Status:** PERMANENT MNEMOSYNE QUARRY / NON-AUTHORITATIVE
**Owner:** Mnemosyne under GPT Control
**Purpose:** stop OTHRYS from repeatedly redesigning things it has already built, tested, rejected, measured, extracted or superseded.

## Permanent law
Before designing or inventing a capability, inspect The Great Harvest for prior code, commits, tests, failures, measurements and lineage. Reuse/adapt/reject must be explicit when relevant prior stock exists. Quarry evidence never grants authority or automatic promotion.

## What The Great Harvest contains
1. **Mnemosyne Estate** — documents, Books, logs, receipts and research already indexed by the estate catalog.
2. **Code Lineage Catalog** — every recoverable code/config Git blob reachable from locally available refs, including deleted/historical objects.
3. **Commit Ledger** — commit identity, date and subject across each deduplicated repository lineage.
4. **Curated Gem Register** — `OTHRYS_OS_EXTERNAL_HARVEST.md` plus mission harvest reports where high-value stock is studied and ranked.

## Baseline — 2026-08-29
- 40 discovered non-disposable Git workspaces collapsed into 12 repository lineages.
- 11,255 indexed recoverable code/config objects.
- 5,147 objects currently present; 6,108 historical-only objects.
- 3,091 indexed commits.
- 1,439 Git objects appear across more than one lineage and are therefore visible as cross-lineage duplication.
- Code/config bytes represented by Git object identity: 428,667,505 bytes.
- Source payload copied into Mnemosyne: **NO**.
- Authority granted / automatic promotion: **NO / NO**.
## Canonical derived catalogs
- `.othrys/knowledge/catalog/great-harvest-code.jsonl`
- `.othrys/knowledge/catalog/great-harvest-commits.jsonl`
- `.othrys/knowledge/catalog/great-harvest-summary.json`

Rebuild with `python tools/mnemosyne/great_harvest.py --projects <Projects> --othrys-root <othrys-v2>`.
Query with `python tools/mnemosyne/great_harvest_query.py --root <othrys-v2> --query "<terms>"`.

## Coverage honesty
The baseline covers all code/config objects reachable from every locally available Git ref in the discovered lineages. Git objects that are no longer reachable by any local ref cannot be claimed harvested. Four old Hub worktrees contain stale WSL-style `.git` pointers on Windows; their branch refs remain present in the parent Hub Git graph and are therefore still indexed through that lineage. `_tc_scratch` is intentionally excluded as disposable test residue.

## Retrieval law
The catalog stores Git object identity and retrieval coordinates, not duplicated source payload. Historical code is retrieved from its owning Git lineage with `git show <object-or-commit>`. A matching historical object is evidence of prior work, not proof that it is current, secure, compatible or admitted.

## Design preflight
Every future OTHRYS design/build mission should ask, in order: **Do we already have it? Did we already try it? Did it fail? Was a better version built elsewhere? What tests and measurements survived?** Only then should new design begin.

## Relationship to current knowledge systems
The Great Harvest is a permanent quarry inside Mnemosyne. It does not replace the Great Library, Source Vault, Garden/R&D, Atlas or the curated External Harvest. Atlas may later derive relationships from it; Mnemosyne remains the knowledge authority; Git remains the source-code provenance store.
