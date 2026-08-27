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

test('replay is idempotent and invalid states fail closed',()=>{
  const d=mkdtempSync(join(tmpdir(),'deck-bridge-')); const ledger=join(d,'admission.jsonl');
  try{const a=admitDeckIntent(intent(),ledger),b=admitDeckIntent(intent(),ledger);assert.equal(a.missionId,b.missionId);assert.equal(b.created,false);assert.throws(()=>admitDeckIntent({...intent(),status:'EXECUTING'},ledger),/INTENT_STATE_INVALID/);assert.throws(()=>admitDeckIntent({...intent(),action:'ACCEPT'},ledger),/INTENT_AUTHORITY_INVALID/);}finally{rmSync(d,{recursive:true,force:true});}
});
