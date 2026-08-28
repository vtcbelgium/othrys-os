import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { buildAtlasProjection, missionPass } from './atlas_projection.mjs';
import { knowledgeGravity, knowledgeHeat, validateAtlasGraph, looksSecret, graphDigest } from './atlas_model.mjs';
import { MUSES, routeToMuses } from './muses.mjs';

const root=resolve(import.meta.dirname,'../..');
test('Nine Muses remain semantic gates, not graph authorities',()=>{
  assert.equal(MUSES.length,9);
  assert.deepEqual(routeToMuses({type:'incident',title:'builder failure',tags:['postmortem']}),['melpomene']);
  assert.ok(routeToMuses({type:'capability',title:'proven block',tags:['success']}).includes('thalia'));
});
test('gravity and heat are bounded and meaningful',()=>{
  assert.ok(knowledgeGravity({truth:'CANONICAL',evidence:5,reuse:10,links:10,recency:1,consequence:1})>.85);
  assert.ok(knowledgeGravity({truth:'INFERRED'})<.5);
  assert.ok(knowledgeHeat({touches:5,changes:2,ageHours:1})>knowledgeHeat({ageHours:500}));
});
test('Atlas derives a secret-free authority-free graph from V2 truth',()=>{
  const graph=buildAtlasProjection(root,{active_mission:{mission_id:'V2-010E'}});
  assert.equal(graph.schema,'othrys.os.atlas.v2');
  assert.equal(graph.projectId,'othrys-v2');
  assert.equal(validateAtlasGraph(graph).length,0);
  assert.ok(graph.nodes.some(x=>x.id==='project:othrys-v2'&&x.truthClass==='CANONICAL'));
  assert.ok(graph.nodes.some(x=>x.id==='titan:talos'));
  assert.ok(graph.nodes.some(x=>x.id==='knowledge:north-star'));
  assert.ok(graph.nodes.some(x=>x.id==='mission:v2-010e'));
  assert.ok(graph.edges.some(x=>x.type==='verified-by'&&x.to==='titan:talos'));
  assert.ok(graph.nodes.every(x=>x.authorityGranted===false));
  assert.equal(graph.authorityGranted,false);
  assert.equal(graph.executionStarted,false);
  assert.match(graph.digest,/^[0-9a-f]{64}$/);
});
test('Atlas graph is deterministically ordered',()=>{
  const graph=buildAtlasProjection(root,{});
  assert.deepEqual(graph.nodes.map(x=>x.id),[...graph.nodes.map(x=>x.id)].sort());
  assert.deepEqual(graph.edges.map(x=>x.id),[...graph.edges.map(x=>x.id)].sort());
});
test('Atlas digest is stable when source evidence is unchanged',()=>{
  const a=buildAtlasProjection(root,{}),b=buildAtlasProjection(root,{});
  assert.equal(a.digest,b.digest);
});

test('Atlas refuses secret-shaped browser data',()=>{
  assert.equal(looksSecret('ordinary token bucket prose'),false);
  assert.equal(looksSecret('api_key: SuperSecretValue123'),true);
  const graph=structuredClone(buildAtlasProjection(root,{}));graph.nodes[0].description='token=abcdefghijklmnopqrstuvwxyz123456';
  assert.ok(validateAtlasGraph(graph).some(x=>x.startsWith('secret:')));
});

test('evidence pointers cannot self-certify and legacy passing proof remains valid',()=>{
  assert.equal(missionPass(root,'V2-999Z'),false);
  assert.equal(missionPass(root,'V2-002B'),true);
  assert.equal(missionPass(root,'V2-010F'),true);
  const graph=buildAtlasProjection(root,{});
  assert.equal(graph.nodes.find(x=>x.id==='titan:talos')?.truthClass,'VERIFIED');
  assert.equal(graph.nodes.find(x=>x.id==='system:atlas')?.truthClass,'VERIFIED');
});

test('live gravity and heat overlays do not mutate graph evidence identity',()=>{
  const graph=structuredClone(buildAtlasProjection(root,{})),before=graphDigest(graph);
  graph.nodes[0].gravity=0; graph.nodes[0].heat=1;
  assert.equal(graphDigest(graph),before);
});
