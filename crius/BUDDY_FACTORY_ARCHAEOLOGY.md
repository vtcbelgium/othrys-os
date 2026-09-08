# BUDDY FACTORY — STUDY BUDDY ARCHAEOLOGY

> Mission: BF-01
> Status: INVESTIGATION STARTED — repo-level evidence still required before code classification.
> Owner: CRIUS / Buddy Factory
> Rule: archaeology only. Do not refactor Study Buddy during this mission.

## 0. Purpose

Study Buddy already exists. The job is not to redesign it from imagination. The job is to discover which parts of the existing product are genuinely reusable enough to become Buddy Core, which are education-specific, which are one-off product decisions, and which are debt.

Target classification:

`GENERIC BUDDY CORE | EDUCATION DOMAIN | PRODUCT-SPECIFIC | LEGACY/DEBT | UNKNOWN`

No component earns `GENERIC BUDDY CORE` merely because another Buddy might someday need something similar. Reuse must be supported by actual implementation evidence and then challenged against at least one contrasting domain.

---

## 1. Archaeology procedure

For the Study Buddy codebase, inventory:

1. repository/package structure;
2. routes/pages/screens;
3. authentication and identity;
4. database schema and migrations;
5. storage/files;
6. ingestion pipeline;
7. transcription/media handling;
8. chunking/indexing/retrieval/RAG;
9. model/provider gateway;
10. prompt/domain instruction layer;
11. lesson/course/curriculum entities;
12. notes/knowledge-bank entities;
13. flashcards;
14. quizzes/assessment;
15. gap finder/progress logic;
16. chat/conversation;
17. tasks/planning/reminders;
18. dashboard/analytics;
19. exports;
20. notifications;
21. permissions/RLS/privacy;
22. telemetry/cost tracking;
23. deployment/configuration;
24. tests/evals;
25. failure/recovery behavior;
26. commercial/billing hooks if any;
27. dead/duplicate/experimental code;
28. product-specific UI assumptions.

For each meaningful component record:

| Component | Path(s) | Current job | Classification | Evidence | Candidate interface | Coupling | Risk | Reuse confidence | Notes |
|---|---|---|---|---|---|---|---|---|---|

Classification without path/evidence is provisional.

---

## 2. Core-extraction hypotheses to test, not assume

Likely generic candidates:

- identity/session;
- profile/preferences;
- secure file ingestion;
- generic document/media processing;
- chunk/index/retrieval substrate;
- source/evidence references;
- model gateway and routing;
- conversation persistence;
- generic memory primitives;
- timeline/activity history;
- notification infrastructure;
- import/export plumbing;
- telemetry/value-event plumbing;
- cost accounting;
- privacy/retention/deletion machinery;
- admin/support primitives;
- feature/entitlement hooks;
- evaluation harness infrastructure.

Likely education-domain candidates:

- course/lesson/curriculum model;
- learning-object extraction;
- flashcard semantics;
- quiz generation/scoring;
- mastery/gap model;
- learning progress;
- study planning;
- pedagogical prompting/evaluation.

These are hypotheses only until repository inspection proves the boundary.

---

## 3. Architecture rule discovered during external pattern check

The Buddy Factory should resist two failure modes: cloning Study Buddy wholesale for every domain, and prematurely moving domain rules into a giant shared core.

Working separation:

`BUDDY CONTROL/CORE -> DOMAIN PACK -> PRODUCT EXPERIENCE`

Core owns common platform concerns. Domain Pack owns domain entities, workflows, tools, evidence rules, safety boundaries and domain evaluations. Product Experience owns the specific user journey and presentation.

For any future multi-user/tenant Buddy, isolation is not merely authentication. Retrieval indexes, prompts/context assembly, caches, logs/traces, tools and model artifacts must respect the same boundary. Cost attribution should also be available per product/tenant/user/value event where appropriate.

This is a design constraint for future extraction, not evidence that Study Buddy currently satisfies it.

