import { searchEstateKnowledge } from './mnemosyne_estate.mjs';

export const KNOWLEDGE_ZONE_SCHEMA='othrys.os.knowledge-zones.v1';
export const KNOWLEDGE_ZONES=Object.freeze(['GREAT_LIBRARY','BLUEPRINT_VAULT','HALL_OF_ECHOES','GARDEN','R_AND_D','CHRONICLE','QUARANTINE']);

const refs=result=>(result?.source?.refs??[]).map(x=>({repo:String(x.repo??''),path:String(x.path??'').replaceAll('\\','/')}));
const matchingRefs=(result,re)=>refs(result).filter(x=>re.test(x.path.toLowerCase())).map(x=>`${x.repo}/${x.path}`);

export function classifyKnowledgeZone(result){
  const currentness=result?.currentness?.status??'UNKNOWN',reasons=[]; let basisRefs=[];
  let zone='GREAT_LIBRARY';
  if(result?.status==='EXCLUDED'){
    zone='QUARANTINE'; reasons.push('excluded source metadata; bytes are not archived');
  }else if(['SUPERSEDED','DIVERGED','MISSING'].includes(currentness)){
    zone='HALL_OF_ECHOES'; reasons.push(`source currentness is ${currentness}`);
  }else if((basisRefs=matchingRefs(result,/(^|[\/_.-])(superseded|deprecated|rejected|retired|historical|archive)([\/_.-]|$)/)).length){
    zone='HALL_OF_ECHOES'; reasons.push('source path explicitly marks historical/superseded stock');
  }else if((basisRefs=matchingRefs(result,/(^|[\/_.-])garden([\/_.-]|$)|garden-seed/)).length){
    zone='GARDEN'; reasons.push('source path is explicitly Garden/seed stock');
  }else if((basisRefs=matchingRefs(result,/(research|experiment|benchmark|prototype|panda-lab|\/lab\/)/)).length){
    zone='R_AND_D'; reasons.push('source path is explicitly research/experiment stock');
  }else if((basisRefs=matchingRefs(result,/(blueprint|constitution)/)).length){
    zone='BLUEPRINT_VAULT'; reasons.push('source path names Blueprint/constitutional architecture class');
  }else if((basisRefs=matchingRefs(result,/chronicle/)).length){
    zone='CHRONICLE'; reasons.push('source path is Chronicle history');
  }else reasons.push('current admitted/navigation evidence defaults to Great Library');
  return Object.freeze({zone,sourceVault:result?.status==='ARCHIVED',contentDigest:result?.contentDigest??null,currentness,reasons:Object.freeze(reasons),basisRefs:Object.freeze(basisRefs),authorityGranted:false});
}

export function projectKnowledgeZones(root,query,{limit=12,zone=null}={}){
  const requestedZone=zone==null?null:String(zone).trim().toUpperCase();
  if(requestedZone&&!KNOWLEDGE_ZONES.includes(requestedZone)) throw new Error('KNOWLEDGE_ZONE_INVALID');
  const boundedLimit=Math.max(1,Math.min(50,limit));
  const search=searchEstateKnowledge(root,query,{limit:requestedZone?50:boundedLimit});
  const classified=search.results.map(item=>Object.freeze({...item,zone:classifyKnowledgeZone(item)}));
  const results=(requestedZone?classified.filter(item=>item.zone.zone===requestedZone):classified).slice(0,boundedLimit);
  const counts=Object.fromEntries(KNOWLEDGE_ZONES.map(zone=>[zone,results.filter(x=>x.zone.zone===zone).length]));
  return Object.freeze({
    schema:KNOWLEDGE_ZONE_SCHEMA,
    query:String(query??'').trim(),
    requestedZone,
    results:Object.freeze(results),
    counts:Object.freeze(counts),
    catalogSha256:search.catalogSha256??null,
    sourceVault:Object.freeze({storage:'existing content-addressed Mnemosyne archive',newStorageEngine:false}),
    authorityGranted:false,
    mutationPerformed:false
  });
}
