import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrainDecision } from './brain_orchestrator.mjs';
import { createNoMissionBrainResult, verifyNoMissionBrainResult } from './brain_no_mission_result.mjs';

function observation(taskType='status',over={}){
  return {
    schema:'othrys.os.jev-observation.v1',
    mode:'TRAINING',
    runDigest:'a'.repeat(64),
    observationDigest:'b'.repeat(64),
    circuitId:'router',
    provider:'OPENROUTER',
    requestedModel:'jev-1.13.0',
    resolvedModel:'typesafe/jev-1.13-20260917',
    questionSetId:'router.v1',
    answers:{
      task_type:{type:'choice',choice:taskType},
      needs_repo:{type:'noul',noul:over.needsRepo??0},
      needs_web:{type:'noul',noul:over.needsWeb??0},
      needs_execution:{type:'noul',noul:over.needsExecution??0},
      risk:{type:'score',score:over.risk??0},
    },
    usage:null,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
}

test('FAST status performs bounded read-only work and verifies deterministic evidence',async()=>{
  const command='Inspect OTHRYS status. Read only.';
  const decision=createBrainDecision({
    command,
    observation:observation('status'),
    sharedStateRef:'web:status',
  });
  const result=await createNoMissionBrainResult({
    decision,
    command,
    statusProjection:async()=>({
      controlGate:'CLEAN_SYNCED',
      activeMission:{mission_id:'V2-011R',status:'COMPLETE'},
      operatingMode:{mode:'PLAN'},
      legionNode:{id:'legion',stale:false,gpuUtilPercent:2,gpuTempC:44,qwenLoaded:false},
      builderInspector:{selectedBuilder:{id:'qwen3-builder',locality:'LOCAL',providerHealth:'HEALTHY',certification:'CERTIFIED'}},
    }),
  });
  assert.equal(result.status,'COMPLETED');
  assert.equal(result.output.kind,'SYSTEM_STATUS');
  assert.match(result.output.text,/control=CLEAN_SYNCED/);
  assert.equal(result.verification.status,'DETERMINISTIC_EVIDENCE_PASS');
  assert.equal(result.readOnlyWorkPerformed,true);
  assert.equal(result.authorityGranted,false);
  verifyNoMissionBrainResult(result,{decision});
});

test('LIGHT completes when bounded specialist returns validated read-only evidence',async()=>{
  const command='Research current Jev pricing.';
  const decision=createBrainDecision({
    command,
    observation:observation('research',{needsWeb:0.9}),
    sharedStateRef:'web:research',
  });
  const result=await createNoMissionBrainResult({
    decision,
    command,
    specialistRoute:{
      outcome:'SELECTED',
      selected:{id:'llama3.2-advisory',label:'Local Small',locality:'LOCAL',costClass:'ZERO',certification:'UNTESTED'},
    },
    specialistExecutor:async()=>({
      schema:'othrys.os.brain-light-result.v1',
      specialist:'prometheus.research',
      kind:'RESEARCH_EVIDENCE',
      text:'Official Jev pricing — https://example.com/pricing',
      sources:[{title:'Official Jev pricing',url:'https://example.com/pricing'}],
      model:null,
      local:false,
      costClass:'ZERO_OR_FREE_CREDIT',
      verification:{status:'SOURCE_EVIDENCE_PASS'},
      readOnlyWorkPerformed:true,
      authorityGranted:false,
      actionApplied:false,
      executionStarted:false,
    }),
  });
  assert.equal(result.status,'COMPLETED');
  assert.equal(result.output.kind,'SPECIALIST_RESULT');
  assert.equal(result.output.specialist,'prometheus.research');
  assert.equal(result.recommendationOnly,false);
  assert.equal(result.readOnlyWorkPerformed,true);
  assert.equal(result.verification.status,'SOURCE_EVIDENCE_PASS');
  assert.equal(result.executionStarted,false);
});

test('LIGHT remains an explicit handoff if no specialist executor is connected',async()=>{
  const command='Research current Jev pricing.';
  const decision=createBrainDecision({
    command,
    observation:observation('research',{needsWeb:0.9}),
    sharedStateRef:'web:research-handoff',
  });
  const result=await createNoMissionBrainResult({
    decision,
    command,
    specialistRoute:{outcome:'SELECTED',selected:{id:'llama3.2-advisory',label:'Local Small',locality:'LOCAL',costClass:'ZERO',certification:'UNTESTED'}},
  });
  assert.equal(result.status,'HANDOFF_READY');
  assert.equal(result.output.kind,'SPECIALIST_HANDOFF');
  assert.equal(result.recommendationOnly,true);
});

test('no-mission result refuses governed decisions',async()=>{
  const command='Fix the bug.';
  const decision=createBrainDecision({
    command,
    observation:observation('build',{needsRepo:0.9,needsExecution:0.9,risk:1}),
    sharedStateRef:'web:build',
  });
  await assert.rejects(
    ()=>createNoMissionBrainResult({decision,command,statusProjection:async()=>({})}),
    /MISSION_REQUIRED/,
  );
});
