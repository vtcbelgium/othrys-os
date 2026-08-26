# OTHRYS V2 FOUNDATION LAWS

**Status:** ACTIVE FOUNDATION LAW  
**Scope:** Block #1 is admitted; its canonical V2 implementation/home and first composition proof are the active foundation work. **Block #2 remains forbidden until composition is proven.**
**Authority:** subordinate to accepted OTHRYS constitutional canon and `BOOK_OF_GPT.md`; binding on V2 foundation work.

These laws do not invent a new Block architecture. They make the recovered OTHRYS Block/Oros law operationally strict enough that the second Block cannot force a redesign.

### V2 CANONICAL BLOCK HOME — OPERATOR-RATIFIED
For V2 only, `othrys-v2` is the canonical monorepo. Active canonical Capability Block implementation lives under `blocks/<domain>/<slug>`. Legacy repositories remain quarry, provenance and historical source; this V2 ownership rule supersedes legacy `BLOCKS-HOME-001` **for V2 only** and does not rewrite legacy law. An Oros consumes the one canonical V2 Block source; no per-Oros copy or fork is permitted.

## 1. CANON BEFORE MECHANISM
Before adding foundation code, inspect `LEGACY_INVENTORY.md` and the cited Block/Oros sources. Reuse or extract existing law and code before inventing a parallel mechanism.

## 2. ONE BLOCK = ONE CAPABILITY
A Block has one coherent capability and the recovered OTHRYS anatomy: **Contract -> Port(s) -> Block directory -> Manifest/Passport**. Its contract declares `provides`, `requires`, `optional`, inputs, outputs, failure behaviour, authority, side effects and trust assumptions.

*Corrected by V2-000C.R:* `SOCKET` and `CAPSULE` do not occur in recovered Block or Oros doctrine. A typed, versioned attachment point is a **Port** (Book of Blocks §0.2); the executable body is the **Block directory** (`othrys-blocks/docs/CONVENTION.md`); Mycelium already owns "capsule" for agent context payloads.

## 3. THE PUBLIC CONTRACT IS VERSIONED
A Block must expose a precise public contract before consumers depend on it. Version contract changes semantically. A released version is immutable; changed behaviour ships as a new version.

## 4. IDENTITY IS CONTENT-BOUND
Name and version are not enough. An admitted Block version must be bound to a cryptographic digest of the exact admitted content/package plus its provenance. Same id+version with different bytes is invalid.

## 5. PROVENANCE IS PART OF IDENTITY
Record where the Block came from, what source revision produced it, what builder/process produced or extracted it when known, and what evidence verified it. Unknown provenance is stated as unknown; it is never guessed.

## 6. INDEX IS OBSERVATION, NOT AUTHORITY
V2 may keep a small Block index so humans/GPT can see what exists and where. The index must not become a universal registry, resolver, package manager or source of execution authority. Runtime truth remains in the Oros composition and evidence.

## 7. NOTHING RUNS BEFORE ADMISSION
Discovery is not admission. A Block becomes usable only after deterministic admission checks pass for the exact version/digest being mounted.

Minimum admission checks:
- identity + version + digest;
- manifest/contract validity;
- required Ports resolve;
- dependencies are explicit and compatible;
- authority, secrets, network and side effects are declared;
- required tests/evidence pass;
- both positive and negative controls exist for safety boundaries;
- provenance and maturity are honest;
- no unresolved blocker is hidden.

Admission failure = explicit reject/block. Never auto-repair during admission.

## 8. AUTHORITY IS DEFAULT-DENY
A Block receives only the paths, data, tools, network, secrets and side effects declared by its manifest and host contract. Capability does not imply permission. No ambient filesystem, network, database or secret access.

## 9. USE THE EXISTING MATURITY LADDER
Do not invent a second lifecycle vocabulary. Use the recovered OTHRYS maturity progression:

`RAW -> PROVEN -> REUSABLE -> CERTIFIED -> GOLDEN -> DEPRECATED -> RETIRED`

Maturity is evidence-backed and separate from current health. A historically CERTIFIED Block can still be unhealthy now.

