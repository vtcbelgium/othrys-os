import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateJevViaLegionBridge } from './jev_remote_router.mjs';

function brainPayload(){
  return {
    ok:true,
    brain:{
      schema:'othrys.legion.brain-response.v1',
      observation:{
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
          task_type:{type:'choice',choice:'build'},
          needs_repo:{type:'noul',noul:0.9},
          needs_web:{type:'noul',noul:0.1},
          needs_execution:{type:'noul',noul:0.9},
          risk:{type:'score',score:1.2},
        },
        usage:null,
        authorityGranted:false,
        actionApplied:false,
        executionStarted:false,
      },
      transport:{provider:'OPENROUTER',latencyMs:300,actualCostUsd:0.00002},
      authorityGranted:false,
      actionApplied:false,
      executionStarted:false,
    },
  };
}

test('remote router accepts only training observations with zero authority',async()=>{
  const seen={};
  const fetchImpl=async(url,init)=>{
    seen.url=url;
    seen.body=JSON.parse(init.body);
    return new Response(JSON.stringify(brainPayload()),{status:200,headers:{'content-type':'application/json'}});
  };
  const out=await evaluateJevViaLegionBridge({
    baseUrl:'http://jeroen-legion.local:8766/',
    token:'bridge-token',
    state:'Fix one bounded repository bug.',
    fetchImpl,
  });
  assert.equal(seen.url,'http://jeroen-legion.local:8766/brain/router');
  assert.equal(seen.body.token,'bridge-token');
  assert.equal(out.observation.answers.task_type.choice,'build');
  assert.equal(out.authorityGranted,false);
  assert.equal(out.executionStarted,false);
});

test('remote router fails closed on upstream authority claim',async()=>{
  const payload=brainPayload();
  payload.brain.observation.authorityGranted=true;
  await assert.rejects(
    ()=>evaluateJevViaLegionBridge({
      baseUrl:'http://legion:8766',
      token:'bridge-token',
      state:'status',
      fetchImpl:async()=>new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json'}}),
    }),
    /AUTHORITY_INVALID/,
  );
});
