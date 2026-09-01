import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectManifest} from './project_manifest.mjs';
import {loadTrainingManifest,nextTrainingJob,prepareTrainingJob} from './training_mode.mjs';
const root=process.cwd();

test('Level 3 stays active without authority after first verified application',()=>{
  const m=loadTrainingManifest(root);
  assert.equal(m.currentLevel,3);
  assert.equal(m.level2.status,'COMPLETE');
  assert.equal(m.level3.status,'ACTIVE');
  assert.equal(m.level3.jobs.length,24);
  assert.equal(m.level3.completedJobs,1);
  assert.equal(m.level3.jobs[0].id,'L3-001');
  assert.equal(m.level3.jobs[0].status,'COMPLETE');
  assert.ok(m.level3.jobs.slice(1).every(x=>x.status==='QUEUED'&&x.authorityGranted===false&&x.executionStarted===false));
  assert.equal(m.levels.find(x=>x.level===4).status,'LOCKED');
  assert.equal(m.automaticAdmission,false);
  assert.equal(m.automaticLevelAdvance,false);
  assert.equal(m.authorityGranted,false);
});

test('next Level 3 job is L3-002 and its preflight remains non-executing',()=>{
  const j=nextTrainingJob(root);
  assert.equal(j.id,'L3-002');
  const p=prepareTrainingJob(root,loadProjectManifest(root),'L3-002');
  assert.equal(p.level,3);
  assert.equal(p.job.id,'L3-002');
  assert.equal(p.authorityGranted,false);
  assert.equal(p.executionStarted,false);
});