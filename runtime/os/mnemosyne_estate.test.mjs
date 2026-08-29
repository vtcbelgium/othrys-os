import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { estateLexicalCacheStats, estateRecordCurrentness, estateSummary, searchEstateKnowledge, verifyEstateArchive } from './mnemosyne_estate.mjs';

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

test('estate currentness is derived from live source bytes without authority',()=>{
  const f=fixture();
  const parent=join(f.root,'..'),repoA=`source-a-${f.safeHash.slice(0,8)}`,repoB=`source-b-${f.safeHash.slice(0,8)}`;
  const a=join(parent,repoA,'docs'),b=join(parent,repoB,'docs');
  const body=Buffer.from('Mnemosyne remembers the boring proof.');
  const record={sha256:f.safeHash,sources:[{repo:repoA,path:'docs/facts.md'}]};
  try{
    mkdirSync(a,{recursive:true}); mkdirSync(b,{recursive:true});
    writeFileSync(join(a,'facts.md'),body);
    assert.deepEqual(estateRecordCurrentness(f.root,record),{status:'CURRENT',currentRefs:1,changedRefs:0,missingRefs:0,invalidRefs:0,observedRefs:1,authorityGranted:false});
    writeFileSync(join(a,'facts.md'),'changed');
    assert.equal(estateRecordCurrentness(f.root,record).status,'SUPERSEDED');
    writeFileSync(join(b,'facts.md'),body);
    assert.equal(estateRecordCurrentness(f.root,{...record,sources:[...record.sources,{repo:repoB,path:'docs/facts.md'}]}).status,'DIVERGED');
    rmSync(join(a,'facts.md')); rmSync(join(b,'facts.md'));
    assert.equal(estateRecordCurrentness(f.root,record).status,'MISSING');
  }finally{
    rmSync(join(parent,repoA),{recursive:true,force:true}); rmSync(join(parent,repoB),{recursive:true,force:true}); rmSync(f.root,{recursive:true,force:true});
  }
});

test('estate catalog digest is checkout-portable across LF and CRLF',()=>{
  const f=fixture();
  try{
    const p=join(f.root,'.othrys','knowledge','catalog','estate-catalog.jsonl');
    const lf=readFileSync(p,'utf8');
    writeFileSync(p,lf.replace(/\n/g,'\r\n'),'utf8');
    const result=searchEstateKnowledge(f.root,'boring proof');
    assert.equal(result.results[0].contentDigest,f.safeHash);
    assert.equal(result.authorityGranted,false);
  }finally{rmSync(f.root,{recursive:true,force:true});}
});


test('term-hit cache preserves exact repeated search semantics',()=>{
  const f=fixture();
  try{
    const cold=searchEstateKnowledge(f.root,'boring proof',{limit:12});
    const statsAfterCold=estateLexicalCacheStats();
    const warm=searchEstateKnowledge(f.root,'boring proof',{limit:12});
    assert.deepEqual(warm,cold);
    assert.ok(statsAfterCold.terms>=2); assert.equal(estateLexicalCacheStats().terms,statsAfterCold.terms);
  }finally{rmSync(f.root,{recursive:true,force:true});}
});

test('catalog change invalidates term-hit cache and exposes new evidence',()=>{
  const f=fixture();
  try{
    assert.equal(searchEstateKnowledge(f.root,'newneedle').results.length,0);
    const catalogDir=join(f.root,'.othrys','knowledge','catalog'),catalogPath=join(catalogDir,'estate-catalog.jsonl');
    const newBody=Buffer.from('newneedle is present after catalog change'); const newHash=sha(newBody);
    writeFileSync(join(f.objects,newHash),newBody);
    const records=readFileSync(catalogPath,'utf8').trim().split(/\r?\n/).map(JSON.parse);
    records.push({sha256:newHash,bytes:newBody.length,kinds:['document'],archived:true,leakPattern:null,sources:[{repo:'othrys-v2',path:'docs/new.md',lineage:'local:test'}]});
    const bytes=Buffer.from(records.map(r=>JSON.stringify(r)).join('\n')+'\n'); writeFileSync(catalogPath,bytes);
    const summaryPath=join(catalogDir,'estate-summary.json'),summary=JSON.parse(readFileSync(summaryPath,'utf8'));
    Object.assign(summary,{occurrences:3,uniqueObjects:3,archivedObjects:2,uniqueBytes:summary.uniqueBytes+newBody.length,archivedBytes:summary.archivedBytes+newBody.length,catalogSha256:sha(bytes)});
    writeFileSync(summaryPath,JSON.stringify(summary,null,2)+'\n');
    const future=new Date(Date.now()+2000); utimesSync(catalogPath,future,future);
    const result=searchEstateKnowledge(f.root,'newneedle');
    assert.equal(result.results[0].contentDigest,newHash); assert.equal(estateLexicalCacheStats().catalogSha256,summary.catalogSha256);
  }finally{rmSync(f.root,{recursive:true,force:true});}
});
