import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseLoopFailure, makeLoopTrace, analyzeLoopTraces } from './loop_trace.mjs';

const D='a'.repeat(64), E='e'.repeat(64), G='b'.repeat(64), A='c'.repeat(64);
function trace(overrides={}){
  return makeLoopTrace({loopId:'talos.retry-replay',componentId:'talos',attempt:1,triggerRef:'mission:V2-X',stateBeforeDigest:D,stateAfterDigest:E,goalDigest:G,actionKind:'VERIFY',actionDigest:A,semanticProgress:true,verifierStatus:'PASS',terminalState:'PASS',budgetRemaining:{attempts:2,mutations:0},...overrides});
}

test('failure diagnosis is structured and unknown failure stops',()=>{
  const d=diagnoseLoopFailure({failureClass:'VERIFICATION',evidenceRef:'receipt:1',changedAssumption:'candidate is not valid',nextAction:'REPAIR_ONE'});
  assert.equal(d.authorityGranted,false);
  assert.throws(()=>diagnoseLoopFailure({failureClass:'UNKNOWN',evidenceRef:'r',changedAssumption:'unknown',nextAction:'RETRY'}),/UNKNOWN_FAILURE_MUST_STOP/);
});

test('loop trace is authority-free and contains no continuation grant',()=>{
  const t=trace();
  assert.equal(t.authorityGranted,false); assert.equal(t.continuationAuthorized,false);
  assert.equal(t.attempt,1); assert.match(t.traceDigest,/^[0-9a-f]{64}$/);
});

test('failed verification requires diagnosis and hidden reasoning fields are rejected',()=>{
  assert.throws(()=>trace({verifierStatus:'FAIL',terminalState:'CONTINUE_PROPOSED'}),/FAILED_TRACE_REQUIRES_DIAGNOSIS/);
  assert.throws(()=>makeLoopTrace({loopId:'x',componentId:'talos',attempt:1,triggerRef:'x',stateBeforeDigest:D,stateAfterDigest:E,goalDigest:G,actionKind:'X',actionDigest:A,semanticProgress:false,verifierStatus:'NOT_RUN',terminalState:'WAIT',budgetRemaining:{attempts:1},reasoning:'secret'}),/LOOP_TRACE_INVALID/);
});

test('trace analysis detects waste but never auto-promotes compression',()=>{
  const rows=[trace({attempt:1}),trace({attempt:2}),trace({attempt:3})];
  const a=analyzeLoopTraces(rows);
  assert.equal(a.attempts,3); assert.equal(a.progressRate,1); assert.equal(a.verifierPassRate,1);
  assert.equal(a.redundantActionCount,2); assert.equal(a.compressionCandidates.length,1);
  assert.equal(a.compressionCandidates[0].status,'CANDIDATE_ONLY');
  assert.equal(a.automaticPromotion,false); assert.equal(a.authorityGranted,false);
});

test('repeated causal failures are visible as a stall signal',()=>{
  const diagnosis={failureClass:'VERIFICATION',evidenceRef:'same-proof',changedAssumption:'candidate bad',nextAction:'REPAIR'};
  const rows=[1,2].map(attempt=>trace({attempt,semanticProgress:false,verifierStatus:'FAIL',terminalState:'CONTINUE_PROPOSED',failureDiagnosis:diagnosis,actionDigest:'d'.repeat(64)}));
  const a=analyzeLoopTraces(rows);
  assert.equal(a.repeatedFailures.length,1); assert.equal(a.progressRate,0);
});

test('fake PASS and fake semantic progress fail closed',()=>{
  assert.throws(()=>trace({verifierStatus:'NOT_RUN',terminalState:'PASS'}),/LOOP_PASS_REQUIRES_VERIFIER_PASS/);
  assert.throws(()=>trace({stateAfterDigest:D,semanticProgress:true,verifierStatus:'NOT_RUN',terminalState:'WAIT'}),/SEMANTIC_PROGRESS_REQUIRES_DELTA/);
});

test('a changed evidence state can record progress before final PASS',()=>{
  const t=trace({semanticProgress:true,verifierStatus:'NOT_RUN',terminalState:'WAIT'});
  assert.notEqual(t.stateAfterDigest,t.stateBeforeDigest);
  assert.equal(t.semanticProgress,true);
  assert.equal(t.continuationAuthorized,false);
});

test('processing health distinguishes stable loops from stall risk',()=>{
  const healthy=analyzeLoopTraces([trace({attempt:1,actionDigest:'1'.repeat(64)}),trace({attempt:2,actionDigest:'2'.repeat(64)})]);
  assert.equal(healthy.health,'HEALTHY'); assert.deepEqual(healthy.optimizationSignals,['KEEP_CURRENT_LOOP']);
  const diagnosis={failureClass:'VERIFICATION',evidenceRef:'repeat',changedAssumption:'still failing',nextAction:'REPAIR'};
  const stalled=analyzeLoopTraces([1,2].map(attempt=>trace({attempt,stateAfterDigest:`${attempt}`.repeat(64).slice(0,64),semanticProgress:false,verifierStatus:'FAIL',terminalState:'CONTINUE_PROPOSED',budgetRemaining:{attempts:3-attempt},failureDiagnosis:diagnosis,actionDigest:'f'.repeat(64)})));
  assert.equal(stalled.health,'STALL_RISK'); assert.ok(stalled.optimizationSignals.includes('STOP_ZERO_PROGRESS'));
  assert.ok(stalled.optimizationSignals.includes('DIAGNOSE_REPEATED_FAILURE'));
});

test('continuation proposal requires remaining attempt budget when declared',()=>{
  const diagnosis={failureClass:'TRANSIENT',evidenceRef:'r',changedAssumption:'temporary',nextAction:'RETRY'};
  assert.throws(()=>trace({semanticProgress:false,verifierStatus:'NOT_RUN',terminalState:'CONTINUE_PROPOSED',budgetRemaining:{attempts:0},failureDiagnosis:diagnosis}),/LOOP_CONTINUE_WITHOUT_BUDGET/);
});
