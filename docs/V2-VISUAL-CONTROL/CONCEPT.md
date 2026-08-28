# OTHRYS V2 — Visual Control Layer

**Status:** DOCUMENTED_ONLY / GATED  
**Scope:** architecture note only; no implementation is authorized by this file.

## Goal
Give OTHRYS a visual observability and control surface over its execution nodes so it can inspect UI state, act when permitted, verify the result, and retain evidence.

This is not a generic remote-desktop product. The target is the minimum visual/control fabric needed for OTHRYS autonomous build-and-maintain loops.

## Nodes and surfaces
- Legion: primary high-power build/AI node.
- T590: secondary worker/service/verifier node.
- Tablet: primary operator/controller surface.
- Phone: secondary controller surface.

## Phased capability
1. **OBSERVE** — periodic/live screenshots, active window, device state, timestamps, health context.
2. **SUPERVISED** — operator-approved mouse, keyboard, scroll and window actions.
3. **AUTONOMOUS** — bounded AI computer-use loop: `observe -> detect -> act -> verify -> record`.

## Design constraints
- Prefer lightweight screen-state updates (roughly 2–5 FPS when enough) over high-bandwidth video.
- Enrich pixels with accessibility tree, active-window and UI metadata where available.
- Every action must be attributable to a node, mode, actor and timestamp.
- Fail closed on stale frames, uncertain target state, lost node connection or permission mismatch.
- Verification is separate from action: a click/keystroke is never success by itself.
- Record before/after evidence sufficient to prove the intended UI state changed.
- No hidden escalation from OBSERVE to SUPERVISED or AUTONOMOUS.

## Relationship to OTHRYS lifecycle
The visual layer is an actuator/sensor for the existing North Star, not a replacement architecture:

`need/fault -> plan -> compose proven capability -> build/repair -> verify -> deploy/operate -> observe -> repeat`

Visual control becomes useful when a build, verifier, deployment, app, browser or local tool exposes state only through a GUI. It should integrate with Talos evidence/loops, Mycelium node routing, Trust Canal authority and the tablet Command Deck rather than create a second orchestration system.

## First implementation boundary (future mission)
Minimum useful specimen: one node screenshot endpoint + timestamp/device identity + tablet view. No input injection in the first proof. Only after observation is proven should supervised mouse/keyboard authority be admitted.
