import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadProjectManifest, validateProjectManifest } from './project_manifest.mjs';

export const PROJECT_CREATE_SCHEMA='othrys.os.project-create.v1';
export const PROJECT_TEMPLATE_SCHEMA='othrys.os.project-template.v1';

function ids(items){ return new Map(items.map(x=>[x.id??x.role,x])); }
function refs(values,name){
  if(values==null) return [];
  if(!Array.isArray(values)||values.some(x=>typeof x!=='string'||!x)) throw new Error(`INVALID_${name}`);
  if(new Set(values).size!==values.length) throw new Error(`DUPLICATE_${name}`);
  return values;
}
function slug(value){
  if(typeof value!=='string'||!/^[a-z0-9][a-z0-9-]{1,62}$/.test(value)) throw new Error('INVALID_PROJECT_ID');
  return value;
}
function label(value){
  if(typeof value!=='string'||!value.trim()||value.length>80) throw new Error('INVALID_PROJECT_LABEL');
  return value.trim();
}

export function loadProjectTemplate(root,templateId){
  if(!/^[a-z0-9][a-z0-9-]*$/.test(String(templateId??''))) throw new Error('INVALID_TEMPLATE_ID');
  const path=join(root,'runtime','os','templates',`${templateId}.json`);
  if(!existsSync(path)) throw new Error('PROJECT_TEMPLATE_NOT_FOUND');
  const template=JSON.parse(readFileSync(path,'utf8'));
  if(template.schema!==PROJECT_TEMPLATE_SCHEMA||template.templateId!==templateId) throw new Error('INVALID_PROJECT_TEMPLATE');
  return template;
}
function resolveRequested(requested,available,name,predicate=()=>true){
  const table=ids(available),out=[];
  for(const id of requested){
    const item=table.get(id); if(!item) throw new Error(`UNKNOWN_${name}:${id}`);
    if(!predicate(item)) throw new Error(`INELIGIBLE_${name}:${id}`);
    out.push(structuredClone(item));
  }
  return out;
}

export function planProjectMaterialization(root,request){
  if(!request||request.schema!==PROJECT_CREATE_SCHEMA) throw new Error('INVALID_PROJECT_CREATE_SCHEMA');
  const base=loadProjectManifest(root),template=loadProjectTemplate(root,request.templateId);
  const projectId=slug(request.projectId),projectLabel=label(request.label);
  const roleIds=refs(request.roles??template.defaultRoles,'ROLES');
  const capabilityIds=refs(request.capabilities??template.defaultCapabilities,'CAPABILITIES');
  const knowledgeIds=refs(request.knowledge??template.defaultKnowledge,'KNOWLEDGE');
  const integrationIds=refs(request.integrations??template.defaultIntegrations,'INTEGRATIONS');
  const roleBindings=resolveRequested(roleIds,base.roleBindings??[],'ROLE');
  const capabilities=resolveRequested(capabilityIds,base.capabilities,'CAPABILITY',x=>x.status==='PROVEN');
  const knowledge=resolveRequested(knowledgeIds,base.knowledge,'KNOWLEDGE');
  const integrations=resolveRequested(integrationIds,base.integrations,'INTEGRATION');
  const authorityIds=new Set(roleBindings.filter(x=>x.authorityClass==='TITAN'&&x.authority).map(x=>x.authority));
  const authorities=base.authorities.filter(x=>authorityIds.has(x.id)).map(x=>structuredClone(x));
  const trust=base.systems.find(x=>x.id===template.work.approvalAuthority);
  const manifest={
    schema:'othrys.os.project.v1',projectId,label:projectLabel,kind:template.kind,canonicalRoot:'.',
    parentProjectId:base.projectId,engineRef:{projectId:base.projectId,mode:'GOVERNED_V2'},
    paths:{work:'.othrys/work',knowledge:'.othrys/knowledge',rules:'.othrys/rules',capabilities:'.othrys/capabilities',ux:'.othrys/ux',logs:'.othrys/logs'},
    work:structuredClone(template.work),authorities,systems:trust?[structuredClone(trust)]:[],capabilities,
    roleBindings,modelPolicy:structuredClone(base.modelPolicy),integrations,knowledge,knowledgePolicy:structuredClone(base.knowledgePolicy),atlasPolicy:structuredClone(base.atlasPolicy),
    operatingModes:{...structuredClone(base.operatingModes),default:template.defaultOperatingMode,declarativeGrant:false},
    authorityGranted:false,executionStarted:false
  };
  validateProjectManifest(manifest);
  return Object.freeze({
    schema:'othrys.os.project-plan.v1',templateId:template.templateId,projectId,manifest,
    directories:['work','knowledge','rules','capabilities','ux','logs'],authorityGranted:false,executionStarted:false
  });
}

const readme=`# OTHRYS OS project\n\nThis workspace is governed by project-local \`.othrys/project.json\`.\n\nThe manifest describes Work, roles, capability references, model policy, knowledge and integrations. It cannot grant execution authority; consequential actions remain behind the parent OTHRYS V2 Trust/Talos gates.\n`;
export function materializeProject(targetRoot,plan){
  if(!plan||plan.schema!=='othrys.os.project-plan.v1'||plan.authorityGranted!==false||plan.executionStarted!==false) throw new Error('INVALID_PROJECT_PLAN');
  const root=resolve(targetRoot),othrys=join(root,'.othrys'),projectPath=join(othrys,'project.json');
  const bytes=JSON.stringify(plan.manifest,null,2)+'\n';
  mkdirSync(othrys,{recursive:true});
  if(existsSync(projectPath)){
    const current=readFileSync(projectPath,'utf8');
    if(current!==bytes) throw new Error('PROJECT_EXISTS_CONFLICT');
    validateProjectManifest(JSON.parse(current));
    return {status:'EXISTS',root,projectPath,authorityGranted:false,executionStarted:false};
  }
  writeFileSync(projectPath,bytes,'utf8');
  writeFileSync(join(othrys,'README.md'),readme,'utf8');
  for(const dir of plan.directories) mkdirSync(join(othrys,dir),{recursive:true});
  return {status:'MATERIALIZED',root,projectPath,authorityGranted:false,executionStarted:false};
}
