import { createHash } from 'node:crypto';

export const CONTEXT_METABOLISM_SCHEMA='othrys.os.context-metabolism.v1';
export const CAPSULE_CLASSES=Object.freeze(['PINNED','ACTIVE','RELEVANT','COMPRESSIBLE','EVICTABLE']);
export const GROUNDING_CLASSES=Object.freeze(['CANONICAL','GROUNDED','CORROBORATED','UNVERIFIED']);

const sha=value=>createHash('sha256').update(value).digest('hex');
const bytes=value=>Buffer.byteLength(JSON.stringify(value),'utf8');
const hex64=value=>typeof value==='string'&&/^[0-9a-f]{64}$/.test(value);
const clean=value=>String(value??'').trim();

function validateItem(item){
  if(!item||typeof item!=='object') throw new Error('CONTEXT_ITEM_INVALID');
  const required=['id','classification','grounding','digest','required','authorityRelevant','payload'];
  if(required.some(key=>!(key in item))) throw new Error('CONTEXT_ITEM_FIELDS_INVALID');
  if(!clean(item.id)) throw new Error('CONTEXT_ITEM_ID_INVALID');
  if(!CAPSULE_CLASSES.includes(item.classification)) throw new Error('CONTEXT_ITEM_CLASS_INVALID');
  if(!GROUNDING_CLASSES.includes(item.grounding)) throw new Error('CONTEXT_ITEM_GROUNDING_INVALID');
  if(!hex64(item.digest)) throw new Error('CONTEXT_ITEM_DIGEST_INVALID');
  if(typeof item.required!=='boolean'||typeof item.authorityRelevant!=='boolean') throw new Error('CONTEXT_ITEM_FLAGS_INVALID');
  if(item.artifactRef!=null&&!/^sha256:[0-9a-f]{64}$/.test(item.artifactRef)) throw new Error('CONTEXT_ITEM_REF_INVALID');
}

function transportItem(item,transport){
  const base={id:item.id,section:item.section??null,transport,digest:item.digest,grounding:item.grounding,
    required:item.required,authorityRelevant:item.authorityRelevant};
  if(transport==='REFERENCE') return Object.freeze({...base,artifactRef:item.artifactRef});
  return Object.freeze({...base,payload:item.payload});
}
export function metabolizeEvidenceCapsule({capsuleId,items,frozenIdentities,maxBytes=null,catalogDigest=null}){
  if(!clean(capsuleId)||!Array.isArray(items)||!items.length) throw new Error('CONTEXT_CAPSULE_INVALID');
  if(!Array.isArray(frozenIdentities)||new Set(frozenIdentities).size!==frozenIdentities.length) throw new Error('CONTEXT_IDENTITY_SKELETON_INVALID');
  const frozen=new Set(frozenIdentities),seen=new Set();
  const normalized=[];
  for(const item of items){
    validateItem(item);
    if(seen.has(item.id)) throw new Error('CONTEXT_ITEM_DUPLICATE');
    if(!frozen.has(item.id)) throw new Error('CONTEXT_IDENTITY_EXPANSION');
    seen.add(item.id); normalized.push(item);
  }
  const beforeBytes=normalized.reduce((n,item)=>n+bytes(item.payload),0);
  const selected=[]; const evicted=[]; const referenced=[];
  for(const item of normalized){
    const mustKeepFull=item.classification==='PINNED'||item.classification==='ACTIVE';
    if(mustKeepFull){selected.push(transportItem(item,'FULL'));continue}
    if(item.artifactRef){selected.push(transportItem(item,'REFERENCE'));referenced.push(item.id);continue}
    if(item.classification==='EVICTABLE'&&!item.required&&!item.authorityRelevant){evicted.push(item.id);continue}
    selected.push(transportItem(item,'FULL'));
  }
  const afterBytes=selected.reduce((n,item)=>n+bytes(item),0);
  if(Number.isInteger(maxBytes)&&maxBytes>=0&&afterBytes>maxBytes) throw new Error('CONTEXT_BUDGET_UNSATISFIED');
  const selectedIds=new Set(selected.map(x=>x.id));
  const requiredLost=normalized.filter(x=>x.required&&!selectedIds.has(x.id));
  const authorityLost=normalized.filter(x=>x.authorityRelevant&&!selectedIds.has(x.id));
  if(requiredLost.length) throw new Error('CONTEXT_REQUIRED_EVIDENCE_LOST');
  if(authorityLost.length) throw new Error('CONTEXT_AUTHORITY_EVIDENCE_LOST');
  const outputIdentities=selected.map(x=>x.id);
  if(outputIdentities.some(id=>!frozen.has(id))) throw new Error('CONTEXT_IDENTITY_EXPANSION');
  const body={schema:CONTEXT_METABOLISM_SCHEMA,capsuleId,items:selected,evicted:Object.freeze(evicted),referenced:Object.freeze(referenced),
    beforeBytes,afterBytes,reductionBytes:beforeBytes-afterBytes,reductionRatio:beforeBytes?Number(((beforeBytes-afterBytes)/beforeBytes).toFixed(6)):0,
    requiredEvidenceLost:0,authorityEvidenceLost:0,identityExpansion:0,catalogDigest:catalogDigest??null,
    frozenIdentities:Object.freeze([...frozenIdentities]),aiRouting:false,learnedRouting:false,authorityGranted:false,executionStarted:false};
  return Object.freeze({...body,capsuleDigest:sha(JSON.stringify(body))});
}
export function metabolizeSelectedKnowledge(capsule){
  if(!capsule||capsule.schema!=='othrys.os.context-capsule.v1') throw new Error('KNOWLEDGE_CAPSULE_INVALID');
  const items=[];
  const add=(section,value,classification,grounding,required=false,artifactRef=null)=>{
    const digest=hex64(value?.contentDigest)?value.contentDigest:sha(JSON.stringify(value));
    items.push({id:`${section}:${value.id??sha(JSON.stringify(value)).slice(0,16)}`,section,classification,grounding,digest,
      required,authorityRelevant:false,payload:value,artifactRef});
  };
  for(const x of capsule.projectTruth??[]) add('projectTruth',x,'PINNED','CANONICAL',true,null);
  for(const x of capsule.estateEvidence??[]){
    const ref=hex64(x?.contentDigest)?`sha256:${x.contentDigest}`:null;
    add('estateEvidence',x,'COMPRESSIBLE',x?.currentness?.status==='CURRENT'?'GROUNDED':'CORROBORATED',false,ref);
  }
  for(const x of capsule.related??[]) add('related',x,'RELEVANT','CORROBORATED',false,null);
  for(const x of capsule.warnings??[]) add('warnings',x,'ACTIVE','GROUNDED',true,null);
  if(!items.length) return Object.freeze({schema:CONTEXT_METABOLISM_SCHEMA,capsuleId:`transport:${capsule.query??''}`,items:[],beforeBytes:0,afterBytes:0,reductionBytes:0,reductionRatio:0,requiredEvidenceLost:0,authorityEvidenceLost:0,identityExpansion:0,frozenIdentities:[],referenced:[],evicted:[],catalogDigest:capsule.estateCatalogSha256??null,aiRouting:false,learnedRouting:false,authorityGranted:false,executionStarted:false,capsuleDigest:sha('empty')});
  return metabolizeEvidenceCapsule({capsuleId:`transport:${capsule.query??''}`,items,frozenIdentities:items.map(x=>x.id),catalogDigest:capsule.estateCatalogSha256??null});
}
