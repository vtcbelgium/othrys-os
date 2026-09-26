import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createTrainingLabRun, loadTrainingLabRegistry, recordTrainingLabRun } from './training_lab.mjs';

const sourceRoot=new URL('../..',import.meta.url).pathname;
function fixture(){
  const root=mkdtempSync(join(tmpdir(),'othrys-training-lab-'));
  const target=join(root,'docs','training','lab','TRAINING_LAB_REGISTRY.json');
  mkdirSync(dirname(target),{recursive:true});
  writeFileSync(target,readFileSync(join(sourceRoot,'docs','training','lab','TRAINING_LAB_REGISTRY.json'),'utf8'));
  return root;
}

test('registry uses unique dotted registrations and preserves a fresh epoch',()=>{
  const registry=loadTrainingLabRegistry(sourceRoot);
  assert.equal(registry.epoch,'dual-brain-2026-09-26');
  assert.equal(new Set(registry.registrations.map(x=>x.code)).size,registry.registrations.length);
  assert.ok(registry.registrations.some(x=>x.code==='1.10.1'&&x.state==='LOCKED'));
  assert.ok(registry.registrations.some(x=>x.code==='5.9.1'));
});

test('run receipt separates usage categories and never grants authority',()=>{
  const root=fixture();
  const run=createTrainingLabRun(root,{code:'3.1.1',status:'PASS',subject:{kind:'dual-brain',id:'routing',model:'jev-1.13.0'},usage:{inputTokens:100,outputTokens:12,judgeTokens:8,attackerTokens:3},metrics:{agreement:true},lesson:'agreement baseline'});
  assert.equal(run.usage.inputTokens,100);
  assert.equal(run.usage.judgeTokens,8);
  assert.equal(run.usage.attackerTokens,3);
  assert.equal(run.authorityGranted,false);
  assert.equal(run.automaticPromotion,false);
  assert.equal(run.productionActionApplied,false);
  assert.match(run.runDigest,/^[a-f0-9]{64}$/);
});

test('recorded run separates durable evidence from the operational event ledger',()=>{
  const root=fixture();
  const out=recordTrainingLabRun(root,{code:'6.1.1',status:'INFO',lesson:'replay registered'});
  assert.equal(out.path,join(root,'.othrys','evidence','training',out.run.startedAt.slice(0,10)+'.jsonl'));
  assert.equal(out.operationalEventPath,join(root,'.othrys','logs','training','training-lab.jsonl'));
  assert.equal(out.operationalEvent.schema,'othrys.os.event.v1');
  assert.equal(out.operationalEvent.job,'training:6.1.1');
  assert.equal(out.operationalEvent.authorityGranted,false);
});
