# THEIA ↔ HYPERION CONTRACT

**Status:** CANONICAL STRATEGIC INTERFACE — schema-level doctrine, not runtime implementation proof.

Purpose: keep Theia independently deployable while preserving a tight economic learning loop with Hyperion.

> **THE SIBLINGS SHARE TYPED EVIDENCE, NOT HIDDEN AUTHORITY.**

---

## 1. Boundary

Hyperion owns:
- opportunity formation;
- commercial hypotheses;
- distribution economics;
- portfolio oxygen;
- monetization design;
- financial gates;
- keep/license/spin-out/sell decisions.

Theia owns:
- visual/audiovisual media production;
- media format/production design;
- clipping;
- explainers;
- character/story media;
- media rights/provenance;
- media QA;
- platform packaging/publishing execution when authorized;
- media production telemetry;
- media-domain learning.

Neither packet below grants execution, publication or financial authority by itself.

---

## 2. Media Opportunity Packet

Hyperion may hand Theia a Media Opportunity Packet.

Illustrative contract:

```yaml
schema: othrys.theia.media-opportunity.v1
opportunity_id: hyp-...
mission_ref: null
property_ref: null

audience:
  hypothesis: ""
  job_or_desire: ""
  geography: null
  language: null
  child_directed_state: UNKNOWN

value:
  promise: ""
  evidence_refs: []
  differentiation_hypothesis: ""

experiment:
  question: ""
  candidate_format_families: []
  candidate_surfaces: []
  batch_limit: null
  decision_point: ""
  kill_conditions: []

economics:
  max_cash_cost: null
  max_operator_minutes: null
  platform_dependence_tolerance: null
  commercial_optionality: []

rights_assumptions:
  source_owner: null
  expected_basis: null
  unresolved_questions: []

constraints:
  trust: []
  legal_policy: []
  brand: []
  prohibited_actions: []

authority:
  production_authorized: false
  external_publish_authorized: false
  monetization_authorized: false
```

### Law

The `authority` object is descriptive evidence of upstream authorization and must be checked against actual OTHRYS authority. Hyperion cannot self-create authority by writing `true`.

---

## 3. Media Production Contract

Theia/Opsis derives a Media Production Contract from approved intent.

The contract may request **one or many artifacts**. This is necessary because one primary production may legitimately fan out into native derivatives, localized variants or alternate packages.

```yaml
schema: othrys.theia.production-contract.v2
run_id: theia-...
opportunity_id: null
mission_ref: ""

property:
  id: ""
  bible_version: null
  internal_codename: null
  public_name_state: UNRESOLVED | WORKING | LOCKED
  format_genome_version: null

source:
  refs: []
  rights_state: UNKNOWN
  provenance_refs: []

audience:
  classification: REVIEW_REQUIRED
  age_band: null
  language: ""
  locale: null

requested_artifacts:
  - artifact_key: primary
    class: video
    format: ""
    expression_roles: []   # HELIOS / EOS / SELENE when useful
    derives_from: null
    duration_target_seconds: null
    aspect_ratios: []
    platform_targets: []

quality:
  factual_sensitivity: NORMAL
  continuity_required: false
  accessibility_requirements: []
  required_gates: []

ai_transparency:
  provider_or_deployer_role: UNKNOWN
  synthetic_content_state: UNKNOWN
  platform_disclosure_required: UNKNOWN
  eu_article_50_review: UNKNOWN

review:
  autonomy_level: 1
  human_publish_approval_required: true

budget:
  cash_ceiling: null
  compute_ceiling: null
  operator_minutes_ceiling: null

outputs:
  artifact_destination: ""
  evidence_destination: ""
```

Artifact keys are contract-local identifiers, not provider IDs.

`expression_roles` are descriptive Theia roles, not routing authority. An artifact can carry more than one role or none.

`derives_from` makes intended lineage explicit before Opsis builds the graph. Opsis may refine implementation dependencies but may not silently invent a new externally visible deliverable outside the authorized contract.

No field silently upgrades the authority granted by Mission/Work or Trust Canal.

---

## 4. Media Evidence Packet

Theia returns production/reality evidence to Hyperion.

The packet aggregates the run while preserving artifact-level receipts.

