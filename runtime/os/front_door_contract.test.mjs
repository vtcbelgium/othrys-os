import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const read=name=>readFileSync(join(root,name),'utf8');
const INTERNAL='OTHRYS_OS_INTERNAL_PROGRESS.md';
const BUILD='OTHRYS_OS_BUILD_PLAN.md';
const HARVEST='OTHRYS_OS_EXTERNAL_HARVEST.md';

test('front-door control files are UTF-8 without BOM',()=>{
  for(const name of [INTERNAL,BUILD,HARVEST,'BOOK_OF_GPT.md','LOOP_LAWS.md']){
    const bytes=readFileSync(join(root,name));
    assert.equal(bytes.subarray(0,3).equals(Buffer.from([0xef,0xbb,0xbf])),false,`${name} has UTF-8 BOM drift`);
  }
});

test('front-door control files are present and ordered by Book of GPT',()=>{
  const book=read('BOOK_OF_GPT.md');
  for(const name of [INTERNAL,BUILD,HARVEST]) assert.ok(read(name).length>0,`${name} missing`);
  const order=[INTERNAL,BUILD,HARVEST].map(name=>book.indexOf(name));
  assert.ok(order.every(x=>x>=0),'front-door file missing from read order');
  assert.ok(order[0]<order[1]&&order[1]<order[2],'front-door read order drifted');
});test('internal progression remains a live maturity ledger',()=>{
  const doc=read(INTERNAL);
  assert.match(doc,/LIVE FRONT-DOOR CONTROL FILE/);
  assert.match(doc,/\| Room \/ resident \| Progress \|/);
  assert.match(doc,/Hephaestus/);
  assert.match(doc,/Mnemosyne/);
  assert.match(doc,/Housekeeping \/ Drift Control/);
  assert.match(doc,/Percentages are house-manager estimates/i);
});

test('external harvest remains quarantine, not admission',()=>{
  const doc=read(HARVEST);
  assert.match(doc,/LIVE FRONT-DOOR QUARRY REGISTER/);
  for(const p of ['P0','P1','P2','P3']) assert.match(doc,new RegExp(`\\| ${p} \\|`));
  assert.match(doc,/Citation does not admit code/);
  assert.match(doc,/QUARRY -> STUDY -> ADAPT\/REJECT -> MISSION -> VERIFY -> ADMIT/);
  assert.match(doc,/Panda features are woven/i);
});