import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { classifyKnowledgeZone, projectKnowledgeZones } from './knowledge_zones.mjs';

const root=resolve(import.meta.dirname,'../..');
const item=(path,{status='ARCHIVED',currentness='CURRENT'}={})=>({status,contentDigest:'a'.repeat(64),source:{refs:[{repo:'fixture',path}]},currentness:{status:currentness}});

test('zone classifier separates current navigation, blueprints, Garden, R&D, Chronicle and Hall',()=>{
  assert.equal(classifyKnowledgeZone(item('docs/current.md')).zone,'GREAT_LIBRARY');
  assert.equal(classifyKnowledgeZone(item('crown/blueprint.mjs')).zone,'BLUEPRINT_VAULT');
  assert.equal(classifyKnowledgeZone(item('great-library/garden-seeds/idea.md')).zone,'GARDEN');
  assert.equal(classifyKnowledgeZone(item('docs/research/benchmark.md')).zone,'R_AND_D');
  assert.equal(classifyKnowledgeZone(item('V2_CHRONICLE.md')).zone,'CHRONICLE');
  assert.equal(classifyKnowledgeZone(item('docs/current.md',{currentness:'SUPERSEDED'})).zone,'HALL_OF_ECHOES');
});

test('Source Vault is an evidence facet, never an authority or second store',()=>{
  const archived=classifyKnowledgeZone(item('docs/current.md'));
  const excluded=classifyKnowledgeZone(item('docs/unsafe.md',{status:'EXCLUDED'}));
  assert.equal(archived.sourceVault,true); assert.equal(archived.authorityGranted,false);
  assert.equal(excluded.sourceVault,false); assert.equal(excluded.zone,'QUARANTINE');
});
test('live zone projection is bounded, reconstructible and authority-free',()=>{
  const view=projectKnowledgeZones(root,'Mnemosyne',{limit:8});
  assert.equal(view.schema,'othrys.os.knowledge-zones.v1');
  assert.equal(view.authorityGranted,false); assert.equal(view.mutationPerformed,false);
  assert.equal(view.sourceVault.newStorageEngine,false);
  assert.ok(view.results.length>0&&view.results.length<=8);
  assert.ok(view.results.every(x=>x.zone.authorityGranted===false&&x.zone.reasons.length>0));
  assert.ok(view.results.filter(x=>x.status==='ARCHIVED').every(x=>x.zone.sourceVault===true));
});

test('stable zone and security policy are declared project-local knowledge',async()=>{
  const { loadProjectManifest }=await import('./project_manifest.mjs');
  const manifest=loadProjectManifest(root);
  const byId=new Map(manifest.knowledge.map(x=>[x.id,x]));
  assert.equal(byId.get('knowledge-zones')?.path,'docs/KNOWLEDGE_ZONES.md');
  assert.equal(byId.get('hecatoncheires-posture')?.path,'docs/HECATONCHEIRES_POSTURE.json');
});

test('zone projection is deterministic and Blueprint classification cannot self-approve',()=>{
  const a=projectKnowledgeZones(root,'Blueprint',{limit:8});
  const b=projectKnowledgeZones(root,'Blueprint',{limit:8});
  assert.deepEqual(a,b);
  for(const result of a.results){
    assert.equal(result.zone.authorityGranted,false);
    assert.equal(Object.hasOwn(result.zone,'approved'),false);
  }
});

test('zone classification uses source paths, not suggestive repository names',()=>{
  const result={status:'ARCHIVED',contentDigest:'b'.repeat(64),source:{refs:[{repo:'othrys-hub-blueprint-studio-001',path:'.claude/agents/reviewer.md'}]},currentness:{status:'CURRENT'}};
  const zone=classifyKnowledgeZone(result);
  assert.equal(zone.zone,'GREAT_LIBRARY');
  assert.deepEqual(zone.basisRefs,[]);
});

test('Hall of Echoes recognizes explicit historical paths and exposes classification basis',()=>{
  const result={status:'ARCHIVED',contentDigest:'c'.repeat(64),source:{refs:[{repo:'fixture',path:'archive/deprecated-design.md'}]},currentness:{status:'CURRENT'}};
  const zone=classifyKnowledgeZone(result);
  assert.equal(zone.zone,'HALL_OF_ECHOES');
  assert.deepEqual(zone.basisRefs,['fixture/archive/deprecated-design.md']);
  assert.equal(zone.authorityGranted,false);
});

test('zone-filtered projection filters after relevance search without rewriting rank semantics',()=>{
  const general=projectKnowledgeZones(root,'Blueprint',{limit:50});
  assert.ok(general.results.length>0);
  const filtered=projectKnowledgeZones(root,'Blueprint',{limit:10,zone:'BLUEPRINT_VAULT'});
  assert.equal(filtered.requestedZone,'BLUEPRINT_VAULT');
  assert.ok(filtered.results.length>0);
  assert.ok(filtered.results.every(x=>x.zone.zone==='BLUEPRINT_VAULT'));
  const generalIds=general.results.map(x=>x.id);
  assert.deepEqual(filtered.results.map(x=>x.id),general.results.filter(x=>x.zone.zone==='BLUEPRINT_VAULT').slice(0,10).map(x=>x.id));
  assert.ok(filtered.results.every(x=>generalIds.includes(x.id)));
  assert.throws(()=>projectKnowledgeZones(root,'Blueprint',{zone:'IMAGINARY'}),/KNOWLEDGE_ZONE_INVALID/);
});
