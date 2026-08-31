# OTHRYS Training Mode — Level 2 Report

**Mission:** V2-011K  
**Status:** COMPLETE  
**Data class:** HIGH_VALUE_OPERATIONAL_LEARNING

Level 2 exercised durable local state rather than isolated utility functions: validated CRUD, atomic persistence, restart behavior, canonical serialization, corruption refusal, bounded history, query projections, import/export, backup/restore, migration and final physical composition.

## Final proof

- 24 / 24 Level 2 jobs COMPLETE.
- 24 Level 2 source test files: **181 / 181 PASS**.
- 24 Level 2 packaged candidate proof files: **181 / 181 PASS**.
- Full Level 1 + Level 2 source rerun: 64 files, **486 / 486 PASS**.
- All 64 packaged Block/composition contract files: **486 / 486 PASS**.
- Runtime regression suite: 75 files, **346 / 346 PASS**.
- `nextTrainingJob()` returns `null` for the completed current level.
- Level 3 remains LOCKED; automatic level advance is disabled.
- Every Level 2 output remains TRAINING_CANDIDATE; no training evidence grants authority.

## Operational corpus

Level 2 retains 46 worker-result receipts. Forty-four carry measured durations totalling about **2054.49 seconds**. Ten receipts explicitly record `NO_ATTEMPT_MUTATION`; seven out-of-scope changes are retained as evidence rather than erased.

## What Level 2 taught the organism

**Hephaestus:** local builders can be productive, but a successful worker receipt is not a semantic pass. Level 2 produced repeated `ok:true` artifacts with wrong APIs, unsupported filesystem calls, stale state assumptions and contract drift. Builder fitness therefore needs runtime and contract evidence, not self-report.

**Talos:** the independent verifier caught false success repeatedly. Its highest-value oracles were byte preservation on corruption, exact API shape, restart/reload behavior, canonical serialization, mutation atomicity and composition boundaries.

**Mnemosyne / Rhea / Kronos:** failed mutations, timeouts, false finishes, repair streaks and operator recoveries are retained as organism training data. Operator repair is explicitly capability debt, never retroactive builder credit.

**Mycelium / Switchyard:** route evidence is task-specific. Qwen3.5 was generally faster in this corpus; Qwen3-Coder handled larger tasks but also generated semantic false positives. No global winner is inferred and no route gains authority automatically.

## Final four jobs

L2-021 Activity Log exhausted two malformed-path attempts, then rejected a path-correct `ok:true` artifact that used Deno and violated the Node/API/state contract. The recovered candidate proves bounded monotonic activity persistence and corruption refusal.

L2-022 Preference Profile rejected two `ok:true` implementations that used invalid filesystem APIs or swallowed corruption. The final proof pins recursive canonical JSON, deep-merge semantics, reload-on-operation and byte-preserving failure.

L2-023 Multi-list Manager rejected two self-reported successes with broken async filesystem semantics, weak validation and noncanonical persistence. The final proof pins nested identity scopes, exact return values, stable order and atomic compact state.

L2-024 Stateful Desk Tool was the strongest composition test. The first builder wired nonexistent child APIs; the repair then reported success after writing **zero bytes**. That false-finish class is now preserved explicitly. The final candidate physically composes the proven settings and todo stores and verifies staged import plus rollback-safe two-file replacement.

## Block outcome

The final four jobs produced `block.state.activity-log`, `block.state.preference-profile`, `block.state.multi-list` and `block.composition.desk-tool`. Their source tests and separately packaged candidate tests are green. They remain training candidates only: no admission, certification or Golden status is implied.

## Governance conclusion

Level 2 now proves the curriculum's bounded local-state layer across all 24 jobs under real builder and orchestration friction. It also proves that OTHRYS can reject convincing-looking false progress when independent evidence disagrees.

This milestone does **not** grant autonomous execution, Block admission, provider trust or Level 3 progression. `currentLevel` remains 2, Level 2 is COMPLETE, Level 3 is LOCKED, and the next curriculum transition requires an explicit governed decision.
