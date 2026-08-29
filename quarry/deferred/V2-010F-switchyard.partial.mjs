const TIER=Object.freeze({LIGHT:0,STANDARD:1,HIGH:2});
const COST=Object.freeze({ZERO:0,LOW:1,PAID:2});
const LATENCY=Object.freeze({INTERACTIVE:0,NORMAL:1,BATCH:2});

export const MODEL_REQUEST_SCHEMA='othrys.os.model-request.v1';

function known(table,value,code){
  if(!(value in table)) throw new Error(code);
  return value;
}
function text(value,code){
  if(typeof value!=='string'||!value.trim()) throw new Error(code);
  return value.trim();
}

export function validateModelRequest(request){
  if(!request||request.schema!==MODEL_REQUEST_SCHEMA) throw new Error('INVALID_MODEL_REQUEST_SCHEMA');
  const capability=text(request.capability,'INVALID_MODEL_CAPABILITY');
  const minimumTier=known(TIER,text(request.minimumTier,'INVALID_MODEL_TIER'),'INVALID_MODEL_TIER');
  const privacy=text(request.privacy,'INVALID_MODEL_PRIVACY');
  if(!['LOCAL_ONLY','PROJECT','REMOTE_ALLOWED'].includes(privacy)) throw new Error('INVALID_MODEL_PRIVACY');
  const locality=text(request.locality,'INVALID_MODEL_LOCALITY');
  if(!['LOCAL_REQUIRED','PREFER_LOCAL','ANY'].includes(locality)) throw new Error('INVALID_MODEL_LOCALITY');
  const maxCostClass=known(COST,text(request.maxCostClass,'INVALID_MODEL_COST'),'INVALID_MODEL_COST');
  const maxLatency=known(LATENCY,text(request.maxLatency,'INVALID_MODEL_LATENCY'),'INVALID_MODEL_LATENCY');
  return Object.freeze({...request,capability,minimumTier,privacy,locality,maxCostClass,maxLatency});
}
