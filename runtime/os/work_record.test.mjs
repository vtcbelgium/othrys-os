import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { appendWorkTransition, compileWorkRecord, materializeWorkRecord, readWorkRecord, verifyWorkRecord } from './work_record.mjs';

const sourceRoot=resolve(import.meta.dirname,'../..');
function fixture(){
  const root=mkdtempSync(join(tmpdir(),'othrys-work-'));
  mkdirSync(join(root,'.othrys'),{recursive:true}); mkdirSync(join(root,'missions'),{recursive:true});
  writeFileSync(join(root,'.othrys','project.json'),readFileSync(join(sourceRoot,'.othrys','project.json')));
  writeFileSync(join(root,'missions','V2-010B.json'),readFileSync(join(sourceRoot,'missions','V2-010B.json')));
  return root;
}

test('Work record preserves stable slice stage task identities',()=>{
  const r=compileWorkRecord(sourceRoot,'V2-010B');
  assert.equal(r.schema,'othrys.os.work.v1');
  assert.equal(r.workId,'WORK-V2-010B');
  assert.deepEqual(r.slices.map(x=>x.id),['work-core','transition-ledger']);
  assert.equal(r.slices[0].stages[0].id,'build');
  assert.equal(r.slices[0].stages[0].tasks[0].id,'compile-record');
  assert.equal(r.authorityGranted,false); assert.equal(r.executionStarted,false);
  verifyWorkRecord(r);
});
test('materialization is idempotent and tamper fails closed',()=>{
  const root=fixture();
  try{
    const first=materializeWorkRecord(root,'V2-010B'); assert.equal(first.status,'MATERIALIZED');
    const second=materializeWorkRecord(root,'V2-010B'); assert.equal(second.status,'EXISTS');
    const path=first.path,record=readWorkRecord(root,'V2-010B'); assert.equal(record.definitionDigest,first.record.definitionDigest);
    const tampered={...record,title:'tampered'}; writeFileSync(path,JSON.stringify(tampered,null,2)+'\n');
    assert.throws(()=>readWorkRecord(root,'V2-010B'),/WORK_DIGEST_MISMATCH/);
    assert.throws(()=>materializeWorkRecord(root,'V2-010B'),/WORK_RECORD_CONFLICT/);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('transition history observes canonical evidence and rejects regression',()=>{
  const root=fixture();
  try{
    materializeWorkRecord(root,'V2-010B');
    const running={active_mission:{mission_id:'V2-010B',status:'RUNNING'}};
    const first=appendWorkTransition(root,running,'V2-010B'); assert.equal(first.status,'APPENDED'); assert.equal(first.transition.phase,'BUILD');
    assert.equal(appendWorkTransition(root,running,'V2-010B').status,'EXISTS');
    writeFileSync(join(root,'missions','V2-010B.result.json'),JSON.stringify({mission_id:'V2-010B',verdict:'PASS'})+'\n');
    const complete={active_mission:{mission_id:'V2-010B',status:'COMPLETE'}};
    const final=appendWorkTransition(root,complete,'V2-010B'); assert.equal(final.transition.phase,'SHIP');
    assert.equal(final.transition.authorityGranted,false); assert.equal(final.transition.executionStarted,false);
    unlinkSync(join(root,'missions','V2-010B.result.json'));
    assert.throws(()=>appendWorkTransition(root,running,'V2-010B'),/WORK_PHASE_REGRESSION/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
