# THEIA ARCHITECTURE

**Status:** CANONICAL STRATEGIC STRUCTURE — implementation admission remains separate.

This file defines Theia's structural layers. It exists to prevent doctrine, runtime orchestration, workflow families, reusable capabilities, properties, mythological expression roles and providers from collapsing into one blob.

> **ONE DOMAIN. ONE CONTROL PLANE. COMPOSABLE WORKFLOWS. REUSABLE FACULTIES. PORTABLE PROPERTIES.**

---

## 1. Canonical layers

```text
OTHRYS MISSION / WORK / GOVERNANCE
              |
              v
         THEIA DOMAIN
   doctrine, law, boundaries
              |
              v
          OPSIS
 control plane / production graph
              |
      +-------+-------+
      |               |
      v               v
    ARMS         SHARED FACULTIES
workflow families  reusable capabilities
      |               |
      +-------+-------+
              |
              v
           ADAPTERS
 providers / renderers / APIs
              |
              v
          ARTIFACTS
              |
              v
   RECEIPTS / MEDIA EVIDENCE
```

Cross-cutting across the stack:

```text
PROPERTIES = portable identity, canon and creative constraints
HELIOS / EOS / SELENE = expression roles, not runtime owners
RIGHTS / POLICY / QA / AUDIENCE = gates
HYPERION CONTRACT = economic input/output seam
```

---

## 2. The layers

### 2.1 Theia — domain/Titan

Theia owns:
- visual/audiovisual media doctrine;
- media-domain authority boundaries;
- media-production semantics;
- property/media canon;
- domain quality, rights and evidence expectations.

Theia is not a process runner.

### 2.2 Opsis — control plane

Opsis turns an authorized production contract into an inspectable **production graph**.

Opsis owns:
- run planning;
- dependency ordering;
- Arm/faculty routing;
- checkpoints;
- budget enforcement;
- review routing;
- idempotent side-effect handling;
- production receipts.

Opsis does not own global mission authority, commercial authority, credentials or independent verification.

### 2.3 Arms — workflow families

An Arm is a reusable **semantic source-to-output workflow family**.

Current Arms:
- Clipping & Repurposing;
- Explainer & Instructional;
- Story Forge / Character & IP.

These are intentionally not identical kinds of output:
- Clipping is a transformation Arm;
- Explainer is an instructional-production Arm;
- Story Forge is a narrative/IP-development Arm that often feeds another production path.

An Arm may call another Arm through Opsis. It does not call another Arm by hidden internal coupling.

### 2.4 Shared faculties — reusable capabilities

A faculty performs a bounded capability used by more than one Arm.

Examples:
- transcription;
- scene planning;
- asset retrieval/generation;
- voice;
- captions;
- QA;
- packaging;
- analytics.

A faculty is not a mini-product and does not create new domain authority.

### 2.5 Properties — portable creative identity

A property is a durable media identity such as a recurring character, show, explainer brand or visual series.

A property owns no execution authority.

Its portable identity may include:
- canonical/property ID;
- working/public name state;
- character/world bible;
- visual grammar/rig refs;
- voice rules;
- audience classification;
- safety constraints;
- format genomes;
- rights/chain-of-title refs;
- continuity;
- derivative lineage;
- autonomy policy;
- telemetry refs.

A property must survive provider replacement.

### 2.6 Expression roles — Helios, Eos, Selene

The three children are **composable expression roles**, not services and not mutually exclusive routing buckets.

- **Helios** — full/canonical primary expression.
- **Eos** — first-contact/discovery expression.
- **Selene** — continuity/return/cycle expression.

One artifact may carry more than one role.

Examples:
- a flagship recurring episode can be **Helios + Selene**;
- a recurring short series can be **Eos + Selene**;
- a one-off canonical explainer may be **Helios** only.

Not every artifact needs a child label.

### 2.7 Adapters — replaceable provider bindings

An adapter connects a faculty or Arm to a concrete provider/tool/API.

Providers do not define architecture.

> **CAPABILITY CONTRACT FIRST. ADAPTER SECOND. VENDOR THIRD.**

---

## 3. Arm admission test

Create a new Arm only when all of the following are materially true:

1. It has distinct source-to-output semantics.
2. It needs a reusable end-to-end workflow contract.
3. It has its own domain-specific QA/evidence concerns.
4. Multiple properties or consumers need it.
5. Treating it as a faculty, format genome, property variant or provider adapter would create more confusion than separation.

