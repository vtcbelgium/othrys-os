import test from 'node:test';
import assert from 'node:assert/strict';
import { executeLightSpecialist, warmLocalAdvisory } from './brain_light_executor.mjs';

const route={outcome:'SELECTED',selected:{id:'llama3.2-advisory',label:'Llama 3.2',locality:'LOCAL',costClass:'ZERO',certification:'UNTESTED'}};
function decision(over={}){
  return {
    schema:'othrys.os.brain-decision.v1',
    lane:'LIGHT',
    taskType:'research',
    needsWeb:false,
    executor:{id:'prometheus.research'},
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
    ...over,
  };
}

test('local LIGHT advisory performs bounded zero-cost read-only work',async()=>{
  let seen=null;
  const out=await executeLightSpecialist({
    decision:decision({needsWeb:false}),
    command:'Explain the likely cause from these logs.',
    specialistRoute:route,
    contextText:'git status: clean\nlog: timeout in test runner',
    fetchImpl:async(url,init)=>{
      seen={url,body:JSON.parse(init.body)};
      return new Response(JSON.stringify({model:'llama3.2:latest',response:'The timeout is the likely cause.'}),{status:200});
    },
  });
  assert.match(seen.url,/127\.0\.0\.1:11434\/api\/generate$/);
  assert.equal(seen.body.model,'llama3.2:latest');
  assert.equal(seen.body.options.num_predict,96);
  assert.match(seen.body.prompt,/no authority/i);
  assert.equal(out.kind,'LOCAL_ADVISORY');
  assert.equal(out.local,true);
  assert.equal(out.costClass,'ZERO');
  assert.equal(out.authorityGranted,false);
  assert.equal(out.executionStarted,false);
});

test('fresh-web LIGHT research uses Legion evidence bridge',async()=>{
  const out=await executeLightSpecialist({
    decision:decision({needsWeb:true}),
    command:'Research current Jev pricing.',
    specialistRoute:route,
    legionBridgeUrl:'http://legion:8766',
    legionBridgeToken:'bridge-token',
    fetchImpl:async(url,init)=>{
      assert.equal(url,'http://legion:8766/brain/research');
      assert.equal(JSON.parse(init.body).token,'bridge-token');
      return new Response(JSON.stringify({
        ok:true,
        research:{
          schema:'othrys.legion.research-response.v1',
          findings:[{title:'Official pricing',url:'https://example.com/pricing',summary:'Current official price.',score:.9}],
          creditsUsed:1,
          authorityGranted:false,
          actionApplied:false,
          executionStarted:false,
        },
      }),{status:200});
    },
  });
  assert.equal(out.kind,'RESEARCH_EVIDENCE');
  assert.equal(out.sources.length,1);
  assert.match(out.text,/Official pricing/);
  assert.equal(out.authorityGranted,false);
});

test('LIGHT executor fails closed on missing admitted route',async()=>{
  await assert.rejects(
    ()=>executeLightSpecialist({decision:decision(),command:'Analyze.',specialistRoute:null,fetchImpl:async()=>{throw new Error('must-not-run')}}),
    /ROUTE_UNAVAILABLE/,
  );
});

test('LIGHT executor refuses authority-bearing decisions',async()=>{
  await assert.rejects(
    ()=>executeLightSpecialist({decision:decision({authorityGranted:true}),command:'Analyze.',specialistRoute:route}),
    /AUTHORITY_INVALID/,
  );
});


test('warmup is authority-free and keeps model loaded',async()=>{
  let body=null;
  const out=await warmLocalAdvisory({
    fetchImpl:async(_url,init)=>{
      body=JSON.parse(init.body);
      return new Response('{}',{status:200});
    },
  });
  assert.equal(out.ok,true);
  assert.equal(body.keep_alive,'2h');
  assert.equal(body.options.num_predict,1);
  assert.equal(out.authorityGranted,false);
  assert.equal(out.executionStarted,false);
});


test('repo LIGHT refuses completion without bounded context',async()=>{
  await assert.rejects(
    ()=>executeLightSpecialist({
      decision:decision({needsWeb:false,needsRepo:true}),
      command:'Investigate the repository failure.',
      specialistRoute:route,
      fetchImpl:async()=>{throw new Error('must-not-run');},
    }),
    /REPO_CONTEXT_REQUIRED/,
  );
});


test('repo LIGHT uses Legion qwen advisory bridge with bounded context',async()=>{
  const out=await executeLightSpecialist({
    decision:decision({needsWeb:false,needsRepo:true}),
    command:'Explain the failing test from the evidence.',
    specialistRoute:route,
    contextText:'TEST LOG: expected 200, got 500',
    legionBridgeUrl:'http://legion:8766',
    legionBridgeToken:'bridge-token',
    fetchImpl:async(url,init)=>{
      assert.equal(url,'http://legion:8766/brain/advisory');
      const body=JSON.parse(init.body);
      assert.equal(body.token,'bridge-token');
      assert.match(body.context,/expected 200/);
      return new Response(JSON.stringify({
        ok:true,
        advisory:{
          schema:'othrys.legion.advisory-response.v1',
          model:'qwen3-fast:latest',
          text:'The evidence shows the test expected HTTP 200 but received HTTP 500.',
          local:true,
          costClass:'ZERO',
          authorityGranted:false,
          actionApplied:false,
          executionStarted:false,
        },
      }),{status:200});
    },
  });
  assert.equal(out.kind,'REPO_ADVISORY');
  assert.equal(out.model,'qwen3-fast:latest');
  assert.equal(out.node,'legion');
  assert.equal(out.costClass,'ZERO');
  assert.equal(out.authorityGranted,false);
});

test('repo LIGHT preserves bounded Pollinations fallback metadata',async()=>{
  const out=await executeLightSpecialist({
    decision:decision({needsWeb:false,needsRepo:true}),
    command:'Explain the failing test from the evidence.',
    specialistRoute:route,
    contextText:'TEST LOG: expected 200, got 500',
    legionBridgeUrl:'http://legion:8766',
    legionBridgeToken:'bridge-token',
    fetchImpl:async()=>new Response(JSON.stringify({
      ok:true,
      advisory:{
        schema:'othrys.legion.advisory-response.v1',
        provider:'POLLINATIONS',
        model:'fc/v3',
        text:'The bounded evidence shows an HTTP 500 response.',
        local:false,
        costClass:'BOUNDED_POLLEN',
        estimatedMaxPollen:0.0002,
        authorityGranted:false,
        actionApplied:false,
        executionStarted:false,
      },
    }),{status:200}),
  });
  assert.equal(out.provider,'POLLINATIONS');
  assert.equal(out.local,false);
  assert.equal(out.costClass,'BOUNDED_POLLEN');
  assert.equal(out.estimatedMaxPollen,0.0002);
});
