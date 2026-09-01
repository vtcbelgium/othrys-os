import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTrainingManifest,nextTrainingJob,prepareTrainingJob} from './training_mode.mjs';
const root=process.cwd();

test('Level 3 campaign completes without authority or Level 4 advance',()=>{
  const m=loadTrainingManifest(root);
  assert.equal(m.currentLevel,3);
  assert.equal(m.level2.status,'COMPLETE');
  assert.equal(m.level3.status,'COMPLETE');
  assert.equal(m.level3.jobs.length,24);
  assert.equal(m.level3.completedJobs,24);
  assert.ok(m.level3.jobs.every(x=>x.status==='COMPLETE'&&x.authorityGranted===false&&x.executionStarted===false));
  assert.equal(m.levels.find(x=>x.level===3).status,'COMPLETE');
  assert.equal(m.levels.find(x=>x.level===4).status,'LOCKED');
  assert.equal(m.level3_5Consolidation.status,'PLANNED_LOCKED');
  assert.equal(m.automaticAdmission,false);
  assert.equal(m.automaticLevelAdvance,false);
  assert.equal(m.authorityGranted,false);
});

test('completed Level 3 exposes no next job and cannot start more Level 3 work',()=>{
  assert.equal(nextTrainingJob(root),null);
  assert.throws(()=>prepareTrainingJob(root,{},'L3-024'),/TRAINING_LEVEL_NOT_ACTIVE/);
});
