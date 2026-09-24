import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptWebJevRouterObservation,
  createJevBridgeReceipt,
  planFromJevRouterObservation,
  planFromWebJevRouterObservation,
  recommendExecutionLane,
} from './jev_execution_planner.mjs';

function routerObservation(overrides={}){
  const answers={
    task_type:{type:'choice',choice:'build'},
    needs_execution:{type:'noul',noul:0.99},
    needs_repo:{type:'noul',noul:0.99},
    needs_web:{type:'noul',noul:0.02},
    risk:{type:'score',score:2},
    ...(overrides.answers??{}),
  };
  return {
    schema:'othrys.os.jev-observation.v1',
    observationDigest:'abc123',
    circuitId:'router',
    answers,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
}

test('FAST is reserved for bounded non-executing work',()=>{
  assert.equal(recommendExecutionLane({
    taskType:'discussion',
    needsExecution:false,
    riskScore:0,
  }).id,'FAST');
});

test('Study and read-only research default to LIGHT',()=>{
  assert.equal(recommendExecutionLane({
    taskType:'study',
    needsExecution:false,
    riskScore:1,
  }).id,'LIGHT');
  assert.equal(recommendExecutionLane({
    taskType:'research',
    needsExecution:false,
    riskScore:1,
  }).id,'LIGHT');
});

test('build, admin and consequential risk escalate to DEEP',()=>{
  assert.equal(recommendExecutionLane({
    taskType:'build',
    needsExecution:true,
    riskScore:1,
  }).id,'DEEP');
  assert.equal(recommendExecutionLane({
    taskType:'discussion',
    needsExecution:false,
    riskScore:3,
  }).id,'DEEP');
});

test('router observation produces recommendation but never authority',()=>{
  const plan=planFromJevRouterObservation({
    observation:routerObservation(),
    interfaceId:'othrys-web',
    bridgeId:'othrys-bridge',
  });
  assert.equal(plan.lane.id,'DEEP');
  assert.equal(plan.authorization.required,true);
  assert.equal(plan.authorization.granted,false);
  assert.equal(plan.verification.required,true);
  assert.equal(plan.recommendationOnly,true);
  assert.equal(plan.authorityGranted,false);
  assert.equal(plan.executionStarted,false);
  assert.equal(plan.actionApplied,false);
});

test('Bridge receipt preserves shared-state flow without starting work',()=>{
  const plan=planFromJevRouterObservation({
    observation:routerObservation({
      answers:{
        task_type:{type:'choice',choice:'study'},
        needs_execution:{type:'noul',noul:0.1},
        needs_repo:{type:'noul',noul:0.2},
        needs_web:{type:'noul',noul:0.1},
        risk:{type:'score',score:1},
      },
    }),
    interfaceId:'voice',
    bridgeId:'othrys-bridge',
  });
  const receipt=createJevBridgeReceipt({
    plan,
    sharedStateRef:'state:session-42',
  });
  assert.equal(receipt.lane,'LIGHT');
  assert.equal(receipt.authorizationGranted,false);
  assert.equal(receipt.verificationCompleted,false);
  assert.equal(receipt.executionStarted,false);
  assert.equal(receipt.actionApplied,false);
});


function webRouterObservation(overrides={}){
  return {
    schema:'othrys.web.jev-training-observation.v1',
    runId:'web-run-001',
    observedAt:'2026-09-24T16:00:00.000Z',
    mode:'TRAINING',
    circuitId:'router',
    provider:'vercel-gateway',
    questionSetId:'router.v1',
    requestedModel:'jev-1.13.0',
    resolvedModel:'typesafe-ai/jev',
    answers:{
      task_type:{type:'choice',choice:'build'},
      needs_execution:{type:'noul',noul:0.98},
      needs_repo:{type:'noul',noul:0.99},
      needs_web:{type:'noul',noul:0.05},
      risk:{type:'score',score:2},
    },
    usage:{inputTokens:100,outputTokens:20},
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
    ...overrides,
  };
}

test('Web training observation adapts into canonical OS observation without authority',()=>{
  const adapted=adaptWebJevRouterObservation({
    observation:webRouterObservation(),
  });
  assert.equal(adapted.schema,'othrys.os.jev-observation.v1');
  assert.equal(adapted.circuitId,'router');
  assert.equal(adapted.source.system,'othrys-web');
  assert.equal(adapted.authorityGranted,false);
  assert.equal(adapted.executionStarted,false);
  assert.equal(typeof adapted.observationDigest,'string');
  assert.equal(adapted.observationDigest.length,64);
});

test('real Web Router shape flows directly into Chase planner',()=>{
  const plan=planFromWebJevRouterObservation({
    observation:webRouterObservation(),
    interfaceId:'othrys-web',
    bridgeId:'othrys-bridge',
  });
  assert.equal(plan.lane.id,'DEEP');
  assert.equal(plan.needsRepo,true);
  assert.equal(plan.needsExecution,true);
  assert.equal(plan.authorization.required,true);
  assert.equal(plan.authorization.granted,false);
  assert.equal(plan.verification.required,true);
  assert.equal(plan.authorityGranted,false);
  assert.equal(plan.executionStarted,false);
});

test('Web adapter fails closed if upstream observation claims authority',()=>{
  assert.throws(
    ()=>adaptWebJevRouterObservation({
      observation:webRouterObservation({authorityGranted:true}),
    }),
    /AUTHORITY_INVALID/,
  );
});


test('danger floor never allows FAST or LIGHT for admin, build, or risk >= 2',()=>{
  const cases=[
    {taskType:'admin',needsExecution:true,riskScore:0},
    {taskType:'admin',needsExecution:false,riskScore:0},
    {taskType:'build',needsExecution:true,riskScore:1},
    {taskType:'build',needsExecution:false,riskScore:0},
    {taskType:'status',needsExecution:false,riskScore:2},
    {taskType:'discussion',needsExecution:false,riskScore:3},
  ];
  for(const item of cases){
    assert.equal(recommendExecutionLane(item).id,'DEEP');
  }
});
