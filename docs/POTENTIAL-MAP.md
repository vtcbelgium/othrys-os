# OTHRYS POTENTIAL MAP

> Status: IDEA RESERVOIR — not roadmap authority, not permission to build.
> Created: 2026-09-07
> Purpose: capture what OTHRYS could become, what existing code may be productized, what it can produce cheaply, and what capabilities unlock each branch.

## 0. Rule of this document

This file is intentionally broader than the build plan. Ideas belong here before they earn roadmap status. Promotion requires evidence, demand, fit, cost estimate, safety/trust requirements, and explicit approval.

Idea states: `SEED -> INVESTIGATE -> PROVE -> CANDIDATE -> APPROVED -> BUILD`.

## 1. The small starting point

OTHRYS already wants to do a commercially useful loop:

`observe -> remember -> plan -> route -> build -> test -> review -> learn -> repair -> report`

The first sellable things should therefore be narrow products cut out of that loop, rather than trying to sell an entire autonomous OS.

### Tier A — easiest / closest to existing work

| Idea | Customer value | OTHRYS assets to reuse | Missing before sellable |
|---|---|---|---|
| Repo Health Report | Finds broken tests, stale deps, risky files, TODO debt, missing docs | Talos/Themis verification, ledgers, repo harvest | stable scanner, report schema, sandbox, benchmarks |
| AI Code Review Pack | Second-opinion review with evidence and confidence | reviewer loops, trust routing, provider comparison | GitHub PR adapter, policy presets, eval set |
| Project Memory Pack | Turns repo/docs/history into navigable project memory | Mnem/Atlas concepts, harvest/indexing | ingestion API, retrieval evals, permissions |
| Build/Test Autopilot | Runs bounded build-test-fix loops | builders, Cronos, Talos, execution ledger | hard budgets, rollback, isolation, CI adapters |
| AI Provider Router | Picks model/provider by cost, quality, task and health | Switchyard/frugal routing, provider tests | normalized adapters, live cost table, SLA metrics |
| Dependency/Tool Watch | Watches ecosystem and recommends useful changes | Prometheus/Forge Watch | source quality scoring, dedupe, notification UX |
| Engineering Daily Brief | One concise daily state/change/risk report | Cronos + Mnem + ledgers | connectors + report templates |
| Incident Explainer | Converts failures/logs into cause/evidence/next action | incident ledger, Talos, evidence receipts | log adapters, incident taxonomy |
| Capability Registry | Inventory of tools/agents/models and what is actually trusted | capability/skill trust work | packaging, UI/API, continuous qualification |
| Local AI Workbench | Uses local/free models first, escalates only when useful | Hephaestus builders, frugal policy | installer, hardware detection, model lifecycle |

## 2. What existing OTHRYS code/know-how could be sellable

Sell modules before mythology. Candidate extractable products/libraries:

- **Trust Gate SDK** — approve/quarantine capabilities based on evidence.
- **Execution Receipt SDK** — structured record of what an agent attempted, changed, tested and proved.
- **Model Router** — cost/quality/latency/privacy-aware model selection.
- **Builder Arena** — benchmark multiple coding agents/models on the same task.
- **Repo Harvester** — inventory code, docs, scripts, dead assets and hidden reusable components.
- **Project Memory Engine** — git-native canonical memory with provenance and conflict handling.
- **Agent Incident Ledger** — failure/containment/recovery history for autonomous systems.
- **Mission Guard** — prevents agents from silently expanding scope beyond an approved mission.
- **Evidence Gate** — blocks “done” until required tests/artifacts exist.
- **Change Risk Scorer** — scores a proposed change using blast radius, tests, trust and history.
- **Capability Qualification Harness** — tests a new tool/model before allowing production use.
- **Frugal Compute Router** — local/free/cheap-first execution with escalation rules.
- **Forge Watch** — discovers promising new builders/models/tools and sends them to qualification.
- **Prometheus Feed** — curated AI/software ecosystem intelligence instead of generic news.
- **Recovery Supervisor** — heartbeat, restart, quarantine and bounded self-repair.
- **Autonomy Scorecard** — measures how much of a workflow is truly autonomous versus human-assisted.

