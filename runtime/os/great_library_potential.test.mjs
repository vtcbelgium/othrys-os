import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const potential=JSON.parse(readFileSync(new URL('../../docs/V2-011J/GREAT_LIBRARY_POTENTIAL.json',import.meta.url),'utf8'));
const seed=JSON.parse(readFileSync(new URL('../../docs/V2-011J/GREAT_LIBRARY_SEED.json',import.meta.url),'utf8'));

test('potential quarry is broad, bounded and non-authoritative',()=>{
  assert.equal(potential.schema,'othrys.os.great-library-potential.v1');
  assert.ok(potential.ideaCount>=200);
  assert.ok(potential.domains.length>=15);
  assert.equal(potential.authorityGranted,false);
  assert.equal(potential.automaticAdmission,false);
  assert.equal(potential.automaticBuild,false);
});

test('potential identities are unique and inert',()=>{
  const ids=potential.ideas.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(potential.ideas.every(x=>x.status==='POTENTIAL_ONLY'&&x.authorityGranted===false&&x.automaticBuild===false));
});

test('every idea specializes a known generic blueprint',()=>{
  const known=new Set(seed.blueprints.map(x=>x.id));
  assert.ok(potential.ideas.every(x=>known.has(x.parentBlueprint)));
});
