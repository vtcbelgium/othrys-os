import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { loadProjectManifest, validateProjectManifest } from './project_manifest.mjs';
import { projectOsProjection } from './os_projection.mjs';
import { projectMissionWork } from './work_projection.mjs';

const root=resolve(import.meta.dirname,'../..');

test('project manifest is declarative and authority-free',()=>{
  const p=loadProjectManifest(root);
  assert.equal(p.schema,'othrys.os.project.v1');
  assert.equal(p.projectId,'othrys-v2');
  assert.equal(p.kind,'CONTROL_PLANE');
  assert.ok(p.authorities.some(x=>x.id==='hephaestus'));
  assert.ok(p.authorities.some(x=>x.id==='talos'));
  assert.ok(p.capabilities.some(x=>x.id==='media.image-prep'));
  assert.equal(p.authorityGranted,undefined);
  assert.equal(p.executionStarted,undefined);
});

test('manifest validation fails closed',()=>{
  const p=structuredClone(loadProjectManifest(root));
  p.authorityGranted=true;
  assert.throws(()=>validateProjectManifest(p),/CANNOT_GRANT_AUTHORITY/);
  const duplicate=structuredClone(loadProjectManifest(root));
  duplicate.authorities.push({...duplicate.authorities[0]});
  assert.throws(()=>validateProjectManifest(duplicate),/DUPLICATE_AUTHORITIES_ID/);
});
test('OS projection maps manifest to proven V2 surfaces',()=>{
  const os=projectOsProjection(root,{control_lifeline:{fallback_a:{status:'ACTIVE_PROVEN'}}},73);
  assert.equal(os.schema,'othrys.os.project-projection.v1');
  assert.equal(os.project.id,'othrys-v2');
  assert.deepEqual(os.titans.map(x=>x.id),['hephaestus','talos']);
  assert.equal(os.models[0].id,'qwen3-builder');
  assert.equal(os.models[1].status,'ADVISORY ONLY');
  assert.equal(os.models[2].available,false);
  assert.ok(os.apps.every(x=>x.actionable===false));
  assert.ok(os.knowledge.some(x=>x.id==='north-star'&&x.present));
  assert.ok(os.templates.some(x=>x.id==='oros-software'&&x.kind==='OROS'));
  assert.ok(os.project.roles.some(x=>x.role==='reviewer'&&x.authority==='talos'));
  assert.equal(os.project.operatingModes.default,'SUPERVISED_EXECUTE');
  assert.equal(os.mnemosyne.service,'mnemosyne');
  assert.equal(os.mnemosyne.opaqueMemory,false);
  assert.equal(os.mnemosyne.writeApiEnabled,false);
  assert.equal(os.authorityGranted,false);
  assert.equal(os.executionStarted,false);
});

test('Work projection derives state from mission evidence, not chat',()=>{
  const state={active_mission:{mission_id:'V2-010A',status:'COMPLETE'}};
  const work=projectMissionWork(root,state,'V2-010A');
  assert.equal(work.schema,'othrys.os.work-state.v1');
  assert.equal(work.phase,'SHIP');
  assert.ok(work.phases.every(x=>x.status==='COMPLETE'));
  assert.equal(work.owner,'Legion');
  assert.equal(work.verifier,'T590');
  assert.equal(work.authorityGranted,false);
  assert.ok(work.artifacts.some(x=>x.id==='surface-data'&&x.present));
  assert.ok(work.artifacts.some(x=>x.id==='project-manifest'&&x.present));
  assert.ok(work.artifacts.some(x=>x.id==='os-projector'&&x.present));
});

test('knowledge policy cannot enable opaque memory or silent promotion',()=>{
  const opaque=structuredClone(loadProjectManifest(root));
  opaque.knowledgePolicy.opaqueMemory=true;
  assert.throws(()=>validateProjectManifest(opaque),/INVALID_KNOWLEDGE_POLICY/);
  const silent=structuredClone(loadProjectManifest(root));
  silent.knowledgePolicy.promotion='AUTO';
  assert.throws(()=>validateProjectManifest(silent),/INVALID_KNOWLEDGE_POLICY/);
});

test('Atlas policy fails closed when derived/read-only/secret-free law is weakened',()=>{
  const p=structuredClone(loadProjectManifest(root));
  p.atlasPolicy.readOnly=false;
  assert.throws(()=>validateProjectManifest(p),/INVALID_ATLAS_POLICY/);
  const q=structuredClone(loadProjectManifest(root));
  q.atlasPolicy.semanticGates='NEW_GODS';
  assert.throws(()=>validateProjectManifest(q),/INVALID_ATLAS_POLICY/);
});
