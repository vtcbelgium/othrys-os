import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { estateSummary, searchEstateKnowledge } from './mnemosyne_estate.mjs';
import { buildAtlasProjection } from './atlas_projection.mjs';
import { classifyKnowledgeZone } from './knowledge_zones.mjs';
import { metabolizeSelectedKnowledge } from './context_metabolism.mjs';

export const KNOWLEDGE_SCHEMA='othrys.os.knowledge-item.v1';
const sha=(value)=>createHash('sha256').update(value).digest('hex');
const clean=(value)=>String(value??'').trim();

function safeProjectPath(root,relative){
  const rel=clean(relative).replaceAll('\\','/');
  if(!rel||rel.startsWith('/')||rel.includes('\0')) throw new Error('KNOWLEDGE_PATH_INVALID');
  const target=resolve(root,normalize(rel));
  const base=resolve(root)+sep;
  if(target!==resolve(root)&&!target.startsWith(base)) throw new Error('KNOWLEDGE_PATH_ESCAPE');
  return target;
}

function atomicJson(path,value){
  mkdirSync(dirname(path),{recursive:true});
  const body=JSON.stringify(value,null,2)+'\n';
  writeFileSync(path,body,{encoding:'utf8',flag:'wx'});
  return {path,digest:sha(body)};
}

function sourceRecord(root,entry){
  const path=safeProjectPath(root,entry.path);
  const present=existsSync(path);
  const content=present?readFileSync(path,'utf8'):'';
  return Object.freeze({schema:KNOWLEDGE_SCHEMA,id:`source-${entry.id}`,title:clean(entry.label),classification:clean(entry.class),status:'DECLARED',source:{kind:'PROJECT_FILE',path:clean(entry.path)},present,contentDigest:present?sha(content):null,authorityGranted:false});
}
export function declaredKnowledge(root,manifest){
  const entries=Array.isArray(manifest?.knowledge)?manifest.knowledge:[];
  const ids=new Set();
  return entries.map(entry=>{
    if(!entry?.id||ids.has(entry.id)) throw new Error('KNOWLEDGE_SOURCE_INVALID');
    ids.add(entry.id);
    return sourceRecord(root,entry);
  });
}

export function captureKnowledgeInbox(root,input){
  const title=clean(input?.title), text=clean(input?.text), source=clean(input?.source);
  if(!title||!text||text.length>12000||!source) throw new Error('KNOWLEDGE_CAPTURE_INVALID');
  const capturedAt=clean(input?.capturedAt)||new Date().toISOString();
  if(!Number.isFinite(Date.parse(capturedAt))) throw new Error('KNOWLEDGE_CAPTURE_TIME_INVALID');
  const identity=sha(JSON.stringify({title,text,source,capturedAt}));
  const item=Object.freeze({schema:KNOWLEDGE_SCHEMA,id:`inbox-${identity.slice(0,24)}`,title,classification:'INBOX',status:'AWAITING_REVIEW',source:{kind:'CAPTURE',ref:source},content:text,contentDigest:sha(text),capturedAt,authorityGranted:false,promoted:false});
  const path=join(root,'.othrys','knowledge','inbox',`${item.id}.json`);
  if(existsSync(path)){
    const existing=JSON.parse(readFileSync(path,'utf8'));
    if(existing.contentDigest!==item.contentDigest) throw new Error('KNOWLEDGE_CAPTURE_CONFLICT');
    return {status:'EXISTS',item,path};
  }
  atomicJson(path,item);
  return {status:'CAPTURED',item,path};
}

