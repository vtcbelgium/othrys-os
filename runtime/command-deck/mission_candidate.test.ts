import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { materializeMissionCandidate } from './mission_candidate.ts';

const digest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
function fixture(){
  const d=mkdtempSync(join(tmpdir(),'mission-candidate-')),inbox=join(d,'intents.jsonl'),ledger=join(d,'admission.jsonl'),out=join(d,'candidates');
  const proposal={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:00:00.000Z',action:'MISSION_PROPOSAL',projectContext:'othrys-v2',objective:'Build one bounded thing.',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  const pb={action:proposal.action,projectContext:proposal.projectContext,objective:proposal.objective,receivedAt:proposal.receivedAt};
  const proposalId=`DECK-MISSION-${digest(pb).slice(0,24)}`;
  const promotion={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:01:00.000Z',action:'MISSION_PROMOTION_REQUEST',proposalId,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  const rb={action:promotion.action,proposalId:promotion.proposalId,receivedAt:promotion.receivedAt};
  const promotionId=`DECK-PROMOTE-${digest(rb).slice(0,24)}`;
  return {d,inbox,ledger,out,proposal,promotion,proposalId,promotionId};
}
test('admitted proposal plus admitted promotion materializes one non-executing candidate',()=>{
  const f=fixture();
  try{
    writeFileSync(f.inbox,JSON.stringify(f.proposal)+'\n'+JSON.stringify(f.promotion)+'\n');
    writeFileSync(f.ledger,JSON.stringify({missionId:f.proposalId,state:'ADMITTED'})+'\n'+JSON.stringify({missionId:f.promotionId,state:'ADMITTED'})+'\n');
    const first=materializeMissionCandidate(f.inbox,f.ledger,f.out,f.proposalId);
    assert.equal(first.created,true); assert.equal(first.candidate.status,'CANDIDATE');
    assert.equal(first.candidate.canonicalMissionId,null); assert.equal(first.candidate.authorityGranted,false); assert.equal(first.candidate.executionStarted,false);
    assert.equal(first.candidate.proposalId,f.proposalId); assert.equal(first.candidate.promotionId,f.promotionId);
    assert.ok(existsSync(first.path)); assert.equal(existsSync(join(f.d,`${f.proposalId}.json`)),false);
    const replay=materializeMissionCandidate(f.inbox,f.ledger,f.out,f.proposalId); assert.equal(replay.created,false); assert.deepEqual(replay.candidate,first.candidate);
  }finally{rmSync(f.d,{recursive:true,force:true});}
});

test('missing admission evidence and malformed ids fail closed',()=>{
  const f=fixture();
  try{
    writeFileSync(f.inbox,JSON.stringify(f.proposal)+'\n'+JSON.stringify(f.promotion)+'\n');
    writeFileSync(f.ledger,JSON.stringify({missionId:f.proposalId,state:'ADMITTED'})+'\n');
    assert.throws(()=>materializeMissionCandidate(f.inbox,f.ledger,f.out,f.proposalId),/PROMOTION_NOT_ADMITTED/);
    assert.throws(()=>materializeMissionCandidate(f.inbox,f.ledger,f.out,'bad'),/PROPOSAL_ID_INVALID/);
  }finally{rmSync(f.d,{recursive:true,force:true});}
});
