export class JevRemoteRouterError extends Error {
  constructor(code){super(code);this.code=code;this.name='JevRemoteRouterError';}
}

function text(value,code){
  if(typeof value!=='string'||!value.trim()) throw new JevRemoteRouterError(code);
  return value.trim();
}

function validateObservation(value){
  if(!value||value.schema!=='othrys.os.jev-observation.v1') throw new JevRemoteRouterError('REMOTE_BRAIN_OBSERVATION_INVALID');
  if(value.mode!=='TRAINING'||value.circuitId!=='router') throw new JevRemoteRouterError('REMOTE_BRAIN_OBSERVATION_INVALID');
  if(value.authorityGranted!==false||value.actionApplied!==false||value.executionStarted!==false) throw new JevRemoteRouterError('REMOTE_BRAIN_AUTHORITY_INVALID');
  if(!value.answers||typeof value.answers!=='object'||Array.isArray(value.answers)) throw new JevRemoteRouterError('REMOTE_BRAIN_ANSWERS_INVALID');
  return value;
}

export async function evaluateJevViaLegionBridge({
  baseUrl,
  token,
  state,
  model='jev-1.13.0',
  fetchImpl=fetch,
  timeoutMs=20000,
}={}){
  const url=text(baseUrl,'REMOTE_BRAIN_URL_REQUIRED').replace(/\/$/,'')+'/brain/router';
  const auth=text(token,'REMOTE_BRAIN_TOKEN_REQUIRED');
  const bodyState=text(state,'REMOTE_BRAIN_STATE_REQUIRED');
  if(bodyState.length>2000) throw new JevRemoteRouterError('REMOTE_BRAIN_STATE_TOO_LARGE');
  if(!['jev-1.13.0','jev-latest'].includes(model)) throw new JevRemoteRouterError('REMOTE_BRAIN_MODEL_NOT_ADMITTED');

  let response;
  try{
    response=await fetchImpl(url,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({token:auth,state:bodyState,model}),
      signal:AbortSignal.timeout(timeoutMs),
    });
  }catch(error){
    throw new JevRemoteRouterError(error?.name==='TimeoutError'?'REMOTE_BRAIN_TIMEOUT':'REMOTE_BRAIN_UNREACHABLE');
  }

  let payload;
  try{payload=await response.json();}catch{throw new JevRemoteRouterError('REMOTE_BRAIN_RESPONSE_INVALID');}
  if(!response.ok||payload?.ok!==true||!payload?.brain){
    throw new JevRemoteRouterError(String(payload?.error??'REMOTE_BRAIN_REFUSED'));
  }

  const brain=payload.brain;
  if(brain.schema!=='othrys.legion.brain-response.v1'||brain.authorityGranted!==false||brain.executionStarted!==false){
    throw new JevRemoteRouterError('REMOTE_BRAIN_RESPONSE_INVALID');
  }

  return Object.freeze({
    schema:'othrys.os.remote-brain-result.v1',
    observation:validateObservation(brain.observation),
    transport:brain.transport&&typeof brain.transport==='object'?Object.freeze({...brain.transport}):null,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  });
}
