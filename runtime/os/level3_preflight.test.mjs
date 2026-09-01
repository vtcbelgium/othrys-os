import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { level3Readiness, projectLevel3Activation } from './level3_preflight.mjs';

const root=process.cwd();
const read=(p)=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));

test('prepared Level 3 package remains immutable historical activation evidence',()=>{
  const prep=read('docs/training/LEVEL_3_PREP.json');
  assert.equal(prep.status,'PREPARED_LOCKED');
  assert.equal(prep.jobs.length,24);
  assert.ok(prep.jobs.every(x=>x.status==='PREPARED'&&x.executionStarted===false&&x.authorityGranted===false));
  assert.equal(prep.laws.operatorActivationRequired,true);
});

test('pre-activation readiness remains closed after the one explicit transition',()=>{
  const r=level3Readiness(root);
  assert.equal(r.ready,false);
  assert.equal(r.authorityGranted,false);
  assert.equal(r.executionStarted,false);
  assert.throws(()=>projectLevel3Activation(root),/LEVEL3_NOT_READY/);
});

test('completed manifest preserves exact prepared curriculum and keeps Level 4 locked',()=>{
  const prep=read('docs/training/LEVEL_3_PREP.json');
  const m=read('docs/training/TRAINING_MANIFEST.json');
  assert.equal(m.currentLevel,3);
  assert.equal(m.level3.status,'COMPLETE');
  assert.deepEqual(m.level3.jobs.map(x=>x.id),prep.jobs.map(x=>x.id));
  assert.equal(m.level3.completedJobs,24);
  assert.ok(m.level3.jobs.every(x=>x.status==='COMPLETE'&&x.executionStarted===false&&x.authorityGranted===false));
  assert.equal(m.levels.find(x=>x.level===4).status,'LOCKED');
  assert.equal(m.automaticLevelAdvance,false);
  assert.equal(m.automaticAdmission,false);
  assert.equal(m.authorityGranted,false);
});