function inboxItems(root){
  const dir=join(root,'.othrys','knowledge','inbox');
  if(!existsSync(dir)) return [];
  return readdirSync(dir).filter(x=>x.endsWith('.json')).sort().map(name=>JSON.parse(readFileSync(join(dir,name),'utf8')));
}
export function reviewKnowledgeInbox(root,itemId,input){
  const id=clean(itemId), decision=clean(input?.decision).toUpperCase(), classification=clean(input?.classification), evidence=clean(input?.evidence);
  if(!/^inbox-[0-9a-f]{24}$/.test(id)||!['PROMOTE','REJECT'].includes(decision)||!evidence) throw new Error('KNOWLEDGE_REVIEW_INVALID');
  const sourcePath=join(root,'.othrys','knowledge','inbox',`${id}.json`);
  if(!existsSync(sourcePath)) throw new Error('KNOWLEDGE_ITEM_NOT_FOUND');
  const item=JSON.parse(readFileSync(sourcePath,'utf8'));
  if(item.schema!==KNOWLEDGE_SCHEMA||item.status!=='AWAITING_REVIEW') throw new Error('KNOWLEDGE_ITEM_STATE_INVALID');
  if(decision==='PROMOTE'&&!classification) throw new Error('KNOWLEDGE_CLASSIFICATION_REQUIRED');
  const reviewedAt=clean(input?.reviewedAt)||new Date().toISOString();
  const review=Object.freeze({schema:'othrys.os.knowledge-review.v1',reviewId:`review-${sha(JSON.stringify({id,decision,classification,evidence,reviewedAt})).slice(0,24)}`,itemId:id,decision,classification:decision==='PROMOTE'?classification:null,evidence,reviewedAt,promoted:false,authorityGranted:false});
  const path=join(root,'.othrys','knowledge','reviews',`${review.reviewId}.json`);
  if(existsSync(path)) return {status:'EXISTS',review,path};
  atomicJson(path,review);
  return {status:'REVIEWED_NOT_PROMOTED',review,path};
}

function tokenize(value){
  return [...new Set(clean(value).toLowerCase().match(/[a-z0-9][a-z0-9._-]{1,}/g)??[])];
}
function contextBudget(limit,input={}){
  const total=Math.max(3,Math.min(36,Number.isInteger(input?.total)?input.total:Number.isInteger(limit)?limit:12));
  const requestedProject=Number.isInteger(input?.projectTruth)?input.projectTruth:Math.max(1,Math.ceil(total*.4));
  const projectTruth=Math.max(1,Math.min(total,requestedProject));
  const remainingAfterProject=total-projectTruth;
  const requestedEstate=Number.isInteger(input?.estateEvidence)?input.estateEvidence:Math.max(1,Math.floor(total*.35));
  const estateEvidence=Math.max(0,Math.min(remainingAfterProject,requestedEstate));
  const remaining=total-projectTruth-estateEvidence;
  const related=Math.max(0,Math.min(remaining,Number.isInteger(input?.related)?input.related:remaining));
  const warnings=Math.max(0,Math.min(20,Number.isInteger(input?.warnings)?input.warnings:8));
  return Object.freeze({total,projectTruth,estateEvidence,related,warnings});
}

