import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, resolve, sep } from 'node:path';

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

export function searchKnowledge(root,manifest,query,{limit=12}={}){
  const terms=tokenize(query);
  if(!terms.length) return Object.freeze({schema:'othrys.os.knowledge-search.v1',query:clean(query),results:[],authorityGranted:false});
  const items=[...declaredKnowledge(root,manifest),...inboxItems(root)];
  const results=[];
  for(const item of items){
    let content=item.content??'';
    if(item.source?.kind==='PROJECT_FILE'&&item.present) content=readFileSync(safeProjectPath(root,item.source.path),'utf8');
    const hay=`${item.title} ${item.classification} ${content}`.toLowerCase();
    const matched=terms.filter(term=>hay.includes(term));
    if(matched.length) results.push({id:item.id,title:item.title,classification:item.classification,status:item.status,score:matched.length/terms.length,matchedTerms:matched,source:item.source,contentDigest:item.contentDigest});
  }
  results.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  return Object.freeze({schema:'othrys.os.knowledge-search.v1',query:clean(query),results:results.slice(0,Math.max(1,Math.min(50,limit))),authorityGranted:false});
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

export function exportKnowledge(root,manifest){
  const sources=declaredKnowledge(root,manifest).map(item=>{
    const content=item.present?readFileSync(safeProjectPath(root,item.source.path),'utf8'):null;
    return {...item,content};
  });
  const inbox=inboxItems(root);
  const reviewsDir=join(root,'.othrys','knowledge','reviews');
  const reviews=existsSync(reviewsDir)?readdirSync(reviewsDir).filter(x=>x.endsWith('.json')).sort().map(x=>JSON.parse(readFileSync(join(reviewsDir,x),'utf8'))):[];
  const body={schema:'othrys.os.knowledge-export.v1',projectId:manifest.projectId,sources,inbox,reviews,authorityGranted:false};
  return Object.freeze({...body,exportDigest:sha(JSON.stringify(body))});
}

export function knowledgeProjection(root,manifest){
  const maintenance=maintainKnowledge(root,manifest);
  return Object.freeze({schema:'othrys.os.mnemosyne.v1',service:'mnemosyne',lifecycle:['CAPTURE','CLASSIFY','REVIEW','SEARCH','MAINTAIN','EXPORT'],...maintenance,writeApiEnabled:false,opaqueMemory:false,authorityGranted:false});
}
