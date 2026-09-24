import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JEV_CIRCUITS,
  JEV_FOUNDATION_POLICY,
  assessJevShadowEligibility,
  createJevCortexStatus,
  createJevObservation,
  createJevTrainingRun,
} from './jev_cortex.mjs';

test('JEV Cortex starts entirely in training with zero authority',()=>{
  const status=createJevCortexStatus();
  assert.equal(status.mode,'TRAINING');
  assert.equal(status.authorityGranted,false);
  assert.equal(status.automaticPromotion,false);
  assert.equal(status.candidate.trust,0);
  assert.equal(JEV_FOUNDATION_POLICY.productionAuthority,false);
  assert.equal(JEV_FOUNDATION_POLICY.decisionMayTriggerExecution,false);
  assert.equal(JEV_CIRCUITS.length,6);
  for(const circuit of JEV_CIRCUITS){
    assert.equal(circuit.mode,'TRAINING');
    assert.equal(circuit.authorityGranted,false);
  }
});

test('every candidate version starts at zero trust even when stable and candidate aliases match',()=>{
  const status=createJevCortexStatus({stableModel:'jev-1.13.0',candidateModel:'jev-1.13.0'});
  assert.equal(status.stable.trust,null);
  assert.equal(status.candidate.trust,0);
  assert.equal(status.policy.candidateMustRequalify,true);
});

test('training runs and observations cannot apply actions',()=>{
  const run=createJevTrainingRun({
    circuitId:'router',
    provider:'TYPESAFE_DIRECT',
    requestedModel:'jev-1.13.0',
    questionSetId:'router.v1',
    state:'Investigate why Post to Book failed and fix it.',
  });
  assert.equal(run.authorityGranted,false);
  assert.equal(run.actionApplied,false);
  assert.equal(run.executionStarted,false);
  const observation=createJevObservation({
    run,
    resolvedModel:'jev-1.13.0',
    answers:{task_type:{type:'choice',choice:'build',confidence:0.91}},
    usage:{input_tokens:128,output_tokens:8},
  });
  assert.equal(observation.authorityGranted,false);
  assert.equal(observation.actionApplied,false);
  assert.equal(observation.executionStarted,false);
});

test('passing metrics only create eligibility for human shadow review, never promotion',()=>{
  const result=assessJevShadowEligibility('router',{
    sampleCount:150,
    accuracy:0.94,
    orderStability:0.98,
    criticalFalseNegativeRate:0,
  });
  assert.equal(result.eligibleForHumanShadowReview,true);
  assert.equal(result.resultingMode,'TRAINING');
  assert.equal(result.automaticPromotion,false);
  assert.equal(result.authorityGranted,false);
});

test('risk circuit refuses shadow eligibility on any critical false-negative rate',()=>{
  const result=assessJevShadowEligibility('risk',{
    sampleCount:500,
    accuracy:0.99,
    orderStability:0.99,
    criticalFalseNegativeRate:0.001,
  });
  assert.equal(result.eligibleForHumanShadowReview,false);
  assert.ok(result.failures.includes('CRITICAL_FALSE_NEGATIVE_GATE'));
});
