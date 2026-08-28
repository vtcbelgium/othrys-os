import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { captureKnowledgeInbox, declaredKnowledge, exportKnowledge, knowledgeProjection, maintainKnowledge, reviewKnowledgeInbox, searchKnowledge } from './mnemosyne.mjs';

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
  assert.equal(view.authorityGranted,false);
});

test('source paths cannot escape the project',()=>{
  const bad={projectId:'x',knowledge:[{id:'escape',label:'Escape',class:'BAD',path:'../secret.txt'}]};
  assert.throws(()=>declaredKnowledge(root,bad),/KNOWLEDGE_PATH_ESCAPE/);
});
