import test from 'node:test';
import assert from 'node:assert/strict';
import { createCapabilityRegistry, normalizeCapabilityRecord } from './capability_registry.mjs';

test('registry is secret-free, deterministic and separates readiness from health',()=>{
  let i=0;const now=()=>`2026-08-30T06:00:0${i++}Z`;
  const r=createCapabilityRegistry([],{now});
  const c=r.put({id:'search.tavily',name:'Tavily',provider:'tavily',category:'search',features:['web-search'],freeTier:true,credentialEnv:'TAVILY_API_KEY',asOf:'2026-08-30T06:00:00Z'});
  assert.equal(c.outcome,'CREATED');assert.equal(c.record.readiness,'UNVERIFIED');assert.equal(c.record.health,'UNKNOWN');
  const v=r.certify('search.tavily',{readiness:'READY',health:'HEALTHY'});
  assert.equal(v.record.lifecycle,'ACTIVE');assert.equal(r.search({freeOnly:true})[0].id,'search.tavily');assert.equal(r.summary().ready,1);
  assert.equal(r.authorityGranted,false);assert.equal(r.executionStarted,false);
});

test('secret-shaped metadata is refused and disable never deletes history',()=>{
  assert.throws(()=>normalizeCapabilityRecord({id:'x',category:'x',asOf:'2026-08-30',apiKey:'nope'}),/CAPABILITY_SECRET_FIELD/);
  const r=createCapabilityRegistry([{id:'x',category:'internal',provider:'othrys',asOf:'2026-08-30'}],{now:()=> '2026-08-30T06:00:00Z'});
  r.certify('x',{readiness:'READY',health:'HEALTHY'});r.disable('x','fault');
  assert.equal(r.get('x').readiness,'DISABLED');assert.deepEqual(r.history().map(x=>x.type),['CapabilityCreated','CapabilityVerified','CapabilityDisabled']);
});