export function searchKnowledge(root,manifest,query,{limit=12}={}){
  const terms=tokenize(query);
  if(!terms.length) return Object.freeze({schema:'othrys.os.knowledge-search.v1',query:clean(query),results:[],authorityGranted:false});
  const items=[...declaredKnowledge(root,manifest),...inboxItems(root)];
  const atlas=buildAtlasProjection(root,{});
  for(const n of atlas.nodes.filter(x=>['block','blueprint','training-level','training-job','pattern'].includes(x.type))) items.push({id:`atlas-${n.id}`,title:n.title,classification:`ATLAS_${n.type.toUpperCase()}`,status:n.truthClass,source:{kind:'ATLAS',ref:n.id},content:`${n.description??''} ${(n.tags??[]).join(' ')}`,contentDigest:null});
  const results=[];
  for(const item of items){
    let content=item.content??'';
    if(item.source?.kind==='PROJECT_FILE'&&item.present) content=readFileSync(safeProjectPath(root,item.source.path),'utf8');
    const hay=`${item.title} ${item.classification} ${content}`.toLowerCase();
    const matched=terms.filter(term=>hay.includes(term));
    if(matched.length) results.push({id:item.id,title:item.title,classification:item.classification,status:item.status,score:matched.length/terms.length,matchedTerms:matched,source:item.source,contentDigest:item.contentDigest});
  }
  const estate=searchEstateKnowledge(root,query,{limit:50});
  const estateResults=estate.results.map(item=>({...item,zone:classifyKnowledgeZone(item)}));
  const cap=Math.max(1,Math.min(50,limit));
  results.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)); estateResults.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const reserve=Math.min(estateResults.length,Math.max(1,Math.floor(cap/4))), selected=[...results.slice(0,Math.max(0,cap-reserve)),...estateResults.slice(0,reserve)];
  selected.sort((a,b)=>b.score-a.score||(Number(a.id.startsWith('estate-'))-Number(b.id.startsWith('estate-')))||a.id.localeCompare(b.id));
  return Object.freeze({schema:'othrys.os.knowledge-search.v1',query:clean(query),results:selected,estateCatalogSha256:estate.catalogSha256??null,authorityGranted:false});
}
export function deriveContextWarnings({maintenance={},graphSummary={},estateEvidence=[]}={}){
  const warnings=[];
  for(const id of maintenance.missingSources??[]) warnings.push({kind:'missing-source',id});
  for(const id of maintenance.awaitingReview??[]) warnings.push({kind:'awaiting-review',id});
  if(graphSummary?.conflictCount) warnings.push({kind:'atlas-conflicts',count:graphSummary.conflictCount});
  const logical=new Map();
  for(const item of estateEvidence){
    const status=item.currentness?.status;
    if(status&&status!=='CURRENT') warnings.push({kind:'estate-source-currentness',id:item.id,status,currentRefs:item.currentness.currentRefs,changedRefs:item.currentness.changedRefs,missingRefs:item.currentness.missingRefs});
    for(const ref of item.source?.refs??[]){
      const key=`${ref.lineage??ref.repo??'unknown'}|${ref.path??'unknown'}`;
      const digests=logical.get(key)??new Set(); digests.add(item.contentDigest); logical.set(key,digests);
    }
  }
  for(const [sourceKey,digests] of logical) if(digests.size>1) warnings.push({kind:'source-divergence',sourceKey,digests:[...digests].sort()});
  return Object.freeze(warnings);
}

