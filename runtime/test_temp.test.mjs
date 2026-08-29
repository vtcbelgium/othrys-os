import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { cleanupTestTemps, makeTestTemp } from './test_temp.mjs';

const root=resolve(import.meta.dirname);

test('test temp helper retracts registered disposable roots',()=>{
  const dir=makeTestTemp('othrys-temp-proof-');
  writeFileSync(join(dir,'proof.txt'),'x');
  assert.equal(existsSync(dir),true);
  cleanupTestTemps();
  assert.equal(existsSync(dir),false);
});

test('known leak families cannot use raw mkdtemp directly',()=>{
  const prefixes=['othrys-tc-','othrys-heph-','othrys-gate-','othrys-factory-'];
  const files=[];
  const walk=d=>{for(const name of readdirSync(d)){const p=join(d,name),st=statSync(p); if(st.isDirectory()) walk(p); else if(/\.test\.(?:ts|mjs|js)$/.test(name)) files.push(p);}};
  walk(root);
  for(const file of files){
    const text=readFileSync(file,'utf8');
    if(prefixes.some(p=>text.includes(p))) assert.doesNotMatch(text,/mkdtempSync\s*\(.*othrys-(?:tc|heph|gate|factory)-/s,file);
  }
});
