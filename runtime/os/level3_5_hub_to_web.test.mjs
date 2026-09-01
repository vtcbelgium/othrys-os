import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const json=(p)=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));

test('Level 3.5 HubToWeb stays locked after Level 3 campaign completion until the seal/transition',()=>{
  const m=json('docs/training/TRAINING_MANIFEST.json');
  const p=json('docs/training/LEVEL_3_5_HUB_TO_WEB_PLAN.json');
  assert.equal(m.currentLevel,3);
  assert.equal(m.levels.find(x=>x.level===3).status,'COMPLETE');
  assert.equal(m.level3.completedJobs,24);
  assert.equal(m.levels.find(x=>x.level===4).status,'LOCKED');
  assert.equal(m.level3_5Consolidation.status,'PLANNED_LOCKED');
  assert.equal(m.level3_5Consolidation.requiredBeforeLevel4,true);
  assert.equal(p.status,'PLANNED_LOCKED');
  assert.equal(p.executionStarted,false);
  assert.equal(p.authorityGranted,false);
});

test('HubToWeb preserves OS authority and requires parity before extinction',()=>{
  const p=json('docs/training/LEVEL_3_5_HUB_TO_WEB_PLAN.json');
  assert.equal(p.laws.othrysOsIsMachine,true);
  assert.equal(p.laws.othrysWebIsHumanInterface,true);
  assert.equal(p.laws.noDuplicateAuthority,true);
  assert.equal(p.laws.noDuplicateState,true);
  assert.equal(p.laws.commandDeckSurvivesUntilParity,true);
  assert.equal(p.laws.deleteOnlyAfterIndependentProof,true);
  assert.equal(p.laws.level4UnlockAllowed,false);
});

test('HubToWeb cannot seal as a dumb migration',()=>{
  const p=json('docs/training/LEVEL_3_5_HUB_TO_WEB_PLAN.json');
  assert.equal(p.laws.talosIsCentralVerificationLearningNexus,true);
  assert.equal(p.laws.loggingWithoutAdaptationIsInsufficient,true);
  assert.equal(p.laws.verifiedLearningFeedsEveryOrgan,true);
  assert.ok(p.entryGate.some(x=>/Talos Level 3 intelligence synthesis/i.test(x)));
  assert.ok(p.exitGate.some(x=>/downstream route\/quality decision changes/i.test(x)));
  assert.ok(p.phases.some(x=>x.id==='3.5-H'&&/Intelligence/i.test(x.name)));
});
