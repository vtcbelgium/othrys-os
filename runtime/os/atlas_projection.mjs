import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { atlasEdgeId, atlasNodeId, graphDigest, knowledgeGravity, knowledgeHeat, validateAtlasGraph, ATLAS_SCHEMA } from './atlas_model.mjs';
import { routeToMuses } from './muses.mjs';
import { loadProjectManifest } from './project_manifest.mjs';

const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const prov=(kind,ref)=>[{kind,ref}];
export function missionPass(root,ref){
  if(typeof ref!=='string'||!/^V2-\d+[A-Z]$/.test(ref)) return false;
  const path=join(root,'missions',`${ref}.result.json`); if(!existsSync(path)) return false;
  try{
    const r=readJson(path),verdict=String(r.verdict??r.status??'').toUpperCase();
    if(verdict==='PASS') return true;
    const tests=Array.isArray(r.tests)?r.tests:[],commands=Array.isArray(r.commands_run)?r.commands_run:[];
    return String(r.result_claimed??'').toUpperCase()==='COMPLETE'&&r.blocker==null&&tests.length>0&&tests.every(t=>String(t.result??'').toLowerCase()==='pass')&&commands.every(c=>Number(c.exit_code)===0);
  }catch{return false}
}
function recentScore(path){
  if(!existsSync(path)) return {recency:.2,ageHours:999,observedAt:null};
  const st=statSync(path),ageHours=Math.max(0,(Date.now()-st.mtimeMs)/3600000);
  return {recency:Math.exp(-ageHours/336),ageHours,observedAt:st.mtime.toISOString()};
}

