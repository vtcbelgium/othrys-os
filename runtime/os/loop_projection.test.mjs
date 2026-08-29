import test from 'node:test';
import assert from 'node:assert/strict';
import { runLoop } from '../talos-kernel/loop.ts';
import { projectTalosLoopRun } from './loop_projection.mjs';

const policy={maxAttempts:3,baseDelayMs:1,factor:2,maxDelayMs:10};
const deps=(work,verify)=>({work,verify,now:()=>1000,iso:()=>new Date(0).toISOString()});

test('Talos retry + success projects to verifier-grounded traces',async()=>{
  const run=await runLoop('V2-TRACE-A',policy,deps(async attempt=>({ok:true,outputRef:`out-${attempt}`}),async ref=>ref==='out-2'));
  const p=projectTalosLoopRun(run);
  assert.equal(p.authorityGranted,false); assert.equal(p.executionStarted,false);
  assert.equal(p.traces.length,2);
  assert.equal(p.traces[0].verifierStatus,'FAIL'); assert.equal(p.traces[0].terminalState,'CONTINUE_PROPOSED');
  assert.equal(p.traces[0].failureDiagnosis.failureClass,'VERIFICATION'); assert.equal(p.traces[0].continuationAuthorized,false);
  assert.equal(p.traces[1].verifierStatus,'PASS'); assert.equal(p.traces[1].terminalState,'PASS');
});

test('retryable worker failure projects as transient diagnosis',async()=>{
  const run=await runLoop('V2-TRACE-B',policy,deps(async attempt=>attempt===1?{ok:false,reason:'temporary',retryable:true}:{ok:true,outputRef:'ok'},async()=>true));
  const p=projectTalosLoopRun(run);
  assert.equal(p.traces[0].verifierStatus,'NOT_RUN');
  assert.equal(p.traces[0].failureDiagnosis.failureClass,'TRANSIENT');
  assert.equal(p.traces[1].terminalState,'PASS');
});

test('semantic worker failure stops without retry',async()=>{
  const run=await runLoop('V2-TRACE-C',policy,deps(async()=>({ok:false,reason:'bad contract',retryable:false}),async()=>true));
  const p=projectTalosLoopRun(run);
  assert.equal(p.traces.length,1); assert.equal(p.traces[0].terminalState,'FAIL');
  assert.equal(p.traces[0].failureDiagnosis.failureClass,'SEMANTIC');
  assert.equal(p.traces[0].failureDiagnosis.nextAction,'STOP');
});

test('exhausted verifier failures remain verifier FAIL and terminal',async()=>{
  const run=await runLoop('V2-TRACE-D',policy,deps(async attempt=>({ok:true,outputRef:`bad-${attempt}`}),async()=>false));
  const p=projectTalosLoopRun(run);
  assert.equal(p.traces.length,3); const last=p.traces.at(-1);
  assert.equal(last.verifierStatus,'FAIL'); assert.equal(last.terminalState,'FAIL');
  assert.equal(last.failureDiagnosis.failureClass,'VERIFICATION'); assert.equal(last.budgetRemaining.attempts,0);
});
