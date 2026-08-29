import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCredentialHealth, createCredentialRemediationProposal, looksSecretShaped, projectCredentialHealth, validateCredentialMetadata, validationPolicyForRisk } from './keymaster.mjs';

const now='2026-08-29T19:20:00.000Z';
const rec=(over={})=>({credentialId:'demo-ai',serviceId:'demo',provider:'Demo',category:'ai-provider',owner:'platform',impactLevel:'standard',configured:true,enabled:true,healthStatus:'healthy',lastCheckedAt:now,expiresAt:null,rotationDueAt:null,capabilityGrants:['analysis.summarize'],dependencies:[],...over});

test('resident inventory contains no secret locator or secret-shaped fields',()=>{
  const r=validateCredentialMetadata(rec());
  assert.equal('secretReference' in r,false); assert.equal(r.authorityGranted,false); assert.equal(r.executionStarted,false);
  assert.throws(()=>validateCredentialMetadata({...rec(),secretReference:'env:DEMO_API_KEY'}),/KEYMASTER_SECRET_FIELD_FORBIDDEN/);
});

test('secret-shaped values fail closed regardless of field name',()=>{
  const key=['sk-proj-','abcdefghijklmnopqrstuvwxyz0123456789ABCD'].join('');
  assert.equal(looksSecretShaped(key),true);
  assert.throws(()=>validateCredentialMetadata({...rec(),provider:key}),/KEYMASTER_SECRET_VALUE_FORBIDDEN/);
});

test('health classifier distinguishes bounded failure causes',()=>{
  const sig=over=>classifyCredentialHealth({present:true,enabled:true,httpStatus:200,now,...over});
  assert.equal(sig({httpStatus:401}),'invalid'); assert.equal(sig({httpStatus:403}),'permission-insufficient'); assert.equal(sig({httpStatus:429}),'rate-limited'); assert.equal(sig({httpStatus:503}),'provider-degraded');
  assert.equal(sig({present:false}),'missing'); assert.equal(sig({enabled:false}),'disabled');
});
test('time-based expiry and rotation outrank HTTP health',()=>{
  assert.equal(classifyCredentialHealth({present:true,enabled:true,httpStatus:200,expiresAt:'2020-01-01T00:00:00Z',now}),'expired');
  assert.equal(classifyCredentialHealth({present:true,enabled:true,httpStatus:200,rotationDueAt:'2020-01-01T00:00:00Z',now}),'rotation-due');
});

test('risk policy is inert, read-only and never a scheduler',()=>{
  const p=validationPolicyForRisk('critical');
  assert.equal(p.cadenceHours,6); assert.equal(p.readOnly,true); assert.equal(p.billableValidationForbidden,true); assert.equal(p.schedulerOwned,false); assert.equal(p.authorityGranted,false);
});

test('sanitized projection degrades only affected credentials',()=>{
  const p=projectCredentialHealth([rec(),rec({credentialId:'db-admin',serviceId:'db',category:'database',impactLevel:'critical',healthStatus:'invalid',capabilityGrants:['database.admin']})],{generatedAt:now});
  assert.equal(p.globalStatus,'critical-failure'); assert.deepEqual(p.counts,{healthy:1,needsAttention:1,total:2}); assert.equal(p.secretsExposed,false); assert.equal(p.statuses[0].actionRequired,false); assert.equal(p.statuses[1].actionRequired,true);
});

test('remediation proposal is non-executing and Trust-Canal-gated',()=>{
  const p=createCredentialRemediationProposal(rec({healthStatus:'rotation-due'}),{requestedAt:now});
  assert.equal(p.actionClass,'ROTATE_REVIEW'); assert.equal(p.requiresTrustCanal,true); assert.equal(p.providerMutation,false); assert.equal(p.secretAccess,false); assert.equal(p.authorityGranted,false); assert.equal(p.executionStarted,false);
});

test('healthy credential cannot generate ritual remediation',()=>{
  assert.throws(()=>createCredentialRemediationProposal(rec(),{requestedAt:now}),/KEYMASTER_REMEDIATION_NOT_REQUIRED/);
});
