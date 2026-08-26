import { canTransition, type MissionState } from "./lifecycle.ts";
import { decideRetry, type RetryPolicy } from "./retry.ts";
import { reduceMission, type OperationEvent } from "./events.ts";

export type WorkResult =
  | { ok: true; outputRef: string }
  | { ok: false; reason: string; retryable: boolean };

export interface LoopDeps {
  work(attempt: number): Promise<WorkResult>;
  verify(outputRef: string): Promise<boolean>;
  now(): number;
  iso(): string;
}

export interface LoopRun {
  missionId: string;
  events: OperationEvent[];
  state: MissionState;
  attempts: number;
}

function push(events: OperationEvent[], event: OperationEvent): void {
  const current = reduceMission("mission", events).state;
  const next = reduceMission("mission", [...events, event]).state;
  if (current !== next && !canTransition(current, next)) {
    throw new Error(`illegal transition ${current} -> ${next}`);
  }
  events.push(event);
}export async function runLoop(
  missionId: string,
  policy: RetryPolicy,
  deps: LoopDeps,
): Promise<LoopRun> {
  const events: OperationEvent[] = [];
  events.push({t:"op.received",at:deps.iso(),correlationId:`cor-${missionId}`,capability:"hephaestus.repair",submittedBy:"gpt-control",idempotencyKey:missionId,department:"build-automation",queue:"background",priority:"normal",payloadDigest:`payload-${missionId}`,maxAttempts:policy.maxAttempts,deadlineAt:null,successCriteria:{requireOutput:true}});
  push(events,{t:"op.validated",at:deps.iso()});
  push(events,{t:"op.queued",at:deps.iso(),queue:"background",reason:"intake"});

  for (let attempt=1; attempt<=policy.maxAttempts; attempt++) {
    push(events,{t:"op.claimed",at:deps.iso(),lease:{leaseId:`lease-${attempt}`,workerId:"worker-1",expiresAt:deps.now()+1000,attempt}});
    push(events,{t:"op.running",at:deps.iso(),attempt});
    const result=await deps.work(attempt);
    if (result.ok) {
      push(events,{t:"op.validating",at:deps.iso()});
      if (await deps.verify(result.outputRef)) {
        push(events,{t:"op.succeeded",at:deps.iso(),outputRef:result.outputRef,costUnits:0});
        return {missionId,events,state:"SUCCEEDED",attempts:attempt};
      }
      const d=decideRetry(policy,attempt,true,deps.now());
      if (d.kind==="retry") {
        push(events,{t:"op.retry_scheduled",at:deps.iso(),attempt,nextRunAt:d.nextRunAt,reason:"verification failed"});
        push(events,{t:"op.queued",at:deps.iso(),queue:"background",reason:"retry"});
        continue;
      }
      push(events,{t:"op.dead_lettered",at:deps.iso(),reason:"verification failed; attempts exhausted"});
      return {missionId,events,state:"DEAD_LETTERED",attempts:attempt};
    }    const d=decideRetry(policy,attempt,result.retryable,deps.now());
    if (d.kind==="fail") {
      push(events,{t:"op.failed",at:deps.iso(),reason:result.reason,code:"worker_failure"});
      return {missionId,events,state:"FAILED",attempts:attempt};
    }
    if (d.kind==="dead-letter") {
      push(events,{t:"op.dead_lettered",at:deps.iso(),reason:result.reason});
      return {missionId,events,state:"DEAD_LETTERED",attempts:attempt};
    }
    push(events,{t:"op.retry_scheduled",at:deps.iso(),attempt,nextRunAt:d.nextRunAt,reason:result.reason});
    push(events,{t:"op.queued",at:deps.iso(),queue:"background",reason:"retry"});
  }
  throw new Error("unreachable retry loop exit");
}

export function replay(run: LoopRun): MissionState {
  return reduceMission(run.missionId,run.events).state;
}
