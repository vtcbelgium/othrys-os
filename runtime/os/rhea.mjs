import { createHash } from 'node:crypto';

export const RHEA_POLICY=Object.freeze({
  schema:'othrys.os.rhea-care.v1',
  failureStreakNotice:2,
  failureStreakOpenCase:3,
  failureStreakCritical:8,
  latencyRegressionMs:5000,
  watchWindowMinutes:15
});

export const RHEA_STATES=Object.freeze([
  'OBSERVED','DEGRADED','DIAGNOSING','CARE_PLAN','WAITING_FOR_AUTHORITY',
  'REPAIR_REQUESTED','REPAIRING','VERIFYING','RECOVERED','WATCHING','CLOSED',
  'FALSE_POSITIVE','ACCEPTED_DEGRADATION','BLOCKED','ESCALATED','UNRESOLVED'
]);
const TERMINAL=new Set(['CLOSED','FALSE_POSITIVE','ACCEPTED_DEGRADATION','BLOCKED','ESCALATED','UNRESOLVED']);
const TRANSITIONS=new Map(Object.entries({
  OBSERVED:['DEGRADED','FALSE_POSITIVE','WATCHING','CLOSED','ESCALATED','UNRESOLVED'],
  DEGRADED:['DIAGNOSING','WATCHING','ACCEPTED_DEGRADATION','ESCALATED','UNRESOLVED'],
  DIAGNOSING:['CARE_PLAN','ESCALATED','FALSE_POSITIVE','UNRESOLVED'],
  CARE_PLAN:['WAITING_FOR_AUTHORITY','REPAIR_REQUESTED','WATCHING','ESCALATED','UNRESOLVED'],
  WAITING_FOR_AUTHORITY:['REPAIR_REQUESTED','BLOCKED','ACCEPTED_DEGRADATION','ESCALATED','UNRESOLVED'],
  REPAIR_REQUESTED:['REPAIRING','BLOCKED','VERIFYING','ESCALATED','UNRESOLVED'],
  REPAIRING:['VERIFYING','BLOCKED','ESCALATED','UNRESOLVED'], VERIFYING:['RECOVERED','DEGRADED','UNRESOLVED','ESCALATED'],
  RECOVERED:['WATCHING','CLOSED','ESCALATED'], WATCHING:['CLOSED','DEGRADED','ESCALATED','UNRESOLVED']
}));const sha=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value),'utf8').digest('hex');
const clean=value=>typeof value==='string'?value.trim():'';
const FORBIDDEN=/api[_-]?key|secret|token|password|credential_body|private_key/i;
function assertNoSecrets(value,path='root'){
  if(Array.isArray(value)){value.forEach((v,i)=>assertNoSecrets(v,`${path}[${i}]`));return;}
  if(!value||typeof value!=='object')return;
  for(const [k,v] of Object.entries(value)){
    if(FORBIDDEN.test(k)) throw new Error(`RHEA_SECRET_SHAPED_FIELD:${path}.${k}`);
    assertNoSecrets(v,`${path}.${k}`);
  }
}
function evidenceRef(value){
  const ref=clean(value); if(!ref) throw new Error('RHEA_EVIDENCE_REF_REQUIRED'); return ref;
}
function freezeCase(body){assertNoSecrets(body);return Object.freeze({...body,authorityGranted:false,executionStarted:false});}
function assertCase(c){
  if(!c||c.schema!==RHEA_POLICY.schema||!RHEA_STATES.includes(c.state)||!c.caseId||!c.subject) throw new Error('RHEA_CASE_INVALID');
  if(c.authorityGranted!==false||c.executionStarted!==false) throw new Error('RHEA_CASE_AUTHORITY_INVALID');
  return c;
}

export function createCareCase({subject,observedAt,state='OBSERVED',severity='DEGRADED',symptoms=[],evidenceRefs=[]}={}){
  subject=clean(subject); observedAt=clean(observedAt); severity=clean(severity).toUpperCase(); state=clean(state).toUpperCase();
  if(!subject||Number.isNaN(Date.parse(observedAt))||!RHEA_STATES.includes(state)) throw new Error('RHEA_CASE_INPUT_INVALID');
  if(!['INFO','DEGRADED','ACTION','CRITICAL'].includes(severity)) throw new Error('RHEA_CASE_SEVERITY_INVALID');
  const refs=Object.freeze(evidenceRefs.map(evidenceRef));
  const basis={subject,observedAt,state,severity,symptoms:[...symptoms].map(String),evidenceRefs:[...refs]};
  return freezeCase({schema:RHEA_POLICY.schema,caseId:`RC-${sha(basis).slice(0,12).toUpperCase()}`,...basis,history:Object.freeze([]),terminal:TERMINAL.has(state)});
}export function transitionCareCase(c,toState,{at,reason='',evidenceRefs=[]}={}){
  c=assertCase(c); toState=clean(toState).toUpperCase(); at=clean(at);
  if(Number.isNaN(Date.parse(at))) throw new Error('RHEA_TRANSITION_TIME_INVALID');
  const allowed=TRANSITIONS.get(c.state)??[];
  if(!allowed.includes(toState)) throw new Error(`RHEA_TRANSITION_INVALID:${c.state}->${toState}`);
  const evt=Object.freeze({from:c.state,to:toState,at,reason:clean(reason),evidenceRefs:Object.freeze(evidenceRefs.map(evidenceRef))});
  return freezeCase({...c,state:toState,history:Object.freeze([...(c.history??[]),evt]),terminal:TERMINAL.has(toState)});
}

