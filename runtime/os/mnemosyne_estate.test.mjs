import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { estateSummary, searchEstateKnowledge, verifyEstateArchive } from './mnemosyne_estate.mjs';

const sha=value=>createHash('sha256').update(value).digest('hex');
function fixture(){
  const root=mkdtempSync(join(tmpdir(),'othrys-estate-'));
  const catalog=join(root,'.othrys','knowledge','catalog');
  const objects=join(root,'.othrys','knowledge','archive','objects');
  mkdirSync(catalog,{recursive:true}); mkdirSync(objects,{recursive:true});
  const body=Buffer.from('Mnemosyne remembers the boring proof.');
  const safeHash=sha(body),excludedHash=sha('excluded');
  writeFileSync(join(objects,safeHash),body);
  const records=[
    {sha256:safeHash,bytes:body.length,kinds:['document','log'],archived:true,leakPattern:null,sources:[{repo:'othrys-v2',path:'logs/proof.log',lineage:'local:test',branch:'main',head:'abc'}]},
    {sha256:excludedHash,bytes:8,kinds:['document'],archived:false,leakPattern:'akia',sources:[{repo:'legacy',path:'docs/unsafe.md',lineage:'local:legacy',branch:null,head:null}]}
  ];
  const bytes=Buffer.from(records.map(r=>JSON.stringify(r)).join('\n')+'\n');
  writeFileSync(join(catalog,'estate-catalog.jsonl'),bytes);
  const summary={schema:'othrys.os.mnemosyne-estate.v1',workspaceCount:2,occurrences:2,uniqueObjects:2,archivedObjects:1,excludedObjects:1,uniqueBytes:body.length+8,archivedBytes:body.length,logObjects:1,bookObjects:0,catalogSha256:sha(bytes),catalogPath:'.othrys/knowledge/catalog/estate-catalog.jsonl',archivePath:'.othrys/knowledge/archive/objects',authorityGranted:false,automaticPromotion:false};
  writeFileSync(join(catalog,'estate-summary.json'),JSON.stringify(summary,null,2)+'\n');
  return {root,safeHash,excludedHash,objects};
}
test('estate summary and search remain authority-free',()=>{
  const f=fixture();
  try{
    const summary=estateSummary(f.root);
    assert.equal(summary.status,'PRESENT'); assert.equal(summary.authorityGranted,false);
    const byContent=searchEstateKnowledge(f.root,'boring proof');
    assert.equal(byContent.results[0].contentDigest,f.safeHash);
    assert.match(byContent.results[0].excerpt,/boring proof/i);
    const byPath=searchEstateKnowledge(f.root,'unsafe');
    assert.equal(byPath.results[0].status,'EXCLUDED');
    assert.equal(byPath.results[0].leakPattern,'akia');
    assert.equal(byPath.results[0].excerpt,'');
  }finally{rmSync(f.root,{recursive:true,force:true});}
});

test('archive verification proves byte identity and exclusion absence',()=>{
  const f=fixture();
  try{
    const proof=verifyEstateArchive(f.root);
    assert.equal(proof.ok,true); assert.equal(proof.archivedObjects,1); assert.equal(proof.excludedObjects,1);
    writeFileSync(join(f.objects,f.safeHash),'tampered');
    const broken=verifyEstateArchive(f.root);
    assert.equal(broken.ok,false); assert.deepEqual(broken.mismatched,[f.safeHash]);
  }finally{rmSync(f.root,{recursive:true,force:true});}
});

test('catalog digest mismatch fails closed',()=>{
  const f=fixture();
  try{
    const p=join(f.root,'.othrys','knowledge','catalog','estate-catalog.jsonl');
    writeFileSync(p,readFileSync(p,'utf8')+'{}\n');
    assert.throws(()=>searchEstateKnowledge(f.root,'proof'),/ESTATE_CATALOG_DIGEST_MISMATCH/);
  }finally{rmSync(f.root,{recursive:true,force:true});}
});
