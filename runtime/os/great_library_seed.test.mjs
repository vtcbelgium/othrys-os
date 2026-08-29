import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const seed=JSON.parse(readFileSync(new URL('../../docs/V2-011J/GREAT_LIBRARY_SEED.json',import.meta.url),'utf8'));

test('Great Library seed is quarry-only and authority-free',()=>{
  assert.equal(seed.schema,'othrys.os.great-library-seed.v1');
  assert.equal(seed.status,'QUARRY_ONLY');
  assert.equal(seed.authorityGranted,false);
  assert.equal(seed.automaticAdmission,false);
});
test('seed starts broad before specializing',()=>{
  assert.ok(seed.blocks.length>=25);
  assert.ok(seed.blueprints.filter(x=>x.tier===1).length>=20);
  assert.ok(seed.blueprints.filter(x=>x.tier===2).length>=10);
});
test('library identities are unique and only proven Blocks claim admission',()=>{
  const ids=[...seed.blocks,...seed.blueprints].map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  const admitted=seed.blocks.filter(x=>x.status==='ADMITTED').map(x=>x.id).sort();
  assert.deepEqual(admitted,['block.analytics.visit-tracking','block.media.image-prep','block.monetization.affiliate-offer']);
});
test('every candidate carries evidence and every blueprint composes requirements',()=>{
  assert.ok(seed.blocks.every(x=>x.evidence.length>0&&x.authorityGranted===false));
  assert.ok(seed.blueprints.every(x=>x.evidence.length>0&&x.requires.length>0&&x.authorityGranted===false));
});
test('old proven Great Library patterns are preserved as a layer below Blocks',()=>{
  assert.equal(seed.patterns.length,9);
  assert.ok(seed.patterns.every(x=>x.tier===-1&&x.status==='HARVESTED_PATTERN'&&x.authorityGranted===false));
  assert.ok(seed.patterns.some(x=>x.id==='pattern.structural-rail'));
  assert.ok(seed.patterns.some(x=>x.id==='pattern.provider-behind-adapter'));
});
test('negative knowledge and recovery playbooks survive the harvest',()=>{
  assert.equal(seed.antiPatterns.length,14);
  assert.equal(seed.playbooks.length,4);
  assert.ok(seed.antiPatterns.some(x=>x.id==='antipattern.never-create-a-second-truth'));
  assert.ok(seed.antiPatterns.some(x=>x.id==='antipattern.never-fabricate-health'));
  assert.ok(seed.playbooks.some(x=>x.id==='playbook.emergency-restore'));
  assert.ok([...seed.antiPatterns,...seed.playbooks].every(x=>x.authorityGranted===false));
});