## 10. PROMOTION REQUIRES NEW EVIDENCE
No self-promotion. A maturity promotion requires evidence appropriate to the new level, and where practical verification independent from the implementation actor. A passing local test alone does not imply REUSABLE or CERTIFIED.

## 11. NO SILENT UPGRADE, DOWNGRADE OR FALLBACK
An Oros never silently swaps Block version, implementation, provider, Bridge or Adapter. Every composition change is explicit, admitted and recorded. Downgrades and stale metadata must be detected rather than treated as normal updates.

## 12. RANGES DECLARE INTENT; LOCKS RECORD REALITY
Blueprint/product capability declarations may state acceptable versions/ranges. The running Oros records the exact resolved Block version, digest, provenance and evidence in its composition/lock. Runtime never executes an unresolved range.

## 13. OROS OWNS OPERATIONAL TRUTH
Blueprint says what is wanted. Admission/composition selects what is allowed. The Oros records what is actually mounted and running. An external index or GPT memory never overrides that operational truth.

## 14. BLOCKS COMMUNICATE ONLY THROUGH DECLARED BOUNDARIES
Data crosses Blocks through declared Port contracts or explicit artifact references. No undeclared global state, hidden filesystem rendezvous, ambient database coupling or conversational context is a legal integration seam.

## 15. DATA OWNERSHIP MUST BE ANSWERABLE
For every persisted artifact/state item, the composition must answer: who owns it, who can read it, who can write it, whether it is mutable, how it is referenced, and what happens when the Block is removed.

## 16. REMOVAL MUST FAIL LOUDLY, NOT GHOST-RUN
If a required Block is unmounted, the dependent capability must become explicitly unavailable. The system must not keep working through an undeclared import, stale singleton, cached object, copied implementation or hidden path.

## 17. BLOCK #2 IS THE COMPOSITION TEST
The second Block is not primarily a feature. It is the proof that Block #1 did not hard-code the house around itself. Block #2 must attach using the same anatomy and declared boundaries without changing the foundation rules.

**Block #2 remains forbidden until a real canonical Block #1 is admitted.** No Block #1 exists today: Control Feedback is `SHARED_SERVICE` / `PLATFORM_ONLY`, not a Capability Block (V2-000C.R).

## 18. REPLACEMENT IS A FIRST-CLASS TEST
For interchangeable implementations, prove: unmount old -> admit replacement -> mount replacement -> run the same contract test -> preserve only explicitly owned compatible state. If replacement requires hidden surgery, the boundary is not clean enough.

## 19. THE HOUSE MUST BE RECONSTRUCTIBLE
If the runtime folder disappears, canonical source + manifests + exact composition/lock + configuration references + evidence/receipts must be sufficient to reconstruct the same declared house. GPT memory, chat history and undocumented local state are not reconstruction dependencies.

## 20. UPDATES ARE NEW ADMISSIONS
Never mutate an admitted released Block in place. Build/extract a new version, bind it to a new digest/provenance record, admit it, then explicitly change composition. Preserve prior evidence for rollback/replay.

## 21. FAILURE STATE IS PART OF THE CONTRACT
A Block must define how it refuses invalid input, missing dependencies, denied authority and unavailable runtime requirements. Failure must be observable and attributable; no fake success, silent no-op or infinite retry.

## 22. DO NOT BUILD THE CITY YET
At this stage do **not** add a universal resolver, marketplace, package manager, daemon, multi-agent orchestrator, general plugin host or automatic promotion engine. Repeated real composition must prove the need first.

## FOUNDATION EXIT TEST
The empty house is ready for Block #2 only when OTHRYS can truthfully answer the questions below **about an admitted Capability Block**. As of V2-000E none is admitted, so the exit test is unmet by definition, not by omission.

1. What is Block #1, exactly?
2. What contract/version/digest is admitted?
3. What may it read/write/do?
4. What evidence proves it?
5. Where is it mounted in the Oros?
6. What happens when it is absent?
7. Can it be replaced without hidden surgery?
8. Can the house be reconstructed from canonical records?

If any answer depends on memory, convention, hidden state or narrative, the foundation is not frozen.