import test from 'node:test';
import assert from 'node:assert/strict';
import { metabolizeEvidenceCapsule, metabolizeEvidenceCapsuleCached, metabolizeSelectedKnowledge } from './context_metabolism.mjs';
import { mkdtempSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const D='a'.repeat(64),E='b'.repeat(64);
const item=(id,overrides={})=>({id,classification:'COMPRESSIBLE',grounding:'GROUNDED',digest:D,
  required:false,authorityRelevant:false,payload:{id,text:'x'.repeat(1000)},artifactRef:`sha256:${D}`,...overrides});

test('real reference substitution reduces serialized transport bytes',()=>{
  const p=metabolizeEvidenceCapsule({capsuleId:'c1',items:[item('estate-a')],frozenIdentities:['estate-a']});
  assert.equal(p.referenced.length,1); assert.equal(p.evicted.length,0);
  assert.ok(p.afterBytes<p.beforeBytes); assert.equal(p.items[0].transport,'REFERENCE');
  assert.equal(p.requiredEvidenceLost,0); assert.equal(p.authorityEvidenceLost,0); assert.equal(p.identityExpansion,0);
  assert.equal(p.authorityGranted,false); assert.equal(p.executionStarted,false);
});

test('pinned and active evidence stay full even when a reference exists',()=>{
  const items=[item('p',{classification:'PINNED'}),item('a',{classification:'ACTIVE'})];
  const p=metabolizeEvidenceCapsule({capsuleId:'c2',items,frozenIdentities:['p','a']});
  assert.deepEqual(p.items.map(x=>x.transport),['FULL','FULL']); assert.equal(p.referenced.length,0);
});
test('only optional evictable evidence may disappear',()=>{
  const items=[item('drop',{classification:'EVICTABLE',artifactRef:null}),item('required',{classification:'EVICTABLE',required:true,artifactRef:null}),item('authority',{classification:'EVICTABLE',authorityRelevant:true,artifactRef:null})];
  const p=metabolizeEvidenceCapsule({capsuleId:'c3',items,frozenIdentities:['drop','required','authority']});
  assert.deepEqual(p.evicted,['drop']); assert.deepEqual(p.items.map(x=>x.id),['required','authority']);
  assert.deepEqual(p.items.map(x=>x.transport),['FULL','FULL']);
});

test('compressible without a real reference stays full rather than inventing byte savings',()=>{
  const p=metabolizeEvidenceCapsule({capsuleId:'c4',items:[item('x',{artifactRef:null})],frozenIdentities:['x']});
  assert.equal(p.items[0].transport,'FULL'); assert.deepEqual(p.items[0].payload,{id:'x',text:'x'.repeat(1000)}); assert.equal(p.referenced.length,0);
});

test('frozen identity skeleton rejects enrichment scope expansion',()=>{
  assert.throws(()=>metabolizeEvidenceCapsule({capsuleId:'c5',items:[item('allowed'),item('invented',{digest:E,artifactRef:`sha256:${E}`})],frozenIdentities:['allowed']}),/CONTEXT_IDENTITY_EXPANSION/);
});

test('unsatisfied transport budget fails closed instead of dropping useful evidence',()=>{
  assert.throws(()=>metabolizeEvidenceCapsule({capsuleId:'c6',items:[item('p',{classification:'PINNED',artifactRef:null})],frozenIdentities:['p'],maxBytes:10}),/CONTEXT_BUDGET_UNSATISFIED/);
});

test('capsule digest is deterministic and grounding labels are preserved',()=>{
  const args={capsuleId:'c7',items:[item('a',{grounding:'CANONICAL'}),item('b',{grounding:'UNVERIFIED',artifactRef:null})],frozenIdentities:['a','b'],catalogDigest:E};
  const x=metabolizeEvidenceCapsule(args),y=metabolizeEvidenceCapsule(args);
  assert.equal(x.capsuleDigest,y.capsuleDigest); assert.equal(x.catalogDigest,E);
  assert.deepEqual(x.items.map(i=>i.grounding),['CANONICAL','UNVERIFIED']);
});


test('knowledge adapter preserves frozen selected identities while compacting reconstructible estate evidence',()=>{
  const full={schema:'othrys.os.context-capsule.v1',query:'x',projectTruth:[{id:'book-x',contentDigest:D,title:'X'}],estateEvidence:[{id:'estate-x',contentDigest:E,excerpt:'z'.repeat(2000),currentness:{status:'CURRENT'}}],related:[{id:'system:x',title:'X'}],warnings:[],estateCatalogSha256:D};
  const p=metabolizeSelectedKnowledge(full);
  assert.equal(p.requiredEvidenceLost,0); assert.equal(p.identityExpansion,0); assert.ok(p.reductionBytes>1000);
  assert.deepEqual(p.items.map(x=>x.id),['projectTruth:book-x','estateEvidence:estate-x','related:system:x']);
  assert.equal(p.items.find(x=>x.id==='projectTruth:book-x').transport,'FULL');
  assert.equal(p.items.find(x=>x.id==='estateEvidence:estate-x').transport,'REFERENCE');
});

test('real context metabolism action reuses exact verified output on second run',()=>{
  const root=mkdtempSync(join(tmpdir(),'othrys-context-cache-'));
  try{
    const args={capsuleId:'cached-c1',items:[item('estate-a')],frozenIdentities:['estate-a']};
    const reuse={cacheRoot:root,claimId:'claim-context',workKey:'1'.repeat(64),compatibilityDigest:'2'.repeat(64),acceptanceDigest:'3'.repeat(64),provenanceDigest:'4'.repeat(64),freshnessDigest:'5'.repeat(64),verifierEvidenceDigest:'6'.repeat(64),producerId:'context-metabolism'};
    const first=metabolizeEvidenceCapsuleCached(args,reuse),second=metabolizeEvidenceCapsuleCached(args,reuse);
    assert.equal(first.executed,true); assert.equal(first.reuse.outcome,'MISS'); assert.equal(first.stored,true);
    assert.equal(second.executed,false); assert.equal(second.reuse.outcome,'HIT'); assert.deepEqual(second.capsule,first.capsule);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('freshness change recomputes once, records refusal, then reuses new artifact',()=>{
  const root=mkdtempSync(join(tmpdir(),'othrys-context-stale-'));
  try{
    const args={capsuleId:'cached-c2',items:[item('estate-a')],frozenIdentities:['estate-a']};
    const baseReuse={cacheRoot:root,claimId:'claim-context',workKey:'7'.repeat(64),compatibilityDigest:'8'.repeat(64),acceptanceDigest:'9'.repeat(64),provenanceDigest:'a'.repeat(64),freshnessDigest:'b'.repeat(64),verifierEvidenceDigest:'c'.repeat(64),producerId:'context-metabolism'};
    metabolizeEvidenceCapsuleCached(args,baseReuse);
    const changed={...baseReuse,freshnessDigest:'d'.repeat(64)};
    const second=metabolizeEvidenceCapsuleCached(args,changed),third=metabolizeEvidenceCapsuleCached(args,changed);
    assert.equal(second.executed,true); assert.equal(second.reuse.outcome,'REFUSED'); assert.equal(second.reuse.reason,'FRESHNESS_STALE');
    assert.equal(third.executed,false); assert.equal(third.reuse.outcome,'HIT');
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('independent context execution never stores or reuses',()=>{
  const root=mkdtempSync(join(tmpdir(),'othrys-context-independent-'));
  try{
    const args={capsuleId:'cached-c3',items:[item('estate-a')],frozenIdentities:['estate-a']};
    const reuse={cacheRoot:root,claimId:'verify-context',reusePolicy:'INDEPENDENT_EXECUTION_REQUIRED',workKey:'e'.repeat(64),compatibilityDigest:'f'.repeat(64),acceptanceDigest:'1'.repeat(64),provenanceDigest:'2'.repeat(64),freshnessDigest:'3'.repeat(64),verifierEvidenceDigest:'4'.repeat(64),producerId:'independent-verifier'};
    const first=metabolizeEvidenceCapsuleCached(args,reuse),second=metabolizeEvidenceCapsuleCached(args,reuse);
    assert.equal(first.executed,true); assert.equal(first.stored,false); assert.equal(first.reuse.outcome,'REFUSED');
    assert.equal(second.executed,true); assert.equal(second.stored,false); assert.equal(second.reuse.outcome,'REFUSED');
  }finally{rmSync(root,{recursive:true,force:true});}
});
