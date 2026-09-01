import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectManifest} from './project_manifest.mjs';
import {loadTrainingManifest,nextTrainingJob,prepareTrainingJob} from './training_mode.mjs';
const root=process.cwd();

test('explicit operator transition activates Level 3 without authority',()=>{
  const m=loadTrainingManifest(root);
  assert.equal(m.currentLevel,3);
  assert.equal(m.level2.status,'COMPLETE');
  assert.equal(m.level3.status,'ACTIVE');
  assert.equal(m.level3.jobs.length,24);
  assert.ok(m.level3.jobs.every(x=>x.status==='QUEUED'&&x.authorityGranted===false&&x.executionStarted===false));
  assert.equal(m.levels.find(x=>x.level===3).status,'ACTIVE');
  assert.equal(m.levels.find(x=>x.level===4).status,'LOCKED');
  assert.equal(m.automaticAdmission,false);
  assert.equal(m.automaticLevelAdvance,false);
  assert.equal(m.authorityGranted,false);
});

test('Level 3 exposes only the first queued job and preflight remains non-executing',()=>{
  const j=nextTrainingJob(root);
  assert.equal(j.id,'L3-001');
  const p=prepareTrainingJob(root,loadProjectManifest(root),'L3-001');
  assert.equal(p.level,3);
  assert.equal(p.job.id,'L3-001');
  assert.equal(p.authorityGranted,false);
  assert.equal(p.executionStarted,false);
});