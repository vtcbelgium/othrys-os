import test from 'node:test';
import assert from 'node:assert/strict';
import {
  POLLINATIONS_CHAT_URL,
  POLLINATIONS_MODELS_URL,
  discoverPollinationsModels,
  estimatePollinationsPollen,
  evaluatePollinationsAdvisory,
  selectPollinationsAdvisoryModel,
} from './pollinations_transport.mjs';

const sealed={
  applyToHeader(headers,header='authorization',prefix='Bearer '){
    return {...headers,[header]:prefix+'test-token'};
  },
};

const paid={
  id:'community/example/paid',
  aliases:[],
  category:'text',
  ownedBy:'example',
  pricing:{currency:'pollen',promptTextTokens:0.0000001,completionTextTokens:0.0000003},
};

const free={
  id:'community/example/free',
  aliases:['free-alias'],
  category:'text',
  ownedBy:'example',
  pricing:{currency:'pollen',promptTextTokens:0,completionTextTokens:0},
};

test('model discovery is sanitized',async()=>{
  let seen=null;
  const fetchImpl=async(url,init)=>{
    seen={url,headers:init.headers};
    return new Response(JSON.stringify({data:[{
      id:paid.id,
      aliases:['old-paid'],
      category:'text',
      owned_by:'example',
      pricing:{currency:'pollen',promptTextTokens:'0.0000001',completionTextTokens:'0.0000003'},
    }]}),{status:200,headers:{'content-type':'application/json'}});
  };
  const result=await discoverPollinationsModels({sealedCredential:sealed,fetchImpl});
  assert.equal(seen.url,POLLINATIONS_MODELS_URL);
  assert.equal(seen.headers.authorization,'Bearer test-token');
  assert.equal(result.modelCount,1);
  assert.equal(result.models[0].id,paid.id);
  assert.equal(result.secretExposed,false);
  assert.equal(JSON.stringify(result).includes('test-token'),false);
});

test('free model wins before pollen-priced model',()=>{
  const selected=selectPollinationsAdvisoryModel([paid,free]);
  assert.equal(selected.id,free.id);
  assert.equal(
    selectPollinationsAdvisoryModel([paid,free],{preferredModel:'free-alias'}).id,
    free.id,
  );
});

test('cost guard calculates bounded estimate',()=>{
  const guard=estimatePollinationsPollen({
    model:paid,
    promptChars:3000,
    maxOutputTokens:100,
  });
  assert.ok(guard.estimatedInputTokens>=1000);
  assert.ok(guard.estimatedMaxPollen>0);
  assert.equal(guard.authorityGranted,false);
});

test('budget refusal happens before chat fetch',async()=>{
  let calls=0;
  await assert.rejects(
    ()=>evaluatePollinationsAdvisory({
      sealedCredential:sealed,
      prompt:'Explain this evidence.',
      context:'x'.repeat(1000),
      models:[paid],
      maxEstimatedPollen:0,
      fetchImpl:async()=>{calls+=1;throw new Error('must-not-run');},
    }),
    /POLLEN_BUDGET_EXCEEDED/,
  );
  assert.equal(calls,0);
});

test('advisory strips think envelope and stays inert',async()=>{
  let seen=null;
  const fetchImpl=async(url,init)=>{
    seen={url,body:JSON.parse(String(init.body)),headers:init.headers};
    return new Response(JSON.stringify({
      model:'fc/v3',
      choices:[{message:{content:'<think>scratch</think>\n\nThe bounded evidence shows a timeout.'}}],
      usage:{prompt_tokens:20,completion_tokens:12,total_tokens:32},
    }),{status:200,headers:{'content-type':'application/json'}});
  };
  const result=await evaluatePollinationsAdvisory({
    sealedCredential:sealed,
    prompt:'What happened?',
    context:'test runner: timeout',
    models:[paid],
    fetchImpl,
  });
  assert.equal(seen.url,POLLINATIONS_CHAT_URL);
  assert.equal(seen.body.model,paid.id);
  assert.equal(seen.headers.authorization,'Bearer test-token');
  assert.equal(result.text,'The bounded evidence shows a timeout.');
  assert.equal(result.local,false);
  assert.equal(result.costClass,'BOUNDED_POLLEN');
  assert.equal(result.authorityGranted,false);
  assert.equal(result.executionStarted,false);
  assert.equal(result.secretExposed,false);
  assert.equal(JSON.stringify(result).includes('test-token'),false);
  assert.equal(JSON.stringify(result).includes('scratch'),false);
});

test('malformed provider response fails closed',async()=>{
  await assert.rejects(
    ()=>evaluatePollinationsAdvisory({
      sealedCredential:sealed,
      prompt:'Explain.',
      models:[free],
      fetchImpl:async()=>new Response('not json',{status:200}),
    }),
    /INVALID_JSON/,
  );
});
