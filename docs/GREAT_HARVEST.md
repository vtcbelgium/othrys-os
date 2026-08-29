# THE GREAT HARVEST

**Status:** PERMANENT MNEMOSYNE QUARRY / NON-AUTHORITATIVE
**Owner:** Mnemosyne under GPT Control
**Purpose:** stop OTHRYS from repeatedly redesigning things it has already built, tested, rejected, measured, extracted or superseded.

## Permanent law
Before designing or inventing a capability, inspect The Great Harvest for prior code, commits, tests, failures, measurements and lineage. Reuse/adapt/reject must be explicit when relevant prior stock exists. Quarry evidence never grants authority or automatic promotion.

## What The Great Harvest contains
1. **Mnemosyne Estate** — documents, Books, logs, receipts and research already indexed by the estate catalog.
2. **Code Lineage Catalog** — every recoverable code/config Git blob reachable from locally available refs, including deleted/historical objects.
3. **Live-Only Catalog** — fingerprints for uncommitted and non-Git code/config that exists on disk but lacks durable Git provenance.
4. **Network Perimeter Catalog** - classified code-bearing roots outside the canonical Projects estate on Legion and T590; duplicates/proofs/tool caches remain visible with explicit disposition.
5. **Commit Ledger** — commit identity, date and subject across each deduplicated repository lineage.
6. **Curated Gem Register** — `OTHRYS_OS_EXTERNAL_HARVEST.md` plus mission harvest reports where high-value stock is studied and ranked.

## Baseline — 2026-08-29
- 63 device-qualified Git workspaces collapsed into 25 repository lineages across the federated local census.
- 12,961 unique recoverable code/config Git objects; 5,815 currently present and 7,146 historical-only.
- 3,891 unique commit records.
- 3,173 Git objects occur across more than one lineage and remain visible as cross-lineage duplication.
- Source-code/source-config bytes represented by Git object identity: 309,273,171 bytes.
- 2,405 unique live-only source/config fingerprints across 2,563 physical locations; 48,757,301 bytes represented by fingerprints.
- Identical live-only content is content-collapsed while every device/path locator is retained.
- Live-only source payload copied into Mnemosyne: **NO**; durable provenance: **NO** until committed/admitted.
- Source payload copied into Mnemosyne: **NO**.
- Authority granted / automatic promotion: **NO / NO**.
- Whole-local-network perimeter: **24 classified roots** outside the Projects baseline, including canonical, duplicate, historical, proof, live-only and explicit tool-cache dispositions.
- Device coverage: Legion 12 perimeter roots; T590 12 perimeter roots.
- Important newly-accounted stock includes Jarvis, OTHRYS Memory, Panda Atlas, Codex work copies, portability/recovery proof repos, T590 OTHRYS/Core/Web/VTC/Titan checkouts, VTC Office, Odysseus, Claude artifacts, local Tools/WSL admin scripts, and loose historical/design specimens.
- Tool/plugin caches remain explicit exclusions; no source payload is copied.
## Canonical derived catalogs
- `.othrys/knowledge/catalog/great-harvest-code.jsonl`
- `.othrys/knowledge/catalog/great-harvest-commits.jsonl`
- `.othrys/knowledge/catalog/great-harvest-live.jsonl`
- `.othrys/knowledge/catalog/great-harvest-perimeter.jsonl`
- `docs/GREAT_HARVEST_PERIMETER.json` (human-auditable perimeter classification input)
- `.othrys/knowledge/catalog/great-harvest-summary.json`

Rebuild with `python tools/mnemosyne/great_harvest.py --projects <Projects> --othrys-root <othrys-v2> --perimeter-manifest docs/GREAT_HARVEST_PERIMETER.json`.
Query with `python tools/mnemosyne/great_harvest_query.py --root <othrys-v2> --query "<terms>"`.

## Coverage honesty
The code/config classifier now includes HTML, CSS/SCSS/Less, notebooks, Terraform/HCL and GraphQL in addition to the original programming/config formats. User-space sweeps also checked common non-project roots on both machines; empty roots are recorded by the census procedure rather than promoted into the catalog.

The baseline covers all code/config objects reachable from every locally available Git ref in the Projects lineages, plus fingerprints of current uncommitted/non-Git code there, and a separately classified perimeter census for legitimate code-bearing roots elsewhere on Legion and T590. Live-only records are locators, not durable archives: if the underlying file is deleted before it is committed/admitted, the Harvest can prove it existed but cannot reconstruct its bytes. Git objects that are no longer reachable by any local ref cannot be claimed harvested. Four old Hub worktrees contain stale WSL-style `.git` pointers on Windows; their branch refs remain present in the parent Hub Git graph and are therefore still indexed through that lineage. `_tc_scratch` is intentionally excluded as disposable test residue.

## Retrieval law
The catalog stores Git object identity and retrieval coordinates, not duplicated source payload. Historical code is retrieved from its owning Git lineage with `git show <object-or-commit>`. A matching historical object is evidence of prior work, not proof that it is current, secure, compatible or admitted.

## Design preflight
Every future OTHRYS design/build mission should ask, in order: **Do we already have it? Did we already try it? Did it fail? Was a better version built elsewhere? What tests and measurements survived?** Only then should new design begin.

## Relationship to current knowledge systems
The Great Harvest is a permanent quarry inside Mnemosyne. It does not replace the Great Library, Source Vault, Garden/R&D, Atlas or the curated External Harvest. Atlas may later derive relationships from it; Mnemosyne remains the knowledge authority; Git remains the source-code provenance store.