Possible packaging: open-source core + paid hosted dashboard; SDK + enterprise policy layer; self-hosted appliance; per-seat developer tool; usage-based API; consulting/install bundle; white-label engine.

## 3. Things OTHRYS could produce cheaply once the core loop works

### Software factory

- Micro-SaaS prototypes from a spec.
- Internal dashboards and admin tools.
- CRUD apps and portals.
- Static/business websites.
- API wrappers and connector services.
- Browser automations.
- Data import/export utilities.
- CLI tools.
- GitHub Actions / CI workflows.
- Test suites and regression packs.
- Migration scripts.
- Documentation sites.
- Boilerplates/starters.
- Small mobile/PWA utilities.
- Existing-app feature branches.
- Bug-fix patches with evidence receipts.

### Knowledge factory

- Repo maps and architecture maps.
- Technical documentation.
- Onboarding manuals.
- SOPs/runbooks.
- Change logs and release notes.
- Incident postmortems.
- Research briefs.
- Competitor scans.
- Technology watch reports.
- Requirements/specification packs.
- API documentation.
- Training material and quizzes.
- Decision records.
- Project timelines reconstructed from git/issues/docs.

### Data/operations factory

- Data cleaning pipelines.
- Classification/tagging.
- Entity extraction.
- Deduplication.
- Spreadsheet/report generation.
- KPI summaries.
- Scheduled monitoring.
- Alert triage.
- Ticket/email categorization.
- Knowledge-base maintenance.
- Back-office reconciliation helpers.

### AI factory

- RAG assistants for bounded corpora.
- Support copilots.
- Study copilots.
- Research agents.
- Coding-agent harnesses.
- Evaluation datasets.
- Prompt/test suites.
- Model comparison reports.
- Agent tool registries.
- Guardrails/policy packs.

## 4. Product constellation ideas

### OTHRYS Forge — software creation

1. **Forge Solo** — “give it a repo + bounded issue; receive tested PR.”
2. **Forge Arena** — competing builders, one reviewer, evidence-based winner.
3. **Forge Rescue** — ingest abandoned/legacy repo and produce recovery plan.
4. **Forge Bootstrap** — generate a production-ready starter from requirements.
5. **Forge QA** — autonomous regression/test authoring service.
6. **Forge Migration** — dependency/framework upgrade assistant.
7. **Forge Local** — privacy-first local coding factory.

### OTHRYS Sentinel — verification and reliability

8. **Sentinel PR** — risk-aware AI pull-request reviewer.
9. **Sentinel CI** — watches failed builds and explains likely cause.
10. **Sentinel Drift** — detects documentation/config/code drift.
11. **Sentinel Agent** — audits autonomous-agent actions.
12. **Sentinel Supply** — dependency/tool provenance and trust monitor.
13. **Sentinel Recovery** — bounded restart/rollback/self-heal supervisor.

### OTHRYS Mnem — organizational memory

14. **Mnem Repo** — living memory for a codebase.
15. **Mnem Team** — decisions, incidents, architecture and lessons in one provenance graph.
16. **Mnem Archaeology** — reconstruct why old code exists.
17. **Mnem Handover** — generate a departure/onboarding knowledge package.
18. **Mnem Personal** — local-first personal knowledge operating layer.

### OTHRYS Prometheus — intelligence

19. **Prometheus Dev** — daily relevant changes in AI/dev tooling.
20. **Prometheus Vendor Watch** — track provider pricing/models/outages/terms.
21. **Prometheus Competitor Watch** — evidence-based market changes.
22. **Prometheus Research Radar** — papers/repos/releases ranked by relevance.
23. **Prometheus Opportunity Radar** — identify automatable pain points from public/company inputs.

### OTHRYS Switchyard — routing

