# OTHRYS Brain production proof — 2026-09-24

Status: **LIVE / TRAINING / authority 0**

## Deployed runtime

Both live runtime surfaces are aligned to:

`80c4e767a99d83bf83329fc8aea22c4344556f38`

### T590
- canonical repo: `/home/jeroen/othrys-os`
- Command Deck: `othrys-command-deck.service`
- live port: 8780
- service status after restart: active

### Legion
- dirty development branch left untouched
- clean runtime worktree: `C:\Users\othry\Othrys-Runtime\othrys-os-main`
- bridge launcher redirected to clean runtime worktree
- launcher backup: `~\.config\othrys\start-legion-worker-bridge.ps1.brain-backup-20260924`
- supervised by user scheduled task: `OTHRYS-Legion-Worker-Bridge`
- live port: 8766
- capabilities: `engineering.patch`, `brain.router`

## First production smoke and discovered regression

The first production read-only request was:

`Inspect OTHRYS service status. Read only. Do not restart, reconfigure, deploy, or change anything.`

Jev correctly returned:
- lane: FAST
- task: status
- execution: false
- risk: 0
- executor: `deterministic.status`

However, the legacy deterministic front-door regex saw the word `deploy` inside the negated phrase `Do not ... deploy` and forced a governed Mission.

Observed pre-fix outcome:
- brain source: `JEV_CORTEX`
- brain lane: FAST
- deterministic false positive: BUILD
- mission required: true
- canonical Mission created: `V2-011S`
- authority: false
- execution: false

`V2-011S` was **not activated and was not deleted**. It is preserved as evidence of the pre-fix regression.

## Production fix

The deterministic front door and brain mission floor were hardened:

- negated mutation clauses beginning with `do not`, `don't`, `never` are not treated as positive actions;
- `without <mutation>` tails are excluded from positive action intent;
- explicit read-only/prohibition language no longer forces BUILD;
- positive mutation verbs remain governed:
  - build / implement / fix / deploy
  - restart / reconfigure
  - rotate / revoke
  - delete / drop
  - update / change / write / edit / remove
  - install / uninstall
  - apply / commit / push / merge
  - restore / migrate / publish
- explanatory questions such as `How do I delete a local git branch?` stay inert;
- degraded fallback still treats positive mutation as governed work.

Verification before deployment:
- focused brain/front-door/planner suite: **25/25**
- broad OTHRYS OS + Command Deck regression: **532/532**
- zero failures
- zero skipped

## Exact production retest

The same production sentence was submitted again after deployment.

Observed outcome:
- receipt: accepted / canonical
- source: `JEV_CORTEX`
- degraded: false
- deterministic intent: `OPERATION`
- deterministic mission floor: false
- lane: `FAST`
- task: `status`
- execution: false
- risk: 0
- executor: `deterministic.status`
- mission required: false
- authorization granted: false
- authority granted: false
- execution started: false
- dispatch status: `NO_MISSION_REQUIRED`
- canonical Mission: none
- mission count before: 167
- mission count after: 167
- mission delta: **0**

The result persisted a canonical brain evidence file and did not mutate the Mission sequence.

## Operational conclusion

The live OTHRYS brain now performs semantic routing before governed planning while preserving deterministic safety and failover:

`System Manager/Web -> T590 Command Deck -> Legion brain.router -> Keymaster -> Jev -> brain decision -> FAST/LIGHT/DEEP -> existing governance`

Key invariants:
- one Jev evaluation per new command; persisted decisions replay without provider calls;
- Cortex loss degrades explicitly to deterministic fallback;
- no API key leaves Legion Keymaster;
- FAST read-only requests do not create Missions;
- DEEP / positive mutation requests remain governed;
- Jev never grants execution authority;
- existing Themis / Trust Canal / Switchyard / Talos boundaries remain authoritative.
