// ---------------------------------------------------------------------------
// Talos · ops/events — the operational journal event model + reducer (pure).
//
// The mission store is append-only + event-sourced (Constitution L1/L2, the
// Hephaestus MissionStore precedent): a mission's state is REBUILT by replaying
// its events, never mutated in place, so a crash is recovered by replay. The
// reducer is total + deterministic and re-runs NO decision logic (routing,
// selection, and gate decisions are recorded as events). This is the truth the
// Nyx Night Ledger reads and the Mission Control read models fold.
// ---------------------------------------------------------------------------

import type { MissionState } from "./lifecycle.ts";
import type { Priority } from "./core.ts";
import type { DepartmentId, QueueId } from "../talos.ts";

/** The declarative, replayable evidence contract a mission may attach. Validation
 *  (the VALIDATING stage) checks the produced output against it before SUCCESS —
 *  success is never assumed (Constitution Art 22). All fields optional; the
 *  DEFAULT is `requireOutput: true` (an output artifact MUST exist). Kept
 *  declarative (not code) so it is deterministic and survives replay. */
export interface SuccessCriteria {
  /** An output artifact must exist. Defaults to true when criteria are present or absent. */
  readonly requireOutput?: boolean;
  /** Actual cost must not exceed this; over → PAUSED_FOR_APPROVAL (budget). */
  readonly maxCostUnits?: number;
  /** Substrings that MUST appear in the serialized output; missing → FAILED. */
  readonly mustContain?: readonly string[];
}

// --- A worker lease (claim) -------------------------------------------------

export interface Lease {
  readonly leaseId: string;
  readonly workerId: string;
  /** Epoch millis after which the lease is stale and may be reclaimed. */
  readonly expiresAt: number;
  /** The attempt number this lease covers (1-based). */
  readonly attempt: number;
}

// --- Orchestration (Hecate) plan, folded so it survives replay --------------

export interface PlanStep {
  readonly stepId: string;
  readonly capability: string;
  /** Steps that must SUCCEED before this one may start. */
  readonly dependsOn: readonly string[];
}

export type StepStatus = "pending" | "running" | "succeeded" | "failed" | "blocked";

export interface StepRecord {
  readonly stepId: string;
  readonly capability: string;
  readonly dependsOn: readonly string[];
  readonly status: StepStatus;
  readonly provider?: string;
  readonly outputRef?: string;
  readonly failureReason?: string;
}

// --- The event union --------------------------------------------------------

export type OperationEvent =
  | { readonly t: "op.received"; readonly at: string; readonly correlationId: string; readonly capability: string; readonly submittedBy: string; readonly idempotencyKey: string; readonly department: DepartmentId; readonly queue: QueueId; readonly priority: Priority; readonly payloadDigest: string; readonly maxAttempts: number; readonly deadlineAt: number | null; readonly successCriteria: SuccessCriteria | null }
  | { readonly t: "op.validated"; readonly at: string }
  | { readonly t: "op.validating"; readonly at: string }
  | { readonly t: "op.queued"; readonly at: string; readonly queue: QueueId; readonly reason: string }
  | { readonly t: "op.claimed"; readonly at: string; readonly lease: Lease }
  | { readonly t: "op.heartbeat"; readonly at: string; readonly leaseId: string; readonly expiresAt: number }
  | { readonly t: "op.lease_released"; readonly at: string; readonly leaseId: string; readonly reason: string }
  | { readonly t: "op.running"; readonly at: string; readonly attempt: number }
  | { readonly t: "op.plan_assigned"; readonly at: string; readonly steps: readonly PlanStep[] }
  | { readonly t: "op.step_started"; readonly at: string; readonly stepId: string }
  | { readonly t: "op.provider_selected"; readonly at: string; readonly stepId: string | null; readonly provider: string; readonly rung: string; readonly paid: boolean; readonly estimatedCost: number }
  | { readonly t: "op.step_completed"; readonly at: string; readonly stepId: string; readonly status: "succeeded" | "failed"; readonly outputRef?: string; readonly failureReason?: string }
  | { readonly t: "op.succeeded"; readonly at: string; readonly outputRef: string; readonly costUnits: number }
  | { readonly t: "op.failed"; readonly at: string; readonly reason: string; readonly code: string }
  | { readonly t: "op.retry_scheduled"; readonly at: string; readonly attempt: number; readonly nextRunAt: number; readonly reason: string }
  | { readonly t: "op.approval_requested"; readonly at: string; readonly reason: string; readonly capability: string; readonly category: string }
  | { readonly t: "op.approval_decided"; readonly at: string; readonly decision: "allow" | "deny"; readonly by: string; readonly capability: string; readonly category: string }
  | { readonly t: "op.cancelled"; readonly at: string; readonly reason: string; readonly by: string }
  | { readonly t: "op.dead_lettered"; readonly at: string; readonly reason: string }
  | { readonly t: "op.library_submitted"; readonly at: string; readonly purpose: string; readonly ref: string }
  | { readonly t: "op.archived"; readonly at: string; readonly from: MissionState };

