import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const ESTATE_SCHEMA='othrys.os.mnemosyne-estate.v1';
const sha=value=>createHash('sha256').update(value).digest('hex');
const clean=value=>String(value??'').trim();
const STOPWORDS=new Set(['of','the','and','a','an','to','in','on','for','with','from','is','are']);
const tokens=value=>[...new Set((clean(value).toLowerCase().match(/[a-z0-9][a-z0-9._-]{1,}/g)??[]).filter(x=>!STOPWORDS.has(x)))];

let cache={path:null,mtimeMs:null,records:null,summary:null};
function paths(root){
  const base=join(root,'.othrys','knowledge');
  return {
    catalog:join(base,'catalog','estate-catalog.jsonl'),
    summary:join(base,'catalog','estate-summary.json'),
    objects:join(base,'archive','objects')
  };
}
function load(root){
  const p=paths(root);
  if(!existsSync(p.catalog)||!existsSync(p.summary)) return null;
  const st=statSync(p.catalog);
  if(cache.path===p.catalog&&cache.mtimeMs===st.mtimeMs&&cache.records) return {...cache,paths:p};
  const bytes=readFileSync(p.catalog);
  const summary=JSON.parse(readFileSync(p.summary,'utf8'));
  if(summary.schema!==ESTATE_SCHEMA||summary.authorityGranted!==false||summary.automaticPromotion!==false) throw new Error('ESTATE_SUMMARY_INVALID');
  if(sha(bytes)!==summary.catalogSha256) throw new Error('ESTATE_CATALOG_DIGEST_MISMATCH');
  const records=bytes.toString('utf8').split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
  cache={path:p.catalog,mtimeMs:st.mtimeMs,records,summary};
  return {...cache,paths:p};
}
export function estateSummary(root){
  const loaded=load(root);
  if(!loaded) return Object.freeze({schema:ESTATE_SCHEMA,status:'ABSENT',authorityGranted:false,automaticPromotion:false});
  return Object.freeze({...loaded.summary,status:'PRESENT'});
}

function sourceLabel(record){
  const s=record.sources?.[0];
  return s?`${s.repo}/${s.path}`:record.sha256;
}
function metadata(record){
  const refs=(record.sources??[]).map(s=>`${s.repo} ${s.path} ${s.lineage??''} ${s.branch??''}`).join(' ');
  return `${(record.kinds??[]).join(' ')} ${refs}`.toLowerCase();
}
function excerpt(text,terms){
  const lower=text.toLowerCase();
  let at=-1;
  for(const term of terms){const i=lower.indexOf(term);if(i>=0&&(at<0||i<at))at=i;}
  if(at<0)return '';
  const start=Math.max(0,at-100),end=Math.min(text.length,at+260);
  return text.slice(start,end).replace(/\s+/g,' ').trim();
}

export function searchEstateKnowledge(root,query,{limit=12}={}){
  const terms=tokens(query),loaded=load(root);
  if(!loaded||!terms.length) return Object.freeze({schema:'othrys.os.estate-search.v1',query:clean(query),results:[],authorityGranted:false});
  const results=[];
  for(const record of loaded.records){
    const meta=metadata(record),metaMatched=new Set(terms.filter(t=>meta.includes(t))),matched=new Set(metaMatched);
    let preview='';
    if(record.archived===true&&existsSync(join(loaded.paths.objects,record.sha256))&&matched.size<terms.length){
      const text=readFileSync(join(loaded.paths.objects,record.sha256),'utf8'),lower=text.toLowerCase();
      for(const term of terms) if(lower.includes(term)) matched.add(term);
      if(matched.size) preview=excerpt(text,[...matched]);
    }
    if(!matched.size) continue;
    const sourceCount=record.sources?.length??0,coverage=matched.size/terms.length,metaCoverage=metaMatched.size/terms.length;
    const score=Number((coverage*.75+metaCoverage*.25).toFixed(6));
    results.push({id:`estate-${record.sha256.slice(0,24)}`,title:sourceLabel(record),classification:(record.kinds??[]).includes('book')?'BOOK':(record.kinds??[]).includes('log')?'LOG':'DOCUMENT',status:record.archived?'ARCHIVED':'EXCLUDED',score,matchedTerms:[...matched].sort(),metadataMatchedTerms:[...metaMatched].sort(),source:{kind:'ESTATE_ARCHIVE',sha256:record.sha256,refs:(record.sources??[]).slice(0,8),sourceCount},contentDigest:record.sha256,bytes:record.bytes,excerpt:preview,leakPattern:record.leakPattern??null});
  }
  results.sort((a,b)=>b.score-a.score||b.metadataMatchedTerms.length-a.metadataMatchedTerms.length||a.title.localeCompare(b.title));
  return Object.freeze({schema:'othrys.os.estate-search.v1',query:clean(query),results:results.slice(0,Math.max(1,Math.min(50,limit))),catalogSha256:loaded.summary.catalogSha256,authorityGranted:false});
}
export function verifyEstateArchive(root){
  const loaded=load(root);
  if(!loaded) throw new Error('ESTATE_ABSENT');
  let archivedObjects=0,archivedBytes=0,excludedObjects=0;
  const missing=[],mismatched=[],unexpectedExcluded=[];
  for(const record of loaded.records){
    const objectPath=join(loaded.paths.objects,record.sha256);
    if(record.archived===true){
      archivedObjects+=1; archivedBytes+=record.bytes;
      if(!existsSync(objectPath)){missing.push(record.sha256);continue;}
      const bytes=readFileSync(objectPath);
      if(bytes.length!==record.bytes||sha(bytes)!==record.sha256) mismatched.push(record.sha256);
    }else{
      excludedObjects+=1;
      if(existsSync(objectPath)) unexpectedExcluded.push(record.sha256);
    }
  }
  const ok=missing.length===0&&mismatched.length===0&&unexpectedExcluded.length===0&&archivedObjects===loaded.summary.archivedObjects&&archivedBytes===loaded.summary.archivedBytes&&excludedObjects===loaded.summary.excludedObjects;
  return Object.freeze({schema:'othrys.os.estate-verification.v1',ok,archivedObjects,archivedBytes,excludedObjects,missing,mismatched,unexpectedExcluded,catalogSha256:loaded.summary.catalogSha256,authorityGranted:false});
}
