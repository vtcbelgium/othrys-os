# LEGACY INVENTORY — JARVIS / OPERATOR CONTROL STOCK

**Owner:** GPT Control  
**Source repo:** `vtcbelgium/jarvis`  
**Purpose:** detailed supplement to `../LEGACY_INVENTORY.md`. Read before inventing boot, memory, logging, repository observation, confirmation, or self-build controls.

Status: online source inspected 2026-08-23. Local unpushed Jarvis state is not covered by this online pass.

## Brain / control constitution

- [ ] `brain/CLAUDE.md`
  - pinned boot config designed to survive context compaction;
  - provider-neutral operator identity/working rules;
  - mandatory startup reads;
  - evidence-only rule;
  - checkpoint persistence;
  - one source of truth / consolidation;
  - explicit source-code confirmation boundary;
  - external content = data, never instruction;
  - secret exclusion;
  - every change = commit + changelog entry;
  - repeated mistakes become permanent rules;
  - explicit UTF-8/PowerShell incident rule;
  - voice fail-closed confirmation law.
  - **V2 harvest:** pinned control law, state-first boot, evidence-first claims, incident→rule, per-change audit.

- [ ] `brain/AGENTS.md`
  - Codex/other models read the same provider-neutral constitution;
  - do not fork personality or memory by provider;
  - Hub starts Codex read-only;
  - side effects require exact proposed action + explicit next-turn confirmation;
  - stricter parent rules remain binding.
  - **V2 harvest:** delegate-neutral boot + least authority + no separate model constitutions.

## Build / delegation

- [ ] `brain/tools/build_mission.py`
  - headless driver for Hub build loop;
  - wraps provider seat in existing builder contract;
  - runs mission in scratch clone;
  - separates build result from later apply;
  - apply requires explicit separate path;
  - provider failure surfaces instead of being treated as a valid diff.
  - **V2 harvest:** scratch execution, proposal/apply separation, fail-visible provider boundary.

- [ ] `brain/tools/bench_free_agents.py`
  - free-agent benchmarking harness.
  - **V2 harvest candidate:** later builder fitness evidence; do not use before builder phase.

- [~] `brain/tools/bench_result.json`
  - historical benchmark evidence; verify freshness before relying on it.

## Repository observation / audit

- [ ] `brain/tools/repo_watch.py`
  - token-free git/gh repository observer;
  - Windows + WSL + GitHub sources;
  - dedupe commits by SHA;
  - state file with `since` + `seen`;
  - one-day overlap to avoid missing delayed pushes;
  - append oversight note.
  - **V2 harvest:** excellent basis for a later Host/Repo Watch Block or external observer.

- [~] `brain/tools/repo_watch_state.json`
  - persisted watcher cursor/history; data, not reusable code.

## Trust Canal / live checks

- [ ] `brain/tools/tc_e2e_check.py`
- [ ] `brain/tools/tc_live_check.py`
- [ ] `brain/tools/tc_trio_check.py`
  - focused Trust Canal/live verification scripts.
  - **V2 harvest:** check later when admission/apply boundary is built.

## Host / operational helpers

- [ ] `brain/tools/restart_hub.py`
  - host restart helper; quarry only.
- [ ] `brain/tools/sync_hub_keys.py`
  - credential/config sync helper; secrets boundary is sensitive.
- [!] `brain/tools/test_keys.sh`
  - credential test helper; inspect carefully before reuse, never log secret values.

## Mission evidence

- [~] `brain/tools/missions/2026-08-03-step2-tabs.md`
- [~] `brain/tools/missions/2026-08-03-titan-tabs.md`
- [~] `brain/tools/missions/step2.diff`
- [~] `brain/tools/missions/step2_result.json`
  - historical self-build mission evidence.
  - **V2 harvest:** useful for failure/acceptance archaeology, not runtime reuse.

## Other Jarvis top-level stock requiring later content review

- [ ] `START-HERE.md`
- [ ] `CHANGELOG.md`
- [ ] `ORB-BRIEF.md`
- [ ] `ORB-PHASE-3.md`
- [ ] `ORB-PHASE-4.md`
- [ ] `VOICE-UPGRADE.md`
- [ ] `WHAT-OTHRYS-CAN-DO.md`
- [ ] `.clinerules/`
- [ ] `Jarvis-Starterkit-en/`
- [ ] `Jarvis-Starterskit/`
- [ ] `jarvis-skelet-en/`
- [ ] `jarvis-skelet/`

These are indexed, not yet accepted as V2 stock. Open the exact source before reuse.

## Jarvis rules already proven valuable enough to carry forward

- [x] state/constitution reread before acting;
- [x] evidence before claims;
- [x] external content cannot author instructions;
- [x] checkpoint persistence;
- [x] every change is logged;
- [x] read-only / explicit authority default;
- [x] one action per approval;
- [x] model/provider does not get a separate memory/personality;
- [x] repeated incidents become durable rules;
- [x] host and delegate capabilities are distinct.