// --- The rebuilt record (a fold over the events) ----------------------------

export interface MissionRecord {
  readonly missionId: string;
  readonly correlationId: string | null;
  readonly capability: string | null;
  readonly submittedBy: string | null;
  readonly idempotencyKey: string | null;
  readonly department: DepartmentId | null;
  readonly queue: QueueId | null;
  readonly priority: Priority;
  readonly state: MissionState;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly deadlineAt: number | null;
  readonly successCriteria: SuccessCriteria | null;
  readonly lease: Lease | null;
  readonly nextRunAt: number | null;
  readonly provider: string | null;
  readonly steps: readonly StepRecord[];
  /** Structured provider-selection history (folded from op.provider_selected) —
   *  the honest, string-parse-free source for free-vs-paid read models. */
  readonly selections: readonly { stepId: string | null; provider: string; rung: string; paid: boolean; estimatedCost: number }[];
  readonly outputRef: string | null;
  readonly failureReason: string | null;
  readonly totalCostUnits: number;
  readonly librarySubmissions: readonly { purpose: string; ref: string }[];
  readonly approvalReason: string | null;
  /** Grants the human explicitly approved, keyed `${capability}::${category}` —
   *  scopes preApproval so approving paid-A never permits paid-B, and approving
   *  paid-A never waives a ceiling breach on A. */
  readonly approvedGrants: readonly string[];
  readonly pendingApprovalCapability: string | null;
  readonly pendingApprovalCategory: string | null;
  readonly approvalDecision: "allow" | "deny" | null;
  readonly receivedAt: string | null;
  readonly updatedAt: string | null;
}

export function emptyRecord(missionId: string): MissionRecord {
  return {
    missionId,
    correlationId: null,
    capability: null,
    submittedBy: null,
    idempotencyKey: null,
    department: null,
    queue: null,
    priority: "normal",
    state: "RECEIVED",
    attempt: 0,
    maxAttempts: 1,
    deadlineAt: null,
    successCriteria: null,
    lease: null,
    nextRunAt: null,
    provider: null,
    steps: [],
    selections: [],
    outputRef: null,
    failureReason: null,
    totalCostUnits: 0,
    librarySubmissions: [],
    approvalReason: null,
    approvedGrants: [],
    pendingApprovalCapability: null,
    pendingApprovalCategory: null,
    approvalDecision: null,
    receivedAt: null,
    updatedAt: null,
  };
}

const STATE_OF: Partial<Record<OperationEvent["t"], MissionState>> = {
  "op.received": "RECEIVED",
  "op.validated": "VALIDATED",
  "op.queued": "QUEUED",
  "op.claimed": "CLAIMED",
  "op.running": "RUNNING",
  "op.validating": "VALIDATING",
  "op.succeeded": "SUCCEEDED",
  "op.failed": "FAILED",
  "op.retry_scheduled": "RETRY_SCHEDULED",
  "op.approval_requested": "PAUSED_FOR_APPROVAL",
  "op.cancelled": "CANCELLED",
  "op.dead_lettered": "DEAD_LETTERED",
  "op.archived": "ARCHIVED",
};

/** Replace-or-append a step by stepId (preserves Map-like last-write semantics
 *  across a plan re-assignment on retry). */
function putStep(steps: readonly StepRecord[], step: StepRecord): StepRecord[] {
  const i = steps.findIndex((s) => s.stepId === step.stepId);
  if (i === -1) return [...steps, step];
  const copy = steps.slice();
  copy[i] = step;
  return copy;
}

function patchStep(steps: readonly StepRecord[], stepId: string, patch: Partial<StepRecord>): readonly StepRecord[] {
  const i = steps.findIndex((s) => s.stepId === stepId);
  if (i === -1) return steps;
  const copy = steps.slice();
  copy[i] = { ...copy[i], ...patch };
  return copy;
}

