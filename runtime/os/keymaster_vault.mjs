import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import util from 'node:util';

export const SEALED_MARKER='[KEYMASTER_SEALED]';
const sha=v=>createHash('sha256').update(String(v),'utf8').digest('hex');
const envName=v=>typeof v==='string'&&/^[A-Z][A-Z0-9_]{2,127}$/.test(v)?v:null;

export function discoverKeymasterEnvSource({home=homedir(),override=process.env.OTHRYS_KEYMASTER_ENV_FILE}={}){
  const candidates=[override,join(home,'jarvis','brain','.env')].filter(Boolean);
  const path=candidates.find(p=>existsSync(p))??null;
  return Object.freeze({schema:'othrys.os.keymaster-env-source.v1',sourceId:'central-bootstrap-env',available:Boolean(path),path,pathDigest:path?sha(path):null,readOnly:true,authorityGranted:false,executionStarted:false});
}

export function discoverHubKeymasterManifest({home=homedir()}={}){
  const candidates=[join(home,'Projects','othrys-hub','core','titan','keymaster','data','credentials.json'),join(home,'Projects','othrys-hub-main','core','titan','keymaster','data','credentials.json')];
  const path=candidates.find(p=>existsSync(p))??null;
  return Object.freeze({schema:'othrys.os.keymaster-hub-manifest.v1',available:Boolean(path),path,pathDigest:path?sha(path):null,authorityGranted:false,executionStarted:false});
}

function parseNames(text){
  const names=[];
  for(const line of String(text).split(/\r?\n/)){const m=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);if(m)names.push(m[1]);}
  return [...new Set(names)].sort();
}
export function inventoryKeymasterEnv(source=discoverKeymasterEnvSource()){
  if(!source?.available||!source.path||!existsSync(source.path)) return Object.freeze({schema:'othrys.os.keymaster-secret-inventory.v1',sourceId:source?.sourceId??'central-bootstrap-env',available:false,credentials:[],authorityGranted:false,executionStarted:false});
  const envText=readFileSync(source.path,'utf8'), presentNames=new Set(parseNames(envText));
  const hub=source.sourceId==='central-bootstrap-env'?discoverHubKeymasterManifest():Object.freeze({available:false,pathDigest:null}); let names=[];
  if(hub.available){try{const doc=JSON.parse(readFileSync(hub.path,'utf8').replace(/^\uFEFF/,''));names=(doc.records??[]).map(r=>typeof r?.secretReference==='string'&&r.secretReference.startsWith('env:')?r.secretReference.slice(4):null).filter(Boolean);}catch{}}
  if(!names.length) names=[...presentNames].filter(n=>/(API_KEY|TOKEN|SECRET|PASSWORD|KEY)$/.test(n));
  const credentials=[...new Set(names)].sort().map(name=>Object.freeze({envVar:name,present:presentNames.has(name),sourceId:source.sourceId,registrySource:hub.available?'HUB_KEYMASTER':'ENV_DISCOVERY',health:presentNames.has(name)?'configured-unverified':'absent'}));
  return Object.freeze({schema:'othrys.os.keymaster-secret-inventory.v1',sourceId:source.sourceId,registrySource:hub.available?'HUB_KEYMASTER':'ENV_DISCOVERY',hubManifestDigest:hub.pathDigest??null,available:true,credentialCount:credentials.length,credentials:Object.freeze(credentials),secretValuesExposed:false,authorityGranted:false,executionStarted:false});
}

function findRaw(text,name){
  const rx=new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*=\\s*(.*)$`,'m');
  const m=String(text).match(rx); if(!m)return null;
  let value=m[1].trim();
  if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'"))) value=value.slice(1,-1);
  return value||null;
}

export function resolveSealedEnvCredential(source,name,context={}){
  const key=envName(name); if(!key) throw new Error('KEYMASTER_ENV_NAME_INVALID');
  if(context.authorityGranted!==false||context.readOnly!==true||typeof context.consumer!=='string'||!context.consumer.trim()) throw new Error('KEYMASTER_ACCESS_CONTEXT_DENIED');
  if(!source?.available||!source.path||!existsSync(source.path)) return Object.freeze({ok:false,reason:'SOURCE_UNAVAILABLE',audit:{envVar:key,outcome:'denied'}});
  const raw=findRaw(readFileSync(source.path,'utf8'),key); if(!raw)return Object.freeze({ok:false,reason:'SECRET_ABSENT',audit:{envVar:key,outcome:'denied'}});
  const sealed={reference:`env:${key}`,applyToEnv(env,target=key){return {...env,[target]:raw};},applyToHeader(headers,header='authorization',prefix='Bearer '){return {...headers,[header]:`${prefix}${raw}`};},toString:()=>SEALED_MARKER,toJSON:()=>SEALED_MARKER,[util.inspect.custom]:()=>SEALED_MARKER};
  return Object.freeze({ok:true,value:Object.freeze(sealed),audit:Object.freeze({envVar:key,outcome:'allowed',consumer:context.consumer.trim(),secretExposed:false})});
}
