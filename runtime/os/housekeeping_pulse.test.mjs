import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendHousekeepingPulse, inspectHousekeepingPulse } from './housekeeping_pulse.mjs';

const root=fileURLToPath(new URL('../..',import.meta.url));

test('housekeeping pulse is read-only evidence and never authority',()=>{
  const pulse=inspectHousekeepingPulse(root,{now:()=> '2026-08-29T00:00:00.000Z'});
  assert.equal(pulse.schema,'othrys.os.housekeeping-pulse.v1');
  assert.equal(pulse.projectId,'othrys-v2');
  assert.equal(pulse.authorityGranted,false);
  assert.equal(pulse.executionStarted,false);
  assert.equal(pulse.mutationsPerformed,0);
  assert.equal(typeof pulse.quality.ok,'boolean');
});
test('pulse journal is append-only JSONL',()=>{
  const temp=mkdtempSync(join(tmpdir(),'othrys-housekeeping-'));
  try{
    const a={schema:'othrys.os.housekeeping-pulse.v1',at:'a',authorityGranted:false};
    const b={schema:'othrys.os.housekeeping-pulse.v1',at:'b',authorityGranted:false};
    const path=appendHousekeepingPulse(temp,a);
    appendHousekeepingPulse(temp,b);
    const rows=readFileSync(path,'utf8').trim().split(/\r?\n/).map(JSON.parse);
    assert.deepEqual(rows,[a,b]);
  }finally{rmSync(temp,{recursive:true,force:true});}
});