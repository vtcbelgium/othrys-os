import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyEngineeringOutcome,classifyRepairCampaign,preflightEngineeringAttempt,ENGINEERING_FAILURE_CLASS as F} from './failure_guard.mjs';

test('preflight rejects path escape before builder invocation',()=>{
  const r=preflightEngineeringAttempt({allowedPaths:['src/a.js'],requestedPaths:['../hub/a.js']});
  assert.equal(r.ok,false); assert.equal(r.failureClass,F.PATH_VIOLATION);
});

test('preflight rejects unavailable required dependency',()=>{
  const r=preflightEngineeringAttempt({allowedPaths:['src'],requestedPaths:['src/a.js'],dependencies:[{id:'ghost-lib',required:true,available:false}]});
  assert.equal(r.ok,false); assert.equal(r.failureClass,F.DEPENDENCY_UNAVAILABLE);
});

test('timeout without mutation or artifact is explicit',()=>{
  const r=classifyEngineeringOutcome({timedOut:true,changedFiles:[],artifactCount:0});
  assert.equal(r.failureClass,F.TIMEOUT_NO_ARTIFACT);
});

test('zero mutation cannot be accepted as success',()=>{
  const r=classifyEngineeringOutcome({claimedOk:true,changedFiles:[],artifactCount:0,contractPassed:true});
  assert.equal(r.ok,false); assert.equal(r.failureClass,F.NO_ATTEMPT_MUTATION);
});
test('builder ok claim is false success until contract passes',()=>{
  const r=classifyEngineeringOutcome({claimedOk:true,changedFiles:['src/a.js'],artifactCount:1,contractPassed:false});
  assert.equal(r.ok,false); assert.equal(r.failureClass,F.FALSE_SUCCESS);
});

test('mutation plus independent contract proof is accepted',()=>{
  const r=classifyEngineeringOutcome({claimedOk:true,changedFiles:['src/a.js'],artifactCount:1,contractPassed:true});
  assert.equal(r.ok,true); assert.equal(r.failureClass,F.OK);
});

test('repair campaign stops calling failure success and marks exhaustion',()=>{
  const r=classifyRepairCampaign([
    {timedOut:true,changedFiles:[],artifactCount:0},
    {claimedOk:true,changedFiles:['src/a.js'],artifactCount:1,contractPassed:false},
    {changedFiles:['src/a.js'],artifactCount:1,contractPassed:false},
  ],{maxAttempts:3});
  assert.equal(r.ok,false); assert.equal(r.failureClass,F.REPAIR_EXHAUSTED); assert.equal(r.authorityGranted,false);
});

test('repair campaign preserves proven recovery',()=>{
  const r=classifyRepairCampaign([
    {changedFiles:[],artifactCount:0},
    {changedFiles:['src/a.js'],artifactCount:1,contractPassed:true},
  ]);
  assert.equal(r.ok,true); assert.equal(r.failureClass,F.OK);
});
