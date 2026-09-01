import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const json=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));

test('Level 3 seal binds completion to Talos intelligence and keeps Level 4 locked',()=>{
  const m=json('docs/training/TRAINING_MANIFEST.json');
  const r=json('docs/training/milestones/LEVEL3_SOLID_APPLICATIONS_2026-09-01.json');
  const i=json('docs/training/TALOS_LEVEL3_INTELLIGENCE_LIVE.json');
  assert.equal(m.level3.status,'COMPLETE');
  assert.equal(m.level3.completedJobs,24);
  assert.equal(r.status,'SEALED_PENDING_LEVEL3_5_TRANSITION');
  assert.equal(r.talosIntelligence.finalPassRate,1);
  assert.equal(r.talosIntelligence.adaptationDigest,i.adaptations.adaptationDigest);
  assert.equal(m.levels.find(x=>x.level===4).status,'LOCKED');
  assert.equal(r.authorityGranted,false);
});
