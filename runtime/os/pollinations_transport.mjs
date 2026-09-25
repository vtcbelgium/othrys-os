import { createHash } from 'node:crypto';

export const POLLINATIONS_BASE_URL='https://gen.pollinations.ai/v1';
export const POLLINATIONS_MODELS_URL=POLLINATIONS_BASE_URL+'/models';
export const POLLINATIONS_CHAT_URL=POLLINATIONS_BASE_URL+'/chat/completions';
export const POLLINATIONS_MAX_ESTIMATED_POLLEN_PER_CALL=0.001;

const sha=value=>createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');
const clean=value=>typeof value==='string'?value.trim():'';
const num=value=>{
  const n=Number(value);
  return Number.isFinite(n)&&n>=0?n:null;
};

function assertSealedCredential(value){
  if(!value||typeof value.applyToHeader!=='function'){
    throw new Error('POLLINATIONS_SEALED_CREDENTIAL_REQUIRED');
  }
  return value;
}

function sanitizePricing(raw={},{community=false,paidOnly=false}={}){
  const numeric=Object.entries(raw)
    .filter(([key,value])=>key!=='currency'&&value!==null&&value!==''&&Number.isFinite(Number(value)))
    .map(([key,value])=>Object.freeze({key,value:Number(value)}));
  const hasPositiveValue=numeric.some(row=>row.value>0);
  const allDeclaredZero=numeric.length>0&&numeric.every(row=>row.value===0);
  const blankCommunityFree=community&&!paidOnly&&numeric.length===0;
  return Object.freeze({
    currency:clean(raw.currency)||'pollen',
    promptTextTokens:num(raw.promptTextTokens),
    completionTextTokens:num(raw.completionTextTokens),
    declaredNumericCount:numeric.length,
    hasPositiveValue,
    allDeclaredZero,
    blankCommunityFree,
    strictFree:!paidOnly&&!hasPositiveValue&&(blankCommunityFree||allDeclaredZero),
  });
}
function sanitizeModel(raw){
  const id=clean(raw?.id);
  if(!id) throw new Error('POLLINATIONS_MODEL_INVALID');
  const aliases=Array.isArray(raw?.aliases)
    ? raw.aliases.map(clean).filter(Boolean).slice(0,20)
    : [];
  const community=raw?.community===true||id.startsWith('community/');
  const paidOnly=raw?.paid_only===true;
  return Object.freeze({
    id,
    aliases:Object.freeze(aliases),
    category:clean(raw?.category)||'text',
    ownedBy:clean(raw?.owned_by)||null,
    community,
    paidOnly,
    pricing:sanitizePricing(raw?.pricing,{community,paidOnly}),
  });
}

function isTextModel(model){
  return !model.category||model.category==='text';
}

function hasKnownPricing(model){
  return model.pricing.promptTextTokens!==null&&
    model.pricing.completionTextTokens!==null;
}

function isStrictFreeModel(model){
  return model?.pricing?.strictFree===true;
}

function unitCost(model){
  if(isStrictFreeModel(model)) return 0;
  if(!hasKnownPricing(model)) return Number.POSITIVE_INFINITY;
  return model.pricing.promptTextTokens+model.pricing.completionTextTokens;
}

export function selectPollinationsAdvisoryModel(models,{preferredModel=null}={}){
  if(!Array.isArray(models)||!models.length){
    throw new Error('POLLINATIONS_NO_MODELS_AVAILABLE');
  }
  const textModels=models.filter(isTextModel).filter(isStrictFreeModel);
  if(!textModels.length) throw new Error('POLLINATIONS_NO_FREE_TEXT_MODEL');
  if(preferredModel){
    const wanted=clean(preferredModel);
    const exact=textModels.find(model=>
      model.id===wanted||model.aliases.includes(wanted)
    );
    if(!exact) throw new Error('POLLINATIONS_PREFERRED_FREE_MODEL_UNAVAILABLE');
    return exact;
  }
  return [...textModels].sort((a,b)=>a.id.localeCompare(b.id))[0];
}

export function estimatePollinationsPollen({
  model,
  promptChars,
  maxOutputTokens=160,
}={}){
  if(!model) throw new Error('POLLINATIONS_PRICING_REQUIRED');
  if(!Number.isInteger(promptChars)||promptChars<0) throw new Error('POLLINATIONS_PROMPT_SIZE_INVALID');
  if(!Number.isInteger(maxOutputTokens)||maxOutputTokens<1) throw new Error('POLLINATIONS_OUTPUT_BUDGET_INVALID');
  const estimatedInputTokens=Math.ceil((promptChars/3)*1.35);
  if(isStrictFreeModel(model)){
    return Object.freeze({
      schema:'othrys.os.pollinations-cost-guard.v1',
      model:model.id,
      estimatedInputTokens,
      maxOutputTokens,
      estimatedMaxPollen:0,
      strictFree:true,
      authorityGranted:false,
      executionStarted:false,
    });
  }
  if(!hasKnownPricing(model)) throw new Error('POLLINATIONS_PRICING_REQUIRED');
  const estimatedMaxPollen=
    estimatedInputTokens*model.pricing.promptTextTokens+
    maxOutputTokens*model.pricing.completionTextTokens;
  return Object.freeze({
    schema:'othrys.os.pollinations-cost-guard.v1',
    model:model.id,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedMaxPollen,
    authorityGranted:false,
    executionStarted:false,
  });
}

