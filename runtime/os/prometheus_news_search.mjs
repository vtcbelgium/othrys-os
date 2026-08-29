import { PROMETHEUS_NEWSLETTER_PROFILE } from './prometheus_arsenal.mjs';
const QUERIES=Object.freeze([
  {lens:'AI',query:'important AI model agent API open-source release official announcement today'},
  {lens:'TECH',query:'important developer automation technology security hardware cloud release official news today'},
  {lens:'SYNTRA',query:'AI automation full-stack developer agents APIs n8n RAG workflow automation new release documentation tutorial today'}
]);
export { QUERIES as PROMETHEUS_DAILY_QUERIES };

function clean(v,max=1200){return typeof v==='string'?v.trim().replace(/\s+/g,' ').slice(0,max):'';}
export async function searchTavilyBasic({sealedCredential,query,fetchImpl=fetch,maxResults=5,timeRange='day'}={}){
  if(!sealedCredential||typeof sealedCredential.applyToHeader!=='function') throw new Error('PROM_NEWS_SEALED_TAVILY_REQUIRED');
  query=clean(query,320); if(!query) throw new Error('PROM_NEWS_QUERY_REQUIRED');
  const headers=sealedCredential.applyToHeader({'content-type':'application/json'},'authorization','Bearer ');
  const response=await fetchImpl('https://api.tavily.com/search',{method:'POST',headers,body:JSON.stringify({query,search_depth:'basic',max_results:Math.max(1,Math.min(6,maxResults)),time_range:timeRange,include_answer:false,include_raw_content:false,include_images:false,auto_parameters:false})});
  if(!response.ok) return Object.freeze({ok:false,status:response.status,results:[],creditsUsed:0,secretExposed:false});
  const body=await response.json(); const rows=Array.isArray(body?.results)?body.results:[];
  return Object.freeze({ok:true,status:response.status,results:Object.freeze(rows.map(r=>Object.freeze({title:clean(r.title,180),url:clean(r.url,600),summary:clean(r.content,320),score:Number.isFinite(Number(r.score))?Math.max(0,Math.min(1,Number(r.score))):0})).filter(r=>r.title&&/^https:\/\//.test(r.url))),creditsUsed:Number(body?.usage?.credits)||1,secretExposed:false});
}
function dedupe(rows){const seen=new Set();return rows.filter(r=>{const key=r.url.toLowerCase();if(seen.has(key))return false;seen.add(key);return true;});}
export async function runPrometheusDailySearch({sealedCredential,fetchImpl=fetch,maxItems=PROMETHEUS_NEWSLETTER_PROFILE.maxItems}={}){
  const all=[]; let creditsUsed=0;
  for(const spec of QUERIES){
    const out=await searchTavilyBasic({sealedCredential,query:spec.query,fetchImpl,maxResults:5,timeRange:'day'}); creditsUsed+=out.creditsUsed;
    if(!out.ok) continue;
    for(const row of out.results) all.push({...row,lens:spec.lens});
  }
  const pool=dedupe(all).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)); const cap=Math.max(1,Math.min(10,maxItems));
  const quotas={AI:Math.min(4,cap),TECH:Math.min(2,cap),SYNTRA:Math.min(2,cap)}; const ranked=[];
  for(const lens of ['AI','SYNTRA','TECH']) for(const row of pool.filter(x=>x.lens===lens).slice(0,quotas[lens])) if(ranked.length<cap) ranked.push(row);
  for(const row of pool) if(ranked.length<cap&&!ranked.some(x=>x.url===row.url)) ranked.push(row);
  const findings=ranked.map(x=>Object.freeze({title:x.title,source:x.url,summary:x.summary,kind:'NEWS',lens:x.lens,score:x.score,alreadyHarvested:false}));
  return Object.freeze({schema:'othrys.os.prometheus-daily-search.v1',queries:QUERIES.length,creditsUsed,findings:Object.freeze(findings),maxItems,searchDepth:'basic',rawContent:false,generatedAnswer:false,paidFallback:false,authorityGranted:false,executionStarted:false});
}


