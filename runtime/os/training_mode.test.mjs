import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectManifest} from './project_manifest.mjs';
import {loadTrainingManifest,nextTrainingJob,prepareTrainingJob} from './training_mode.mjs';
const root=process.cwd();

test('training manifest locks levels and Level 1 contains forty completed currency jobs',()=>{
  const m=loadTrainingManifest(root);
  assert.equal(m.levels.length,10);
  assert.equal(m.currentLevel,1);
  assert.equal(m.level1.jobs.length,40);
  assert.equal(m.levels[0].status,'ACTIVE');
  assert.ok(m.levels.slice(1).every(x=>x.status==='LOCKED'));
  assert.ok(m.level1.jobs.every(x=>x.status==='COMPLETE'));
  assert.equal(m.automaticAdmission,false);
});

test('Level 1 exhausts sequence without silently advancing authority',()=>{
  assert.equal(nextTrainingJob(root),null);
  const p=prepareTrainingJob(root,loadProjectManifest(root),'L1-040');
  assert.equal(p.job.title,'Identifier validator');
  assert.ok(p.stockMatches.length>0);
  assert.deepEqual(p.requiredOrgans,['MNEMOSYNE','HEPHAESTUS','TALOS','SWITCHYARD']);
  assert.equal(p.authorityGranted,false);
  assert.equal(p.executionStarted,false);
});