function baseNode(type,key,title,description,truthClass,sourceRef,tags=[]){
  const {recency,ageHours,observedAt}=recentScore(sourceRef.abs);
  const node={id:atlasNodeId(type,key),type,title,description,tags,truthClass,basis:truthClass==='INFERRED'?'INFERENCE':'EVIDENCE',
    provenance:prov(sourceRef.kind,sourceRef.ref),observedAt,validFrom:null,validUntil:null,
    gravity:knowledgeGravity({truth:truthClass,evidence:1,recency}),heat:knowledgeHeat({touches:0,retrievals:0,changes:0,conflicts:truthClass==='CONFLICTED'?1:0,ageHours}),
    muses:[],authorityGranted:false};
  node.muses=routeToMuses(node); return node;
}
function edge(type,from,to,kind,ref,basis='EVIDENCE'){
  return {id:atlasEdgeId(type,from,to),type,from,to,basis,provenance:prov(kind,ref),validFrom:null,validUntil:null,authorityGranted:false};
}
export function buildAtlasProjection(root,state={}){
  const manifest=loadProjectManifest(root),nodes=[],edges=[];
  const projectRef={kind:'project-manifest',ref:'.othrys/project.json',abs:join(root,'.othrys','project.json')};
  const project=baseNode('project',manifest.projectId,manifest.label,'OTHRYS OS project context','CANONICAL',projectRef,['project','canonical']);
  nodes.push(project);
  const add=(node,relation='contains')=>{nodes.push(node);edges.push(edge(relation,project.id,node.id,'project-manifest','.othrys/project.json'));return node};
  for(const x of manifest.authorities??[]) add(baseNode('titan',x.id,x.label,x.role,missionPass(root,x.statusEvidence)?'VERIFIED':'REVIEWED',projectRef,['authority',...(x.capabilities??[])]));
  for(const x of manifest.systems??[]) add(baseNode('system',x.id,x.label,x.role,missionPass(root,x.statusEvidence)?'VERIFIED':'OBSERVED',projectRef,['system']));
  for(const x of manifest.capabilities??[]) add(baseNode('capability',x.id,x.id,'Capability inventory entry',x.status==='PROVEN'?'VERIFIED':'OBSERVED',projectRef,['capability',String(x.status).toLowerCase()]));
  for(const x of manifest.modelPolicy?.requests??[]) add(baseNode('model',x.id,x.label,x.class,x.available?'OBSERVED':'STALE',projectRef,['model',String(x.status).toLowerCase()]));
  for(const x of manifest.integrations??[]) add(baseNode('integration',x.id,x.label,x.class,missionPass(root,x.evidence)?'VERIFIED':'OBSERVED',projectRef,['integration']));
  for(const x of manifest.knowledge??[]){
    const abs=join(root,x.path),truth=/CANONICAL|CONTROL/.test(x.class)?'CANONICAL':/RESEARCH/.test(x.class)?'RESEARCH':'REVIEWED';
    add(baseNode('knowledge',x.id,x.label,x.class,existsSync(abs)?truth:'STALE',{kind:'project-file',ref:x.path,abs},['knowledge',x.class.toLowerCase()]));
  }
  const librarySeedPath=join(root,'docs','V2-011J','GREAT_LIBRARY_SEED.json');
  if(existsSync(librarySeedPath)){
    const ls=readJson(librarySeedPath),ref={kind:'great-library-seed',ref:'docs/V2-011J/GREAT_LIBRARY_SEED.json',abs:librarySeedPath};
    for(const b of ls.blocks??[]) add(baseNode('block',b.id,b.name??b.id,`${b.domain??'unknown'} ? ${b.status??'UNKNOWN'}`,b.status==='ADMITTED'?'VERIFIED':b.status==='REFERENCE_ONLY_LICENSE_BOUND'?'RESEARCH':'REVIEWED',ref,['library','block',b.domain??'unknown',String(b.status??'unknown').toLowerCase()]));
    for(const b of ls.blueprints??[]) add(baseNode('blueprint',b.id,b.name??b.id,b.domain??'Great Library blueprint','REVIEWED',ref,['library','blueprint',b.domain??'unknown']));
    for(const p of ls.patterns??[]) add(baseNode('pattern',p.id,p.name??p.id,'Great Library pattern','VERIFIED',ref,['library','pattern']));
  }
  const libraryIndexPath=join(root,'.othrys','library','INDEX.json');
  if(existsSync(libraryIndexPath)){
    const li=readJson(libraryIndexPath),ref={kind:'great-library-index',ref:'.othrys/library/INDEX.json',abs:libraryIndexPath};
    // Navigation index is declared knowledge; canonical stock nodes come from GREAT_LIBRARY_SEED to avoid duplicate truth.
  }
  const trainingPath=join(root,'docs','training','TRAINING_MANIFEST.json');
  if(existsSync(trainingPath)){
    const tm=readJson(trainingPath),ref={kind:'training-manifest',ref:'docs/training/TRAINING_MANIFEST.json',abs:trainingPath};
    for(const l of tm.levels??[]){
      const ln=add(baseNode('training-level',String(l.level),`Level ${l.level}: ${l.name}`,l.goal,l.status==='ACTIVE'?'CANONICAL':'REVIEWED',ref,['training',String(l.status).toLowerCase()]));
      if(l.level===1) for(const j of tm.level1?.jobs??[]){const jn=add(baseNode('training-job',j.id,j.title,j.contract,j.status==='COMPLETE'?'VERIFIED':'REVIEWED',ref,['training','level-1',j.family,String(j.status).toLowerCase()]));edges.push(edge('contains',ln.id,jn.id,'training-manifest','docs/training/TRAINING_MANIFEST.json'));}
    }
  }
  const missionsDir=join(root,'missions');
  if(existsSync(missionsDir)) for(const name of readdirSync(missionsDir).filter(x=>/^V2-\d+[A-Z]\.json$/.test(x)).sort()){
    const id=name.replace('.json',''),missionPath=join(missionsDir,name),m=readJson(missionPath),resultPath=join(missionsDir,`${id}.result.json`);
    const result=existsSync(resultPath)?readJson(resultPath):null;
    const truth=result?(String(result.verdict??result.status)==='PASS'?'VERIFIED':'OBSERVED'):'OBSERVED';
    const n=add(baseNode('mission',id,id,String(m.title??m.goal??m.objective??id),truth,{kind:'mission',ref:`missions/${name}`,abs:missionPath},['mission',String(result?.verdict??'open').toLowerCase()]));
    if(nodes.some(x=>x.id==='titan:talos')&&truth==='VERIFIED') edges.push(edge('verified-by',n.id,'titan:talos','mission-result',`missions/${id}.result.json`));
  }
  const workDir=join(root,'.othrys','work');
  if(existsSync(workDir)) for(const name of readdirSync(workDir).filter(x=>x.endsWith('.work.json')).sort()){
    const path=join(workDir,name),w=readJson(path),missionId=String(w.sourceMissionId??name.replace('.work.json',''));
    const n=add(baseNode('work',w.workId??missionId,w.title??missionId,w.problem??'Durable Work object','VERIFIED',{kind:'work-record',ref:`.othrys/work/${name}`,abs:path},['work','workflow']));
    const missionNode=atlasNodeId('mission',missionId); if(nodes.some(x=>x.id===missionNode)) edges.push(edge('created-during',n.id,missionNode,'work-record',`.othrys/work/${name}`));
  }
  const reviewsDir=join(root,'.othrys','knowledge','reviews');
  const reviews=existsSync(reviewsDir)?readdirSync(reviewsDir).filter(x=>x.endsWith('.json')).sort().map(name=>readJson(join(reviewsDir,name))):[];
  const reviewedIds=new Set(reviews.map(x=>x.itemId));
  const inboxDir=join(root,'.othrys','knowledge','inbox');
  if(existsSync(inboxDir)) for(const name of readdirSync(inboxDir).filter(x=>x.endsWith('.json')).sort()){
    const path=join(inboxDir,name),item=readJson(path),reviewed=reviewedIds.has(item.id),tags=['research','inbox',reviewed?'reviewed':'awaiting-review'];
    const n=add(baseNode('research',item.id,item.title,item.classification??'INBOX','RESEARCH',{kind:'mnemosyne-inbox',ref:`.othrys/knowledge/inbox/${name}`,abs:path},tags));
    const source=nodes.find(x=>x.type==='knowledge'&&String(item.source?.ref??'').includes(x.title));
    if(source) edges.push(edge('derived-from',n.id,source.id,'mnemosyne-inbox',`.othrys/knowledge/inbox/${name}`,'INFERENCE'));
  }
  const degree=new Map(); for(const e of edges){degree.set(e.from,(degree.get(e.from)??0)+1);degree.set(e.to,(degree.get(e.to)??0)+1)}
  const active=String(state.active_mission?.mission_id??'');
  for(const n of nodes){
    const links=degree.get(n.id)??0,evidence=n.provenance?.length??0,reuse=n.type==='capability'?3:n.type==='knowledge'?2:1;
    n.gravity=knowledgeGravity({truth:n.truthClass,evidence,reuse,links,recency:.7,consequence:['project','titan','system'].includes(n.type)?.9:.5});
    if(n.type==='mission'&&n.title===active) n.heat=1;
  }
  nodes.sort((a,b)=>a.id.localeCompare(b.id)); edges.sort((a,b)=>a.id.localeCompare(b.id));
  const summary={nodeCount:nodes.length,edgeCount:edges.length,byType:Object.fromEntries([...new Set(nodes.map(x=>x.type))].sort().map(t=>[t,nodes.filter(x=>x.type===t).length])),
    byTruth:Object.fromEntries([...new Set(nodes.map(x=>x.truthClass))].sort().map(t=>[t,nodes.filter(x=>x.truthClass===t).length])),
    inboxCount:nodes.filter(x=>x.tags.includes('inbox')).length,reviewCount:nodes.filter(x=>x.tags.includes('awaiting-review')).length,reviewedCount:reviews.length,conflictCount:nodes.filter(x=>x.truthClass==='CONFLICTED').length};
  const graph={schema:ATLAS_SCHEMA,generatedAt:new Date().toISOString(),projectId:manifest.projectId,nodes,edges,summary,digest:null,authorityGranted:false,executionStarted:false};
  const issues=validateAtlasGraph(graph); if(issues.length) throw new Error(`ATLAS_INVALID:${issues.join(',')}`);
  graph.digest=graphDigest(graph); return Object.freeze(graph);
}
