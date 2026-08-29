const clean=v=>typeof v==='string'?v.trim():'';
const base=body=>Object.freeze({...body,authorityGranted:false,executionStarted:false});
function finiteNonNegative(v,label){const n=Number(v);if(!Number.isFinite(n)||n<0)throw new Error(`FREE_CAPACITY_${label}_INVALID`);return n;}

export function createFreeCapacityObservation(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) throw new Error('FREE_CAPACITY_INPUT_INVALID');
  const providerId=clean(raw.providerId),observedAt=clean(raw.observedAt); if(!providerId||!Number.isFinite(Date.parse(observedAt))) throw new Error('FREE_CAPACITY_ID_TIME_INVALID');
  const limitRequests=finiteNonNegative(raw.limitRequests,'REQUEST_LIMIT'),remainingRequests=finiteNonNegative(raw.remainingRequests,'REQUEST_REMAINING');
  const limitTokens=finiteNonNegative(raw.limitTokens,'TOKEN_LIMIT'),remainingTokens=finiteNonNegative(raw.remainingTokens,'TOKEN_REMAINING');
  if(remainingRequests>limitRequests||remainingTokens>limitTokens||limitRequests===0||limitTokens===0) throw new Error('FREE_CAPACITY_RANGE_INVALID');
  const requestFraction=remainingRequests/limitRequests,tokenFraction=remainingTokens/limitTokens,remainingFraction=Math.min(requestFraction,tokenFraction);
  return base({schema:'othrys.os.free-capacity-observation.v1',providerId,observedAt,limitRequests,remainingRequests,limitTokens,remainingTokens,requestFraction,tokenFraction,remainingFraction,resetRequests:raw.resetRequests==null?null:clean(raw.resetRequests),resetTokens:raw.resetTokens==null?null:clean(raw.resetTokens),sourceEvidenceRef:clean(raw.sourceEvidenceRef)||null});
}

export function parseGroqRateLimitHeaders(headers,{providerId='groq-free',observedAt}={}){
  const get=name=>typeof headers?.get==='function'?headers.get(name):headers?.[name]??headers?.[name.toLowerCase()];
  return createFreeCapacityObservation({providerId,observedAt,limitRequests:get('x-ratelimit-limit-requests'),remainingRequests:get('x-ratelimit-remaining-requests'),limitTokens:get('x-ratelimit-limit-tokens'),remainingTokens:get('x-ratelimit-remaining-tokens'),resetRequests:get('x-ratelimit-reset-requests'),resetTokens:get('x-ratelimit-reset-tokens'),sourceEvidenceRef:'groq-rate-limit-headers'});
}

export function assessCapacityFreshness(observation,{now,maxAgeMs=300000}={}){
  if(!observation||observation.schema!=='othrys.os.free-capacity-observation.v1') throw new Error('FREE_CAPACITY_OBSERVATION_REQUIRED');
  const ageMs=Date.parse(clean(now))-Date.parse(observation.observedAt);if(!Number.isFinite(ageMs)||ageMs<0||!Number.isSafeInteger(maxAgeMs)||maxAgeMs<1000)throw new Error('FREE_CAPACITY_FRESHNESS_INVALID');
  return base({schema:'othrys.os.free-capacity-freshness.v1',providerId:observation.providerId,ageMs,fresh:ageMs<=maxAgeMs,remainingFraction:observation.remainingFraction});
}