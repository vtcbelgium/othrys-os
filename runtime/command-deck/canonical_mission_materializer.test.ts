import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { materializeCanonicalMission } from './canonical_mission_materializer.ts';

function digest(v:unknown){return createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');}
function fixture(){
  const d=mkdtempSync(join(tmpdir(),'canonical-mission-')),missions=join(d,'missions');mkdirSync(join(missions,'candidates'),{recursive:true});
  for(const id of ['V2-008A','V2-008B','V2-008C'])writeFileSync(join(missions,`${id}.json`),'{}\n');
  writeFileSync(join(missions,'V2-008C.R.json'),'{}\n');
  const candidateId='CANDIDATE-0123456789abcdef01234567',candidatePath=join(missions,'candidates',`${candidateId}.json`);
  const candidate={schema:'othrys.os.mission-candidate.v1',candidateId,proposalId:'DECK-MISSION-0123456789abcdef01234567',promotionId:'DECK-PROMOTE-0123456789abcdef01234567',projectContext:'othrys-v2',objective:'Prove a safe tablet-generated canonical mission.',canonicalMissionId:null,authorityGranted:false,executionStarted:false,status:'CANDIDATE'};
  writeFileSync(candidatePath,JSON.stringify(candidate,null,2)+'\n');
  return {d,missions,candidatePath,candidateId};
}
test('admitted allocation materializes V2-008D with zero authority',()=>{
  const f=fixture(); const inbox=join(f.d,'intents.jsonl'),ledger=join(f.d,'ledger.jsonl');
  try{
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:29:45.152Z',action:'MISSION_ID_ALLOCATION_REQUEST',candidateId:f.candidateId,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    const body={action:intent.action,candidateId:intent.candidateId,receivedAt:intent.receivedAt},allocationId=`DECK-ALLOCATE-${digest(body).slice(0,24)}`;
    writeFileSync(inbox,JSON.stringify(intent)+'\n');writeFileSync(ledger,JSON.stringify({missionId:allocationId,state:'ADMITTED'})+'\n');
    const out=materializeCanonicalMission(f.candidatePath,inbox,ledger,f.missions);
    assert.equal(out.mission.mission_id,'V2-008D');assert.equal(out.mission.status,'CANONICAL_UNACTIVATED');assert.equal(out.mission.authorityGranted,false);assert.equal(out.mission.executionStarted,false);
    assert.deepEqual(out.mission.allowed_write_paths,[]);assert.deepEqual(out.mission.allowed_tools,[]);assert.equal(out.binding.status,'ALLOCATED_UNACTIVATED');
  }finally{rmSync(f.d,{recursive:true,force:true});}
});
test('missing allocation admission fails closed and writes nothing',()=>{
  const f=fixture(); const inbox=join(f.d,'intents.jsonl'),ledger=join(f.d,'ledger.jsonl');
  try{
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:29:45.152Z',action:'MISSION_ID_ALLOCATION_REQUEST',candidateId:f.candidateId,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox,JSON.stringify(intent)+'\n');writeFileSync(ledger,'');
    assert.throws(()=>materializeCanonicalMission(f.candidatePath,inbox,ledger,f.missions),/ALLOCATION_NOT_ADMITTED/);
    assert.throws(()=>readFileSync(join(f.missions,'V2-008D.json'),'utf8'));
  }finally{rmSync(f.d,{recursive:true,force:true});}
});
test('materialization replay is idempotent',()=>{
  const f=fixture(); const inbox=join(f.d,'intents.jsonl'),ledger=join(f.d,'ledger.jsonl');
  try{
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:29:45.152Z',action:'MISSION_ID_ALLOCATION_REQUEST',candidateId:f.candidateId,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    const body={action:intent.action,candidateId:intent.candidateId,receivedAt:intent.receivedAt},allocationId=`DECK-ALLOCATE-${digest(body).slice(0,24)}`;
    writeFileSync(inbox,JSON.stringify(intent)+'\n');writeFileSync(ledger,JSON.stringify({missionId:allocationId,state:'ADMITTED'})+'\n');
    const first=materializeCanonicalMission(f.candidatePath,inbox,ledger,f.missions),second=materializeCanonicalMission(f.candidatePath,inbox,ledger,f.missions);
    assert.equal(first.created,true);assert.equal(second.created,false);assert.equal(second.mission.mission_id,'V2-008D');
  }finally{rmSync(f.d,{recursive:true,force:true});}
});