24. **Switchyard API** — one endpoint, policy routes to best model.
25. **Switchyard Local** — prefer on-device/local compute.
26. **Switchyard Budget** — enforce spend ceilings per mission/team.
27. **Switchyard Privacy** — route based on data sensitivity.
28. **Switchyard Resilience** — fail over when a provider/model breaks.

### OTHRYS Atlas — control plane

29. **Atlas Console** — missions, agents, models, machines, costs, evidence and health.
30. **Atlas Fleet** — orchestrate several PCs/servers as one bounded worker fleet.
31. **Atlas Home Lab** — simple AI/automation control plane for enthusiasts.
32. **Atlas Agency** — multi-client control plane for small automation agencies.
33. **Atlas Classroom** — safe student agent lab with budgets and audit trail.

## 5. Vertical products built on the same organs

### Developers / small software teams
- autonomous issue-to-PR worker
- test-generation service
- legacy code explainer
- dependency upgrade bot
- release manager
- architecture drift detector
- documentation maintainer

### SMEs
- “company brain” over internal docs
- inbox/ticket triage
- quotation/proposal generator
- SOP assistant
- recurring report generator
- website/content maintenance
- simple workflow automation discovery

### Education
- Study Buddy as a real product
- lesson ingest/transcription -> notes -> flashcards -> quiz -> gap finder
- curriculum tracker
- source-grounded tutor
- teacher material generator
- assignment feedback/evidence checker

### Research
- literature/repo monitor
- reproducibility assistant
- experiment ledger
- source/provenance graph
- research-agent evaluator

### IT / homelab
- machine health supervisor
- service restart/recovery
- config drift watch
- backup verification
- local model fleet manager
- “what broke overnight?” brief

### Agencies / consultants
- client discovery harvester
- rapid prototype factory
- proposal -> backlog -> prototype pipeline
- reusable client knowledge packs
- maintenance autopilot

### Personal manager
- travel archive/map + stats
- document/admin tracker
- finance/budget overview
- collection catalogues
- learning dashboard
- personal research memory
- recurring life-admin monitor

## 6. Weird but plausible branches

- **AI mechanic**: diagnose another agent system from traces and propose repairs.
- **Agent driving licence**: standardized qualification tests before an agent gets tools/permissions.
- **Autonomy insurance evidence**: produce audit evidence showing what safeguards actually ran.
- **Compute scavenger**: schedule safe jobs across idle household/office machines.
- **Digital workshop**: multiple specialized local models as cheap “machines” in a workshop.
- **Software archaeology service**: ingest years of abandoned code and recover reusable IP.
- **Prompt archaeology**: recover effective prompts/evals from old agent runs.
- **Failure dataset foundry**: turn every failed run into structured training/evaluation data.
- **Synthetic incident gym**: deliberately break sandbox projects so agents learn recovery.
- **Tool Olympics**: continuously benchmark new AI tools on stable tasks.
- **Autonomy observatory**: public benchmarks showing what coding agents can *actually* finish.
- **AI bill optimizer**: replay workloads against models to estimate cheaper routing.
- **Shadow-mode automation**: agent proposes actions for weeks without executing, earns trust gradually.
- **Company process miner**: observe approved workflows, identify repetitive automatable steps.
- **One-person software studio**: idea -> research -> spec -> prototype -> tests -> deploy -> monitor.
- **Digital estate maintainer**: keep personal sites/repos/docs alive and upgraded over years.
- **Open-source maintainer copilot**: triage issues, reproduce bugs, draft PRs, release notes.
- **Museum/heritage knowledge engine**: collection ingest, provenance, exhibit/research assistant.
- **Collector OS**: catalog toys/coins/stamps/watches, valuation evidence, wishlists, provenance.
- **Travel memory engine**: mail/photos/bookings -> trips -> places -> map -> statistics -> travel book.
- **AI apprenticeship engine**: tracks what a learner can prove they know, then generates next exercises.

## 7. What is needed — capability ladder