---

## 4. Extraction test: Travel Buddy

A proposed generic component is challenged against Travel Buddy.

Questions:

- Does it work for bookings, emails, maps, locations, transport and travel memories without education terminology leaking through?
- Can retrieval operate on itinerary/history/reference documents rather than lessons?
- Can the same evidence primitive support sources for transport/history/booking facts?
- Can timeline primitives represent trip stages rather than lesson chronology?
- Can notification infrastructure support departure/check-in/activity reminders rather than study reminders?
- Can memory remain domain-scoped?
- Can domain tools be registered without modifying core internals?

If substantial education assumptions must be added to core to make Travel Buddy work, the boundary is wrong.

---

## 5. Extraction test: Collector Buddy

Second contrast domain deliberately differs from both Study and Travel.

Questions:

- Can generic ingestion accept images/scans/receipts/reference documents?
- Can evidence attach to structured physical objects and provenance claims?
- Can domain entities model item, variant, condition, acquisition, provenance, valuation evidence and collection membership outside core?
- Can search combine structured filters with semantic retrieval?
- Can notifications support watchlists/maintenance/insurance/document expiry?
- Can export infrastructure produce collection inventories without collector logic in core?

A component surviving Study + Travel + Collector is a much stronger Buddy Core candidate.

---

## 6. Buddy Core promotion gate

A component can be promoted from hypothesis to Buddy Core candidate only if:

1. it exists and works in Study Buddy or is otherwise already proven OTHRYS infrastructure;
2. its current implementation can be identified precisely;
3. education-specific assumptions can be separated cleanly;
4. Travel Buddy can plausibly consume it through a stable interface;
5. Collector Buddy can plausibly consume it through the same interface;
6. privacy/security boundaries remain at least as strong after extraction;
7. extraction does not require a giant rewrite;
8. tests/evidence can prove unchanged Study Buddy behavior;
9. shared ownership reduces rather than increases maintenance cost.

If uncertain: leave it in Study Buddy.

---

## 7. Anti-framework law

> DO NOT BUILD THE FACTORY BEFORE WE HAVE HARVESTED THE MACHINE THAT ALREADY WORKS.

BF-01 is inventory and evidence.
BF-02 is an extraction plan.
Only later missions may modify code.

No abstract `BuddyEngine`, universal schema, mega-plugin system or cross-domain ontology is authorized merely because it looks elegant on paper.

---

## 8. What BF-01 must produce

Before BF-01 closes, produce:

- complete Study Buddy component map;
- evidence-backed classification table;
- dependency/coupling map;
- generic-vs-education boundary;
- data/privacy boundary map;
- reusable UI primitive list;
- reusable backend primitive list;
- reusable AI/RAG primitive list;
- test/eval inventory;
- known debt/dead code list;
- extraction risk list;
- candidate Buddy Core v0 manifest;
- explicit `DO NOT EXTRACT` list;
- proof gaps;
- recommended BF-02 sequence.

---

## 9. CRIUS angle

Every reusable primitive should also be checked as a potential independent commercial asset. A Buddy Core component may have value outside the Buddy family.

Examples to investigate:

- ingestion pipeline -> SDK/API;
- evidence/source layer -> Evidence Gate integration;
- domain-pack contract -> white-label vertical-app factory;
- model gateway -> Switchyard product surface;
- evaluation harness -> Tool Olympics/Agent Driving Licence;
- memory layer -> Mnem product;
- secure tenant-scoped RAG -> B2B platform capability;
- import/export framework -> migration service;
- notification/value-event analytics -> generic product infrastructure.

Rule: internal reuse and external commercial value are separate scores.

---

## 10. Current next action

Locate the canonical Study Buddy source repository and inspect it directly. Do not infer implementation from product documentation or remembered features. Once source is located, populate the component table from code and migrations before proposing extraction.

BF-01 remains OPEN until that evidence exists.
