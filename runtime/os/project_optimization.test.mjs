import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizationPolicyFor, PROJECT_OPTIMIZATION_PROFILES, validateOptimizationPolicy } from './project_optimization.mjs';

test('project optimization profiles are finite bounded and authority-free',()=>{
  assert.deepEqual(PROJECT_OPTIMIZATION_PROFILES,['MINIMAL','INTERACTIVE','BALANCED','BATCH','VERIFICATION_HEAVY','GPU_HEAVY']);
  for(const id of PROJECT_OPTIMIZATION_PROFILES){
    const p=optimizationPolicyFor(id);
    assert.ok(p.maxChannels>=1&&p.maxChannels<=8);
    assert.ok(p.maxHephaestusHands>=1&&p.maxHephaestusHands<=3);
    assert.ok(p.verificationFanout>=1&&p.verificationFanout<=2);
    assert.equal(p.sharedMutation,false); assert.equal(p.claimsMerge,false); assert.equal(p.declarativeGrant,false);
    assert.equal(validateOptimizationPolicy({...p}).profile,id);
  }
});

test('profiles express different project phenotypes without hardware identity',()=>{
  const interactive=optimizationPolicyFor('INTERACTIVE'),batch=optimizationPolicyFor('BATCH'),verify=optimizationPolicyFor('VERIFICATION_HEAVY');
  assert.ok(interactive.maxChannels<batch.maxChannels);
  assert.equal(batch.placementHint,'PACK');
  assert.equal(verify.placementHint,'SPREAD');
  for(const p of [interactive,batch,verify]) assert.doesNotMatch(JSON.stringify(p),/legion|t590/i);
});
test('optimization policy drift and invented profiles fail closed',()=>{
  assert.throws(()=>optimizationPolicyFor('YOLO'),/INVALID_OPTIMIZATION_PROFILE/);
  const tampered={...optimizationPolicyFor('BALANCED'),maxChannels:8};
  assert.throws(()=>validateOptimizationPolicy(tampered),/OPTIMIZATION_POLICY_DRIFT:maxChannels/);
  const authority={...optimizationPolicyFor('BALANCED'),declarativeGrant:true};
  assert.throws(()=>validateOptimizationPolicy(authority),/OPTIMIZATION_POLICY_DRIFT:declarativeGrant/);
});
