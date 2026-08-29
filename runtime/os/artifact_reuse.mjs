import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const ARTIFACT_SCHEMA='othrys.os.verified-artifact.v1';
export const REUSE_DECISION_SCHEMA='othrys.os.artifact-reuse-decision.v1';
export const REFUSAL_SCHEMA='othrys.os.artifact-reuse-refusal.v1';
const HEX64=/^[0-9a-f]{64}$/;
const POLICIES=new Set(['SHARE_COMPUTATION','INDEPENDENT_EXECUTION_REQUIRED']);
const sha=value=>createHash('sha256').update(value).digest('hex');
const canonical=value=>JSON.stringify(value,Object.keys(value).sort());
const isHex=value=>typeof value==='string'&&HEX64.test(value);
const clean=value=>String(value??'').trim();

function payloadBytes(payload){
  if(Buffer.isBuffer(payload)) return payload;
  if(typeof payload==='string') return Buffer.from(payload,'utf8');
  return Buffer.from(JSON.stringify(payload),'utf8');
}
function requireHex(value,name){ if(!isHex(value)) throw new Error(`${name}_INVALID`); return value; }

export function createArtifactRecord(fields,payload){
  if(!fields||typeof fields!=='object') throw new Error('ARTIFACT_FIELDS_INVALID');
  const producerId=clean(fields.producerId); if(!producerId) throw new Error('ARTIFACT_PRODUCER_REQUIRED');
  const body={schema:ARTIFACT_SCHEMA,workKey:requireHex(fields.workKey,'ARTIFACT_WORK_KEY'),
    compatibilityDigest:requireHex(fields.compatibilityDigest,'ARTIFACT_COMPATIBILITY'),
    acceptanceDigest:requireHex(fields.acceptanceDigest,'ARTIFACT_ACCEPTANCE'),
    provenanceDigest:requireHex(fields.provenanceDigest,'ARTIFACT_PROVENANCE'),
    freshnessDigest:requireHex(fields.freshnessDigest,'ARTIFACT_FRESHNESS'),
    payloadDigest:sha(payloadBytes(payload)),verifierEvidenceDigest:requireHex(fields.verifierEvidenceDigest,'ARTIFACT_VERIFIER_EVIDENCE'),
    producerId,verified:true,authorityGranted:false,executionStarted:false};
  const artifactId=`ARTIFACT-${sha(canonical(body)).slice(0,24)}`;
  return Object.freeze({...body,artifactId});
}

