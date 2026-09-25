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
  community:true,
  paidOnly:false,
  pricing:{currency:'pollen',promptTextTokens:0.0000001,completionTextTokens:0.0000003,strictFree:false},
};

const free={
  id:'community/example/free',
  aliases:['free-alias'],
  category:'text',
  ownedBy:'example',
  community:true,
  paidOnly:false,
  pricing:{currency:'pollen',promptTextTokens:0,completionTextTokens:0,strictFree:true},
};

const blankFree={
  id:'community/example/blank-free',
  aliases:['blank-free-alias'],
  category:'text',
  ownedBy:'example',
  community:true,
  paidOnly:false,
  pricing:{currency:'pollen',promptTextTokens:null,completionTextTokens:null,strictFree:true},
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

test('strict-free models are admitted and priced models are excluded',()=>{
  const selected=selectPollinationsAdvisoryModel([paid,free,blankFree]);
  assert.ok([free.id,blankFree.id].includes(selected.id));
  assert.equal(
    selectPollinationsAdvisoryModel([paid,free,blankFree],{preferredModel:'blank-free-alias'}).id,
    blankFree.id,
  );
  assert.throws(
    ()=>selectPollinationsAdvisoryModel([paid],{preferredModel:paid.id}),
    /NO_FREE_TEXT_MODEL/,
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

test('positive-priced model is refused before chat fetch',async()=>{
  let calls=0;
  await assert.rejects(
    ()=>evaluatePollinationsAdvisory({
      sealedCredential:sealed,
      prompt:'Explain this evidence.',
      context:'x'.repeat(1000),
      models:[paid],
      fetchImpl:async()=>{calls+=1;throw new Error('must-not-run');},
    }),
    /NO_FREE_TEXT_MODEL/,
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
    models:[blankFree],
    fetchImpl,
  });
  assert.equal(seen.url,POLLINATIONS_CHAT_URL);
  assert.equal(seen.body.model,blankFree.id);
  assert.equal(seen.headers.authorization,'Bearer test-token');
  assert.equal(result.text,'The bounded evidence shows a timeout.');
  assert.equal(result.local,false);
  assert.equal(result.costClass,'ZERO');
  assert.equal(result.estimatedMaxPollen,0);
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

test('blank-priced community model is normalized as strict free',async()=>{
  const fetchImpl=async()=>new Response(JSON.stringify({data:[{
    id:'community/example/blank',
    aliases:['blank'],
    category:'text',
    pricing:{currency:'pollen'},
  }]}),{status:200,headers:{'content-type':'application/json'}});
  const result=await discoverPollinationsModels({sealedCredential:sealed,fetchImpl});
  assert.equal(result.models[0].community,true);
  assert.equal(result.models[0].paidOnly,false);
  assert.equal(result.models[0].pricing.blankCommunityFree,true);
  assert.equal(result.models[0].pricing.strictFree,true);
  const guard=estimatePollinationsPollen({model:result.models[0],promptChars:500,maxOutputTokens:100});
  assert.equal(guard.estimatedMaxPollen,0);
  assert.equal(guard.strictFree,true);
});