Therefore these are **not automatically Arms**:
- localization — cross-cutting faculty/workflow;
- synthetic presenter/avatar — rendering modality/faculty;
- branded B2B explainer — Explainer property/contract variant;
- product demo/onboarding — usually Explainer class;
- a new platform — packaging adapter/surface;
- a new model/vendor — adapter.

Candidate future Arms must earn the boundary through repeated evidence.

---

## 4. Faculty taxonomy

To avoid a flat bag of tools, faculties are grouped conceptually.

### Intake & knowledge
- Source Ingestor;
- Transcript Engine;
- Research/Fact Pack Adapter.

### Creative planning
- Script Builder;
- Story/Beat Planner;
- Scene Planner;
- Visual Grammar Resolver;
- Character/World Bible Manager.

### Asset & render
- Asset Library;
- Asset Generator Router;
- Diagram/Chart/Map Renderer;
- Voice Router;
- Music/SFX Rights Checker;
- Subtitle/Caption Generator;
- Video Assembler;
- Render Farm Adapter.

### Trust & gates
- Rights/Provenance Ledger;
- Fact/Evidence QA Gate;
- Media Quality Gate;
- Policy/Disclosure Adapter;
- Audience Classification Gate.

Theia's Fact/Evidence QA is domain QA. It does not replace Talos or any separately required independent verification.

### Package & side effects
- Platform Packager;
- Localization Engine;
- Scheduler/Publisher.

Packaging never implies publication authority.

### Evidence & learning
- Analytics Collector;
- Retention Analyzer;
- Comment/Question Miner;
- Media Production Experiment Ledger;
- Archive/Resurrection Manager.

The Media Production Experiment Ledger stores Theia-local execution evidence. Hyperion Laboratory remains canonical owner of cross-domain/economic experiment contracts.

---

## 5. Production graph law

A media run is not assumed to be one linear pipeline.

One authorized intent may produce:

```text
SOURCE
  -> PRIMARY SCRIPT
      -> HELIOS ARTIFACT
      -> EOS DERIVATIVE A
      -> EOS DERIVATIVE B
      -> LOCALIZED VARIANT
```

or:

```text
FACT PACK
  -> STORY FORGE
      -> SCRIPT CONTRACT
          -> EXPLAINER
              -> PRIMARY EPISODE
                  -> CLIPPING
                      -> NATIVE DERIVATIVES
```

Opsis plans these as typed nodes with dependencies, checkpoints and artifact-level evidence.

A failure in one derivative must not automatically invalidate unrelated completed artifacts.

---

## 6. Source-of-truth rules

- Theia Book = doctrine, laws, boundaries.
- Theia Architecture = structural topology and admission rules.
- Opsis Book = orchestration semantics.
- Arm Books = workflow-family semantics.
- Property bibles = property canon.
- Children Foundations = expression-role semantics.
- Hyperion Contract = typed economic seam.
- Dated research = volatile platform/provider/legal evidence.
- Runtime/admission evidence = proof that design exists in code.

Do not duplicate detailed canon across layers when a pointer is sufficient.

---

## 7. Dependency rules

Allowed:
- Opsis routes Arms and faculties.
- Arms use shared faculties through declared contracts.
- Properties constrain production contracts.
- Expression roles annotate desired artifact function.
- Adapters satisfy faculty contracts.
- Theia returns evidence through the Hyperion seam.

Avoid:
- property -> provider direct dependency;
- Arm -> raw credentials;
- child role -> independent runtime authority;
- provider -> canonical property identity;
- Hyperion Arm -> Theia internal state;
- Theia faculty -> Hyperion portfolio decision;
- duplicated rights/continuity truth in multiple layers.

---

## 8. Structural laws

> **MYTHOLOGY NAMES RESPONSIBILITY; IT DOES NOT JUSTIFY COMPONENTS.**

> **A PROPERTY IS IDENTITY, NOT AUTHORITY.**

> **AN ARM IS A WORKFLOW FAMILY, NOT A FEATURE BUCKET.**

> **A FACULTY IS REUSABLE CAPABILITY, NOT A NEW KINGDOM.**

> **THE CHILDREN DESCRIBE HOW MEDIA FUNCTIONS FOR AN AUDIENCE; THEY DO NOT OWN THE PIPELINE.**

> **ONE RUN MAY PRODUCE MANY ARTIFACTS. EVERY ARTIFACT KEEPS ITS OWN EVIDENCE.**

> **DO NOT ADD A COMPONENT WHEN A CONTRACT OR LABEL WILL DO.**
