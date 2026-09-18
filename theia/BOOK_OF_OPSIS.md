# BOOK OF OPSIS

**Theia's Media Orchestration Runtime**

**Status:** CANONICAL DESIGN — not proof of implementation.

Opsis means sight/vision in Greek vocabulary and is used here as Theia's domain runtime: the media-specific planner, state machine and evidence collector that turns an approved media intent into a traceable production run.

> **THEIA OWNS THE DOMAIN. OPSIS RUNS THE PRODUCTION GRAPH.**

## 1. Boundary

Opsis:
- resolves a Theia Arm;
- resolves a production contract;
- sequences admitted media capabilities;
- checkpoints work;
- records cost;
- collects provenance;
- routes review;
- packages outputs;
- emits a production receipt.

Opsis does not:
- create OTHRYS mission authority;
- bypass Trust Canal;
- replace Mission/Work;
- self-approve high-risk publication;
- own credentials;
- declare independent verification;
- open financial gates.

## 2. Input contract

A media request should identify:
- mission/work ref;
- property/Oros;
- source type and refs;
- rights state;
- target audience;
- requested format;
- target surfaces;
- duration/aspect;
- factual sensitivity;
- child-directed state if applicable;
- property/brand identity;
- human-review requirement;
- budget/cost ceiling;
- deadline if real;
- output destinations;
- experiment ID/hypothesis where applicable.

## 3. State model

Suggested domain states:

    RECEIVED
    -> PREFLIGHT
    -> RIGHTS_CLEAR
    -> AUDIENCE_CLASSIFIED
    -> POLICY_PREFLIGHT_CLEAR
    -> INPUT_READY
    -> PLAN_READY
    -> PRODUCING
    -> ASSEMBLED
    -> QA_PENDING
    -> REVIEW_PENDING
    -> APPROVED
    -> PACKAGED
    -> EXTERNAL_SIDE_EFFECT_AUTHORIZED
    -> PUBLISH_PENDING
    -> PUBLISHED
    -> TELEMETRY_ACTIVE
    -> CLOSED

Failure states:
- BLOCKED_RIGHTS;
- BLOCKED_POLICY;
- BLOCKED_AUDIENCE_CLASSIFICATION;
- BLOCKED_DISCLOSURE;
- BLOCKED_EVIDENCE;
- FAILED_PROVIDER;
- FAILED_RENDER;
- FAILED_QA;
- REJECTED_OPERATOR;
- CANCELLED;
- BUDGET_EXCEEDED.

No failure silently mutates into success.

## 4. Arm routing

Example:

    source=long_video + target=short
      -> Clipping Arm

    source=fact_pack + target=animated_explainer
      -> Explainer Arm

    source=story_seed + property=Mipi
      -> Story Forge / Character IP Arm
      -> Explainer/episode production as required

Routing should be deterministic from declared fields where possible. Model advice may propose a route but does not create authority.

## 5. Capability resolution

Opsis selects only:
- admitted Blocks;
- configured provider adapters;
- compatible versions;
- capabilities that satisfy the production contract.

Switchyard may assist selection when its laws permit. Opsis does not reinvent provider selection policy.

## 6. Checkpoints

Durable checkpoints should exist after expensive or authority-relevant stages:
- source resolved;
- rights verified;
- transcript/fact pack fixed;
- script approved;
- scene plan fixed;
- assets fixed;
- voice generated;
- assembled render;
- QA result;
- operator decision;
- platform package;
- publication receipt.

A run should resume from safe checkpoints rather than start over after every failure.

## 7. Idempotence

A retry must not:
- publish twice;
- bill twice where avoidable;
- regenerate every upstream asset unnecessarily;
- lose provenance;
- fork continuity silently.

Every externally visible side effect requires a stable idempotency key or equivalent evidence.

## 8. Budget control

Before expensive generation:
- estimate remaining cost;
- compare with run budget;
- stop/escalate when threshold exceeded.

Track provider/API, compute, render and human-review estimates separately.

## 9. Human review

Review is an explicit state.

The review packet should expose:
- preview;
- script/transcript;
- source refs;
- rights summary;
- flagged facts;
- policy/disclosure flags;
- cost;
- intended platforms;
- approve/reject/repair controls.

A future Telegram/mobile surface may be an adapter, not Opsis itself.

## 10. Evidence

Production receipt should include:
- run ID;
- mission/work ref;
- property;
- source refs;
- rights evidence refs;
- providers/models;
- prompt/template/genome versions where material;
- generated asset IDs;
- checks;
- review decision;
- final hashes/URLs;
- publication refs;
- cost summary;
- timestamps supplied by trusted runtime;
- failure/retry history.

## 11. Credentials

Opsis asks Keymaster for sealed provider use.
It never stores raw API keys in production records.

## 12. Publishing

Packaging and publishing are separate powers.

If the governing Mission/Work does not include an authorized external publication side effect, Opsis stops at `PACKAGED` and returns the artifact for later use.

When publication is authorized, publishing should use:
- official provider/platform APIs where feasible;
- explicit authenticated adapters;
- platform-specific policy preflight;
- idempotent upload semantics;
- separately governed credentials.

Avoid brittle password-sharing/browser automation when supported APIs exist.

## 13. Telemetry

After publication Opsis may schedule/trigger collection through admitted mechanisms.

It records raw metrics with:
- platform;
- artifact;
- observation time;
- metric definition/version.

Hyperion/Theia analytics interpret; raw history remains traceable. For child-directed surfaces, metrics that the platform does not expose or features it disables must not be fabricated or treated as missing implementation work.

## 14. Autonomy

Opsis implements the autonomy level declared for a property/workflow.

It may not infer higher autonomy from repeated success.
Governance grants elevation.

## 15. Failure law

> **A MEDIA PIPELINE THAT CANNOT STOP SAFELY IS NOT AUTOMATED; IT IS UNCONTROLLED.**

## 16. Final laws

> **DOMAIN ORCHESTRATION IS NOT GLOBAL AUTHORITY.**

> **CHECKPOINT BEFORE YOU SPEND AGAIN.**

> **RETRY WORK; DO NOT DUPLICATE SIDE EFFECTS.**

> **EVERY PUBLISHED ARTIFACT SHOULD HAVE A TRACEABLE PRODUCTION RECEIPT.**
