export const MODEL_REQUEST_SCHEMA='othrys.os.model-request.v1';
export const SWITCHYARD_SCHEMA='othrys.os.switchyard-selection.v1';

const TIER=Object.freeze({LIGHT:0,STANDARD:1,HIGH:2});
const COST=Object.freeze({ZERO:0,LOW:1,PAID:2});
const LATENCY=Object.freeze({INTERACTIVE:0,NORMAL:1,BATCH:2});
const PRIVACY=new Set(['LOCAL_ONLY','PROJECT','REMOTE_ALLOWED']);
const LOCALITY=new Set(['LOCAL_REQUIRED','PREFER_LOCAL','ANY']);
const HEALTH=new Set(['HEALTHY','DEGRADED','UNAVAILABLE','UNKNOWN']);
const CERT=new Set(['CERTIFIED','UNTESTED','FAILED','UNSUPPORTED']);
const CANDIDATE_KEYS=['id','label','capabilities','tier','costClass','latencyClass','locality','providerHealth','certification','measuredTrust','paidApprovalRequired','legal'];
const REQUEST_KEYS=['schema','capability','minimumTier','privacy','locality','maxCostClass','maxLatency'];

function exactKeys(value,allowed,code){
  if(!value||typeof value!=='object'||Array.isArray(value)) throw new Error(code);
  const keys=Object.keys(value);
  if(keys.length!==allowed.length||keys.some(k=>!allowed.includes(k))) throw new Error(code);
}
function text(value,code){if(typeof value!=='string'||!value.trim()) throw new Error(code);return value.trim();}
function known(table,value,code){const v=text(value,code);if(!(v in table)) throw new Error(code);return v;}

export function validateModelRequest(request){
  exactKeys(request,REQUEST_KEYS,'INVALID_MODEL_REQUEST_FIELDS');
  if(request.schema!==MODEL_REQUEST_SCHEMA) throw new Error('INVALID_MODEL_REQUEST_SCHEMA');
  const capability=text(request.capability,'INVALID_MODEL_CAPABILITY');
  const minimumTier=known(TIER,request.minimumTier,'INVALID_MODEL_TIER');
  const privacy=text(request.privacy,'INVALID_MODEL_PRIVACY'); if(!PRIVACY.has(privacy)) throw new Error('INVALID_MODEL_PRIVACY');
  const locality=text(request.locality,'INVALID_MODEL_LOCALITY'); if(!LOCALITY.has(locality)) throw new Error('INVALID_MODEL_LOCALITY');
  const maxCostClass=known(COST,request.maxCostClass,'INVALID_MODEL_COST');
  const maxLatency=known(LATENCY,request.maxLatency,'INVALID_MODEL_LATENCY');
  return Object.freeze({schema:MODEL_REQUEST_SCHEMA,capability,minimumTier,privacy,locality,maxCostClass,maxLatency});
}
export function validateSwitchyardCandidate(candidate){
  exactKeys(candidate,CANDIDATE_KEYS,'INVALID_SWITCHYARD_CANDIDATE_FIELDS');
  const id=text(candidate.id,'INVALID_CANDIDATE_ID'),label=text(candidate.label,'INVALID_CANDIDATE_LABEL');
  if(!Array.isArray(candidate.capabilities)||candidate.capabilities.length===0||candidate.capabilities.some(x=>typeof x!=='string'||!x.trim())) throw new Error('INVALID_CANDIDATE_CAPABILITIES');
  const tier=known(TIER,candidate.tier,'INVALID_CANDIDATE_TIER');
  const costClass=known(COST,candidate.costClass,'INVALID_CANDIDATE_COST');
  const latencyClass=known(LATENCY,candidate.latencyClass,'INVALID_CANDIDATE_LATENCY');
  if(!['LOCAL','REMOTE'].includes(candidate.locality)) throw new Error('INVALID_CANDIDATE_LOCALITY');
  if(!HEALTH.has(candidate.providerHealth)) throw new Error('INVALID_CANDIDATE_HEALTH');
  if(!CERT.has(candidate.certification)) throw new Error('INVALID_CANDIDATE_CERTIFICATION');
  if(candidate.measuredTrust!==null&&(typeof candidate.measuredTrust!=='number'||candidate.measuredTrust<0||candidate.measuredTrust>1)) throw new Error('INVALID_CANDIDATE_TRUST');
  if(typeof candidate.paidApprovalRequired!=='boolean'||typeof candidate.legal!=='boolean') throw new Error('INVALID_CANDIDATE_FLAGS');
  return Object.freeze({...candidate,id,label,tier,costClass,latencyClass,capabilities:Object.freeze([...candidate.capabilities])});
}

