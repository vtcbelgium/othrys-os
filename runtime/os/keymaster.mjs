import { createHash } from 'node:crypto';

export const KEYMASTER_HEALTH_STATES=Object.freeze(['healthy','configured-unverified','validation-unavailable','invalid','expired','revoked','quota-low','quota-exhausted','rate-limited','account-action-required','permission-insufficient','provider-degraded','project-paused','missing','disabled','rotation-due','unknown']);
export const KEYMASTER_ACTION_REQUIRED=Object.freeze(['invalid','expired','revoked','quota-exhausted','account-action-required','permission-insufficient','project-paused','missing','rotation-due']);
const CATEGORIES=new Set(['ai-provider','search-retrieval','repository-cicd','database','hosting','infrastructure','storage','messaging','monitoring','payments','other']);
const RISKS=new Set(['critical','high','standard','low']);
const FORBIDDEN_KEYS=new Set(['secret','secretvalue','value','apikey','token','tokens','password','passwd','key','keys','credential','credentials','authorization','bearer','connectionstring','accesstoken','refreshtoken','sessiontoken','clientsecret','privatekey','auth','xapikey','secretreference']);
const clean=v=>typeof v==='string'?v.trim():'';
const normalized=k=>String(k).toLowerCase().replace(/[_-]/g,'');
const sha=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
function base(body){return Object.freeze({...body,authorityGranted:false,executionStarted:false});}

export function looksSecretShaped(s){
  if(typeof s!=='string') return false;
  if(/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(s)||/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/.test(s)||/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{6,}/.test(s)) return true;
  if(/\b(sk-proj|sk|pk|rk|nvapi|xai|gsk|ghp|gho|ghs|ghr|glpat|glsa|xox[baprs]|dop_v1|shpat|tvly|AKIA|AIza|ASIA|SG)[-_]?[A-Za-z0-9]{10,}/.test(s)||/\bhf_[A-Za-z0-9]{10,}/.test(s)) return true;
  for(const run of s.match(/[A-Za-z0-9+/=_-]{20,}/g)??[]){const d=/\d/.test(run),u=/[A-Z]/.test(run),l=/[a-z]/.test(run); if((run.length>=20&&d&&u&&l)||(run.length>=32&&d&&(u||l))) return true;}
  return false;
}
function assertNoSecretFields(value,path='root'){
  if(Array.isArray(value)){value.forEach((v,i)=>assertNoSecretFields(v,`${path}[${i}]`));return;}
  if(!value||typeof value!=='object') return;
  for(const [k,v] of Object.entries(value)){
    if(FORBIDDEN_KEYS.has(normalized(k))) throw new Error(`KEYMASTER_SECRET_FIELD_FORBIDDEN:${path}.${k}`);
    if(typeof v==='string'&&looksSecretShaped(v)) throw new Error(`KEYMASTER_SECRET_VALUE_FORBIDDEN:${path}.${k}`);
    assertNoSecretFields(v,`${path}.${k}`);
  }
}

