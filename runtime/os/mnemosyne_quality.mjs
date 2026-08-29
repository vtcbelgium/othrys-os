import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadProjectManifest } from './project_manifest.mjs';
import { maintainKnowledge } from './mnemosyne.mjs';
import { verifyEstateArchive } from './mnemosyne_estate.mjs';

const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const readJsonl=p=>readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
const severityRank={critical:0,high:1,medium:2,low:3,info:4};
function finding(kind,severity,detail,evidence={}){
  return {kind,severity,detail,evidence,suggestedAction:'review-only',authorityGranted:false};
}

export function inspectMnemosyneQuality(root,{projectsRoot=null}={}){
  const manifest=loadProjectManifest(root),findings=[];
  const catalogPath=join(root,'.othrys','knowledge','catalog','estate-catalog.jsonl');
  const summaryPath=join(root,'.othrys','knowledge','catalog','estate-summary.json');
  const objectDir=join(root,'.othrys','knowledge','archive','objects');
  const bookPath=join(root,'books','BOOK_REGISTRY.json');
  if(!existsSync(catalogPath)||!existsSync(summaryPath)) findings.push(finding('estate-missing','high','Estate catalog/summary is missing.'));
  else{
    const records=readJsonl(catalogPath),summary=readJson(summaryPath),proof=verifyEstateArchive(root);
    if(!proof.ok) findings.push(finding('archive-integrity','critical','Content-addressed archive verification failed.',proof));
    const referenced=new Set(records.filter(x=>x.archived===true).map(x=>x.sha256));
    if(existsSync(objectDir)) for(const name of readdirSync(objectDir)) if(!referenced.has(name)) findings.push(finding('orphan-object','medium',`Archive object ${name} is not present in the catalog.`,{sha256:name}));
    const exclusions=records.filter(x=>x.archived!==true);
    if(exclusions.length!==summary.excludedObjects) findings.push(finding('exclusion-count-drift','high','Catalog exclusion count does not match summary.',{catalog:exclusions.length,summary:summary.excludedObjects}));
    const duplicateObjects=records.filter(x=>(x.sources?.length??0)>1).length;
    const duplicateRefs=records.reduce((n,x)=>n+Math.max(0,(x.sources?.length??0)-1),0);
    if(duplicateRefs) findings.push(finding('duplicate-source-collapse','info',`${duplicateRefs} duplicate source occurrences are safely collapsed into ${duplicateObjects} shared content objects.`,{duplicateObjects,duplicateRefs}));
    if(exclusions.length) findings.push(finding('secret-shaped-exclusions','info',`${exclusions.length} source objects are intentionally excluded by leak-shape policy.`,{patterns:[...new Set(exclusions.map(x=>x.leakPattern).filter(Boolean))].sort()}));
    if(projectsRoot){
      let missing=0; const sample=[];
      for(const rec of records) for(const src of rec.sources??[]){
        const p=join(projectsRoot,src.repo,...String(src.path).split('/'));
        if(!existsSync(p)){missing++; if(sample.length<12) sample.push(`${src.repo}/${src.path}`);}
      }
      if(missing) findings.push(finding('source-ref-missing','medium',`${missing} catalog provenance refs no longer resolve in the current estate.`,{sample}));
    }
  }
  const maintenance=maintainKnowledge(root,manifest);
  for(const item of maintenance.missingSources??[]) findings.push(finding('declared-source-missing','high',`Declared knowledge source ${item.id??item.path??'unknown'} is missing.`,item));
  for(const item of maintenance.awaitingReview??[]) findings.push(finding('inbox-awaiting-review','medium',`Inbox item ${item.id??'unknown'} is awaiting review.`,item));
  if(!existsSync(bookPath)) findings.push(finding('book-registry-missing','high','OTHRYS OS Book registry is missing.'));
  else{
    const registry=readJson(bookPath),bookIds=registry.books?.map(x=>x.id)??[];
    const required=new Set(['othrys-os','gpt','missions-work','blocks','oroi-projects','models',...manifest.authorities.map(x=>x.id),...manifest.systems.map(x=>x.id),manifest.knowledgePolicy.service]);
    for(const id of required) if(bookIds.filter(x=>x===id).length!==1) findings.push(finding('book-coverage','high',`House surface ${id} does not have exactly one Book target.`,{id}));
    for(const id of ['prometheus','rhea','switchyard','visual-control']) if(bookIds.includes(id)) findings.push(finding('quarry-promoted-by-doc','high',`Quarry-only surface ${id} appears as a current house Book.`,{id}));
  }
  findings.sort((a,b)=>(severityRank[a.severity]??9)-(severityRank[b.severity]??9)||a.kind.localeCompare(b.kind));
  const defects=findings.filter(x=>x.severity!=='info');
  return Object.freeze({schema:'othrys.os.mnemosyne-quality.v1',ok:defects.length===0,defectCount:defects.length,infoCount:findings.length-defects.length,findings,authorityGranted:false,mutationPerformed:false});
}
