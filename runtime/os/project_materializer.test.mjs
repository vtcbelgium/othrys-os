import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { loadProjectManifest } from './project_manifest.mjs';
import { materializeProject, planProjectMaterialization } from './project_materializer.mjs';

const root=resolve(import.meta.dirname,'../..');
const request={
  schema:'othrys.os.project-create.v1',templateId:'oros-software',projectId:'sample-oros',label:'Sample Oros',
  capabilities:['media.image-prep'],knowledge:['north-star'],integrations:['command-deck-lan']
};

test('project plan composes roles and only proven capability references',()=>{
  const plan=planProjectMaterialization(root,request);
  assert.equal(plan.schema,'othrys.os.project-plan.v1');
  assert.equal(plan.manifest.kind,'OROS');
  assert.equal(plan.manifest.engineRef.projectId,'othrys-v2');
  assert.deepEqual(plan.manifest.roleBindings.map(x=>x.role),['planner','designer','builder','reviewer']);
  assert.equal(plan.manifest.roleBindings.find(x=>x.role==='designer').status,'GATED');
  assert.deepEqual(plan.manifest.capabilities.map(x=>x.id),['media.image-prep']);
  assert.deepEqual(plan.manifest.authorities.map(x=>x.id).sort(),['hephaestus','talos']);
  assert.equal(plan.authorityGranted,false); assert.equal(plan.executionStarted,false);
});

test('unknown and unproven references fail closed',()=>{
  assert.throws(()=>planProjectMaterialization(root,{...request,capabilities:['does.not.exist']}),/UNKNOWN_CAPABILITY/);
  assert.throws(()=>planProjectMaterialization(root,{...request,capabilities:['monetization.affiliate-offer']}),/INELIGIBLE_CAPABILITY/);
  assert.throws(()=>planProjectMaterialization(root,{...request,roles:['invented']}),/UNKNOWN_ROLE/);
  assert.throws(()=>planProjectMaterialization(root,{...request,projectId:'../escape'}),/INVALID_PROJECT_ID/);
});
test('materializer creates only project-local OS substrate and is idempotent',()=>{
  const target=mkdtempSync(join(tmpdir(),'othrys-project-'));
  try{
    const plan=planProjectMaterialization(root,request);
    const first=materializeProject(target,plan); assert.equal(first.status,'MATERIALIZED');
    const loaded=loadProjectManifest(target); assert.equal(loaded.projectId,'sample-oros');
    assert.equal(loaded.authorityGranted,false); assert.equal(loaded.executionStarted,false);
    for(const dir of plan.directories) assert.equal(existsSync(join(target,'.othrys',dir)),true);
    assert.equal(existsSync(join(target,'package.json')),false);
    assert.equal(materializeProject(target,plan).status,'EXISTS');
    const p=join(target,'.othrys','project.json'),tampered=JSON.parse(readFileSync(p,'utf8')); tampered.label='Other';
    writeFileSync(p,JSON.stringify(tampered,null,2)+'\n');
    assert.throws(()=>materializeProject(target,plan),/PROJECT_EXISTS_CONFLICT/);
  }finally{rmSync(target,{recursive:true,force:true});}
});

test('new Oros workspaces inherit Atlas and Mnemosyne knowledge law',()=>{
  const plan=planProjectMaterialization(root,request);
  assert.deepEqual(plan.manifest.atlasPolicy,loadProjectManifest(root).atlasPolicy);
  assert.equal(plan.manifest.atlasPolicy.readOnly,true);
  assert.equal(plan.manifest.atlasPolicy.secretFree,true);
  assert.equal(plan.manifest.atlasPolicy.semanticGates,'NINE_MUSES');
  assert.equal(plan.manifest.knowledgePolicy.service,'mnemosyne');
});