export function validateCredentialMetadata(raw){
  assertNoSecretFields(raw);
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) throw new Error('KEYMASTER_RECORD_INVALID');
  const id=clean(raw.credentialId),serviceId=clean(raw.serviceId),provider=clean(raw.provider),category=clean(raw.category),owner=clean(raw.owner),risk=clean(raw.impactLevel),health=clean(raw.healthStatus);
  if(!/^[a-z][a-z0-9-]*$/.test(id)||!serviceId||!provider||!owner||!CATEGORIES.has(category)||!RISKS.has(risk)||!KEYMASTER_HEALTH_STATES.includes(health)||typeof raw.configured!=='boolean'||typeof raw.enabled!=='boolean') throw new Error('KEYMASTER_RECORD_INVALID');
  for(const a of ['capabilityGrants','dependencies']) if(raw[a]!==undefined&&(!Array.isArray(raw[a])||raw[a].some(x=>!clean(x)))) throw new Error(`KEYMASTER_RECORD_${a.toUpperCase()}_INVALID`);
  const body={schema:'othrys.os.keymaster-credential-metadata.v1',credentialId:id,serviceId,provider,category,owner,impactLevel:risk,configured:raw.configured,enabled:raw.enabled,healthStatus:health,lastCheckedAt:raw.lastCheckedAt??null,expiresAt:raw.expiresAt??null,rotationDueAt:raw.rotationDueAt??null,capabilityGrants:Object.freeze([...(raw.capabilityGrants??[])]),dependencies:Object.freeze([...(raw.dependencies??[])])};
  assertNoSecretFields(body);
  return base({...body,recordDigest:sha(body)});
}
export function classifyCredentialHealth(signal){
  if(!signal||typeof signal!=='object'||typeof signal.present!=='boolean'||typeof signal.enabled!=='boolean'||!clean(signal.now)||Number.isNaN(Date.parse(signal.now))) throw new Error('KEYMASTER_SIGNAL_INVALID');
  if(signal.code!==undefined&&(!/^[a-z0-9-]{1,48}$/.test(String(signal.code)))) throw new Error('KEYMASTER_SIGNAL_CODE_INVALID');
  if(!signal.present)return 'missing'; if(!signal.enabled)return 'disabled';
  const codes={'network-error':'validation-unavailable','timeout':'validation-unavailable','keyless-endpoint':'configured-unverified','unsupported-validation':'validation-unavailable','billing-required':'account-action-required','onboarding-required':'account-action-required','project-paused':'project-paused','revoked':'revoked','expired':'expired'};
  if(Object.prototype.hasOwnProperty.call(codes,signal.code)) return codes[signal.code];
  if(typeof signal.expiresAt==='string'&&signal.expiresAt<=signal.now)return 'expired';
  if(typeof signal.rotationDueAt==='string'&&signal.rotationDueAt<=signal.now)return 'rotation-due';
  const s=signal.httpStatus;
  if(s===null)return 'configured-unverified'; if(!Number.isInteger(s))throw new Error('KEYMASTER_SIGNAL_STATUS_INVALID');
  if((s>=200&&s<300)||s===400||s===422)return 'healthy'; if(s===401)return 'invalid'; if(s===403)return 'permission-insufficient'; if(s===402||s===412)return 'account-action-required'; if(s===404)return 'project-paused'; if(s===429)return 'rate-limited'; if(s>=500&&s<600)return 'provider-degraded'; return 'unknown';
}

export function validationPolicyForRisk(risk){
  if(!RISKS.has(risk)) throw new Error('KEYMASTER_RISK_INVALID');
  const map={critical:{cadenceHours:6,maxRetries:1,notify:'urgent-operator'},high:{cadenceHours:12,maxRetries:2,notify:'operator'},standard:{cadenceHours:24,maxRetries:2,notify:'operator'},low:{cadenceHours:72,maxRetries:1,notify:'silent'}};
  return base({schema:'othrys.os.keymaster-validation-policy.v1',risk,...map[risk],readOnly:true,billableValidationForbidden:true,schedulerOwned:false});
}
export function projectCredentialHealth(records,{generatedAt}={}){
  if(!Array.isArray(records)||Number.isNaN(Date.parse(generatedAt))) throw new Error('KEYMASTER_HEALTH_PROJECTION_INVALID');
  const rows=records.map(validateCredentialMetadata), action=rows.filter(r=>KEYMASTER_ACTION_REQUIRED.includes(r.healthStatus));
  const critical=action.some(r=>r.impactLevel==='critical');
  const globalStatus=critical?'critical-failure':action.length?'needs-attention':'all-healthy';
  const counts={healthy:rows.filter(r=>r.healthStatus==='healthy').length,needsAttention:action.length,total:rows.length};
  const body={schema:'othrys.os.keymaster-health-projection.v1',generatedAt,globalStatus,counts:Object.freeze(counts),statuses:Object.freeze(rows.map(r=>Object.freeze({credentialId:r.credentialId,provider:r.provider,category:r.category,healthStatus:r.healthStatus,impactLevel:r.impactLevel,affectedCapabilities:r.capabilityGrants,actionRequired:KEYMASTER_ACTION_REQUIRED.includes(r.healthStatus)}))),secretsExposed:false};
  assertNoSecretFields(body); return base({...body,projectionDigest:sha(body)});
}

export function createCredentialRemediationProposal(record,{requestedAt}={}){
  const r=validateCredentialMetadata(record); requestedAt=clean(requestedAt);
  if(Number.isNaN(Date.parse(requestedAt))||!KEYMASTER_ACTION_REQUIRED.includes(r.healthStatus)) throw new Error('KEYMASTER_REMEDIATION_NOT_REQUIRED');
  const body={schema:'othrys.os.keymaster-remediation-proposal.v1',credentialId:r.credentialId,serviceId:r.serviceId,healthStatus:r.healthStatus,impactLevel:r.impactLevel,requestedAt,affectedCapabilities:r.capabilityGrants,actionClass:r.healthStatus==='rotation-due'?'ROTATE_REVIEW':r.healthStatus==='missing'?'CONFIGURE_REVIEW':'REPAIR_CREDENTIAL_REVIEW',requiresTrustCanal:true,providerMutation:false,secretAccess:false};
  assertNoSecretFields(body); return base({...body,proposalDigest:sha(body)});
}
