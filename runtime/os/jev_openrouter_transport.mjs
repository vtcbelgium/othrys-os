import { createHash } from 'node:crypto';

export const JEV_OPENROUTER_DECISIONS_URL='https://openrouter.ai/api/alpha/decisions';
export const JEV_OPENROUTER_MAX_USD_PER_CALL=0.00005;
export const JEV_OPENROUTER_INPUT_USD_PER_TOKEN=0.000000042;
export const JEV_OPENROUTER_TOKEN_SAFETY_FACTOR=1.35;

const sha=value=>createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');

function requiredText(value,code){
  if(typeof value!=='string'||!value.trim()) throw new Error(code);
  return value.trim();
}

export function mapOpenRouterJevModel(model){
  const value=requiredText(model,'JEV_OPENROUTER_MODEL_REQUIRED');
  if(value==='jev-1.13.0'||value==='typesafe/jev-1.13') return 'typesafe/jev-1.13';
  if(value==='jev-latest'||value==='~typesafe/jev-latest') return '~typesafe/jev-latest';
  throw new Error('JEV_OPENROUTER_MODEL_NOT_ADMITTED');
}

export function estimateOpenRouterJevCost({
  state,
  questions,
  maxUsd=JEV_OPENROUTER_MAX_USD_PER_CALL,
}={}){
  const stateText=requiredText(state,'JEV_OPENROUTER_STATE_REQUIRED');
  if(!questions||typeof questions!=='object'||Array.isArray(questions)){
    throw new Error('JEV_OPENROUTER_QUESTIONS_REQUIRED');
  }
  const serialized=JSON.stringify({state:stateText,questions});
  const rawTokenEstimate=Math.ceil(serialized.length/3);
  const estimatedInputTokens=Math.ceil(rawTokenEstimate*JEV_OPENROUTER_TOKEN_SAFETY_FACTOR);
  const estimatedUsd=estimatedInputTokens*JEV_OPENROUTER_INPUT_USD_PER_TOKEN;
  const allowed=estimatedUsd<=maxUsd;
  return Object.freeze({
    schema:'othrys.os.jev-openrouter-cost-guard.v1',
    rawTokenEstimate,
    safetyFactor:JEV_OPENROUTER_TOKEN_SAFETY_FACTOR,
    estimatedInputTokens,
    estimatedUsd,
    maxUsd,
    allowed,
    inferenceStarted:false,
    authorityGranted:false,
  });
}

export async function evaluateJevViaOpenRouter({
  sealedCredential,
  model,
  state,
  questions,
  fetchImpl=fetch,
  maxUsd=JEV_OPENROUTER_MAX_USD_PER_CALL,
}={}){
  if(!sealedCredential||typeof sealedCredential.applyToHeader!=='function'){
    throw new Error('JEV_OPENROUTER_SEALED_CREDENTIAL_REQUIRED');
  }
  const mappedModel=mapOpenRouterJevModel(model);
  const guard=estimateOpenRouterJevCost({state,questions,maxUsd});
  if(!guard.allowed) throw new Error('JEV_OPENROUTER_BUDGET_EXCEEDED');

  const headers=sealedCredential.applyToHeader(
    {'content-type':'application/json','accept':'application/json'},
    'authorization',
    'Bearer ',
  );

  const response=await fetchImpl(JEV_OPENROUTER_DECISIONS_URL,{
    method:'POST',
    headers,
    body:JSON.stringify({model:mappedModel,state,questions}),
    redirect:'error',
    signal:AbortSignal.timeout(15000),
  });

  const raw=await response.text();
  if(!response.ok) throw new Error('JEV_OPENROUTER_HTTP_'+response.status);

  let payload;
  try{payload=JSON.parse(raw);}
  catch{throw new Error('JEV_OPENROUTER_INVALID_JSON');}

  if(!payload?.answers||typeof payload.answers!=='object'||Array.isArray(payload.answers)){
    throw new Error('JEV_OPENROUTER_TYPED_ANSWERS_REQUIRED');
  }

  const actualCostUsd=typeof payload?.usage?.cost==='number'
    ? payload.usage.cost
    : Number.isFinite(Number(payload?.usage?.cost))
      ? Number(payload.usage.cost)
      : null;
  const postflightBudgetStatus=actualCostUsd===null
    ? 'UNKNOWN'
    : actualCostUsd<=maxUsd
      ? 'WITHIN_CAP'
      : 'BREACHED';

  const body={
    schema:'othrys.os.jev-openrouter-observation.v1',
    provider:'OPENROUTER',
    requestedModel:model,
    resolvedModel:typeof payload.model==='string'?payload.model:mappedModel,
    answers:Object.freeze({...payload.answers}),
    usage:payload.usage&&typeof payload.usage==='object'?Object.freeze({...payload.usage}):null,
    costGuard:guard,
    actualCostUsd,
    postflightBudgetStatus,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };

  return Object.freeze({...body,observationDigest:sha(body)});
}