export function assembleKnowledgeContext(root,manifest,query,{limit=12,state={},budget={}}={}){
  const appliedBudget=contextBudget(limit,budget);
  const terms=tokenize(query);
  if(!terms.length){ const full={schema:'othrys.os.context-capsule.v1',query:clean(query),projectTruth:[],estateEvidence:[],related:[],warnings:[],authorityGranted:false}; return Object.freeze({...full,transportCapsule:metabolizeSelectedKnowledge(full)}); }
  const search=searchKnowledge(root,manifest,query,{limit:Math.max(appliedBudget.total*4,24)});
  const bookPath=join(root,'books','BOOK_REGISTRY.json');
  const bookMatches=[];
  if(existsSync(bookPath)){
    const registry=JSON.parse(readFileSync(bookPath,'utf8'));
    for(const b of registry.books??[]){
      const id=String(b.id??'').toLowerCase(),title=String(b.title??'').toLowerCase(),role=String(b.role??'').toLowerCase(),hay=`${id} ${title} ${role}`,hits=terms.filter(t=>hay.includes(t));
      if(hits.length){
        const identityHits=terms.filter(t=>id===t||id.endsWith(`-${t}`)||title===t||title.endsWith(` ${t}`));
        const identityScore=identityHits.length/terms.length,coverage=hits.length/terms.length;
        bookMatches.push({id:`book-${b.id}`,title:b.title,classification:'HOUSE_BOOK',status:b.status??'CURRENT',score:Number((coverage+identityScore).toFixed(6)),matchedTerms:hits,identityMatchedTerms:identityHits,source:{kind:'HOUSE_BOOK',path:b.path},contentDigest:existsSync(join(root,b.path))?sha(readFileSync(join(root,b.path),'utf8')):null,selectedBecause:identityHits.length?'current House Book identity':'current House Book reference'});
      }
    }
    bookMatches.sort((a,b)=>b.score-a.score||b.identityMatchedTerms.length-a.identityMatchedTerms.length||a.title.localeCompare(b.title));
  }
  const localMatches=search.results.filter(x=>!x.id.startsWith('estate-')).map(x=>({...x,selectedBecause:'project-local match'}));
  const seen=new Set();
  const projectTruth=[...bookMatches,...localMatches].filter(x=>!seen.has(x.id)&&(seen.add(x.id),true)).slice(0,appliedBudget.projectTruth);
  const estateEvidence=search.results.filter(x=>x.id.startsWith('estate-')&&x.status!=='EXCLUDED').slice(0,appliedBudget.estateEvidence).map(x=>({...x,selectedBecause:'supporting estate evidence'}));
  const graph=buildAtlasProjection(root,state),matched=new Set();
  for(const n of graph.nodes){
    const hay=`${n.id} ${n.title} ${n.description??''} ${(n.tags??[]).join(' ')}`.toLowerCase();
    if(terms.some(t=>hay.includes(t))) matched.add(n.id);
  }
  const neighborIds=new Set(matched),relationKinds=new Map();
  for(const e of graph.edges){
    if(matched.has(e.from)||matched.has(e.to)){neighborIds.add(e.from);neighborIds.add(e.to)}
    if(matched.has(e.from)){const a=relationKinds.get(e.to)??new Set();a.add(e.type);relationKinds.set(e.to,a)}
    if(matched.has(e.to)){const a=relationKinds.get(e.from)??new Set();a.add(e.type);relationKinds.set(e.from,a)}
  }
  const degree=new Map(); for(const e of graph.edges){degree.set(e.from,(degree.get(e.from)??0)+1);degree.set(e.to,(degree.get(e.to)??0)+1)}
  const related=graph.nodes.filter(n=>neighborIds.has(n.id)).map(n=>{
    const hay=`${n.id} ${n.title}`.toLowerCase(),exact=terms.some(t=>hay===t||n.id.toLowerCase().endsWith(`:${t}`)||n.title.toLowerCase()===t);
    const relations=[...(relationKinds.get(n.id)??[])].sort();
    return {id:n.id,type:n.type,title:n.title,truthClass:n.truthClass,muses:n.muses??[],provenance:n.provenance??[],relationCount:degree.get(n.id)??0,relationKinds:relations,exactMatch:exact,selectedBecause:matched.has(n.id)?'direct Atlas match':`one-hop Atlas relation${relations.length?`: ${relations.join(', ')}`:''}`};
  }).sort((a,b)=>Number(b.exactMatch)-Number(a.exactMatch)||(Number(b.selectedBecause.startsWith('direct'))-Number(a.selectedBecause.startsWith('direct')))||b.relationKinds.length-a.relationKinds.length||b.relationCount-a.relationCount||a.id.localeCompare(b.id)).slice(0,appliedBudget.related);
  const maintenance=maintainKnowledge(root,manifest);
  const selectedWarnings=deriveContextWarnings({maintenance,graphSummary:graph.summary,estateEvidence}).slice(0,appliedBudget.warnings);
  const budgetReport=Object.freeze({...appliedBudget,selected:projectTruth.length+estateEvidence.length+related.length});
  const full={schema:'othrys.os.context-capsule.v1',query:clean(query),projectTruth,estateEvidence,related,warnings:selectedWarnings,contextBudget:budgetReport,estateCatalogSha256:search.estateCatalogSha256??null,authorityGranted:false};
  const transportCapsule=metabolizeSelectedKnowledge(full);
  return Object.freeze({...full,transportCapsule});
}