export function assessCareObservations(subject,observations,{policy=RHEA_POLICY}={}){
  subject=clean(subject); if(!subject||!Array.isArray(observations)||observations.length<1) throw new Error('RHEA_OBSERVATIONS_REQUIRED');
  const rows=observations.map((row,i)=>{
    if(!row||typeof row!=='object'||typeof row.failed!=='boolean'||Number.isNaN(Date.parse(clean(row.observedAt)))) throw new Error(`RHEA_OBSERVATION_INVALID:${i}`);
    assertNoSecrets(row); return {...row,observedAt:clean(row.observedAt),evidenceRef:evidenceRef(row.evidenceRef),availability:clean(row.availability).toUpperCase()};
  }).sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt));
  const latest=rows.at(-1); let streak=0;
  for(let i=rows.length-1;i>=0&&rows[i].failed;i--) streak++;
  let judgment='IGNORE',severity='INFO',reason='healthy observation';
  if(latest.criticalPlatform===true){judgment='OPEN_CASE';severity='CRITICAL';reason='critical platform status';}
  else if(latest.failed){
    if(streak<policy.failureStreakNotice) reason='transient failure below notice threshold';
    else if(streak<policy.failureStreakOpenCase){judgment='WATCH';severity='DEGRADED';reason='persistent signal below open-case threshold';}
    else {judgment='OPEN_CASE';severity=streak>=policy.failureStreakCritical&&['UNAVAILABLE','OFFLINE'].includes(latest.availability)?'CRITICAL':'ACTION';reason='persistent degradation';}
  }
  return Object.freeze({schema:'othrys.os.rhea-assessment.v1',subject,judgment,severity,reason,streak,latestEvidenceRef:latest.evidenceRef,latencyRegression:Boolean(latest.failed&&Number.isFinite(latest.latencyMs)&&latest.latencyMs>=policy.latencyRegressionMs),authorityGranted:false,executionStarted:false});
}
export function createCarePlan(c,{prometheusEvidenceRef,mnemosyneEvidenceRef,createdAt}={}){
  c=assertCase(c); createdAt=clean(createdAt);
  if(!['DIAGNOSING','CARE_PLAN'].includes(c.state)||Number.isNaN(Date.parse(createdAt))) throw new Error('RHEA_CARE_PLAN_INVALID');
  const body={schema:'othrys.os.rhea-care-plan.v1',caseId:c.caseId,subject:c.subject,createdAt,prometheusEvidenceRef:evidenceRef(prometheusEvidenceRef),mnemosyneEvidenceRef:evidenceRef(mnemosyneEvidenceRef),steps:Object.freeze(['CONFIRM_DEGRADATION','REQUEST_CONTEXT','REQUEST_DIAGNOSIS','FORM_REPAIR_REQUEST','VERIFY_VITALITY','WATCH']),applyForbidden:true};
  return Object.freeze({...body,planDigest:sha(body),authorityGranted:false,executionStarted:false});
}

export function createRepairRequest(c,{planDigest,requestedAt,consequential=true}={}){
  c=assertCase(c); requestedAt=clean(requestedAt);
  if(c.state!=='CARE_PLAN'||!/^[0-9a-f]{64}$/.test(String(planDigest??''))||Number.isNaN(Date.parse(requestedAt))) throw new Error('RHEA_REPAIR_REQUEST_INVALID');
  const body={schema:'othrys.os.rhea-repair-request.v1',caseId:c.caseId,subject:c.subject,requestedAt,planDigest,consequential:Boolean(consequential),targetOwner:'hephaestus',capability:'engineering.build',requestedOutcome:'RESTORE_VITALITY',authorityState:consequential?'WAITING_FOR_AUTHORITY':'REQUEST_ONLY',applyForbidden:true};
  return Object.freeze({...body,requestDigest:sha(body),authorityGranted:false,executionStarted:false});
}

export function createKronosEscalation(c,{recommendation='SAFE_MODE_REVIEW',blastRadius='platform',requestedAt}={}){
  c=assertCase(c); requestedAt=clean(requestedAt); recommendation=clean(recommendation); blastRadius=clean(blastRadius);
  if(!recommendation||!blastRadius||Number.isNaN(Date.parse(requestedAt))) throw new Error('RHEA_KRONOS_ESCALATION_INVALID');
  const body={schema:'othrys.os.rhea-kronos-escalation.v1',caseId:c.caseId,subject:c.subject,severity:c.severity,requestedAt,recommendation,blastRadius,decisionOwner:'kronos',rheaMayNotExecute:Object.freeze(['safe_mode','halt','boot','valve','platform_lifecycle'])};
  return Object.freeze({...body,requestDigest:sha(body),rheaInvokedLifeAction:false,authorityGranted:false,executionStarted:false});
}

export function verifyVitality(c,{observedAt,healthy,evidenceRef:ref}={}){
  c=assertCase(c); observedAt=clean(observedAt);
  if(!['REPAIR_REQUESTED','REPAIRING','VERIFYING','WAITING_FOR_AUTHORITY','CARE_PLAN'].includes(c.state)||typeof healthy!=='boolean'||Number.isNaN(Date.parse(observedAt))) throw new Error('RHEA_VITALITY_VERIFICATION_INVALID');
  const body={schema:'othrys.os.rhea-vitality-verification.v1',caseId:c.caseId,subject:c.subject,observedAt,healthy,evidenceRef:evidenceRef(ref),judgment:healthy?'RECOVERED':'DEGRADED'};
  return Object.freeze({...body,verificationDigest:sha(body),talosVerificationAuthorityUnchanged:true,authorityGranted:false,executionStarted:false});
}
