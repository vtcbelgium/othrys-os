import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const map=JSON.parse(readFileSync(new URL('../../docs/architecture/OTHRYS_HIERARCHY.json',import.meta.url),'utf8'));

test('OTHRYS hierarchy keeps authority species distinct',()=>{
  assert.equal(map.schema,'othrys.os.architecture-hierarchy.v1');
  assert.equal(map.controlPlane,'OTHRYS_OS');
  assert.equal(new Set(map.authorityTree).size,map.authorityTree.length);
  assert.equal(map.invariants.othrysOsIsOros,false);
  assert.equal(map.invariants.blockEqualsStar,false);
  assert.equal(map.invariants.titanBelongsToOros,false);
});

test('Oros/Blueprint/Constellation laws remain explicit',()=>{
  assert.equal(map.invariants.exactlyOneBlueprintPerOros,true);
  assert.equal(map.invariants.orosOwnsRuntimeTruth,true);
  assert.equal(map.invariants.microConstellationPerOros,1);
  assert.equal(map.invariants.starsPerMicroConstellation,'0..N');
  assert.equal(map.invariants.blueprintOwnsExactResolvedVersion,false);
  assert.equal(map.invariants.lockIsAuthority,false);
});

test('normal Block composition requires earned reuse maturity',()=>{
  assert.equal(map.invariants.normalBlockReuseMinimumMaturity,'REUSABLE');
  assert.ok(map.compositionAxis.includes('CAPABILITY_BLOCK'));
  assert.ok(!map.authorityTree.includes('CAPABILITY_BLOCK'));
});