export function maintainKnowledge(root,manifest){
  const declared=declaredKnowledge(root,manifest);
  const inbox=inboxItems(root);
  const missing=declared.filter(x=>!x.present).map(x=>x.id);
  const reviewsDir=join(root,'.othrys','knowledge','reviews');
  const reviews=existsSync(reviewsDir)?readdirSync(reviewsDir).filter(x=>x.endsWith('.json')).map(x=>JSON.parse(readFileSync(join(reviewsDir,x),'utf8'))):[];
  const reviewedIds=new Set(reviews.map(x=>x.itemId));
  const awaiting=inbox.filter(x=>!reviewedIds.has(x.id)).map(x=>x.id);
  return Object.freeze({schema:'othrys.os.knowledge-maintenance.v1',declaredSources:declared.length,inboxItems:inbox.length,reviews:reviews.length,missingSources:missing,awaitingReview:awaiting,healthy:missing.length===0,mutationsPerformed:0,authorityGranted:false});
}

function greatHarvestProjection(root){
  const path=join(root,'.othrys','knowledge','catalog','great-harvest-summary.json');
  if(!existsSync(path)) return Object.freeze({status:'MISSING',authorityGranted:false});
  try{
    const value=JSON.parse(readFileSync(path,'utf8'));
    if(value.schema!=='othrys.os.great-harvest.summary.v1'||value.authorityGranted!==false||value.automaticPromotion!==false||value.sourcePayloadCopied!==false) return Object.freeze({status:'INVALID',authorityGranted:false});
    return Object.freeze({status:'READY',workspaceCount:value.workspaceCount,lineageCount:value.lineageCount,indexedObjects:value.indexedObjects,historicalOnlyObjects:value.historicalOnlyObjects,liveOnlyCount:value.liveOnlyCount??0,liveOnlyStates:value.liveOnlyStates??{},commitCount:value.commitCount,perimeterCount:value.perimeterCount??0,perimeterClassifications:value.perimeterClassifications??{},perimeterDevices:value.perimeterDevices??{},catalogSha256:value.catalogSha256,commitCatalogSha256:value.commitCatalogSha256,liveOnlyDigest:value.liveOnlyDigest??null,perimeterDigest:value.perimeterDigest??null,authorityGranted:false});
  }catch{return Object.freeze({status:'INVALID',authorityGranted:false});}
}

export function exportKnowledge(root,manifest){
  const sources=declaredKnowledge(root,manifest).map(item=>{
    const content=item.present?readFileSync(safeProjectPath(root,item.source.path),'utf8'):null;
    return {...item,content};
  });
  const inbox=inboxItems(root);
  const reviewsDir=join(root,'.othrys','knowledge','reviews');
  const reviews=existsSync(reviewsDir)?readdirSync(reviewsDir).filter(x=>x.endsWith('.json')).sort().map(x=>JSON.parse(readFileSync(join(reviewsDir,x),'utf8'))):[];
  const body={schema:'othrys.os.knowledge-export.v1',projectId:manifest.projectId,sources,inbox,reviews,estate:estateSummary(root),authorityGranted:false};
  return Object.freeze({...body,exportDigest:sha(JSON.stringify(body))});
}

export function knowledgeProjection(root,manifest){
  const maintenance=maintainKnowledge(root,manifest);
  return Object.freeze({schema:'othrys.os.mnemosyne.v1',service:'mnemosyne',lifecycle:['CAPTURE','CLASSIFY','REVIEW','SEARCH','MAINTAIN','EXPORT'],...maintenance,estate:estateSummary(root),greatHarvest:greatHarvestProjection(root),zonePolicy:'docs/KNOWLEDGE_ZONES.md',securityPosture:'docs/HECATONCHEIRES_POSTURE.json',writeApiEnabled:false,opaqueMemory:false,authorityGranted:false});
}
