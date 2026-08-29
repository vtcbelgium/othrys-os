import { createHash } from 'node:crypto';

export const KRONOS_STATES=Object.freeze(['DORMANT','BOOTING','VERIFYING','ALIVE','DEGRADED','CRITICAL','RECOVERING','HALTING']);
const TRANSITIONS=Object.freeze({
  DORMANT:['BOOTING'], BOOTING:['VERIFYING','HALTING','DORMANT'], VERIFYING:['ALIVE','HALTING','DORMANT'],
  ALIVE:['DEGRADED','CRITICAL','HALTING'], DEGRADED:['ALIVE','CRITICAL','RECOVERING','HALTING'],
  CRITICAL:['RECOVERING','HALTING'], RECOVERING:['ALIVE','DEGRADED','CRITICAL','HALTING'], HALTING:['DORMANT']
});
export const KRONOS_EXECUTION_SEMANTICS=Object.freeze({deliveryGuarantee:'at-least-once',bootStepsIdempotent:true,suspendAndReleaseWaits:true,exactlyOnce:false});
const HEALTH=new Set(['ready','degraded','unavailable','unknown']);
const sha=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const clean=v=>typeof v==='string'?v.trim():'';
function base(body){return Object.freeze({...body,authorityGranted:false,executionStarted:false});}

export function canTransitionKronos(from,to){return KRONOS_STATES.includes(from)&&KRONOS_STATES.includes(to)&&(TRANSITIONS[from]??[]).includes(to);}
export function transitionKronos(from,to){
  if(!canTransitionKronos(from,to)) throw new Error(`KRONOS_LIFECYCLE_INVALID:${from}->${to}`);
  return base({schema:'othrys.os.kronos-transition.v1',from,to});
}

function component(raw){
  if(!raw||typeof raw!=='object'||!clean(raw.componentId)||!HEALTH.has(clean(raw.band).toLowerCase())) throw new Error('KRONOS_COMPONENT_INVALID');
  return Object.freeze({componentId:clean(raw.componentId),mandatory:raw.mandatory===true,band:clean(raw.band).toLowerCase(),evidenceRef:raw.evidenceRef==null?null:clean(raw.evidenceRef),leaseExpiresAt:Number.isFinite(raw.leaseExpiresAt)?Number(raw.leaseExpiresAt):null});
}
export function evaluateKronosSupervision(components,{observedAt}={}){
  if(!Array.isArray(components)||!Number.isFinite(observedAt)) throw new Error('KRONOS_SUPERVISION_INVALID');
  const rows=components.map(component);
  let verdict='ALIVE';
  for(const row of rows.filter(x=>x.mandatory)){
    const expired=row.leaseExpiresAt!==null&&row.leaseExpiresAt<observedAt;
    if(row.band==='unavailable'||expired){verdict='CRITICAL';break;}
    if(row.band==='degraded'||row.band==='unknown') verdict='DEGRADED';
  }
  return base({schema:'othrys.os.kronos-supervision.v1',observedAt,verdict,components:Object.freeze(rows)});
}

export function createKronosHeartbeat({bootId,sequence,timestamp,uptimeMs,lifecycleState,components,compactedContext=false,pinSetHash=null}={}){
  bootId=clean(bootId); lifecycleState=clean(lifecycleState).toUpperCase();
  if(!bootId||!Number.isInteger(sequence)||sequence<1||Number.isNaN(Date.parse(timestamp))||!Number.isFinite(uptimeMs)||uptimeMs<0||!KRONOS_STATES.includes(lifecycleState)) throw new Error('KRONOS_HEARTBEAT_INVALID');
  const rows=components.map(component), supervision=evaluateKronosSupervision(rows,{observedAt:Date.parse(timestamp)});
  const rank={ALIVE:3,DEGRADED:2,CRITICAL:1};
  if(lifecycleState==='ALIVE'&&rank[supervision.verdict]<rank.ALIVE) throw new Error('KRONOS_HEARTBEAT_DISHONEST');
  const body={schema:'othrys.os.kronos-heartbeat.v1',bootId,sequence,timestamp,uptimeMs,lifecycleState,components:Object.freeze(rows),compactedContext:Object.freeze({compactedContext:Boolean(compactedContext),pinSetHash:pinSetHash==null?null:clean(pinSetHash)}),supervisionVerdict:supervision.verdict};
  return base({...body,heartbeatDigest:sha(body)});
}
export function gracefulKronosCancellation(compensation){
  if(!Array.isArray(compensation)||compensation.length<1) throw new Error('KRONOS_GRACEFUL_COMPENSATION_REQUIRED');
  const steps=compensation.map((x,i)=>{
    if(!x||typeof x!=='object'||!clean(x.stepId)||!clean(x.intent)) throw new Error(`KRONOS_COMPENSATION_INVALID:${i}`);
    return Object.freeze({stepId:clean(x.stepId),intent:clean(x.intent),afterStepId:x.afterStepId==null?null:clean(x.afterStepId)});
  });
  return base({schema:'othrys.os.kronos-cancellation.v1',verb:'graceful',compensation:Object.freeze(steps)});
}
export function forcedKronosCancellation(){
  return base({schema:'othrys.os.kronos-cancellation.v1',verb:'forced',compensation:null});
}

export function createKronosLifeProposal({action,evidenceRef,requestedAt}={}){
  action=clean(action).toUpperCase(); evidenceRef=clean(evidenceRef); requestedAt=clean(requestedAt);
  if(!['SAFE_MODE_REVIEW','HALT_REVIEW','RECOVERY_REVIEW','BOOT_REVIEW'].includes(action)||!evidenceRef||Number.isNaN(Date.parse(requestedAt))) throw new Error('KRONOS_LIFE_PROPOSAL_INVALID');
  const body={schema:'othrys.os.kronos-life-proposal.v1',action,evidenceRef,requestedAt,requiresTrustCanal:true,requiresIndependentVerification:true};
  return base({...body,proposalDigest:sha(body)});
}