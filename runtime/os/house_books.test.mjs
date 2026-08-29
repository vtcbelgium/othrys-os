import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const manifest=JSON.parse(readFileSync(join(root,'.othrys','project.json'),'utf8'));
const registry=JSON.parse(readFileSync(join(root,'books','BOOK_REGISTRY.json'),'utf8'));
const required=new Set([
  'othrys-os','gpt','missions-work','blocks','oroi-projects','models',
  ...manifest.authorities.map(x=>x.id),
  ...manifest.systems.map(x=>x.id),
  manifest.knowledgePolicy.service
]);

test('every current OTHRYS OS house surface has exactly one Book',()=>{
  assert.equal(registry.schema,'othrys.os.book-registry.v1');
  assert.equal(registry.authorityGranted,false);
  assert.equal(registry.automaticPromotion,false);
  const ids=registry.books.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of required){
    const matches=registry.books.filter(x=>x.id===id);
    assert.equal(matches.length,1,`Book coverage for ${id}`);
    assert.equal(existsSync(join(root,matches[0].path)),true,`Book file for ${id}`);
  }
});
test('quarry-only systems cannot appear as current house Books',()=>{
  const ids=new Set(registry.books.map(x=>x.id));
  for(const id of []) assert.equal(ids.has(id),false,id);
});

test('OTHRYS OS edition Books are evidence-bound and non-authoritative',()=>{
  for(const book of registry.books){
    assert.ok(Array.isArray(book.evidence)&&book.evidence.length>0,book.id);
    assert.equal(book.status,'CURRENT_OS_EDITION');
    if(book.id==='gpt') continue;
    const body=readFileSync(join(root,book.path),'utf8');
    assert.match(body,/## Canonical evidence/);
    assert.match(body,/## Current house law/);
    assert.match(body,/non-authoritative|grants no authority|not execution authority/i);
  }
});

