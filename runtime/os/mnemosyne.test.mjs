import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { assembleKnowledgeContext, captureKnowledgeInbox, declaredKnowledge, deriveContextWarnings, exportKnowledge, knowledgeProjection, maintainKnowledge, reviewKnowledgeInbox, searchKnowledge } from './mnemosyne.mjs';

const root=resolve(import.meta.dirname,'../..');
const manifest=JSON.parse(readFileSync(join(root,'.othrys','project.json'),'utf8'));

test('declared project knowledge is explicit, digest-bound and authority-free',()=>{
  const items=declaredKnowledge(root,manifest);
  assert.equal(items.length,manifest.knowledge.length);
  assert.ok(items.some(x=>x.id==='source-north-star'&&x.present));
  assert.ok(items.every(x=>x.authorityGranted===false));
  assert.ok(items.filter(x=>x.present).every(x=>/^[0-9a-f]{64}$/.test(x.contentDigest)));
});

test('local search is deterministic over inspectable project sources',()=>{
  const a=searchKnowledge(root,manifest,'PandaOS Work State');
  const b=searchKnowledge(root,manifest,'PandaOS Work State');
  assert.deepEqual(a,b);
  assert.equal(a.authorityGranted,false);
  assert.ok(a.results.some(x=>x.id==='source-panda-harvest'));
});

test('context capsule anchors current House Books and Atlas relations before estate history',()=>{
  const a=assembleKnowledgeContext(root,manifest,'Mnemosyne',{limit:6});
  const b=assembleKnowledgeContext(root,manifest,'Mnemosyne',{limit:6});
  assert.deepEqual(a,b);
  assert.equal(a.authorityGranted,false);
  assert.equal(a.projectTruth[0].id,'book-mnemosyne');
  assert.ok(a.related.some(x=>x.id==='system:mnemosyne'&&x.exactMatch===true));
  assert.ok(a.estateEvidence.length>0);
  assert.ok(a.projectTruth.every(x=>x.selectedBecause));
  assert.ok(a.related.every(x=>x.selectedBecause));
});

test('capture lands in inbox and review cannot silently promote it',()=>{
  const d=mkdtempSync(join(tmpdir(),'mnemosyne-'));
  try{
    const capture=captureKnowledgeInbox(d,{title:'Panda Atlas note',text:'Atlas keeps project knowledge explicit and searchable.',source:'panda-lab',capturedAt:'2026-08-28T20:00:00.000Z'});
    assert.equal(capture.status,'CAPTURED');
    assert.equal(capture.item.status,'AWAITING_REVIEW');
    assert.equal(capture.item.promoted,false);
    const review=reviewKnowledgeInbox(d,capture.item.id,{decision:'PROMOTE',classification:'RESEARCH',evidence:'operator-review',reviewedAt:'2026-08-28T20:01:00.000Z'});
    assert.equal(review.status,'REVIEWED_NOT_PROMOTED');
    assert.equal(review.review.promoted,false);
    assert.equal(review.review.authorityGranted,false);
  }finally{rmSync(d,{recursive:true,force:true});}
});

test('maintenance reports problems without mutating knowledge',()=>{
  const d=mkdtempSync(join(tmpdir(),'mnemosyne-maint-'));
  try{
    writeFileSync(join(d,'known.md'),'known fact','utf8');
    const m={projectId:'x',knowledge:[{id:'known',label:'Known',class:'CANONICAL',path:'known.md'},{id:'missing',label:'Missing',class:'RESEARCH',path:'missing.md'}]};
    const report=maintainKnowledge(d,m);
    assert.deepEqual(report.missingSources,['source-missing']);
    assert.equal(report.mutationsPerformed,0);
    assert.equal(report.healthy,false);
  }finally{rmSync(d,{recursive:true,force:true});}
});
test('export is reconstructible and contains no hidden-memory claim',()=>{
  const out=exportKnowledge(root,manifest);
  assert.equal(out.projectId,'othrys-v2');
  assert.equal(out.authorityGranted,false);
  assert.match(out.exportDigest,/^[0-9a-f]{64}$/);
  const north=out.sources.find(x=>x.id==='source-north-star');
  assert.ok(north?.content?.includes('OTHRYS OS'));
  assert.equal(north.contentDigest,createHash('sha256').update(north.content).digest('hex'));
});

