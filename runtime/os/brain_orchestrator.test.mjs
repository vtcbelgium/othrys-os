import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBrainDecision,
  createFallbackBrainDecision,
  verifyBrainDecision,
} from './brain_orchestrator.mjs';

function observation(answers={}){
  const body={
    schema:'othrys.os.jev-observation.v1',
    mode:'TRAINING',
    runDigest:'a'.repeat(64),
    circuitId:'router',
    provider:'OPENROUTER',
    requestedModel:'jev-1.13.0',
    resolvedModel:'typesafe/jev-1.13-20260917',
    questionSetId:'router.v1',
    answers:{
      task_type:{type:'choice',choice:'status'},
      needs_repo:{type:'noul',noul:0.9},
      needs_web:{type:'noul',noul:0.1},
      needs_execution:{type:'noul',noul:0.05},
      risk:{type:'score',score:0},
      ...answers,
    },
    usage:null,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
  return {...body,observationDigest:'b'.repeat(64)};
}

test('read-only status becomes FAST without a mission',()=>{
  const d=createBrainDecision({
    command:'Inspect repository status. Read only.',
    observation:observation(),
    sharedStateRef:'web:1',
  });
  assert.equal(d.lane,'FAST');
  assert.equal(d.executor.id,'deterministic.status');
  assert.equal(d.missionRequired,false);
  assert.equal(d.authorization.granted,false);
  verifyBrainDecision(d,{command:'Inspect repository status. Read only.'});
});

test('build becomes DEEP and cannot bypass mission governance',()=>{
  const d=createBrainDecision({
    command:'Fix the TypeScript bug and run tests.',
    observation:observation({
      task_type:{type:'choice',choice:'build'},
      needs_execution:{type:'noul',noul:0.95},
      risk:{type:'score',score:1.1},
    }),
    sharedStateRef:'web:2',
  });
  assert.equal(d.lane,'DEEP');
  assert.equal(d.executor.id,'hephaestus.switchyard');
  assert.equal(d.missionRequired,true);
  assert.equal(d.authorization.required,true);
  assert.equal(d.authorization.granted,false);
});

test('danger floor prevents semantic downgrade of deterministic build intent',()=>{
  const d=createBrainDecision({
    command:'Build a new settings panel.',
    observation:observation({
      task_type:{type:'choice',choice:'discussion'},
      needs_execution:{type:'noul',noul:0.01},
      risk:{type:'score',score:0},
    }),
    sharedStateRef:'web:3',
  });
  assert.equal(d.deterministicIntent,'BUILD');
  assert.equal(d.missionRequired,true);
  assert.equal(d.authorization.required,true);
});

test('fallback keeps OTHRYS alive while clearly degraded',()=>{
  const d=createFallbackBrainDecision({
    command:'Research current Jev provider options.',
    sharedStateRef:'web:4',
    reason:'REMOTE_BRAIN_TIMEOUT',
  });
  assert.equal(d.source,'DETERMINISTIC_FALLBACK');
  assert.equal(d.degraded,true);
  assert.equal(d.lane,'LIGHT');
  assert.equal(d.executor.id,'prometheus.research');
  assert.equal(d.authorityGranted,false);
  verifyBrainDecision(d,{command:'Research current Jev provider options.'});
});
