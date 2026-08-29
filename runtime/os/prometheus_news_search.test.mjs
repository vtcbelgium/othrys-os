import test from 'node:test';
import assert from 'node:assert/strict';
import { searchTavilyBasic, runPrometheusDailySearch, PROMETHEUS_DAILY_QUERIES } from './prometheus_news_search.mjs';
const sealed={applyToHeader(h){return {...h,authorization:'Bearer fixture-secret'};}};
const response=(query)=>({ok:true,status:200,json:async()=>({results:[{title:`${query} result`,url:`https://example.com/${encodeURIComponent(query)}`,content:'Useful concise evidence.',score:.9}],usage:{credits:1}})});

test('daily profile runs exactly three cheap lenses',()=>assert.deepEqual(PROMETHEUS_DAILY_QUERIES.map(x=>x.lens),['AI','TECH','CURRICULUM']));
test('Tavily basic search disables generated answers and raw content',async()=>{let req=null;await searchTavilyBasic({sealedCredential:sealed,query:'AI news',fetchImpl:async(u,o)=>{req={u,o,body:JSON.parse(o.body)};return response('ai');}});assert.equal(req.body.search_depth,'basic');assert.equal(req.body.include_answer,false);assert.equal(req.body.include_raw_content,false);assert.equal(req.body.auto_parameters,false);assert.equal(JSON.stringify(req).includes('fixture-secret'),true);});
test('daily search is bounded, deduped and costs three basic credits',async()=>{const x=await runPrometheusDailySearch({sealedCredential:sealed,fetchImpl:async(_u,o)=>response(JSON.parse(o.body).query),maxItems:8});assert.equal(x.queries,3);assert.equal(x.creditsUsed,3);assert.equal(x.findings.length,3);assert.equal(x.paidFallback,false);assert.equal(JSON.stringify(x).includes('fixture-secret'),false);});
test('failed lens does not invent findings',async()=>{let n=0;const x=await runPrometheusDailySearch({sealedCredential:sealed,fetchImpl:async()=>++n===1?{ok:false,status:429,json:async()=>({})}:response('ok')});assert.equal(x.findings.length,1);assert.equal(x.authorityGranted,false);});