test('Mnemosyne projection exposes lifecycle but no write API or opaque memory',()=>{
  const view=knowledgeProjection(root,manifest);
  assert.deepEqual(view.lifecycle,['CAPTURE','CLASSIFY','REVIEW','SEARCH','MAINTAIN','EXPORT']);
  assert.equal(view.writeApiEnabled,false);
  assert.equal(view.opaqueMemory,false);
  assert.equal(view.greatHarvest.status,'READY');
  assert.ok(view.greatHarvest.indexedObjects>0);
  assert.ok(view.greatHarvest.liveOnlyCount>=0);
  assert.ok(view.greatHarvest.perimeterCount>0);
  assert.ok(view.greatHarvest.perimeterClassifications.CANONICAL>=1);
  assert.equal(view.greatHarvest.authorityGranted,false);
  assert.equal(view.authorityGranted,false);
});

test('source paths cannot escape the project',()=>{
  const bad={projectId:'x',knowledge:[{id:'escape',label:'Escape',class:'BAD',path:'../secret.txt'}]};
  assert.throws(()=>declaredKnowledge(root,bad),/KNOWLEDGE_PATH_ESCAPE/);
});

test('context budget stays bounded and Atlas relations remain explainable',()=>{
  const out=assembleKnowledgeContext(root,manifest,'Mnemosyne',{limit:6});
  assert.equal(out.contextBudget.total,6);
  assert.ok(out.contextBudget.selected<=6);
  assert.ok(out.related.every(x=>Array.isArray(x.relationKinds)));
  assert.ok(out.related.some(x=>x.id==='system:mnemosyne'));
});

test('derived warnings expose stale and divergent evidence without authority',()=>{
  const warnings=deriveContextWarnings({
    maintenance:{missingSources:['source-missing'],awaitingReview:[]},
    graphSummary:{conflictCount:1},
    estateEvidence:[
      {id:'estate-a',contentDigest:'a',currentness:{status:'SUPERSEDED',currentRefs:0,changedRefs:1,missingRefs:0},source:{refs:[{lineage:'repo:x',path:'docs/fact.md'}]}},
      {id:'estate-b',contentDigest:'b',currentness:{status:'CURRENT',currentRefs:1,changedRefs:0,missingRefs:0},source:{refs:[{lineage:'repo:x',path:'docs/fact.md'}]}}
    ]
  });
  assert.ok(warnings.some(x=>x.kind==='estate-source-currentness'&&x.status==='SUPERSEDED'));
  assert.ok(warnings.some(x=>x.kind==='source-divergence'&&x.digests.length===2));
  assert.ok(warnings.some(x=>x.kind==='atlas-conflicts'));
});

test('Mnemosyne estate results carry logical zone and Source Vault facets',()=>{
  const search=searchKnowledge(root,manifest,'Mnemosyne',{limit:12});
  const estate=search.results.filter(x=>x.id.startsWith('estate-'));
  assert.ok(estate.length>0);
  assert.ok(estate.every(x=>x.zone&&x.zone.authorityGranted===false));
  assert.ok(estate.filter(x=>x.status==='ARCHIVED').every(x=>x.zone.sourceVault===true));
  const context=assembleKnowledgeContext(root,manifest,'Mnemosyne',{limit:8});
  assert.ok(context.estateEvidence.every(x=>x.zone&&x.zone.reasons.length>0));
});

test('Mnemosyne projection points to stable current zone and security policy artifacts',()=>{
  const view=knowledgeProjection(root,manifest);
  assert.equal(view.zonePolicy,'docs/KNOWLEDGE_ZONES.md');
  assert.equal(view.securityPosture,'docs/HECATONCHEIRES_POSTURE.json');
  assert.equal(view.authorityGranted,false);
});

test('resident Switchyard is current project truth and Atlas evidence without a second registry',()=>{
  const c=assembleKnowledgeContext(root,manifest,'Switchyard',{limit:8});
  assert.ok(c.projectTruth.some(x=>x.id==='book-switchyard'&&x.source?.kind==='HOUSE_BOOK'));
  assert.ok(c.related.some(x=>x.id==='system:switchyard'&&x.exactMatch===true));
  assert.equal(c.authorityGranted,false);
  assert.equal(c.transportCapsule.authorityGranted,false);
});

test('resident Prometheus is current project truth and Atlas evidence without a second registry',()=>{
  const c=assembleKnowledgeContext(root,manifest,'Prometheus',{limit:8});
  assert.ok(c.projectTruth.some(x=>x.id==='book-prometheus'&&x.source?.kind==='HOUSE_BOOK'));
  assert.ok(c.related.some(x=>x.id==='system:prometheus'&&x.exactMatch===true));
  assert.equal(c.authorityGranted,false);
  assert.equal(c.transportCapsule.authorityGranted,false);
});
