// ---------------------------------------------------------------------------
// Talos · ops/lifecycle — the mission state machine as DATA (pure, node-free).
//
// The freeze fixes the mission lifecycle; this file makes it enforceable. States
// are opaque UPPER_SNAKE strings (the Hephaestus convention) with a declared
// `kind`; transitions are a static, validated adjacency. Every state transition
// in the engine is checked against `canTransition` — an illegal move is rejected,
// never applied. This module owns NO time and NO io.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// THE CANONICAL TALOS RUNTIME LIFECYCLE — FROZEN (Talos v1, ADR-0025/0029).
//
// Evidence-based: a mission reaches SUCCEEDED only THROUGH `VALIDATING` — success
// is never assumed, it is validated (Constitution Art 22). Human gates use ONE
// `PAUSED_FOR_APPROVAL` state, scoped by category (paid/ceiling/budget/security/
// deployment/policy) — no state explosion. `ARCHIVED` closes a terminal mission.
// Diagram-label ↔ identifier: LEASED≡CLAIMED, SUCCESS≡SUCCEEDED, RETRY≡
// RETRY_SCHEDULED, DEAD_LETTER≡DEAD_LETTERED (see ADR-0029).
// ---------------------------------------------------------------------------
export const MISSION_STATES = [
  "RECEIVED",
  "VALIDATED",
  "QUEUED",
  "CLAIMED", // canonical label: LEASED
  "RUNNING",
  "VALIDATING", // output-evidence gate (Art 22)
  "PAUSED_FOR_APPROVAL", // one human gate, category-scoped
  "RETRY_SCHEDULED", // canonical label: RETRY
  "SUCCEEDED", // canonical label: SUCCESS
  "FAILED",
  "CANCELLED",
  "DEAD_LETTERED", // canonical label: DEAD_LETTER
  "ARCHIVED",
] as const;
export type MissionState = (typeof MISSION_STATES)[number];

export type StateKind = "system" | "human" | "terminal";

export const STATE_KIND: Readonly<Record<MissionState, StateKind>> = {
  RECEIVED: "system",
  VALIDATED: "system",
  QUEUED: "system",
  CLAIMED: "system",
  RUNNING: "system",
  VALIDATING: "system",
  PAUSED_FOR_APPROVAL: "human",
  RETRY_SCHEDULED: "system",
  SUCCEEDED: "terminal",
  FAILED: "terminal",
  CANCELLED: "terminal",
  DEAD_LETTERED: "terminal",
  ARCHIVED: "terminal",
};

/** The legal transition adjacency. A transition NOT listed here is illegal and
 *  the engine refuses to apply it. Cancellation (any non-terminal → CANCELLED)
 *  and archival (any terminal → ARCHIVED) are handled in `canTransition`. */
export const LEGAL_TRANSITIONS: Readonly<Record<MissionState, readonly MissionState[]>> = {
  RECEIVED: ["VALIDATED", "FAILED"],
  VALIDATED: ["QUEUED", "FAILED"],
  QUEUED: ["CLAIMED", "FAILED", "DEAD_LETTERED"], // FAILED/DEAD = deadline expiry / no worker at reap
  CLAIMED: ["RUNNING", "QUEUED", "DEAD_LETTERED"], // QUEUED = stale recovery; DEAD = exhausted stale claim
  RUNNING: ["VALIDATING", "PAUSED_FOR_APPROVAL", "FAILED", "RETRY_SCHEDULED", "DEAD_LETTERED", "QUEUED"], // success routes through VALIDATING; QUEUED = crashed-run reclaim
  VALIDATING: ["SUCCEEDED", "RETRY_SCHEDULED", "PAUSED_FOR_APPROVAL", "FAILED", "DEAD_LETTERED"], // evidence gate outcomes
  PAUSED_FOR_APPROVAL: ["QUEUED", "FAILED"], // approved → re-queue; denied → fail
  RETRY_SCHEDULED: ["QUEUED", "DEAD_LETTERED", "FAILED"], // FAILED = deadline passed while scheduled
  SUCCEEDED: ["ARCHIVED"],
  FAILED: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  DEAD_LETTERED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function isTerminal(s: MissionState): boolean {
  return STATE_KIND[s] === "terminal";
}

/** Cancellation is legal from ANY non-terminal state; archival is legal from ANY
 *  terminal state (except ARCHIVED itself). Everything else follows the adjacency. */
export function canTransition(from: MissionState, to: MissionState): boolean {
  if (to === "ARCHIVED") return isTerminal(from) && from !== "ARCHIVED";
  if (isTerminal(from)) return false;
  if (to === "CANCELLED") return true; // cancel any live mission
  return LEGAL_TRANSITIONS[from].includes(to);
}

/** The reason a transition is illegal (for precise, auditable rejections). */
export function transitionRejection(from: MissionState, to: MissionState): string | null {
  if (canTransition(from, to)) return null;
  if (isTerminal(from)) return `mission is terminal (${from}); no transition to ${to}`;
  return `illegal transition ${from} -> ${to}`;
}
