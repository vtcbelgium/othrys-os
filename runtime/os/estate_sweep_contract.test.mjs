import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot=resolve(import.meta.dirname,'../..');
const python=process.platform==='win32'?'python':'python3';

test('estate sweep excludes local .othrys logs/runtime but keeps real repo runtime/docs',()=>{
  const projects=mkdtempSync(join(tmpdir(),'othrys-estate-projects-'));
  const root=join(projects,'othrys-fixture');
  try{
    for(const d of ['.git','.othrys/logs','.othrys/runtime','docs','runtime']) mkdirSync(join(root,d),{recursive:true});
    writeFileSync(join(root,'.othrys','logs','pulse.jsonl'),'changing local log\n');
    writeFileSync(join(root,'.othrys','runtime','lock.json'),'local runtime state\n');
    writeFileSync(join(root,'docs','keep.md'),'institutional document\n');
    writeFileSync(join(root,'runtime','keep.json'),'real runtime evidence\n');
    const run=spawnSync(python,[join(repoRoot,'tools','mnemosyne','estate_sweep.py'),'--projects',projects,'--othrys-root',root],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr||run.stdout);
    const catalog=readFileSync(join(root,'.othrys','knowledge','catalog','estate-catalog.jsonl'),'utf8');
    assert.doesNotMatch(catalog,/\.othrys\/logs\//);
    assert.doesNotMatch(catalog,/\.othrys\/runtime\//);
    assert.match(catalog,/docs\/keep\.md/);
    assert.match(catalog,/runtime\/keep\.json/);
  }finally{rmSync(projects,{recursive:true,force:true});}
});

test('estate sweep records secret-shaped metadata but never archives secret-shaped bytes',()=>{
  const projects=mkdtempSync(join(tmpdir(),'othrys-estate-secret-'));
  const root=join(projects,'othrys-fixture');
  try{
    for(const d of ['.git','docs']) mkdirSync(join(root,d),{recursive:true});
    const secret='credential AKIA1234567890ABCDEF must never enter archive\n';
    writeFileSync(join(root,'docs','unsafe.md'),secret,'utf8');
    const run=spawnSync(python,[join(repoRoot,'tools','mnemosyne','estate_sweep.py'),'--projects',projects,'--othrys-root',root],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr||run.stdout);
    const records=readFileSync(join(root,'.othrys','knowledge','catalog','estate-catalog.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
    const unsafe=records.find(x=>x.sources?.some(s=>s.path==='docs/unsafe.md'));
    assert.ok(unsafe); assert.equal(unsafe.archived,false); assert.equal(unsafe.leakPattern,'akia');
    assert.equal(existsSync(join(root,'.othrys','knowledge','archive','objects',unsafe.sha256)),false);
  }finally{rmSync(projects,{recursive:true,force:true});}
});