export function validateArtifactRecord(record){
  if(!record||record.schema!==ARTIFACT_SCHEMA||record.verified!==true) throw new Error('ARTIFACT_RECORD_INVALID');
  for(const key of ['workKey','compatibilityDigest','acceptanceDigest','provenanceDigest','freshnessDigest','payloadDigest','verifierEvidenceDigest']) requireHex(record[key],`ARTIFACT_${key.toUpperCase()}`);
  if(!/^ARTIFACT-[0-9a-f]{24}$/.test(record.artifactId)||!clean(record.producerId)) throw new Error('ARTIFACT_IDENTITY_INVALID');
  if(record.authorityGranted!==false||record.executionStarted!==false) throw new Error('ARTIFACT_AUTHORITY_INVALID');
  const {artifactId,...body}=record;
  if(artifactId!==`ARTIFACT-${sha(canonical(body)).slice(0,24)}`) throw new Error('ARTIFACT_RECORD_DIGEST_MISMATCH');
  return record;
}
function decision(outcome,reason,artifactId=null,refusalId=null){
  return Object.freeze({schema:REUSE_DECISION_SCHEMA,outcome,reason,artifactId,refusalId,authorityGranted:false,executionStarted:false});
}
function refusalIdentity({claimId,artifactId,reason}){
  return `REFUSAL-${sha(JSON.stringify({claimId,artifactId,reason})).slice(0,24)}`;
}
export function createRefusalRecord({claimId,artifactId,reason,evidenceDigest}){
  const c=clean(claimId),a=clean(artifactId),r=clean(reason); if(!c||!a||!r) throw new Error('REFUSAL_FIELDS_INVALID');
  requireHex(evidenceDigest,'REFUSAL_EVIDENCE');
  return Object.freeze({schema:REFUSAL_SCHEMA,refusalId:refusalIdentity({claimId:c,artifactId:a,reason:r}),claimId:c,artifactId:a,reason:r,evidenceDigest,authorityGranted:false});
}
export function evaluateArtifactReuse({claim,artifact,payload,current,refusals=[]}){
  if(!claim||!clean(claim.claimId)||!POLICIES.has(claim.reusePolicy)) throw new Error('REUSE_CLAIM_INVALID');
  for(const key of ['workKey','compatibilityDigest','acceptanceDigest']) requireHex(claim[key],`CLAIM_${key.toUpperCase()}`);
  if(claim.reusePolicy==='INDEPENDENT_EXECUTION_REQUIRED') return decision('REFUSED','INDEPENDENT_EXECUTION_REQUIRED',artifact?.artifactId??null);
  if(artifact==null) return decision('MISS','NO_VERIFIED_ARTIFACT');
  try{ validateArtifactRecord(artifact); }catch{return decision('UNKNOWN','ARTIFACT_EVIDENCE_INVALID',artifact?.artifactId??null);}
  if(!current||!isHex(current.provenanceDigest)||!isHex(current.freshnessDigest)) return decision('UNKNOWN','CURRENT_EVIDENCE_INCOMPLETE',artifact.artifactId);
  for(const item of refusals){
    if(!item||item.schema!==REFUSAL_SCHEMA||!clean(item.refusalId)||!isHex(item.evidenceDigest)) return decision('UNKNOWN','REFUSAL_EVIDENCE_INVALID',artifact.artifactId);
    if(item.artifactId===artifact.artifactId&&item.claimId===claim.claimId) return decision('REFUSED',item.reason,artifact.artifactId,item.refusalId);
  }
  if(artifact.workKey!==claim.workKey) return decision('MISS','WORK_KEY_CHANGED');
  if(artifact.compatibilityDigest!==claim.compatibilityDigest) return decision('REFUSED','COMPATIBILITY_MISMATCH',artifact.artifactId);
  if(artifact.acceptanceDigest!==claim.acceptanceDigest) return decision('REFUSED','ACCEPTANCE_MISMATCH',artifact.artifactId);
  if(artifact.provenanceDigest!==current.provenanceDigest) return decision('REFUSED','PROVENANCE_STALE',artifact.artifactId);
  if(artifact.freshnessDigest!==current.freshnessDigest) return decision('REFUSED','FRESHNESS_STALE',artifact.artifactId);
  if(sha(payloadBytes(payload))!==artifact.payloadDigest) return decision('UNKNOWN','PAYLOAD_INTEGRITY_FAILED',artifact.artifactId);
  return decision('HIT','VERIFIED_ARTIFACT_REUSABLE',artifact.artifactId);
}

