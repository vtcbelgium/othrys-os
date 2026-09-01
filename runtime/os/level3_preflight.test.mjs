import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { level3Readiness, projectLevel3Activation } from './level3_preflight.mjs';

const root=process.cwd();

test('Level 3 is fully prepared while remaining locked',()=>{
  const r=level3Readiness(root);
  assert.equal(r.ready,true);
  assert.equal(r.level3Unlocked,false);
  assert.equal(r.executionStarted,false);
  assert.equal(r.authorityGranted,false);
  assert.ok(Object.values(r.checks).every(Boolean));
});

test('activation projection is pure and queues the exact prepared curriculum',()=>{
  const before=readFileSync('docs/training/TRAINING_MANIFEST.json','utf8');
  const p=projectLevel3Activation(root);
  assert.equal(p.writesPerformed,false);
  assert.equal(p.manifest.currentLevel,3);
  assert.equal(p.manifest.level3.status,'ACTIVE');
  assert.equal(p.manifest.level3.jobs.length,24);
  assert.ok(p.manifest.level3.jobs.every(x=>x.status==='QUEUED'&&x.authorityGranted===false&&x.executionStarted===false));
  assert.equal(p.manifest.levels.find(x=>x.level===4).status,'LOCKED');
  assert.equal(p.manifest.automaticLevelAdvance,false);
  assert.equal(p.manifest.automaticAdmission,false);
  assert.equal(p.manifest.authorityGranted,false);
  assert.equal(readFileSync('docs/training/TRAINING_MANIFEST.json','utf8'),before);
});

test('prepared curriculum is ordered, stock-first and below Level 4 boundary',()=>{
  const prep=JSON.parse(readFileSync('docs/training/LEVEL_3_PREP.json','utf8'));
  assert.deepEqual(prep.jobs.map(x=>x.id),Array.from({length:24},(_,i)=>`L3-${String(i+1).padStart(3,'0')}`));
  assert.deepEqual(prep.jobs.map(x=>x.sequence),Array.from({length:24},(_,i)=>i+1));
  assert.ok(prep.jobs.every(x=>Array.isArray(x.sourceStock)&&x.sourceStock.length>0));
  assert.ok(prep.jobs.every(x=>Array.isArray(x.qualityGates)&&x.qualityGates.includes('Talos visible/behavior proof')));
  assert.equal(prep.laws.externalServicesAllowed,false);
  assert.equal(prep.laws.productionMutationAllowed,false);
  assert.equal(prep.laws.paidUsageAllowed,false);
  assert.equal(prep.laws.level4UnlockAllowed,false);
});

test('extension band requires MV3 minimum-permission proof',()=>{
  const prep=JSON.parse(readFileSync('docs/training/LEVEL_3_PREP.json','utf8'));
  const ext=prep.jobs.filter(x=>x.family==='extension');
  assert.equal(ext.length,3);
  for(const job of ext){
    assert.ok(job.qualityGates.includes('MV3 manifest'));
    assert.ok(job.qualityGates.includes('minimum permissions'));
    assert.ok(job.qualityGates.includes('no remote code'));
  }
});