export async function discoverPollinationsModels({
  sealedCredential,
  fetchImpl=fetch,
  timeoutMs=10000,
}={}){
  const sealed=assertSealedCredential(sealedCredential);
  const headers=sealed.applyToHeader(
    {'accept':'application/json'},
    'authorization',
    'Bearer ',
  );
  let response;
  try{
    response=await fetchImpl(POLLINATIONS_MODELS_URL,{
      method:'GET',
      headers,
      redirect:'error',
      signal:AbortSignal.timeout(timeoutMs),
    });
  }catch(error){
    throw new Error(error?.name==='TimeoutError'
      ?'POLLINATIONS_MODELS_TIMEOUT'
      :'POLLINATIONS_MODELS_UNREACHABLE');
  }
  if(!response.ok) throw new Error('POLLINATIONS_MODELS_HTTP_'+response.status);
  let payload;
  try{payload=await response.json();}catch{throw new Error('POLLINATIONS_MODELS_INVALID_JSON');}
  const rows=Array.isArray(payload?.data)?payload.data:[];
  const models=rows.map(sanitizeModel).filter(isTextModel);
  return Object.freeze({
    schema:'othrys.os.pollinations-model-inventory.v1',
    provider:'POLLINATIONS',
    modelCount:models.length,
    models:Object.freeze(models),
    bodyPersisted:false,
    secretExposed:false,
    authorityGranted:false,
    executionStarted:false,
  });
}

function stripReasoningEnvelope(value){
  let out=clean(value);
  out=out.replace(/<think>[\s\S]*?<\/think>/gi,'').trim();
  if(out.startsWith('```')&&out.endsWith('```')){
    out=out.replace(/^```(?:text|markdown)?\s*/i,'').replace(/\s*```$/,'').trim();
  }
  return out;
}

function usageSummary(raw){
  if(!raw||typeof raw!=='object') return null;
  return Object.freeze({
    promptTokens:Number.isFinite(Number(raw.prompt_tokens))?Number(raw.prompt_tokens):null,
    completionTokens:Number.isFinite(Number(raw.completion_tokens))?Number(raw.completion_tokens):null,
    totalTokens:Number.isFinite(Number(raw.total_tokens))?Number(raw.total_tokens):null,
  });
}

export async function evaluatePollinationsAdvisory({
  sealedCredential,
  prompt,
  context='',
  preferredModel=null,
  models=null,
  fetchImpl=fetch,
  timeoutMs=30000,
  maxOutputTokens=160,
  maxEstimatedPollen=POLLINATIONS_MAX_ESTIMATED_POLLEN_PER_CALL,
}={}){
  const question=clean(prompt);
  const evidence=clean(context);
  if(!question||question.length>2000) throw new Error('POLLINATIONS_PROMPT_INVALID');
  if(evidence.length>14000) throw new Error('POLLINATIONS_CONTEXT_INVALID');
  const inventory=models
    ? {models}
    : await discoverPollinationsModels({sealedCredential,fetchImpl,timeoutMs:Math.min(timeoutMs,10000)});
  const model=selectPollinationsAdvisoryModel(inventory.models,{preferredModel});
  const userContent=[
    'QUESTION:',
    question,
    evidence?'':'',
    evidence?'BOUNDED EVIDENCE:':'',
    evidence,
  ].filter(Boolean).join('\n');
  const guard=estimatePollinationsPollen({
    model,
    promptChars:userContent.length,
    maxOutputTokens,
  });
  if(guard.estimatedMaxPollen>maxEstimatedPollen){
    throw new Error('POLLINATIONS_POLLEN_BUDGET_EXCEEDED');
  }
  const sealed=assertSealedCredential(sealedCredential);
  const headers=sealed.applyToHeader(
    {'content-type':'application/json','accept':'application/json'},
    'authorization',
    'Bearer ',
  );
  const body={
    model:model.id,
    messages:[
      {role:'system',content:[
        'You are the OTHRYS read-only LIGHT advisory specialist.',
        'Use only explicit facts from BOUNDED EVIDENCE when evidence is supplied.',
        'Do not claim you changed files, systems, credentials, deployments, or accounts.',
        'If evidence is insufficient, say unknown.',
        'Answer in at most three short factual sentences and do not reveal hidden reasoning.'
      ].join(' ')},
      {role:'user',content:userContent},
    ],
    temperature:0,
    max_tokens:maxOutputTokens,
  };
  let response;
  try{
    response=await fetchImpl(POLLINATIONS_CHAT_URL,{
      method:'POST',
      headers,
      body:JSON.stringify(body),
      redirect:'error',
      signal:AbortSignal.timeout(timeoutMs),
    });
  }catch(error){
    throw new Error(error?.name==='TimeoutError'
      ?'POLLINATIONS_CHAT_TIMEOUT'
      :'POLLINATIONS_CHAT_UNREACHABLE');
  }
  if(!response.ok) throw new Error('POLLINATIONS_CHAT_HTTP_'+response.status);
  let payload;
  try{payload=await response.json();}catch{throw new Error('POLLINATIONS_CHAT_INVALID_JSON');}
  const answer=stripReasoningEnvelope(payload?.choices?.[0]?.message?.content);
  if(!answer) throw new Error('POLLINATIONS_CHAT_EMPTY');
  const resolvedModel=clean(payload?.model)||model.id;
  const result={
    schema:'othrys.os.pollinations-advisory.v1',
    provider:'POLLINATIONS',
    requestedModel:model.id,
    resolvedModel,
    text:answer.slice(0,4000),
    usage:usageSummary(payload?.usage),
    estimatedMaxPollen:guard.estimatedMaxPollen,
    costClass:unitCost(model)===0?'ZERO':'BOUNDED_POLLEN',
    local:false,
    bodyPersisted:false,
    secretExposed:false,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
  return Object.freeze({...result,observationDigest:sha(result)});
}
