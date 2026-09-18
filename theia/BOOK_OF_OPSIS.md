# BOOK OF OPSIS

**Theia's Media Production Control Plane**

**Status:** CANONICAL DESIGN — not proof of implementation.

Opsis means sight/vision in Greek vocabulary and is used here as Theia's domain control plane. It turns an authorized media production contract into a typed production graph, routes the graph through admitted Arms/faculties, checkpoints work, controls side effects and returns traceable production evidence.

> **THEIA OWNS THE DOMAIN. OPSIS RUNS THE PRODUCTION GRAPH.**

---

## 1. Boundary

Opsis:
- accepts an authorized Theia production contract;
- plans a production graph;
- resolves Arm(s) and faculties;
- orders dependencies;
- checkpoints expensive/authority-relevant work;
- enforces run budgets;
- records provenance and cost;
- routes human review;
- packages artifacts;
- executes external media side effects only when separately authorized;
- emits run- and artifact-level receipts.

Opsis does not:
- create OTHRYS mission authority;
- bypass Trust Canal;
- replace Mission/Work;
- own Hyperion's economic experiment contract;
- self-approve high-risk publication;
- own credentials;
- declare independent verification;
- open financial gates;
- decide that an economic bet should scale or die.

---

## 2. Canonical input

Opsis consumes the **Media Production Contract** defined by `THEIA_HYPERION_CONTRACT.md` or an equivalent authorized contract from another valid front door.

Do not maintain a second competing production schema inside Opsis.

Opsis may add a runtime envelope containing:
- run ID;
- mission/work ref;
- contract version;
- requested artifact set;
- checkpoint/resume metadata;
- idempotency scope;
- runtime/admitted capability versions;
- output/evidence destinations.

Missing authority-, rights-, audience-, policy- or budget-critical fields fail closed at preflight.

---

## 3. Run, graph and artifact are different things

A **run** is one execution of an authorized production contract.

A **production graph** is the typed dependency graph Opsis plans for that run.

An **artifact** is one output object within the graph.

One run may create many artifacts.

Example:

```text
RUN
 |
 +-- PRIMARY SCRIPT
 |    |
 |    +-- HELIOS EPISODE
 |    |
 |    +-- EOS SHORT A
 |    +-- EOS SHORT B
 |
 +-- LOCALIZED HELIOS VARIANT
```

A failed derivative must not automatically invalidate unrelated completed artifacts.

> **ONE RUN MAY HAVE MANY ARTIFACTS. EVERY ARTIFACT KEEPS ITS OWN EVIDENCE.**

---

## 4. Production graph

Graph nodes should be typed.

Candidate node classes:
- SOURCE;
- RIGHTS_CHECK;
- RESEARCH_INPUT;
- STORY_CONTRACT;
- SCRIPT;
- SCENE_PLAN;
- ASSET;
- VOICE;
- RENDER;
- ASSEMBLY;
- QA;
- REVIEW;
- PACKAGE;
- PUBLISH;
- TELEMETRY;
- ARCHIVE.

Each node should declare:
- input refs;
- output refs;
- producing Arm/faculty;
- version;
- cost;
- gate dependencies;
- retry behavior;
- checkpoint policy;
- evidence refs;
- failure semantics.

Graph edges express declared dependencies, not hidden service calls.

Arms may compose through graph outputs:
- Story Forge -> Script Contract -> Explainer;
- Helios artifact -> Clipping -> native Eos derivatives.

---

## 5. Run phases

Do not model rights, audience classification and publication as one giant linear state chain. They are gates around a graph.

Suggested **run phases**:

```text
RECEIVED
  -> PREFLIGHT
  -> PLANNED
  -> EXECUTING
  -> REVIEW
  -> PACKAGED
  -> SIDE_EFFECT_PENDING
  -> OBSERVING
  -> CLOSED
```

A run may close at `PACKAGED` when no external publication is authorized.

A run may move between `EXECUTING` and `REVIEW` for bounded repairs without pretending that the entire run restarted.

---

## 6. Gate vector

Track critical gates independently from run phase.