export function artifactPaths(root,artifactId){
  const base=join(root,'.othrys','artifacts',artifactId); return {record:`${base}.json`,payload:`${base}.bin`};
}
export function materializeArtifact(root,fields,payload){
  const record=createArtifactRecord(fields,payload),paths=artifactPaths(root,record.artifactId); mkdirSync(dirname(paths.record),{recursive:true});
  const recordBytes=JSON.stringify(record,null,2)+'\n',bytes=payloadBytes(payload);
  if(existsSync(paths.record)||existsSync(paths.payload)){
    if(!existsSync(paths.record)||!existsSync(paths.payload)) throw new Error('ARTIFACT_STORE_TORN');
    const prior=validateArtifactRecord(JSON.parse(readFileSync(paths.record,'utf8'))); if(prior.artifactId!==record.artifactId||sha(readFileSync(paths.payload))!==record.payloadDigest) throw new Error('ARTIFACT_STORE_CONFLICT');
    return Object.freeze({status:'EXISTS',record,paths});
  }
  writeFileSync(paths.payload,bytes); writeFileSync(paths.record,recordBytes,'utf8'); return Object.freeze({status:'MATERIALIZED',record,paths});
}
export function appendRefusal(root,record,path='.othrys/artifact-refusals.jsonl'){
  if(!record||record.schema!==REFUSAL_SCHEMA||!clean(record.refusalId)||!isHex(record.evidenceDigest)) throw new Error('REFUSAL_RECORD_INVALID');
  const full=join(root,path); mkdirSync(dirname(full),{recursive:true});
  const existing=existsSync(full)?readFileSync(full,'utf8').split(/\r?\n/).filter(Boolean):[];
  for(const line of existing){
    let parsed; try{parsed=JSON.parse(line);}catch{throw new Error('REFUSAL_LEDGER_TORN');}
    if(parsed.refusalId===record.refusalId){
      if(JSON.stringify(parsed)!==JSON.stringify(record)) throw new Error('REFUSAL_ID_CONFLICT');
      return Object.freeze({status:'EXISTS',path:full,record});
    }
  }
  appendFileSync(full,JSON.stringify(record)+'\n','utf8'); return Object.freeze({status:'APPENDED',path:full,record});
}
export function readRefusals(root,path='.othrys/artifact-refusals.jsonl'){
  const full=join(root,path); if(!existsSync(full)) return Object.freeze({status:'EMPTY',records:[]});
  const records=[];
  for(const line of readFileSync(full,'utf8').split(/\r?\n/).filter(Boolean)){
    let parsed; try{parsed=JSON.parse(line);}catch{return Object.freeze({status:'UNKNOWN',records:[],reason:'REFUSAL_LEDGER_TORN'});}
    if(parsed.schema!==REFUSAL_SCHEMA||!clean(parsed.refusalId)||!isHex(parsed.evidenceDigest)) return Object.freeze({status:'UNKNOWN',records:[],reason:'REFUSAL_LEDGER_INVALID'});
    records.push(parsed);
  }
  return Object.freeze({status:'OK',records:Object.freeze(records)});
}
export function findArtifactByWorkKey(root,workKey){
  requireHex(workKey,'WORK_KEY'); const dir=join(root,'.othrys','artifacts'); if(!existsSync(dir)) return null;
  for(const name of readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
    let record; try{record=validateArtifactRecord(JSON.parse(readFileSync(join(dir,name),'utf8')));}catch{throw new Error('ARTIFACT_STORE_UNKNOWN');}
    if(record.workKey===workKey){ const paths=artifactPaths(root,record.artifactId); if(!existsSync(paths.payload)||sha(readFileSync(paths.payload))!==record.payloadDigest) throw new Error('ARTIFACT_STORE_UNKNOWN'); return record; }
  }
  return null;
}

export function listArtifactsByWorkKey(root,workKey){
  requireHex(workKey,'WORK_KEY'); const dir=join(root,'.othrys','artifacts'); if(!existsSync(dir)) return Object.freeze([]);
  const matches=[];
  for(const name of readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
    let record; try{record=validateArtifactRecord(JSON.parse(readFileSync(join(dir,name),'utf8')));}catch{throw new Error('ARTIFACT_STORE_UNKNOWN');}
    if(record.workKey!==workKey) continue;
    const paths=artifactPaths(root,record.artifactId); if(!existsSync(paths.payload)||sha(readFileSync(paths.payload))!==record.payloadDigest) throw new Error('ARTIFACT_STORE_UNKNOWN');
    matches.push(record);
  }
  return Object.freeze(matches);
}
export function findArtifactForReuse(root,claim,current){
  const records=listArtifactsByWorkKey(root,claim.workKey); if(!records.length) return null;
  return records.find(r=>r.compatibilityDigest===claim.compatibilityDigest&&r.acceptanceDigest===claim.acceptanceDigest&&r.provenanceDigest===current?.provenanceDigest&&r.freshnessDigest===current?.freshnessDigest)
    ??records.find(r=>r.compatibilityDigest===claim.compatibilityDigest&&r.acceptanceDigest===claim.acceptanceDigest)
    ??records[0];
}
