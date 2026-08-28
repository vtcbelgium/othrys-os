import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { admitDeckIntent } from './intent_bridge.ts';

function intent(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-27T19:37:22.080Z',action:'REFINE_REQUEST',candidateCommit:'24b99ab9b9420c407d9eed01d23e0cf2f52a73d8',feedback:'Make the candidate clearer.',authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending tablet refine becomes Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-bridge-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(intent(),ledger);assert.equal(r.created,true);assert.equal(r.record.actor.role,'operator');assert.equal(r.record.actor.channel,'command-deck');assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);assert.equal(readFileSync(ledger,'utf8').trim().split(/\r?\n/).length,1);}finally{rmSync(d,{recursive:true,force:true});}
});


function missionProposal(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T12:30:00.000Z',action:'MISSION_PROPOSAL',projectContext:'othrys-v2',objective:'Create a bounded mission from the selected project context.',authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending tablet mission proposal becomes Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-proposal-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(missionProposal(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-MISSION-/);assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);assert.match(r.record.promptDigest,/^[0-9a-f]{64}$/);assert.ok(r.record.commandBytes>0);}finally{rmSync(d,{recursive:true,force:true});}
});

test('mission proposal replay is idempotent and malformed evidence fails closed',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-proposal-')); const ledger=join(d,'admission.jsonl');
  try{const a=admitDeckIntent(missionProposal(),ledger),b=admitDeckIntent(missionProposal(),ledger);assert.equal(a.missionId,b.missionId);assert.equal(b.created,false);assert.throws(()=>admitDeckIntent({...missionProposal(),objective:''},ledger),/INTENT_EVIDENCE_INVALID/);assert.throws(()=>admitDeckIntent({...missionProposal(),projectContext:'x'.repeat(65)},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

function promotionRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:00:00.000Z',action:'MISSION_PROMOTION_REQUEST',proposalId:'DECK-MISSION-0123456789abcdef01234567',authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending promotion request becomes separate Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-promote-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(promotionRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-PROMOTE-/);assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);}finally{rmSync(d,{recursive:true,force:true});}
});

test('promotion request validates DECK-MISSION identity and replays idempotently',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-promote-')); const ledger=join(d,'admission.jsonl');
  try{const a=admitDeckIntent(promotionRequest(),ledger),b=admitDeckIntent(promotionRequest(),ledger);assert.equal(a.missionId,b.missionId);assert.equal(b.created,false);assert.throws(()=>admitDeckIntent({...promotionRequest(),proposalId:'V2-007X'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});
test('replay is idempotent and invalid states fail closed',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-bridge-')); const ledger=join(d,'admission.jsonl');
  try{const a=admitDeckIntent(intent(),ledger),b=admitDeckIntent(intent(),ledger);assert.equal(a.missionId,b.missionId);assert.equal(b.created,false);assert.throws(()=>admitDeckIntent({...intent(),status:'EXECUTING'},ledger),/INTENT_STATE_INVALID/);assert.throws(()=>admitDeckIntent({...intent(),action:'ACCEPT'},ledger),/INTENT_AUTHORITY_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

function allocationRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:10:00.000Z',action:'MISSION_ID_ALLOCATION_REQUEST',candidateId:'CANDIDATE-0123456789abcdef01234567',authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending V2 ID allocation request becomes separate Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-allocate-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(allocationRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-ALLOCATE-/);assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);}finally{rmSync(d,{recursive:true,force:true});}
});

test('allocation request validates CANDIDATE identity and replays idempotently',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-allocate-')); const ledger=join(d,'admission.jsonl');
  try{const a=admitDeckIntent(allocationRequest(),ledger),b=admitDeckIntent(allocationRequest(),ledger);assert.equal(a.missionId,b.missionId);assert.equal(b.created,false);assert.throws(()=>admitDeckIntent({...allocationRequest(),candidateId:'DECK-MISSION-0123456789abcdef01234567'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

function activationRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:55:00.000Z',action:'MISSION_ACTIVATION_REQUEST',missionId:'V2-008D',authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending activation request becomes separate Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-activate-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(activationRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-ACTIVATE-/);assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);}finally{rmSync(d,{recursive:true,force:true});}
});

test('activation request validates canonical primary mission identity',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-activate-')); const ledger=join(d,'admission.jsonl');
  try{assert.throws(()=>admitDeckIntent({...activationRequest(),missionId:'V2-008C.R'},ledger),/INTENT_EVIDENCE_INVALID/);assert.throws(()=>admitDeckIntent({...activationRequest(),missionId:'DECK-MISSION-0123456789abcdef01234567'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

function noChangeCloseRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T14:10:00.000Z',action:'MISSION_NO_CHANGE_CLOSE_REQUEST',missionId:'V2-008D',preflightDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending no-change close request becomes Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-nochange-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(noChangeCloseRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-NOCHANGE-/);assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);}finally{rmSync(d,{recursive:true,force:true});}
});

test('no-change close request binds exact preflight digest',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-nochange-')); const ledger=join(d,'admission.jsonl');
  try{const a=admitDeckIntent(noChangeCloseRequest(),ledger),b=admitDeckIntent({...noChangeCloseRequest(),preflightDigest:'b'.repeat(64)},ledger);assert.notEqual(a.missionId,b.missionId);assert.throws(()=>admitDeckIntent({...noChangeCloseRequest(),preflightDigest:'bad'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

function buildRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T15:20:00.000Z',action:'MISSION_BUILD_REQUEST',missionId:'V2-008G',builderId:'qwen3-builder',routeDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending build request becomes Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-build-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(buildRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-BUILD-/);assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);}finally{rmSync(d,{recursive:true,force:true});}
});

test('build request binds canonical mission builder and route digest',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-build-')); const ledger=join(d,'admission.jsonl');
  try{const a=admitDeckIntent(buildRequest(),ledger),b=admitDeckIntent({...buildRequest(),builderId:'other-builder'},ledger);assert.notEqual(a.missionId,b.missionId);assert.throws(()=>admitDeckIntent({...buildRequest(),routeDigest:'bad'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

function executionAuthRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T15:40:00.000Z',action:'MISSION_EXECUTION_AUTH_REQUEST',missionId:'V2-009A',buildRequestId:'DECK-BUILD-0123456789abcdef01234567',builderId:'qwen3-builder',packageDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending execution authorization request is admitted without worker launch',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-exec-auth-'));const ledger=join(d,'admission.jsonl');try{const r=admitDeckIntent(executionAuthRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-EXEC-/);assert.equal(r.authorityGranted,false);assert.equal(r.executionStarted,false);}finally{rmSync(d,{recursive:true,force:true});}
});

test('execution authorization request binds package evidence',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-exec-auth-'));const ledger=join(d,'admission.jsonl');try{const a=admitDeckIntent(executionAuthRequest(),ledger),b=admitDeckIntent({...executionAuthRequest(),packageDigest:'b'.repeat(64)},ledger);assert.notEqual(a.missionId,b.missionId);assert.throws(()=>admitDeckIntent({...executionAuthRequest(),buildRequestId:'bad'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

function launchRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T16:20:00.000Z',action:'MISSION_WORKER_LAUNCH_REQUEST',missionId:'V2-009A',leaseId:'LEASE-0123456789abcdef01234567',builderId:'qwen3-builder',leaseDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};}
test('pending worker launch request becomes Trust Canal admission only',()=>{const d=mkdtempSync(join(tmpdir(),'deck-launch-'));const ledger=join(d,'admission.jsonl');try{const r=admitDeckIntent(launchRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-LAUNCH-/);assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);}finally{rmSync(d,{recursive:true,force:true});}});
test('worker launch request validates exact lease evidence',()=>{const d=mkdtempSync(join(tmpdir(),'deck-launch-'));const ledger=join(d,'admission.jsonl');try{assert.throws(()=>admitDeckIntent({...launchRequest(),leaseDigest:'bad'},ledger),/INTENT_EVIDENCE_INVALID/);assert.throws(()=>admitDeckIntent({...launchRequest(),leaseId:'DECK-EXEC-0123456789abcdef01234567'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}});

function changeApplyRequest(){return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T17:45:00.000Z',action:'MISSION_CHANGE_APPLY_REQUEST',candidateId:'CHANGE-0123456789abcdef01234567',missionId:'V2-009A',patchDigest:'a'.repeat(64),targetSha:'b'.repeat(40),authorityGranted:false,status:'PENDING_TRUST_CANAL'};}

test('pending change apply request becomes Trust Canal admission only',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-apply-')); const ledger=join(d,'admission.jsonl');
  try{const r=admitDeckIntent(changeApplyRequest(),ledger);assert.equal(r.created,true);assert.match(r.missionId,/^DECK-APPLY-/);assert.equal(r.record.state,'ADMITTED');assert.equal(r.executionStarted,false);assert.equal(r.authorityGranted,false);}finally{rmSync(d,{recursive:true,force:true});}
});

test('change apply request validates candidate and target identities',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-apply-')); const ledger=join(d,'admission.jsonl');
  try{assert.throws(()=>admitDeckIntent({...changeApplyRequest(),candidateId:'bad'},ledger),/INTENT_EVIDENCE_INVALID/);assert.throws(()=>admitDeckIntent({...changeApplyRequest(),targetSha:'bad'},ledger),/INTENT_EVIDENCE_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});

test('Trust Canal admission enforces operating mode independently of ingress',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-mode-')); const ledger=join(d,'admission.jsonl');
  const previous=process.env.OTHRYS_OS_MODE;
  try{
    process.env.OTHRYS_OS_MODE='PLAN';
    assert.throws(()=>admitDeckIntent(intent(),ledger),/MODE_DENIES_MUTATE/);
    const planned=admitDeckIntent(missionProposal(),ledger);
    assert.equal(planned.created,true);
    assert.equal(planned.authorityGranted,false);
  }finally{
    if(previous===undefined) delete process.env.OTHRYS_OS_MODE; else process.env.OTHRYS_OS_MODE=previous;
    rmSync(d,{recursive:true,force:true});
  }
});
