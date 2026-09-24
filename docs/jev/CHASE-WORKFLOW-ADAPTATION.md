# Chase Workflow Adaptation — OTHRYS JEV Cortex

Date: 2026-09-24  
Status: **TRAINING ARCHITECTURE**

## Harvested pattern

The studied Chase workflow converges on a compact control shape:

```
interfaces
  ↓
one Bridge
  ↓
fast decision/router
  ↓
deterministic / small-model / deep-agent lane
  ↓
connectors and tools
  ↓
shared Vault/state
```

The useful part is not the surface UI. Voice, buttons, browser HUD and note interfaces are wrappers around one Bridge and one shared state model.

## OTHRYS adaptation

OTHRYS keeps its existing governance boundaries and maps the pattern as:

```
voice / web / text / button / API
              ↓
         OTHRYS Bridge
              ↓
      hard deterministic route
          or JEV Router
              ↓
       execution planner
       FAST / LIGHT / DEEP
              ↓
 Themis / Keymaster / Trust Canal
              ↓
      tools / connectors
              ↓
        Talos / verifier
              ↓
 Books + memory + immutable receipt
```

## Lane meaning

### FAST
Deterministic or near-zero-intelligence handling.

Examples:
- direct status/read-only lookup;
- known command normalization;
- bounded deterministic formatting;
- no generative planning.

### LIGHT
Small model or narrow skill.

Examples:
- Study classification;
- simple research triage;
- bounded extraction or transformation;
- single-skill execution after normal authorization.

### DEEP
Frontier reasoning / coding agent / complex plan.

Examples:
- repository changes;
- deployment work;
- administration with consequences;
- multi-step planning;
- higher-risk or ambiguous operations.

## Critical boundary

**Routing is not authorization.**

Jev may recommend FAST/LIGHT/DEEP. It cannot:
- grant Themis permission;
- release a Keymaster credential;
- bypass Trust Canal;
- execute a connector;
- mark verification complete;
- promote itself.

The planner therefore always emits:
- `authorization.granted = false`;
- `authorityGranted = false`;
- `executionStarted = false`;
- `actionApplied = false`.

## One Bridge

All interfaces should converge on one canonical Bridge rather than grow separate agent systems.

The interface identifies the source of the request, but does not own:
- routing law;
- credentials;
- execution authority;
- state;
- verification.

This prevents voice UI, browser UI, Obsidian-like surfaces and future devices from becoming separate brains.

## Shared state and receipts

Every routing decision should be correlatable through:
- interface ID;
- Bridge ID;
- shared-state reference;
- Router observation digest;
- execution-plan digest;
- authorization status;
- verification status;
- receipt digest.

The receipt is evidence, not permission.

## Current implementation

- `runtime/os/jev_execution_planner.mjs`
- `runtime/os/jev_execution_planner.test.mjs`

This first slice is training-only and consumes a Router observation. It does not connect the recommendation to a real executor yet.
