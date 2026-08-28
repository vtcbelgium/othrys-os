import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadProjectManifest } from './project_manifest.mjs';

function missionProven(root,id){
  return typeof id==='string'&&/^V2-/.test(id)&&existsSync(join(root,'missions',`${id}.result.json`));
}

function evidenceStatus(root,item){
  if(item.status==='PROVEN') return 'PROVEN';
  if(missionProven(root,item.statusEvidence??item.evidence)) return 'PROVEN';
  return item.status??'AVAILABLE';
}

function projectTemplates(root){
  const dir=join(root,'runtime','os','templates'); if(!existsSync(dir)) return [];
  const out=[];
  for(const name of readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
    try{const t=JSON.parse(readFileSync(join(dir,name),'utf8'));if(t.schema!=='othrys.os.project-template.v1')continue;out.push({id:t.templateId,label:t.label,kind:t.kind,description:t.description,defaultRoles:t.defaultRoles??[]});}catch{}
  }
  return out;
}
export function projectOsProjection(root,state,missionResults=0){
  const project=loadProjectManifest(root);
  const titans=project.authorities.map(x=>({id:x.id,label:x.label,role:x.role,status:evidenceStatus(root,x)}));
  const systems=[...project.authorities,...project.systems].map(x=>({id:x.id,label:x.label,role:x.role,status:evidenceStatus(root,x)}));
  const blocks=project.capabilities.map(x=>({id:x.id,status:x.status}));
  const models=project.modelPolicy.requests.map(x=>({...x}));
  const apps=project.integrations.map(x=>({
    id:x.id,label:x.label,class:x.class,
    status:x.id==='github-relay'?String(state.control_lifeline?.fallback_a?.status??'GATED'):evidenceStatus(root,x),
    actionable:false,evidence:x.evidence??null
  }));
  const knowledge=project.knowledge.map(x=>({...x,present:existsSync(join(root,x.path))}));
  return Object.freeze({
    schema:'othrys.os.project-projection.v1',
    project:{id:project.projectId,label:project.label,kind:project.kind,work:project.work,roles:project.roleBindings??[],operatingModes:project.operatingModes??null},
    name:project.label,engine:'V2',missionResults,systems,titans,blocks,models,apps,knowledge,templates:projectTemplates(root),
    authorityGranted:false,executionStarted:false
  });
}
