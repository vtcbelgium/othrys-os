export const BRAIN_LIGHT_RESULT_SCHEMA='othrys.os.brain-light-result.v1';

function text(value,code,max=4000){
  if(typeof value!=='string'||!value.trim()) throw new Error(code);
  const out=value.trim();
  if(out.length>max) throw new Error(code);
  return out;
}
function assertDecision(decision){
  if(!decision||decision.schema!=='othrys.os.brain-decision.v1'||decision.lane!=='LIGHT') throw new Error('BRAIN_LIGHT_DECISION_REQUIRED');
  if(decision.authorityGranted!==false||decision.executionStarted!==false||decision.actionApplied!==false) throw new Error('BRAIN_LIGHT_AUTHORITY_INVALID');
  return decision;
}
function sanitizeFinding(row){
  const title=text(row?.title,'BRAIN_RESEARCH_TITLE_INVALID',240);
  const url=text(row?.url,'BRAIN_RESEARCH_URL_INVALID',800);
  if(!/^https:\/\//i.test(url)) throw new Error('BRAIN_RESEARCH_URL_INVALID');
  const summary=typeof row?.summary==='string'?row.summary.trim().slice(0,500):'';
  return Object.freeze({title,url,summary,score:Number.isFinite(Number(row?.score))?Number(row.score):null});
}
function researchText(findings){
  return findings.map((x,i)=>[
    `${i+1}. ${x.title}`,
    x.summary||null,
    x.url,
  ].filter(Boolean).join(' — ')).join('\n');
}

export async function executeLightSpecialist({
  decision,
  command,
  specialistRoute,
  legionBridgeUrl='',
  legionBridgeToken='',
  ollamaEndpoint='http://127.0.0.1:11434',
  ollamaModel='llama3.2:latest',
  fetchImpl=fetch,
  timeoutMs=35000,
}={}){
  const d=assertDecision(decision);
  const input=text(command,'BRAIN_LIGHT_COMMAND_REQUIRED',2000);

  if(d.executor?.id==='prometheus.research'&&d.needsWeb===true){
    const base=text(legionBridgeUrl,'BRAIN_RESEARCH_BRIDGE_REQUIRED',1000).replace(/\/$/,'');
    const token=text(legionBridgeToken,'BRAIN_RESEARCH_TOKEN_REQUIRED',1000);
    let response;
    try{
      response=await fetchImpl(base+'/brain/research',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({token,query:input,maxResults:5}),
        signal:AbortSignal.timeout(timeoutMs),
      });
    }catch(error){
      throw new Error(error?.name==='TimeoutError'?'BRAIN_RESEARCH_TIMEOUT':'BRAIN_RESEARCH_UNREACHABLE');
    }
    let payload;
    try{payload=await response.json();}catch{throw new Error('BRAIN_RESEARCH_RESPONSE_INVALID');}
    if(!response.ok||payload?.ok!==true||!payload?.research) throw new Error(String(payload?.error??'BRAIN_RESEARCH_REFUSED'));
    const research=payload.research;
    if(research.schema!=='othrys.legion.research-response.v1'||research.authorityGranted!==false||research.executionStarted!==false) throw new Error('BRAIN_RESEARCH_RESPONSE_INVALID');
    const findings=Object.freeze((research.findings??[]).map(sanitizeFinding));
    if(!findings.length) throw new Error('BRAIN_RESEARCH_EMPTY');
    return Object.freeze({
      schema:BRAIN_LIGHT_RESULT_SCHEMA,
      specialist:'prometheus.research',
      kind:'RESEARCH_EVIDENCE',
      text:researchText(findings),
      sources:findings,
      model:null,
      local:false,
      costClass:'ZERO_OR_FREE_CREDIT',
      verification:Object.freeze({status:'SOURCE_EVIDENCE_PASS',sourceCount:findings.length}),
      readOnlyWorkPerformed:true,
      authorityGranted:false,
      actionApplied:false,
      executionStarted:false,
    });
  }

  if(!specialistRoute||specialistRoute.outcome!=='SELECTED'||specialistRoute.selected?.id!=='llama3.2-advisory'){
    throw new Error('BRAIN_LIGHT_ROUTE_UNAVAILABLE');
  }
  const prompt=[
    'You are the OTHRYS read-only LIGHT advisory specialist.',
    'You may analyze and explain, but you have no authority to change files, repositories, accounts, deployments, credentials, policy, or external systems.',
    'Do not claim that you executed changes. Give a concise useful answer based only on the request.',
    '',
    input,
  ].join('\n');

  let response;
  try{
    response=await fetchImpl(ollamaEndpoint.replace(/\/$/,'')+'/api/generate',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({
        model:ollamaModel,
        prompt,
        stream:false,
        keep_alive:'2h',
        options:{temperature:0.1,num_predict:192},
      }),
      signal:AbortSignal.timeout(timeoutMs),
    });
  }catch(error){
    throw new Error(error?.name==='TimeoutError'?'BRAIN_LIGHT_LOCAL_TIMEOUT':'BRAIN_LIGHT_LOCAL_UNREACHABLE');
  }
  if(!response.ok) throw new Error('BRAIN_LIGHT_LOCAL_HTTP_'+response.status);
  let payload;
  try{payload=await response.json();}catch{throw new Error('BRAIN_LIGHT_LOCAL_RESPONSE_INVALID');}
  const answer=text(payload?.response,'BRAIN_LIGHT_LOCAL_EMPTY',5000);
  return Object.freeze({
    schema:BRAIN_LIGHT_RESULT_SCHEMA,
    specialist:d.executor?.id??'specialist.light',
    kind:'LOCAL_ADVISORY',
    text:answer,
    sources:Object.freeze([]),
    model:String(payload?.model??ollamaModel),
    local:true,
    costClass:'ZERO',
    verification:Object.freeze({status:'BOUNDED_LOCAL_RESPONSE_PASS',sourceCount:0}),
    readOnlyWorkPerformed:true,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  });
}


export async function warmLocalAdvisory({
  ollamaEndpoint='http://127.0.0.1:11434',
  ollamaModel='llama3.2:latest',
  fetchImpl=fetch,
  timeoutMs=35000,
}={}){
  let response;
  const started=performance.now();
  try{
    response=await fetchImpl(ollamaEndpoint.replace(/\/$/,'')+'/api/generate',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({
        model:ollamaModel,
        prompt:'.',
        stream:false,
        keep_alive:'2h',
        options:{temperature:0,num_predict:1},
      }),
      signal:AbortSignal.timeout(timeoutMs),
    });
  }catch(error){
    return Object.freeze({
      schema:'othrys.os.brain-light-warmup.v1',
      ok:false,
      model:ollamaModel,
      error:error?.name==='TimeoutError'?'TIMEOUT':'UNREACHABLE',
      latencyMs:Math.round((performance.now()-started)*100)/100,
      authorityGranted:false,
      executionStarted:false,
    });
  }
  return Object.freeze({
    schema:'othrys.os.brain-light-warmup.v1',
    ok:response.ok,
    model:ollamaModel,
    httpStatus:response.status,
    latencyMs:Math.round((performance.now()-started)*100)/100,
    authorityGranted:false,
    executionStarted:false,
  });
}
