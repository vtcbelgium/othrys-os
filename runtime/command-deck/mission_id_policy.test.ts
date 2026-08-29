import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { nextPrimaryMissionId, MissionIdPolicyError } from './mission_id_policy.ts';

function withDir(names:string[],fn:(d:string)=>void){
  const d=mkdtempSync(join(tmpdir(),'mission-id-policy-'));
  try{for(const n of names)writeFileSync(join(d,n),'{}\n');fn(d);}finally{rmSync(d,{recursive:true,force:true});}
}

test('current canonical sequence advances 008C to 008D',()=>{
  withDir(['V2-007Z.json','V2-008A.json','V2-008B.json','V2-008C.json'],d=>assert.equal(nextPrimaryMissionId(d),'V2-008D'));
});

test('Z rolls numeric series forward to A',()=>{
  withDir(['V2-007Y.json','V2-007Z.json'],d=>assert.equal(nextPrimaryMissionId(d),'V2-008A'));
});

test('revision IDs do not consume primary sequence positions',()=>{
  withDir(['V2-001A.json','V2-001A.R.json','V2-001A.1.json','V2-001B.json'],d=>assert.equal(nextPrimaryMissionId(d),'V2-001C'));
});
test('historical gaps are not backfilled',()=>{
  withDir(['V2-001A.json','V2-001C.json'],d=>assert.equal(nextPrimaryMissionId(d),'V2-001D'));
});

test('proven legacy mission sidecars do not consume or block the primary sequence',()=>{
  withDir(['V2-008Y.json','V2-008Z.json','V2-008Z.patch.json','V2-008Z.acceptance.json','V2-008Z.apply-verification.json'],d=>assert.equal(nextPrimaryMissionId(d),'V2-009A'));
});

test('ambiguous primary-looking filenames fail closed',()=>{
  withDir(['V2-008A.json','V2-008B.foo.json'],d=>assert.throws(()=>nextPrimaryMissionId(d),(e:any)=>e instanceof MissionIdPolicyError&&e.code==='MISSION_ID_FILENAME_AMBIGUOUS'));
});

test('empty and exhausted sequences fail closed',()=>{
  withDir([],d=>assert.throws(()=>nextPrimaryMissionId(d),/MISSION_ID_SEQUENCE_EMPTY/));
  withDir(['V2-999Z.json'],d=>assert.throws(()=>nextPrimaryMissionId(d),/MISSION_ID_SEQUENCE_EXHAUSTED/));
});
