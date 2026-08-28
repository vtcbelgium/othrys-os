import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { resolveOperatingMode, authorizeOperatingModeAction, operatingModeProjection } from './operating_mode.mjs';

const root=resolve(import.meta.dirname,'../..');
const manifest=JSON.parse(readFileSync(join(root,'.othrys','project.json'),'utf8'));

test('PLAN permits planning intents and denies execution/mutation',()=>{
  const mode=resolveOperatingMode(manifest,'PLAN');
  assert.equal(authorizeOperatingModeAction(mode,'MISSION_PROPOSAL').allowed,true);
  assert.throws(()=>authorizeOperatingModeAction(mode,'MISSION_BUILD_REQUEST'),/MODE_DENIES_EXECUTE/);
  assert.throws(()=>authorizeOperatingModeAction(mode,'MISSION_CHANGE_APPLY_REQUEST'),/MODE_DENIES_MUTATE/);
  assert.equal(mode.authorityGranted,false);
});

test('OBSERVE denies every intent write',()=>{
  const mode=resolveOperatingMode(manifest,'OBSERVE');
  assert.throws(()=>authorizeOperatingModeAction(mode,'MISSION_PROPOSAL'),/MODE_DENIES_PLAN/);
  assert.throws(()=>authorizeOperatingModeAction(mode,'REFINE_REQUEST'),/MODE_DENIES_MUTATE/);
});
test('SUPERVISED_EXECUTE permits governed actions but grants no authority',()=>{
  const mode=resolveOperatingMode(manifest,'SUPERVISED_EXECUTE');
  for(const action of ['MISSION_PROPOSAL','MISSION_BUILD_REQUEST','MISSION_WORKER_LAUNCH_REQUEST','MISSION_CHANGE_APPLY_REQUEST']){
    const decision=authorizeOperatingModeAction(mode,action);
    assert.equal(decision.allowed,true);
    assert.equal(decision.authorityGranted,false);
    assert.equal(decision.executionStarted,false);
  }
  assert.equal(mode.policy.operatorGate,'EVERY_CONSEQUENTIAL_STEP');
});

test('AUTONOMOUS_EXECUTE changes intervention policy, never authority',()=>{
  const view=operatingModeProjection(manifest,'AUTONOMOUS_EXECUTE');
  assert.equal(view.active.policy.operatorGate,'TRUST_CANAL_POLICY');
  assert.equal(view.active.authorityGranted,false);
  assert.equal(view.authorityGranted,false);
  assert.deepEqual(view.available.map(x=>x.id),['OBSERVE','PLAN','SUPERVISED_EXECUTE','AUTONOMOUS_EXECUTE']);
});

test('manifest policy fails closed when Trust Canal enforcement is weakened',()=>{
  assert.throws(()=>resolveOperatingMode({...manifest,operatingModes:{...manifest.operatingModes,enforcedBy:'ui'}},'PLAN'),/MODE_POLICY_INVALID/);
  assert.throws(()=>resolveOperatingMode({...manifest,operatingModes:{...manifest.operatingModes,declarativeGrant:true}},'PLAN'),/MODE_POLICY_INVALID/);
  assert.throws(()=>resolveOperatingMode(manifest,'GOD_MODE'),/MODE_NOT_ALLOWED/);
});
