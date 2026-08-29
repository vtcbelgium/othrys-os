import test from 'node:test';
import assert from 'node:assert/strict';
import { assessCareObservations, createCareCase, createCarePlan, createKronosEscalation, createRepairRequest, transitionCareCase, verifyVitality } from './rhea.mjs';

const t='2026-08-29T18:00:00.000Z';
const fail=(n=3)=>Array.from({length:n},(_,i)=>({failed:true,observedAt:`2026-08-29T18:0${i}:00.000Z`,evidenceRef:`telemetry:${i}`,availability:'DEGRADED',latencyMs:1200+i}));

test('single transient failure stays below CareCase threshold',()=>{
  const a=assessCareObservations('prometheus',fail(1));
  assert.equal(a.judgment,'IGNORE'); assert.equal(a.streak,1); assert.equal(a.authorityGranted,false);
});

test('persistent degradation opens a case deterministically',()=>{
  const a=assessCareObservations('prometheus',fail(3));
  assert.equal(a.judgment,'OPEN_CASE'); assert.equal(a.severity,'ACTION');
});

test('CareCase lifecycle rejects skipped transitions and grants no authority',()=>{
  const c=createCareCase({subject:'prometheus',observedAt:t,evidenceRefs:['telemetry:1']});
  assert.throws(()=>transitionCareCase(c,'RECOVERED',{at:t}),/RHEA_TRANSITION_INVALID/);
  const d=transitionCareCase(c,'DEGRADED',{at:t,reason:'persistent',evidenceRefs:['telemetry:1']});
  assert.equal(d.state,'DEGRADED'); assert.equal(d.authorityGranted,false); assert.equal(d.executionStarted,false);
});
test('care plan binds Prometheus and Mnemosyne evidence without execution',()=>{
  let c=createCareCase({subject:'prometheus',observedAt:t,evidenceRefs:['telemetry:1']});
  c=transitionCareCase(c,'DEGRADED',{at:t,evidenceRefs:['telemetry:1']});
  c=transitionCareCase(c,'DIAGNOSING',{at:t,evidenceRefs:['trace:1']});
  const p=createCarePlan(c,{prometheusEvidenceRef:'prometheus:e1',mnemosyneEvidenceRef:'mnemosyne:e1',createdAt:t});
  assert.match(p.planDigest,/^[0-9a-f]{64}$/); assert.equal(p.applyForbidden,true); assert.equal(p.executionStarted,false);
});

test('consequential repair stops at WAITING_FOR_AUTHORITY',()=>{
  let c=createCareCase({subject:'prometheus',observedAt:t,evidenceRefs:['telemetry:1']});
  c=transitionCareCase(c,'DEGRADED',{at:t}); c=transitionCareCase(c,'DIAGNOSING',{at:t}); c=transitionCareCase(c,'CARE_PLAN',{at:t});
  const r=createRepairRequest(c,{planDigest:'a'.repeat(64),requestedAt:t,consequential:true});
  assert.equal(r.authorityState,'WAITING_FOR_AUTHORITY'); assert.equal(r.targetOwner,'hephaestus'); assert.equal(r.executionStarted,false);
});

test('Kronos escalation is request-only and Rhea never invokes LIFE',()=>{
  const c=createCareCase({subject:'prometheus',observedAt:t,state:'DEGRADED',severity:'CRITICAL'});
  const e=createKronosEscalation(c,{requestedAt:t});
  assert.equal(e.decisionOwner,'kronos'); assert.equal(e.rheaInvokedLifeAction,false); assert.equal(e.authorityGranted,false);
});

test('vitality verification does not become Talos verification authority',()=>{
  const c=createCareCase({subject:'prometheus',observedAt:t,state:'VERIFYING'});
  const v=verifyVitality(c,{observedAt:t,healthy:true,evidenceRef:'telemetry:recovered'});
  assert.equal(v.judgment,'RECOVERED'); assert.equal(v.talosVerificationAuthorityUnchanged,true); assert.equal(v.authorityGranted,false);
});

test('secret-shaped evidence fails closed',()=>{
  assert.throws(()=>assessCareObservations('x',[{failed:true,observedAt:t,evidenceRef:'e',token:'nope'}]),/RHEA_SECRET_SHAPED_FIELD/);
});