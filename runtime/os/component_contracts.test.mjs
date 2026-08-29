import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const registry=JSON.parse(readFileSync(join(root,'books','BOOK_REGISTRY.json'),'utf8'));
const dir=join(root,'contracts','components');
const expected=new Map(registry.books.map(book=>[book.id,book]));
const files=readdirSync(dir).filter(name=>name.endsWith('.md')).sort();
const ids=files.map(name=>name.slice(0,-3));
const field=(doc,label)=>doc.match(new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`,'m'))?.[1]?.trim()??'';
const loop=(doc,label)=>doc.match(new RegExp(`^- ${label}:\\s*(.+)$`,'m'))?.[1]?.trim()??'';

test('component contract shelf exactly matches current Book registry',()=>{
  assert.deepEqual(ids,[...expected.keys()].sort());
});

test('every component contract is operationally bounded and evidence-backed',()=>{
  const required=['ID','Book','Owner','Purpose','Inputs','Outputs','Dependencies','Allowed touch','Forbidden touch','Authority','Evidence'];
  const loopFields=['OWNER','TRIGGER','INPUT','STATE','BUDGET','EXIT CONDITION','EVIDENCE','STALL/FAILURE'];
  for(const id of ids){
    const book=expected.get(id),doc=readFileSync(join(dir,`${id}.md`),'utf8');
    assert.match(doc,/^# Component Contract:/m,`${id}: heading missing`);
    for(const name of required) assert.ok(field(doc,name),`${id}: ${name} missing`);
    assert.equal(field(doc,'ID'),`\`${id}\``,`${id}: identity drift`);
    assert.equal(field(doc,'Book'),`\`${book.path}\``,`${id}: Book path drift`);
    assert.equal(existsSync(join(root,book.path)),true,`${id}: Book target missing`);
    assert.equal(field(doc,'Purpose'),book.role,`${id}: purpose/Book drift`);
    assert.match(field(doc,'Authority'),/^NO_SELF_GRANT\b/,`${id}: authority can self-grant`);
    for(const evidence of book.evidence??[]) assert.match(field(doc,'Evidence'),new RegExp(evidence.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`${id}: Book evidence drift ${evidence}`);
    for(const name of loopFields) assert.ok(loop(doc,name),`${id}: loop ${name} missing`);
    assert.match(loop(doc,'BUDGET'),/bounded|hard cap|max(?:imum)?|one |event-driven|deterministic|idempotent|poll\s*>?=|interval\s*>?=|\d+\.\.\d+\s+attempts/i,`${id}: loop budget is not explicitly bounded`);
    assert.doesNotMatch(doc,/\b(?:TODO|TBD)\b/i,`${id}: placeholder drift`);
  }
});

test('Quarry-only surfaces cannot acquire component contracts',()=>{
  for(const id of ['rhea','visual-control']) assert.equal(ids.includes(id),false,id);
});