### L0 — truthful execution
- deterministic command runner
- filesystem/git adapter
- structured stdout/stderr/exit receipts
- timeout/cancellation
- secrets isolation
- mission-scoped permissions

### L1 — reliable verification
- test/lint/typecheck adapters
- artifact verification
- evidence receipts
- confidence calibrated against actual outcomes
- rollback/checkpoint
- sandboxing

### L2 — memory and learning
- canonical event schema
- Mnem storage/index
- provenance
- dedupe/conflict resolution
- lessons extracted from success *and* failure
- retrieval evaluation
- retention/forgetting policy

### L3 — intelligent routing
- capability registry
- provider/model/tool benchmarks
- cost/latency/quality metrics
- policy engine
- frugal/local-first routing
- health-aware failover

### L4 — bounded autonomy
- planner with explicit acceptance criteria
- dependency-aware work graph
- budgets: money/time/tokens/changes
- human approval gates
- self-repair within bounded blast radius
- stop/escalate rules

### L5 — product platform
- multi-user auth
- tenant isolation
- billing/metering
- API/SDK
- connector framework
- web control plane
- observability
- backup/recovery
- security review
- privacy/compliance posture

### L6 — autonomous factory
- reusable product templates
- demand intake/specification
- automatic eval generation
- deployment adapters
- production monitoring
- customer feedback -> backlog loop
- maintenance and deprecation loop

## 8. Commercialization map

### Fastest route to first euros

1. Sell **reports/services powered by OTHRYS** before selling OTHRYS itself.
2. Start with repo audit, AI/tool audit, legacy harvest, test-gap report, or automation opportunity scan.
3. Make the output repeatable and machine-generated.
4. Turn the repeated internal pipeline into a product.
5. Add a hosted dashboard only after the workflow proves valuable.

Candidate service offers:
- “€X repo health & hidden-IP audit.”
- “AI stack cost/reliability audit.”
- “Legacy repo resurrection report.”
- “Automation opportunity map for your SME.”
- “Agent safety/evidence audit.”
- “Build a tested internal tool in N days.”

### Possible business models
- fixed-price audit
- monthly monitoring subscription
- per-repo subscription
- per-agent/per-seat SaaS
- usage-based API
- self-hosted licence
- enterprise support
- paid qualification/benchmark reports
- implementation/consulting
- marketplace of verified capability packs

## 9. Moats worth building

The UI is not the moat. Potential durable assets are:

- accumulated execution/failure dataset
- capability benchmark history
- trusted qualification corpus
- provenance-rich project memory
- cross-model routing data
- repair outcome history
- reusable eval suites
- safe autonomy policies
- adapters/connectors
- domain-specific templates
- reputation for evidence-backed “done,” not agent theatre

## 10. Idea scoring rubric

Before promoting any seed, score 0–5:

`Value + Frequency + ExistingReuse + EaseOfProof + Distribution + Defensibility - SafetyRisk - IntegrationCost - SupportBurden`

Also answer:
1. Who pays?
2. What painful job disappears?
3. Can OTHRYS prove the output is correct?
4. Can we demo it in 5 minutes?
5. Can it run 10 times without babysitting?
6. What existing organ/code does it reuse?
7. What is the smallest sellable slice?
8. What could catastrophically go wrong?

## 11. Initial candidates to investigate first

**P0 — prove the engine**
- Repo Health Report
- Legacy/Great Harvest Report
- Builder Arena
- Evidence Gate / Execution Receipts
- Daily Engineering Brief

**P1 — productize reusable organs**
- AI Provider Router
- Capability Qualification Harness
- PR Reviewer
- Project Memory Pack
- Agent Incident Ledger

**P2 — larger products**
- issue-to-tested-PR Forge
- Atlas developer control plane
- Study Buddy
- SME Company Brain
- local AI/homelab supervisor

**P3 — long shots / research**
- one-person autonomous software studio
- agent driving licence / qualification standard
- synthetic incident gym
- autonomy observatory
- digital estate maintainer

