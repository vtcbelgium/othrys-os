import test from 'node:test';
import assert from 'node:assert/strict';
import { rankLibraryPrimitives } from '../../tools/penta/library-priority.mjs';

test('reuse-pressure ranking is deterministic and authority-free',()=>{
  const a=rankLibraryPrimitives(),b=rankLibraryPrimitives();
  assert.deepEqual(a,b);
  assert.equal(a.authorityGranted,false);
  assert.equal(a.automaticExtraction,false);
  assert.ok(a.ideaCount>=300);
  assert.ok(a.primitiveCount>=15);
});

test('ranking is descending and preserves admitted-vs-quarry truth',()=>{
  const r=rankLibraryPrimitives().ranking;
  for(let i=1;i<r.length;i++) assert.ok(r[i-1].demand>=r[i].demand);
  assert.ok(r.some(x=>x.stockStatus==='ADMITTED'));
  assert.ok(r.some(x=>x.stockStatus==='QUARRY'||x.stockStatus==='POTENTIAL'));
  assert.ok(r.every(x=>x.authorityGranted===false));
});

test('high demand never becomes automatic extraction authority',()=>{
  const r=rankLibraryPrimitives().ranking;
  assert.ok(r[0].demand>0);
  assert.equal(r[0].authorityGranted,false);
});
