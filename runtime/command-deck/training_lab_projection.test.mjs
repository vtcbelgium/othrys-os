import test from 'node:test';
import assert from 'node:assert/strict';

process.env.OTHRYS_DECK_NO_START='1';
const {trainingLabProjection}=await import('./server.mjs');

test('training lab projection composes canonical curriculum, JEV and Aegis truth',()=>{
  const out=trainingLabProjection();
  assert.equal(out.schema,'othrys.os.training-lab-projection.v1');
  assert.equal(out.epoch,'dual-brain-2026-09-26');
  assert.equal(out.curriculum.levels.length,10);
  assert.deepEqual(out.curriculum.levels.map(x=>x.level),[1,2,3,4,5,6,7,8,9,10]);
  assert.equal(out.jev.circuits.length,6);
  assert.equal(out.aegis.hands.length,11);
  assert.equal(out.domains.length,6);
  assert.equal(out.authorityGranted,false);
  assert.equal(out.controlsEnabled,false);
});

test('recursive and Aegis registrations remain explicit and locked/registered',()=>{
  const out=trainingLabProjection();
  assert.equal(out.registrations.find(x=>x.code==='1.10.1')?.state,'LOCKED');
  assert.equal(out.registrations.find(x=>x.code==='5.9.1')?.domain,'aegis');
  assert.equal(out.legacyCorpus.preserved,true);
});
