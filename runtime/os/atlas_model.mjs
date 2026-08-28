import { createHash } from 'node:crypto';

export const ATLAS_SCHEMA='othrys.os.atlas.v2';
export const NODE_TYPES=Object.freeze([
  'project','system','titan','capability','model','integration','knowledge','mission','work',
  'evidence','decision','lesson','incident','research','pattern','question','source'
]);
export const EDGE_TYPES=Object.freeze([
  'contains','owns','uses','depends-on','derived-from','supersedes','conflicts-with',
  'implemented-by','verified-by','learned-from','created-during','used-successfully-in',
  'failed-in','routes-through','governed-by','related-to'
]);
export const TRUTH_CLASSES=Object.freeze([
  'CANONICAL','VERIFIED','REVIEWED','OBSERVED','INFERRED','RESEARCH','STALE','CONFLICTED','REJECTED'
]);
const sha=v=>createHash('sha256').update(String(v)).digest('hex');
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:0));
const SECRET_PATTERNS=[/\bsk-[A-Za-z0-9_-]{16,}\b/i,/\bgh[pousr]_[A-Za-z0-9]{20,}\b/,/-----BEGIN [A-Z ]+PRIVATE KEY-----/,/\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,/\b(?:api[_-]?key|secret|token|password|passwd|bearer)\b\s*[:=]\s*["']?[A-Za-z0-9_.-]{12,}/i];
export function looksSecret(value){return typeof value==='string'&&SECRET_PATTERNS.some(re=>re.test(value));}
function secretPath(value,path='atlas',hits=[]){if(typeof value==='string'){if(looksSecret(value))hits.push(path);return hits}if(Array.isArray(value)){value.forEach((x,i)=>secretPath(x,`${path}[${i}]`,hits));return hits}if(value&&typeof value==='object'){for(const [k,v] of Object.entries(value))secretPath(v,`${path}.${k}`,hits)}return hits}
export function atlasNodeId(type,key){
  if(!NODE_TYPES.includes(type)) throw new Error('ATLAS_NODE_TYPE_INVALID');
  const slug=String(key??'').trim().toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
  if(!slug) throw new Error('ATLAS_NODE_KEY_INVALID');
  return `${type}:${slug}`;
}
export function atlasEdgeId(type,from,to){
  if(!EDGE_TYPES.includes(type)) throw new Error('ATLAS_EDGE_TYPE_INVALID');
  return `${type}:${from}->${to}`;
}
export function knowledgeGravity({truth='OBSERVED',evidence=0,reuse=0,links=0,recency=0.5,consequence=0.5}={}){
  const truthWeight={CANONICAL:1,VERIFIED:.95,REVIEWED:.82,OBSERVED:.55,INFERRED:.38,RESEARCH:.5,STALE:.25,CONFLICTED:.2,REJECTED:.05}[truth]??.2;
  const evidenceWeight=clamp(evidence/5);
  const reuseWeight=clamp(reuse/10);
  const linkWeight=clamp(Math.log2(1+Math.max(0,links))/5);
  const score=.34*truthWeight+.22*evidenceWeight+.16*reuseWeight+.12*linkWeight+.08*clamp(recency)+.08*clamp(consequence);
  return Number(clamp(score).toFixed(4));
}
export function knowledgeHeat({touches=0,retrievals=0,changes=0,conflicts=0,ageHours=24}={}){
  const activity=clamp((touches+retrievals+2*changes+3*conflicts)/20);
  const freshness=Math.exp(-Math.max(0,ageHours)/72);
  return Number(clamp(.72*activity+.28*freshness).toFixed(4));
}
export function validateAtlasGraph(graph){
  const issues=[];
  for(const path of secretPath(graph)) issues.push(`secret:${path}`);
  if(graph?.schema!==ATLAS_SCHEMA) issues.push('schema');
  const ids=new Set();
  for(const n of graph?.nodes??[]){
    if(ids.has(n.id)) issues.push(`duplicate:${n.id}`); ids.add(n.id);
    if(!NODE_TYPES.includes(n.type)) issues.push(`node-type:${n.id}`);
    if(!TRUTH_CLASSES.includes(n.truthClass)) issues.push(`truth:${n.id}`);
    if(n.basis==='EVIDENCE'&&!(n.provenance?.length)) issues.push(`provenance:${n.id}`);
    if(n.authorityGranted!==false) issues.push(`authority:${n.id}`);
  }
  const edgeIds=new Set();
  for(const e of graph?.edges??[]){
    if(edgeIds.has(e.id)) issues.push(`duplicate-edge:${e.id}`); edgeIds.add(e.id);
    if(!EDGE_TYPES.includes(e.type)) issues.push(`edge-type:${e.id}`);
    if(!ids.has(e.from)||!ids.has(e.to)) issues.push(`dangling:${e.id}`);
    if(e.basis==='EVIDENCE'&&!(e.provenance?.length)) issues.push(`edge-provenance:${e.id}`);
  }
  return issues;
}
export function graphDigest(graph){
  const nodes=(graph?.nodes??[]).map(({gravity,heat,...node})=>node);
  const stable={...graph,nodes,generatedAt:null,digest:null};
  return sha(JSON.stringify(stable));
}