```yaml
schema: othrys.theia.media-evidence.v2
run_id: ""
opportunity_id: null
property_ref: ""
run_receipt_ref: ""

production:
  graph_version: ""
  recipe_version: ""
  format_genome_version: null
  provider_refs: []
  source_refs: []
  rights_state: ""
  provenance_refs: []

cost:
  cash: null
  compute: null
  operator_minutes: null
  rework_minutes: null

quality:
  gate_results: []
  corrections: []
  incidents: []

artifacts:
  - artifact_key: primary
    artifact_ref: ""
    artifact_receipt_ref: ""
    expression_roles: []
    derives_from: null
    publication_state: PACKAGED
    platform_refs: []
    disclosure_state: null
    published_at: null
    artifact_cost: null
    telemetry:
      observation_window: null
      impressions: null
      stops_or_clicks: null
      average_view_duration: null
      completion_rate: null
      rewatch_rate: null
      saves: null
      shares: null
      follows: null
      returning_viewers: null
      owned_asset_routes: null

learning:
  audience_questions: []
  production_bottlenecks: []
  format_findings: []
  portability_risks: []
  next_media_experiment_candidates: []
```

Unknown/unavailable metrics remain null. Opsis must never invent a metric because a platform withholds it.

Hyperion should reason from the run aggregate **and** preserve distinctions between artifacts. One successful short does not automatically prove the primary episode or another derivative succeeded.

---

## 5. Decision Packet back from Hyperion

Optional response:

```yaml
schema: othrys.hyperion.media-decision.v1
opportunity_id: ""
evidence_packet_refs: []

decision:
  state: CONTINUE | PIVOT | PAUSE | KILL | PRESERVE | SCALE_CANDIDATE
  rationale: ""
  economic_findings: []
  next_budget_proposal: null

commercial:
  candidate_surfaces: []
  qualification_required: true

portfolio:
  oxygen_change_proposed: null

authority:
  grants_nothing: true
```

Hyperion may recommend scale; OTHRYS governance/mission authority decides what is actually executed.

---

## 6. Property identity contract

A property should be portable across Theia implementations.

Minimum portable identity:
- property ID;
- internal codename/ID where used;
- public-name state and public name when locked;
- property bible;
- visual identity/rig refs;
- voice rules;
- format genomes;
- audience classification;
- safety policy;
- rights/chain-of-title refs;
- continuity state;
- source/episode lineage;
- localization rules;
- autonomy level;
- platform adapters;
- telemetry history refs.

No provider-specific ID may be the sole identity of a character or property.

---

## 7. Standalone separation test

Theia is sufficiently decoupled when:

1. Hyperion can submit an opportunity packet without knowing Theia's internal tools.
2. Theia can execute an authorized multi-artifact production contract without importing Hyperion's internal state.
3. Theia can return evidence without deciding commercial action.
4. Theia can replace providers without changing property identity.
5. Hyperion can compare Theia against an external media provider using the same economic evidence fields.
6. A future external customer could call Theia through a different commercial front door without rewriting Opsis.
7. Removing Hyperion would remove economic strategy, not break media production.
8. Removing Theia would remove media production, not corrupt Hyperion's portfolio logic.

> **A CLEAN SEAM TODAY IS AN EXIT OPTION TOMORROW.**

---

## 8. Failure behavior

Missing:
- rights;
- audience classification;
- authority;
- budget;
- required evidence

must fail closed at the relevant boundary.

A packet may be `INCOMPLETE`.
It may not be silently "completed" by model inference when the missing field controls rights, external publication or money.

---

## 9. Versioning

Packet schemas are versioned.

Breaking changes:
- new major schema version;
- explicit migration;
- old packet retained for provenance.

Provider changes do not require a schema change unless the semantic contract changes.

---

## 10. Final laws

> **HYPERION MAY REQUEST. THEIA MAY PRODUCE. NEITHER MAY SELF-AUTHORIZE THE NEXT DOMAIN.**

> **UNKNOWN IS A VALID STATE. INVENTED AUTHORITY IS NOT.**

> **PROPERTY IDENTITY MUST SURVIVE PROVIDER REPLACEMENT.**

> **THEIA SHOULD BE SEPARABLE WITHOUT BECOMING ISOLATED.**
