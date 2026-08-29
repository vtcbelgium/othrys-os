import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_REQUEST_SCHEMA, selectSwitchyardRoute, validateModelRequest } from './switchyard.mjs';

const req=(overrides={})=>({schema:MODEL_REQUEST_SCHEMA,capability:'engineering.build',minimumTier:'STANDARD',privacy:'PROJECT',locality:'PREFER_LOCAL',maxCostClass:'PAID',maxLatency:'BATCH',...overrides});
const candidate=(id,overrides={})=>({id,label:id,capabilities:['engineering.build'],tier:'STANDARD',costClass:'ZERO',latencyClass:'NORMAL',locality:'LOCAL',providerHealth:'HEALTHY',certification:'CERTIFIED',measuredTrust:0.8,paidApprovalRequired:false,legal:true,...overrides});

test('cheapest capable certified candidate wins without authority',()=>{
  const r=selectSwitchyardRoute(req(),[candidate('paid',{costClass:'PAID',locality:'REMOTE',paidApprovalRequired:true}),candidate('local')]);
  assert.equal(r.outcome,'SELECTED'); assert.equal(r.selected.id,'local');
  assert.equal(r.rejections.paid,'MORE_EXPENSIVE_THAN_SELECTED'); assert.equal(r.authorityGranted,false); assert.equal(r.executionStarted,false);
});

test('provider healthy is not builder certified for engineering work',()=>{
  const r=selectSwitchyardRoute(req(),[candidate('untested',{certification:'UNTESTED'}),candidate('certified')]);
  assert.equal(r.selected.id,'certified'); assert.equal(r.rejections.untested,'ENGINEERING_UNTESTED');
});

test('unhealthy candidates are filtered before frugal ranking',()=>{
  const r=selectSwitchyardRoute(req(),[candidate('cheap-bad',{providerHealth:'DEGRADED'}),candidate('good',{costClass:'LOW'})]);
  assert.equal(r.selected.id,'good'); assert.equal(r.rejections['cheap-bad'],'PROVIDER_DEGRADED');
});
test('LOCAL_ONLY and LOCAL_REQUIRED cannot be bypassed by remote candidate',()=>{
  const remote=candidate('remote',{locality:'REMOTE'});
  let r=selectSwitchyardRoute(req({privacy:'LOCAL_ONLY'}),[remote]);
  assert.equal(r.outcome,'NO_LEGAL_CANDIDATE'); assert.equal(r.rejections.remote,'PRIVACY_LOCAL_ONLY');
  r=selectSwitchyardRoute(req({privacy:'REMOTE_ALLOWED',locality:'LOCAL_REQUIRED'}),[remote]);
  assert.equal(r.rejections.remote,'LOCALITY_REQUIRED');
});

test('cost and latency ceilings fail closed',()=>{
  let r=selectSwitchyardRoute(req({maxCostClass:'ZERO'}),[candidate('low',{costClass:'LOW'})]);
  assert.equal(r.rejections.low,'COST_ABOVE_MAXIMUM');
  r=selectSwitchyardRoute(req({maxLatency:'INTERACTIVE'}),[candidate('normal')]);
  assert.equal(r.rejections.normal,'LATENCY_ABOVE_MAXIMUM');
});

test('measured task trust only breaks a same-cost same-tier same-locality tie',()=>{
  const r=selectSwitchyardRoute(req(),[candidate('a',{measuredTrust:0.7}),candidate('b',{measuredTrust:0.9})]);
  assert.equal(r.selected.id,'b'); assert.equal(r.rejections.a,'LOWER_MEASURED_TASK_TRUST');
});

test('paid-only route is surfaced for approval but never auto-selected',()=>{
  const r=selectSwitchyardRoute(req(),[candidate('paid',{costClass:'PAID',locality:'REMOTE',paidApprovalRequired:true})]);
  assert.equal(r.outcome,'APPROVAL_REQUIRED'); assert.equal(r.selected,null); assert.equal(r.approvalCandidate.id,'paid');
  assert.equal(r.paidApprovalRequired,true); assert.equal(r.executionStarted,false);
});
test('candidate order cannot change deterministic winner',()=>{
  const a=candidate('a',{measuredTrust:0.8}),b=candidate('b',{measuredTrust:0.8});
  assert.equal(selectSwitchyardRoute(req(),[b,a]).selected.id,'a');
  assert.equal(selectSwitchyardRoute(req(),[a,b]).selected.id,'a');
});

test('strict request rejects extra fields and unknown classes',()=>{
  assert.throws(()=>validateModelRequest({...req(),surprise:true}),/INVALID_MODEL_REQUEST_FIELDS/);
  assert.throws(()=>validateModelRequest(req({minimumTier:'MAGIC'})),/INVALID_MODEL_TIER/);
});

test('non-engineering capability may use untested healthy legal candidate but never failed certification',()=>{
  const request=req({capability:'analysis.summarize',minimumTier:'LIGHT'});
  const ok=candidate('advisory',{capabilities:['analysis.summarize'],tier:'LIGHT',certification:'UNTESTED'});
  const bad=candidate('failed',{capabilities:['analysis.summarize'],tier:'LIGHT',certification:'FAILED'});
  const r=selectSwitchyardRoute(request,[bad,ok]);
  assert.equal(r.selected.id,'advisory'); assert.equal(r.rejections.failed,'CERTIFICATION_FAILED');
});

test('no capability match returns explicit no-legal-candidate evidence',()=>{
  const r=selectSwitchyardRoute(req(),[candidate('other',{capabilities:['analysis.summarize']})]);
  assert.equal(r.outcome,'NO_LEGAL_CANDIDATE'); assert.equal(r.rejections.other,'CAPABILITY_MISMATCH');
  assert.equal(r.authorityGranted,false); assert.equal(r.executionStarted,false);
});

test('unknown measured trust stays explicit and falls through to deterministic id tie-break',()=>{
  const r=selectSwitchyardRoute(req(),[candidate('b',{measuredTrust:null}),candidate('a',{measuredTrust:null})]);
  assert.equal(r.selected.id,'a'); assert.equal(r.selected.measuredTrust,null); assert.equal(r.rejections.b,'DETERMINISTIC_ID_TIE_BREAK');
});