Suggested gate states:

```yaml
rights: UNKNOWN | CLEAR | BLOCKED
audience: UNKNOWN | CLASSIFIED | BLOCKED
policy: UNKNOWN | CLEAR | BLOCKED
disclosure: UNKNOWN | CLEAR | BLOCKED
evidence: UNKNOWN | SUFFICIENT | BLOCKED
budget: OPEN | WARNING | EXCEEDED
publish_authority: ABSENT | PRESENT | REVOKED
financial_authority: LOCKED | PRESENT
```

A gate may change because:
- evidence becomes stale;
- provider/platform rules change;
- authority is revoked;
- a new asset introduces new rights;
- the artifact audience changes.

A phase label must never conceal a failed gate.

---

## 7. Artifact lifecycle

Suggested artifact states:

```text
DECLARED
  -> READY
  -> PRODUCING
  -> ASSEMBLED
  -> QA_PENDING
  -> QA_PASS / QA_FAIL
  -> REVIEW_PENDING
  -> APPROVED / REJECTED / REPAIR
  -> PACKAGED
  -> PUBLISHED | DELIVERED | ARCHIVED
  -> OBSERVING
  -> CLOSED
```

Different artifacts within one run may be in different states.

This is required for:
- multiple derivatives;
- localization;
- clips from one source;
- alternate thumbnails/titles;
- partial delivery;
- selective rejection.

---

## 8. Arm routing

Examples:

```text
source=long_video + target=native_derivative
  -> Clipping Arm

source=fact_pack + target=animated_explainer
  -> Explainer Arm

source=story_seed + property=<property_id>
  -> Story Forge
  -> downstream production Arm/faculties as required
```

Routing should be deterministic from declared contract fields where possible.

Model advice may propose a route.
It does not create authority.

An Arm may feed another Arm only through declared graph outputs, not hidden cross-calls.

---

## 9. Capability resolution

Opsis selects only:
- admitted Blocks/faculties;
- configured provider adapters;
- compatible versions;
- capabilities satisfying the production contract;
- capabilities allowed under current authority/gate state.

Switchyard may assist provider/tool selection when its laws permit.

Opsis does not reinvent global provider-selection policy.

Provider identity must not become property identity.

---

## 10. Checkpoints

Durable checkpoints should exist after expensive or authority-relevant stages such as:
- source resolved;
- rights evidence fixed;
- transcript/fact pack fixed;
- story/script contract fixed;
- scene plan fixed;
- reusable assets fixed;
- voice fixed;
- assembled render;
- QA result;
- operator decision;
- platform package;
- publication receipt.

Checkpoint granularity should follow cost and failure domain.

A run should resume from the cheapest safe checkpoint rather than regenerate the whole graph.

---

## 11. Idempotence and replay

A retry must not:
- publish twice;
- bill twice where avoidable;
- regenerate unaffected upstream nodes;
- lose provenance;
- fork property continuity silently;
- overwrite a previously approved artifact without versioning.

Every externally visible side effect requires:
- stable idempotency key or equivalent;
- request evidence;
- result/receipt evidence;
- replay-safe failure behavior.

> **RETRY WORK. DO NOT DUPLICATE SIDE EFFECTS.**

---

## 12. Budget control

Before expensive graph expansion or generation:
- estimate remaining cost;
- compare with run budget;
- surface uncertainty;
- stop/escalate when threshold is exceeded.

Track separately where material:
- provider/API cash;
- local compute;
- render time;
- storage/egress;
- operator review time;
- rework.

Budget authority is not permission to spend money outside the governing OTHRYS financial rules.

---

## 13. Human review

Review is an explicit graph/state transition, not an informal message.

The review packet should expose:
- preview/artifact refs;
- script/transcript where relevant;
- source refs;
- rights summary;
- factual/quality flags;
- audience/policy/disclosure flags;
- cost;
- intended surfaces;
- changed fields since prior review;
- approve/reject/repair controls.

A future Telegram/mobile surface may be a review adapter.
It is not Opsis itself.

---

## 14. Evidence and receipts

