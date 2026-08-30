export const CREDENTIAL_BROKER_SCHEMA='othrys.os.credential-broker.v1';
const text=(v,c)=>{if(typeof v!=='string'||!v.trim())throw new Error(c);return v.trim();};
export function draftCapabilityGrant(raw){
  return Object.freeze({grantId:text(raw.grantId,'GRANT_ID_REQUIRED'),consumer:text(raw.consumer,'GRANT_CONSUMER_REQUIRED'),provider:text(raw.provider,'GRANT_PROVIDER_REQUIRED'),capabilities:Object.freeze([...(raw.capabilities??[])].map(String)),oros:Object.freeze([...(raw.oros??[])].map(String)),environments:Object.freeze([...(raw.environments??[])].map(String)),enabled:false,maxRequests:raw.maxRequests??null,maxCost:0,expiresAt:raw.expiresAt??null,revokedAt:null});
}
export function evaluateCapabilityGrant(book,request,now){
  const rows=(book??[]).filter(g=>g.consumer===request.consumer&&g.provider===request.provider);
  if(!rows.length)return Object.freeze({allowed:false,code:'NO_GRANT'});
  let code='NO_MATCHING_SCOPE';
  for(const g of rows){
    if(g.revokedAt){code='GRANT_REVOKED';continue;} if(!g.enabled){code='GRANT_DISABLED';continue;}
    if(g.expiresAt&&g.expiresAt<=now){code='GRANT_EXPIRED';continue;}
    if(!g.capabilities.includes(request.capability)){code='CAPABILITY_NOT_GRANTED';continue;}
    if(!g.oros.includes(request.oros)){code='OROS_NOT_GRANTED';continue;}
    if(!g.environments.includes(request.environment)){code='ENVIRONMENT_NOT_GRANTED';continue;}
    return Object.freeze({allowed:true,grant:g});
  }
  return Object.freeze({allowed:false,code});
}
export function decideCredentialUse(request,{registry,grants=[],credentialPresent=false,usage={requests:0,cost:0},now}={}){
  for(const k of ['consumer','provider','capability','oros','environment','purpose']) if(typeof request?.[k]!=='string'||!request[k].trim()) return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'REQUESTER_INVALID',authorityGranted:false,executionStarted:false});
  const provider=registry?.get?.(request.provider)??null;
  if(!provider)return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'PROVIDER_UNKNOWN',authorityGranted:false,executionStarted:false});
  if(provider.readiness==='DISABLED')return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'PROVIDER_DISABLED',authorityGranted:false,executionStarted:false});
  if(provider.health!=='HEALTHY')return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:`PROVIDER_${provider.health}`,authorityGranted:false,executionStarted:false});
  if(!credentialPresent)return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'CREDENTIAL_MISSING',authorityGranted:false,executionStarted:false});
  if(!provider.features.includes(request.capability))return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'CAPABILITY_UNSUPPORTED',authorityGranted:false,executionStarted:false});
  const g=evaluateCapabilityGrant(grants,request,now);if(!g.allowed)return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,...g,authorityGranted:false,executionStarted:false});
  const estimated=Math.max(0,Number(request.estimatedCost??0)), ceiling=Math.min(Number(provider.maxCost??0),Number(g.grant.maxCost??0));
  if(estimated>0&&provider.freeTier===true)return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'PAID_USAGE_FORBIDDEN',authorityGranted:false,executionStarted:false});
  if(Number(usage.cost??0)+estimated>ceiling)return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'COST_CEILING_REACHED',authorityGranted:false,executionStarted:false});
  if(g.grant.maxRequests!==null&&Number(usage.requests??0)+1>g.grant.maxRequests)return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:false,code:'REQUEST_CEILING_REACHED',authorityGranted:false,executionStarted:false});
  return Object.freeze({schema:CREDENTIAL_BROKER_SCHEMA,allowed:true,code:'GRANTED',grantId:g.grant.grantId,costCeiling:ceiling,secretExposed:false,authorityGranted:false,executionStarted:false});
}
