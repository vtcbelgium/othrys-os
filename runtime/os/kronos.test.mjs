import test from 'node:test';
import assert from 'node:assert/strict';
import { KRONOS_EXECUTION_SEMANTICS, canTransitionKronos, createKronosHeartbeat, createKronosLifeProposal, evaluateKronosSupervision, forcedKronosCancellation, gracefulKronosCancellation, transitionKronos } from './kronos.mjs';

const ts='2026-08-29T19:10:00.000Z';
const ready=[{componentId:'runtime',mandatory:true,band:'ready',evidenceRef:'talos:runtime',leaseExpiresAt:Date.parse(ts)+10000}];

test('qualified lifecycle path is fail-closed',()=>{
  assert.equal(canTransitionKronos('DORMANT','BOOTING'),true);
  assert.equal(canTransitionKronos('DORMANT','ALIVE'),false);
  assert.throws(()=>transitionKronos('DORMANT','ALIVE'),/KRONOS_LIFECYCLE_INVALID/);
  assert.equal(transitionKronos('VERIFYING','ALIVE').authorityGranted,false);
});

test('execution semantics preserve at-least-once honesty',()=>{
  assert.equal(KRONOS_EXECUTION_SEMANTICS.deliveryGuarantee,'at-least-once');
  assert.equal(KRONOS_EXECUTION_SEMANTICS.bootStepsIdempotent,true);
  assert.equal(KRONOS_EXECUTION_SEMANTICS.exactlyOnce,false);
});

test('mandatory unavailable or expired component makes supervision CRITICAL',()=>{
  const u=evaluateKronosSupervision([{componentId:'runtime',mandatory:true,band:'unavailable',evidenceRef:'e',leaseExpiresAt:null}],{observedAt:1});
  assert.equal(u.verdict,'CRITICAL');
  const x=evaluateKronosSupervision([{componentId:'runtime',mandatory:true,band:'ready',evidenceRef:'e',leaseExpiresAt:1}],{observedAt:2});
  assert.equal(x.verdict,'CRITICAL');
});
test('heartbeat cannot claim ALIVE over degraded mandatory evidence',()=>{
  const bad=[{componentId:'runtime',mandatory:true,band:'degraded',evidenceRef:'talos:runtime',leaseExpiresAt:Date.parse(ts)+10000}];
  assert.throws(()=>createKronosHeartbeat({bootId:'boot-1',sequence:1,timestamp:ts,uptimeMs:1000,lifecycleState:'ALIVE',components:bad}),/KRONOS_HEARTBEAT_DISHONEST/);
});

test('honest heartbeat is digest-bound and authority-free',()=>{
  const h=createKronosHeartbeat({bootId:'boot-1',sequence:1,timestamp:ts,uptimeMs:1000,lifecycleState:'ALIVE',components:ready});
  assert.match(h.heartbeatDigest,/^[0-9a-f]{64}$/); assert.equal(h.supervisionVerdict,'ALIVE'); assert.equal(h.authorityGranted,false); assert.equal(h.executionStarted,false);
});

test('graceful and forced cancellation remain distinct',()=>{
  const g=gracefulKronosCancellation([{stepId:'drain',intent:'drain-accepted-work',afterStepId:null}]);
  assert.equal(g.verb,'graceful'); assert.equal(g.compensation.length,1);
  assert.throws(()=>gracefulKronosCancellation([]),/KRONOS_GRACEFUL_COMPENSATION_REQUIRED/);
  assert.equal(forcedKronosCancellation().compensation,null);
});

test('LIFE action remains a proposal requiring Trust Canal and independent verification',()=>{
  const p=createKronosLifeProposal({action:'SAFE_MODE_REVIEW',evidenceRef:'rhea:case-1',requestedAt:ts});
  assert.equal(p.requiresTrustCanal,true); assert.equal(p.requiresIndependentVerification,true); assert.equal(p.authorityGranted,false); assert.equal(p.executionStarted,false);
});