function rejectionReason(request,c){
  if(c.legal!==true) return 'NOT_PREDECLARED_LEGAL';
  if(!c.capabilities.includes(request.capability)) return 'CAPABILITY_MISMATCH';
  if(TIER[c.tier]<TIER[request.minimumTier]) return 'TIER_BELOW_MINIMUM';
  if(c.providerHealth!=='HEALTHY') return `PROVIDER_${c.providerHealth}`;
  if(request.capability.startsWith('engineering.')&&c.certification!=='CERTIFIED') return `ENGINEERING_${c.certification}`;
  if(c.certification==='FAILED'||c.certification==='UNSUPPORTED') return `CERTIFICATION_${c.certification}`;
  if(request.privacy==='LOCAL_ONLY'&&c.locality!=='LOCAL') return 'PRIVACY_LOCAL_ONLY';
  if(request.locality==='LOCAL_REQUIRED'&&c.locality!=='LOCAL') return 'LOCALITY_REQUIRED';
  if(COST[c.costClass]>COST[request.maxCostClass]) return 'COST_ABOVE_MAXIMUM';
  if(LATENCY[c.latencyClass]>LATENCY[request.maxLatency]) return 'LATENCY_ABOVE_MAXIMUM';
  return null;
}
export function selectSwitchyardRoute(requestRaw,candidatesRaw){
  const request=validateModelRequest(requestRaw);
  if(!Array.isArray(candidatesRaw)||candidatesRaw.length===0) throw new Error('SWITCHYARD_CANDIDATES_REQUIRED');
  const candidates=candidatesRaw.map(validateSwitchyardCandidate);
  if(new Set(candidates.map(x=>x.id)).size!==candidates.length) throw new Error('SWITCHYARD_CANDIDATE_DUPLICATE');
  const rejections={},eligible=[];
  for(const c of candidates){
    const reason=rejectionReason(request,c);
    if(reason) rejections[c.id]=reason; else eligible.push(c);
  }
  const ranked=[...eligible].sort((a,b)=>
    COST[a.costClass]-COST[b.costClass] ||
    TIER[a.tier]-TIER[b.tier] ||
    (a.locality==='LOCAL'?0:1)-(b.locality==='LOCAL'?0:1) ||
    (b.measuredTrust??-1)-(a.measuredTrust??-1) ||
    a.id.localeCompare(b.id)
  );
  if(!ranked.length) return Object.freeze({schema:SWITCHYARD_SCHEMA,outcome:'NO_LEGAL_CANDIDATE',request,selected:null,
    eligible:[],rejections,paidApprovalRequired:false,authorityGranted:false,executionStarted:false});
  const winner=ranked[0];
  for(const c of ranked.slice(1)){
    if(COST[c.costClass]>COST[winner.costClass]) rejections[c.id]='MORE_EXPENSIVE_THAN_SELECTED';
    else if(TIER[c.tier]>TIER[winner.tier]) rejections[c.id]='HIGHER_TIER_THAN_NEEDED';
    else if(c.locality!==winner.locality&&winner.locality==='LOCAL') rejections[c.id]='LOCAL_TIE_BREAK';
    else if(c.measuredTrust!==null&&winner.measuredTrust!==null&&c.measuredTrust<winner.measuredTrust) rejections[c.id]='LOWER_MEASURED_TASK_TRUST';
    else rejections[c.id]='DETERMINISTIC_ID_TIE_BREAK';
  }
  const paid=winner.costClass==='PAID'||winner.paidApprovalRequired===true;
  return Object.freeze({schema:SWITCHYARD_SCHEMA,outcome:paid?'APPROVAL_REQUIRED':'SELECTED',request,
    selected:paid?null:winner,approvalCandidate:paid?winner:null,eligible:ranked.map(x=>x.id),rejections,
    paidApprovalRequired:paid,authorityGranted:false,executionStarted:false});
}
