import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSclerotium, portableTextDigest, verifySclerotium } from './sclerotium.mjs';

const required=['.othrys/project.json','BOOK_OF_GPT.md','FOUNDATION_LAWS.md','GPT_RAILS.md','GPT_STATE.json','books/BOOK_REGISTRY.json'];
function fixture(projectId='othrys-v2'){
  const root=mkdtempSync(join(tmpdir(),'othrys-sclerotium-'));
  mkdirSync(join(root,'.othrys'),{recursive:true}); mkdirSync(join(root,'books'),{recursive:true});
  writeFileSync(join(root,'.othrys','project.json'),JSON.stringify({projectId}));
  for(const rel of required.filter(x=>x!=='.othrys/project.json')) writeFileSync(join(root,rel),`${rel}\r\ntruth\r\n`);
  return root;
}

test('portable digest is identical for LF, CRLF and UTF-8 BOM',()=>{
  assert.equal(portableTextDigest('a\r\nb\r\n'),portableTextDigest('a\nb\n'));
  assert.equal(portableTextDigest('\uFEFFa\nb\n'),portableTextDigest('a\nb\n'));
});

test('clean-root manifest is minimal, classified, secret-free and authority-free',t=>{
  const root=fixture(); t.after(()=>rmSync(root,{recursive:true,force:true}));
  const m=buildSclerotium(root,{sourceRevision:'abc123'}),v=verifySclerotium(root,m);
  assert.equal(v.ok,true); assert.equal(v.preservedCount,6); assert.equal(m.sourcePayloadCopied,false);
  assert.equal(m.secretsCopied,false); assert.equal(m.automaticRestore,false); assert.equal(m.authorityGranted,false);
  assert.deepEqual(new Set(m.items.map(x=>x.classification)),new Set(['PRESERVE_EVIDENCE','REBUILD','REACQUIRE','REBIND','EXCLUDE']));
});
test('preserved evidence corruption fails closed',t=>{
  const root=fixture(); t.after(()=>rmSync(root,{recursive:true,force:true}));
  const m=buildSclerotium(root); writeFileSync(join(root,'GPT_RAILS.md'),'tampered\n');
  assert.equal(verifySclerotium(root,m).reason,'PRESERVED_CORRUPT');
});

test('wrong project body fails closed',t=>{
  const root=fixture('othrys-v2'); t.after(()=>rmSync(root,{recursive:true,force:true}));
  const m=buildSclerotium(root); writeFileSync(join(root,'.othrys','project.json'),JSON.stringify({projectId:'other'}));
  assert.equal(verifySclerotium(root,m).reason,'WRONG_BODY');
});

test('manifest tampering fails closed',t=>{
  const root=fixture(); t.after(()=>rmSync(root,{recursive:true,force:true}));
  const m=buildSclerotium(root); const bad={...m,sourceRevision:'invented'};
  assert.equal(verifySclerotium(root,bad).reason,'MANIFEST_CORRUPT');
});

test('secret-shaped payload is rejected even when hidden in a binding',t=>{
  const root=fixture(); t.after(()=>rmSync(root,{recursive:true,force:true}));
  const m=buildSclerotium(root); const items=m.items.map(x=>({...x})); items.push({id:'bad',classification:'REBIND',apiKey:'actual-value'});
  const bad={...m,items};
  assert.equal(verifySclerotium(root,bad).reason,'SECRET_PAYLOAD_PRESENT');
});
test('live OTHRYS checkout produces a valid portable survival manifest',()=>{
  const root=new URL('../..',import.meta.url).pathname.replace(/^\/(.:)/,'$1');
  const m=buildSclerotium(root,{sourceRevision:'live-test'}),v=verifySclerotium(root,m);
  assert.equal(v.ok,true); assert.equal(v.projectId,'othrys-v2'); assert.equal(v.secretsCopied,false);
});

test('missing required current-House evidence prevents sclerotium creation',t=>{
  const root=fixture(); t.after(()=>rmSync(root,{recursive:true,force:true}));
  rmSync(join(root,'BOOK_OF_GPT.md'));
  assert.throws(()=>buildSclerotium(root),/RECOVERY_REQUIRED_MISSING/);
});