## 12. Harvest inbox — deliberately unfiltered

Add ideas here immediately; organize later.

- turn a GitHub issue into reproducible test before attempting fix
- auto-create missing tests around risky legacy code
- compare README claims with what repo actually does
- generate “bus factor” handover pack
- detect abandoned useful code hidden in old branches
- recommend which local model fits installed hardware
- nightly replay of important workflows to detect model regression
- provider outage escape hatch
- token/cost anomaly detector
- secret-leak preflight before an agent can commit
- scope-creep detector for autonomous coding
- automatic changelog with proof links
- “why did this agent choose this?” trace explainer
- confidence vs reality calibration dashboard
- test flakiness hunter
- dependency update simulator
- automatic minimal reproduction generator
- bug report quality improver
- support ticket -> reproducible engineering issue
- meeting/notes -> decision ledger
- architecture decision contradiction detector
- stale documentation detector
- dead feature detector
- duplicate internal tool detector
- reusable-code extractor
- safe codemod factory
- API compatibility checker
- model prompt regression suite
- RAG retrieval regression suite
- agent permission minimizer
- temporary credential broker
- human approval inbox
- autonomous rollback controller
- machine/fleet wake/sleep scheduler
- idle-compute job queue
- remote build farm from spare laptops
- project “black box recorder”
- automatic postmortem writer from receipts
- known-failure fingerprint library
- self-healing runbook executor
- incident simulation mode
- chaos testing for agents
- evaluate an agent before and after every upgrade
- compare open-source AI tools against OTHRYS canonical tasks
- vendor lock-in score
- privacy route: local vs cloud decision engine
- carbon/energy-aware background task scheduler
- budget-aware research depth
- automatic source freshness checker
- claim-to-source verifier
- research contradiction finder
- technology radar generated from actual project needs
- “should we adopt this?” evidence report
- convert successful project into reusable template
- template marketplace
- verified connector marketplace
- verified skill/capability marketplace
- internal automation app store
- customer-specific policy packs
- client sandbox per mission
- disposable demo environments
- prototype -> production gap report
- product maintenance cost estimator
- automatic feature kill/deprecation recommendation
- telemetry -> improvement hypothesis generator
- user feedback -> clustered backlog
- backlog -> evidence-ranked priority suggestions
- project health score
- autonomy maturity score
- AI readiness audit
- local-first company assistant
- privacy-safe document classifier
- recurring compliance evidence collector
- knowledge-base contradiction cleaner
- company terminology/ontology builder
- new employee onboarding tutor
- employee departure knowledge capture
- “ask why” organizational memory
- research notebook -> reproducible experiment package
- course material -> adaptive learning path
- personal curriculum generator
- portfolio generator from proved work
- skills evidence passport
- student project reviewer
- teacher rubric checker
- travel booking/mail -> automatic itinerary archive
- visited-place map and stats
- UNESCO/collection/interest overlays on travel map
- trip journal generated from user-owned evidence
- vintage collection visual inventory
- duplicate/missing collection detector
- provenance/price-history tracker for collectibles
- watch service/history ledger
- home digital inventory
- personal document expiry/reminder map
- “what needs my attention?” personal daily brief
- life admin evidence vault
- household tech watchdog
- family tech support diagnostic pack
- small-business website guardian
- WordPress/site update sandbox tester
- e-commerce listing QA
- catalog normalization
- invoice/document extraction + reconciliation
- procurement comparison assistant
- supplier change monitor
- tender/RFP digestion and compliance matrix
- proposal consistency checker
- sales call -> requirements -> proposal skeleton
- CRM hygiene agent
- support knowledge-gap detector
- multilingual support draft reviewer
- museum collection research assistant
- heritage-site maintenance/incident knowledge base
- archive metadata cleanup
- local history research graph
- oral-history transcription/indexing
- exhibition research pack generator

---

**North-star question:** Can OTHRYS turn an intent into a verified, useful artifact or action, remember what happened, and become measurably better next time — cheaply and without pretending success?
