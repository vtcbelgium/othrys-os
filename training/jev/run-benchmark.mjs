import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const sets=JSON.parse(readFileSync(join(here,'question-sets.json'),'utf8')).questionSets;
const benchmark=JSON.parse(readFileSync(join(here,'benchmark-cases.json'),'utf8'));

const provider=(process.env.JEV_PROVIDER||'TYPESAFE_DIRECT').toUpperCase();
const requestedModel=process.env.JEV_MODEL||'jev-1.13.0';
const writeResults=process.env.JEV_WRITE_RESULTS==='1';

const providers={
  TYPESAFE_DIRECT:{
    url:'https://api.typesafe.ai/v1/systemone',
    key:process.env.TYPESAFE_API_KEY,
    model:requestedModel,
  },
  VERCEL_AI_GATEWAY:{
    url:'https://ai-gateway.vercel.sh/typesafe/v1/systemone',
    key:process.env.AI_GATEWAY_API_KEY,
    model:requestedModel,
  },
};

if(!providers[provider]) throw new Error('JEV_BENCHMARK_PROVIDER_UNSUPPORTED');
if(!providers[provider].key) throw new Error(`JEV_BENCHMARK_KEY_MISSING:${provider}`);

function reverseChoiceCriteria(questions){
  return Object.fromEntries(Object.entries(questions).map(([id,q])=>{
    if(q.type!=='choice'||!q.criteria||Array.isArray(q.criteria)) return [id,q];
    return [id,{...q,criteria:Object.fromEntries(Object.entries(q.criteria).reverse())}];
  }));
}
function answerValue(answer){
  if(!answer||typeof answer!=='object') return undefined;
  if(answer.type==='choice') return answer.choice;
  if(answer.type==='score') return answer.score;
  if(answer.type==='noul') return answer.noul>=0.5;
  return undefined;
}
function caseAccuracy(expected,answers){
  const rows=Object.entries(expected).map(([id,value])=>{
    const actual=answerValue(answers[id]);
    const ok=typeof value==='number'&&typeof actual==='number'
      ? Math.abs(value-actual)<=0.5
      : actual===value;
    return {id,expected:value,actual,ok};
  });
  return {correct:rows.filter(x=>x.ok).length,total:rows.length,rows};
}
async function evaluate(state,questions){
  const cfg=providers[provider];
  const started=performance.now();
  const response=await fetch(cfg.url,{
    method:'POST',
    headers:{Authorization:`Bearer ${cfg.key}`,'Content-Type':'application/json'},
    body:JSON.stringify({state,model:cfg.model,questions}),
  });
  const text=await response.text();
  if(!response.ok) throw new Error(`JEV_HTTP_${response.status}:${text.slice(0,500)}`);
  const payload=JSON.parse(text);
  return {...payload,latencyMs:Math.round((performance.now()-started)*100)/100};
}

const results=[];
for(const item of benchmark.cases){
  const questionSetId=`${item.circuit}.v1`;
  const base=sets[questionSetId];
  if(!base) throw new Error(`QUESTION_SET_MISSING:${questionSetId}`);
  const primary=await evaluate(item.state,base.questions);
  const reversed=await evaluate(item.state,reverseChoiceCriteria(base.questions));
  const scored=caseAccuracy(item.expected,primary.answers);
  const choiceIds=Object.entries(base.questions).filter(([,q])=>q.type==='choice').map(([id])=>id);
  const orderStable=choiceIds.every(id=>answerValue(primary.answers[id])===answerValue(reversed.answers[id]));
  results.push({
    id:item.id,
    circuit:item.circuit,
    expected:item.expected,
    answers:primary.answers,
    reversedAnswers:reversed.answers,
    correct:scored.correct,
    total:scored.total,
    details:scored.rows,
    orderStable,
    model:primary.model,
    usage:primary.usage,
    latencyMs:primary.latencyMs,
  });
}

const total=results.reduce((n,x)=>n+x.total,0);
const correct=results.reduce((n,x)=>n+x.correct,0);
const orderCases=results.length;
const orderStable=results.filter(x=>x.orderStable).length;
const report={
  schema:'othrys.os.jev-benchmark-report.v1',
  generatedAt:new Date().toISOString(),
  provider,
  requestedModel,
  benchmarkVersion:benchmark.version,
  caseCount:results.length,
  accuracy:total?correct/total:0,
  orderStability:orderCases?orderStable/orderCases:0,
  authorityGranted:false,
  productionEvidence:false,
  results,
};
const json=JSON.stringify(report,null,2);
if(writeResults){
  const outDir=resolve(here,'results');
  mkdirSync(outDir,{recursive:true});
  const safe=report.generatedAt.replaceAll(':','-');
  const path=join(outDir,`${safe}-${provider.toLowerCase()}.json`);
  writeFileSync(path,json+'\n','utf8');
  console.error(`Wrote ${path}`);
}
console.log(json);
