import { createHash } from 'node:crypto';
export const CAPABILITY_REGISTRY_SCHEMA='othrys.os.capability-registry.v1';
const READINESS=new Set(['UNVERIFIED','READY','LIMITED','DISABLED']);
const HEALTH=new Set(['UNKNOWN','HEALTHY','DEGRADED','DOWN']);
const LIFECYCLE=new Set(['PROPOSED','ACTIVE','DEPRECATED','SUPERSEDED','RETIRED']);
const SECRET=/secret|password|token|api[_-]?key|credentialValue/i;
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const text=(v,code)=>{if(typeof v!=='string'||!v.trim())throw new Error(code);return v.trim();};
function secretFree(v,path='record'){
  if(Array.isArray(v))return v.forEach((x,i)=>secretFree(x,`${path}[${i}]`));
  if(!v||typeof v!=='object')return;
  for(const [k,x] of Object.entries(v)){if(SECRET.test(k)&&x!==false&&x!==null&&x!=='REDACTED'&&x!=='REFERENCE_ONLY')throw new Error(`CAPABILITY_SECRET_FIELD:${path}.${k}`);secretFree(x,`${path}.${k}`);}
}
export function normalizeCapabilityRecord(raw,{now}={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('CAPABILITY_RECORD_REQUIRED');secretFree(raw);
  const record={id:text(raw.id,'CAPABILITY_ID_REQUIRED'),name:text(raw.name??raw.id,'CAPABILITY_NAME_REQUIRED'),provider:text(raw.provider??'internal','CAPABILITY_PROVIDER_REQUIRED'),category:text(raw.category,'CAPABILITY_CATEGORY_REQUIRED'),features:Object.freeze([...(raw.features??[])].map(String).sort()),freeTier:raw.freeTier===true,credentialEnv:raw.credentialEnv?text(raw.credentialEnv,'CAPABILITY_ENV_INVALID'):null,maxCost:Math.max(0,Number(raw.maxCost??0)),readiness:String(raw.readiness??'UNVERIFIED').toUpperCase(),health:String(raw.health??'UNKNOWN').toUpperCase(),lifecycle:String(raw.lifecycle??'PROPOSED').toUpperCase(),lastVerifiedAt:raw.lastVerifiedAt??null,updatedAt:text(now??raw.updatedAt??raw.asOf,'CAPABILITY_TIME_REQUIRED'),sourceRefs:Object.freeze([...(raw.sourceRefs??[])].map(String).sort())};
  if(!READINESS.has(record.readiness)||!HEALTH.has(record.health)||!LIFECYCLE.has(record.lifecycle))throw new Error('CAPABILITY_STATE_INVALID');
  return Object.freeze({...record,recordDigest:sha(record),secretValuesExposed:false});
}
export function createCapabilityRegistry(seed=[],deps={}){
  const now=deps.now??(()=>new Date().toISOString()),records=new Map(),history=[];
  const emit=(type,id,actor,detail={})=>{const fact=Object.freeze({schema:'othrys.os.capability-fact.v1',type,capabilityId:id,actor,at:now(),detail:Object.freeze({...detail}),authorityGranted:false,executionStarted:false});history.push(fact);return fact;};
  const put=(raw,actor='prometheus')=>{const record=normalizeCapabilityRecord(raw,{now:now()});const existed=records.has(record.id);records.set(record.id,record);return Object.freeze({outcome:existed?'UPDATED':'CREATED',record,event:emit(existed?'CapabilityUpdated':'CapabilityCreated',record.id,actor)});};
  for(const x of seed)put(x,'bootstrap');
  const certify=(id,{readiness,health,at=now(),actor='keymaster'}={})=>{const cur=records.get(id);if(!cur)return Object.freeze({outcome:'NOT_FOUND'});const next=normalizeCapabilityRecord({...cur,readiness,health,lastVerifiedAt:at,lifecycle:cur.lifecycle==='PROPOSED'?'ACTIVE':cur.lifecycle,updatedAt:at},{now:at});records.set(id,next);return Object.freeze({outcome:'CERTIFIED',record:next,event:emit('CapabilityVerified',id,actor,{readiness:next.readiness,health:next.health})});};
  const disable=(id,reason='operator-or-health')=>{const cur=records.get(id);if(!cur)return Object.freeze({outcome:'NOT_FOUND'});const at=now();const next=normalizeCapabilityRecord({...cur,readiness:'DISABLED',updatedAt:at},{now:at});records.set(id,next);return Object.freeze({outcome:'DISABLED',record:next,event:emit('CapabilityDisabled',id,'keymaster',{reason})});};
  const search=(q={})=>[...records.values()].filter(r=>(!q.category||r.category===q.category)&&(!q.provider||r.provider===q.provider)&&(!q.feature||r.features.includes(q.feature))&&(!q.readiness||r.readiness===q.readiness)&&(!q.health||r.health===q.health)&&(!q.freeOnly||r.freeTier===true)).sort((a,b)=>a.id.localeCompare(b.id));
  return Object.freeze({schema:CAPABILITY_REGISTRY_SCHEMA,put,certify,disable,get:id=>records.get(id)??null,all:()=>Object.freeze([...records.values()].sort((a,b)=>a.id.localeCompare(b.id))),search,history:()=>Object.freeze([...history]),summary:()=>Object.freeze({total:records.size,ready:search({readiness:'READY'}).length,healthy:search({health:'HEALTHY'}).length,disabled:search({readiness:'DISABLED'}).length,authorityGranted:false,executionStarted:false}),authorityGranted:false,executionStarted:false});
}