/** Apply ONE event to a record, returning the next record. Total + deterministic
 *  + pure. This is the single fold step: `reduceMission` folds a whole log with
 *  it, and the store applies it incrementally on each append so reads never
 *  replay full history (the fix for the O(missions²·events) pump). */
export function applyEvent(r: MissionRecord, e: OperationEvent): MissionRecord {
  {
    const nextState = STATE_OF[e.t];
    if (nextState) r = { ...r, state: nextState };
    r = { ...r, updatedAt: e.at };

    switch (e.t) {
      case "op.received":
        r = {
          ...r,
          correlationId: e.correlationId,
          capability: e.capability,
          submittedBy: e.submittedBy,
          idempotencyKey: e.idempotencyKey,
          department: e.department,
          queue: e.queue,
          priority: e.priority,
          maxAttempts: e.maxAttempts,
          deadlineAt: e.deadlineAt,
          successCriteria: e.successCriteria,
          receivedAt: e.at,
        };
        break;
      case "op.queued":
        r = { ...r, queue: e.queue, lease: null, nextRunAt: null };
        break;
      case "op.claimed":
        r = { ...r, lease: e.lease, attempt: e.lease.attempt };
        break;
      case "op.heartbeat":
        if (r.lease && r.lease.leaseId === e.leaseId) {
          r = { ...r, lease: { ...r.lease, expiresAt: e.expiresAt } };
        }
        break;
      case "op.lease_released":
        if (r.lease && r.lease.leaseId === e.leaseId) r = { ...r, lease: null };
        break;
      case "op.plan_assigned": {
        let steps = r.steps;
        for (const s of e.steps) steps = putStep(steps, { stepId: s.stepId, capability: s.capability, dependsOn: s.dependsOn, status: "pending" });
        r = { ...r, steps };
        break;
      }
      case "op.step_started":
        r = { ...r, steps: patchStep(r.steps, e.stepId, { status: "running" }) };
        break;
      case "op.provider_selected":
        r = {
          ...r,
          provider: e.provider,
          selections: [...r.selections, { stepId: e.stepId, provider: e.provider, rung: e.rung, paid: e.paid, estimatedCost: e.estimatedCost }],
          steps: e.stepId ? patchStep(r.steps, e.stepId, { provider: e.provider }) : r.steps,
        };
        break;
      case "op.step_completed":
        r = { ...r, steps: patchStep(r.steps, e.stepId, { status: e.status, outputRef: e.outputRef, failureReason: e.failureReason }) };
        break;
      case "op.succeeded":
        r = { ...r, outputRef: e.outputRef, lease: null, totalCostUnits: r.totalCostUnits + e.costUnits };
        break;
      case "op.failed":
        r = { ...r, failureReason: e.reason, lease: null };
        break;
      case "op.retry_scheduled":
        r = { ...r, nextRunAt: e.nextRunAt, failureReason: e.reason, lease: null };
        break;
      case "op.approval_requested":
        r = { ...r, approvalReason: e.reason, pendingApprovalCapability: e.capability, pendingApprovalCategory: e.category };
        break;
      case "op.approval_decided": {
        const grant = `${e.capability}::${e.category}`;
        r = {
          ...r,
          approvalDecision: e.decision,
          approvedGrants: e.decision === "allow" && !r.approvedGrants.includes(grant) ? [...r.approvedGrants, grant] : r.approvedGrants,
        };
        break;
      }
      case "op.cancelled":
        r = { ...r, failureReason: `cancelled by ${e.by}: ${e.reason}`, lease: null };
        break;
      case "op.dead_lettered":
        r = { ...r, failureReason: e.reason, lease: null };
        break;
      case "op.library_submitted":
        r = { ...r, librarySubmissions: [...r.librarySubmissions, { purpose: e.purpose, ref: e.ref }] };
        break;
    }
  }
  return r;
}

/** Replay a mission's events into its record by folding `applyEvent`. Total +
 *  deterministic. (Durable adapters rebuild their record cache with this on
 *  startup; steady-state reads use the incrementally-maintained cache.) */
export function reduceMission(missionId: string, events: readonly OperationEvent[]): MissionRecord {
  return events.reduce(applyEvent, emptyRecord(missionId));
}
