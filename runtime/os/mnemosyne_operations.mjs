import { appendEvent } from './event_ledger.mjs';

const clean=(v,n=240)=>String(v??'').trim().slice(0,n);

export function recordOperationalEvent(root,input={}){
  const at=clean(input.at||new Date().toISOString(),64);
  if(!Number.isFinite(Date.parse(at))) throw new Error('MNEM_OP_TIME_INVALID');
  const actor=clean(input.actor,48),job=clean(input.job,96),status=clean(input.status,24).toUpperCase();
  if(!actor||!job||!['PASS','FAIL','INFO','SKIP','DEGRADED'].includes(status)) throw new Error('MNEM_OP_EVENT_INVALID');
  return appendEvent(root,{
    occurredAt:at,
    source:actor,
    type:clean(input.type,96)||'OPERATION_RECORDED',
    status,
    channel:clean(input.channel,32)||'system',
    stream:clean(input.stream,80)||actor,
    missionId:input.missionId,
    workId:input.workId,
    correlationId:input.correlationId,
    evidenceRef:input.evidenceRef,
    job,
    evidence:input.evidence??null,
    lesson:clean(input.lesson,1200),
    data:input.data
  });
}

export function recordTroubleshootingFailure(root,input={}){
  const op=recordOperationalEvent(root,{...input,status:'FAIL'});
  return Object.freeze({operation:op,reviewRecommended:true,retainedIn:'OTHRYS_EVENT_LEDGER'});
}
