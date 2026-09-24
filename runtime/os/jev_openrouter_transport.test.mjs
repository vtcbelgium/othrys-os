import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JEV_OPENROUTER_DECISIONS_URL,
  JEV_OPENROUTER_MAX_USD_PER_CALL,
  JEV_OPENROUTER_TOKEN_SAFETY_FACTOR,
  estimateOpenRouterJevCost,
  evaluateJevViaOpenRouter,
  mapOpenRouterJevModel,
} from './jev_openrouter_transport.mjs';

const sealed={
  applyToHeader(headers,header='authorization',prefix='Bearer '){
    return {...headers,[header]:prefix+'fixture-key'};
  },
};

const questions={
  task_type:{
    type:'choice',
    instructions:'What is the primary intent?',
    criteria:{build:'Modify implementation.',status:'Inspect only.'},
  },
  needs_execution:{type:'noul',instructions:'Does this require a system change?'},
};

test('maps only admitted Jev model aliases',()=>{
  assert.equal(mapOpenRouterJevModel('jev-1.13.0'),'typesafe/jev-1.13');
  assert.equal(mapOpenRouterJevModel('jev-latest'),'~typesafe/jev-latest');
  assert.throws(()=>mapOpenRouterJevModel('some-other-model'),/NOT_ADMITTED/);
});

test('cost guard blocks calls beyond the hard per-call budget',()=>{
  const small=estimateOpenRouterJevCost({
    state:'Inspect repository status.',
    questions,
  });
  assert.equal(small.allowed,true);
  assert.equal(small.maxUsd,JEV_OPENROUTER_MAX_USD_PER_CALL);
  assert.equal(small.safetyFactor,JEV_OPENROUTER_TOKEN_SAFETY_FACTOR);
  assert.ok(small.estimatedInputTokens>small.rawTokenEstimate);

  const huge=estimateOpenRouterJevCost({
    state:'x'.repeat(100000),
    questions,
  });
  assert.equal(huge.allowed,false);
  assert.ok(huge.estimatedUsd>huge.maxUsd);
});

test('adapter uses Decisions API and preserves native Jev answers',async()=>{
  let seen=null;
  const fetchImpl=async(url,init)=>{
    seen={url,init,body:JSON.parse(String(init.body))};
    return new Response(JSON.stringify({
      model:'typesafe/jev-1.13-20260917',
      answers:{
        task_type:{type:'choice',choice:'build',probabilities:{build:0.99,status:0.01},confidence:0.99},
        needs_execution:{type:'noul',noul:0.98},
      },
      usage:{input_tokens:300,output_tokens:25,cost:0.0000126},
      provider:'TypeSafe',
    }),{status:200,headers:{'content-type':'application/json'}});
  };

  const result=await evaluateJevViaOpenRouter({
    sealedCredential:sealed,
    model:'jev-1.13.0',
    state:'Fix the bounded repository bug and run tests.',
    questions,
    fetchImpl,
  });

  assert.equal(seen.url,JEV_OPENROUTER_DECISIONS_URL);
  assert.equal(seen.body.model,'typesafe/jev-1.13');
  assert.equal(seen.body.questions.needs_execution.type,'noul');
  assert.equal(result.answers.needs_execution.noul,0.98);
  assert.equal(result.authorityGranted,false);
  assert.equal(result.executionStarted,false);
  assert.equal(result.costGuard.allowed,true);
  assert.equal(result.actualCostUsd,0.0000126);
  assert.equal(result.postflightBudgetStatus,'WITHIN_CAP');
});

test('budget refusal happens before fetch',async()=>{
  let called=false;
  await assert.rejects(
    ()=>evaluateJevViaOpenRouter({
      sealedCredential:sealed,
      model:'jev-1.13.0',
      state:'x'.repeat(100000),
      questions,
      fetchImpl:async()=>{called=true;throw new Error('should-not-run');},
    }),
    /BUDGET_EXCEEDED/,
  );
  assert.equal(called,false);
});


test('records a postflight budget breach without granting authority',async()=>{
  const fetchImpl=async()=>new Response(JSON.stringify({
    model:'typesafe/jev-1.13-20260917',
    answers:{
      task_type:{type:'choice',choice:'status',probabilities:{status:1},confidence:1},
      needs_execution:{type:'noul',noul:0},
    },
    usage:{input_tokens:100,output_tokens:10,cost:0.00006},
  }),{status:200,headers:{'content-type':'application/json'}});

  const result=await evaluateJevViaOpenRouter({
    sealedCredential:sealed,
    model:'jev-1.13.0',
    state:'Inspect status.',
    questions,
    fetchImpl,
  });

  assert.equal(result.postflightBudgetStatus,'BREACHED');
  assert.equal(result.actualCostUsd,0.00006);
  assert.equal(result.authorityGranted,false);
  assert.equal(result.executionStarted,false);
});