Opsis emits both a **Run Receipt** and **Artifact Receipts**.

Run Receipt should include:
- run ID;
- mission/work ref;
- production-contract ref/version;
- graph version/hash;
- property ref;
- selected Arms/faculties;
- total cost summary;
- gate history;
- operator decisions;
- failures/retries;
- artifact refs.

Artifact Receipt should include:
- artifact ID/version/hash;
- parent/source refs;
- derivative lineage;
- rights/provenance refs;
- providers/models/adapters;
- prompt/template/genome versions where material;
- checks/gate results;
- review decision;
- final destination/URL where applicable;
- publication/delivery receipt;
- artifact-specific cost;
- observation refs.

Theia's Media Evidence Packet may aggregate these receipts for Hyperion without destroying the underlying detail.

---

## 15. Credentials

Opsis requests authorized provider use through Keymaster.

It never stores raw production credentials in:
- graph nodes;
- property bibles;
- receipts;
- prompts;
- telemetry.

Credentials are references/capabilities, not content.

---

## 16. Packaging and publication

Packaging and publishing are separate powers.

If the governing Mission/Work does not include authorized external publication, Opsis stops at `PACKAGED` and returns the artifact.

When publication is authorized:
- use official platform/provider APIs where feasible;
- use explicit authenticated adapters;
- perform platform-specific policy/disclosure preflight;
- use idempotent upload semantics;
- preserve publication receipts.

A packaged artifact can later be published by a separate authorized run without regenerating it.

> **A FILE READY TO SHIP IS NOT PERMISSION TO SHIP IT.**

---

## 17. Telemetry

After publication or delivery, Opsis may trigger collection through admitted mechanisms.

Raw observations should record:
- artifact ID;
- platform/surface;
- observation time;
- metric name;
- metric definition/version;
- value/null state;
- source/ref.

Unknown or unavailable metrics remain null.

Theia may interpret production/media quality.
Hyperion interprets economic/portfolio meaning.

For child-directed surfaces, disabled/unavailable metrics must not be fabricated or treated as implementation defects.

---

## 18. Autonomy

Opsis implements the autonomy level declared for a property/workflow.

It may not infer higher autonomy from:
- repeated success;
- low review rate;
- high audience performance;
- operator silence.

Governance grants elevation.
Governance or gate failure may revoke it.

Autonomy may differ by:
- property;
- Arm;
- artifact class;
- surface;
- risk class;
- side effect.

---

## 19. Failure model

Failure is typed.

Candidate categories:
- BLOCKED_RIGHTS;
- BLOCKED_POLICY;
- BLOCKED_AUDIENCE_CLASSIFICATION;
- BLOCKED_DISCLOSURE;
- BLOCKED_EVIDENCE;
- BLOCKED_AUTHORITY;
- FAILED_PROVIDER;
- FAILED_RENDER;
- FAILED_QA;
- REJECTED_OPERATOR;
- CANCELLED;
- BUDGET_EXCEEDED.

Failures attach to the smallest correct scope:
- node;
- artifact;
- branch;
- run.

Do not fail the entire run when a quarantined derivative is the only broken branch.

Do not silently turn a failure into success.

> **A MEDIA PIPELINE THAT CANNOT STOP SAFELY IS NOT AUTOMATED; IT IS UNCONTROLLED.**

---

## 20. Final laws

> **DOMAIN ORCHESTRATION IS NOT GLOBAL AUTHORITY.**

> **OPSIS PLANS GRAPHS; IT DOES NOT INVENT PERMISSION.**

> **CHECKPOINT BEFORE YOU SPEND AGAIN.**

> **RETRY WORK; DO NOT DUPLICATE SIDE EFFECTS.**

> **ONE RUN MAY PRODUCE MANY ARTIFACTS. EVERY ARTIFACT KEEPS ITS OWN EVIDENCE.**

> **A FILE READY TO SHIP IS NOT PERMISSION TO SHIP IT.**

> **EVERY PUBLISHED ARTIFACT SHOULD HAVE A TRACEABLE PRODUCTION RECEIPT.**
