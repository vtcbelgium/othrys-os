import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createArtifactRecord, createRefusalRecord, evaluateArtifactReuse, materializeArtifact, appendRefusal, readRefusals, findArtifactByWorkKey } from './artifact_reuse.mjs';

const H=c=>c.repeat(64);
const base={workKey:H('a'),compatibilityDigest:H('b'),acceptanceDigest:H('c'),provenanceDigest:H('d'),freshnessDigest:H('e'),verifierEvidenceDigest:H('f'),producerId:'legion:qwen3-builder'};
const claim=(overrides={})=>({claimId:'claim-1',reusePolicy:'SHARE_COMPUTATION',workKey:base.workKey,compatibilityDigest:base.compatibilityDigest,acceptanceDigest:base.acceptanceDigest,...overrides});
const current=(overrides={})=>({provenanceDigest:base.provenanceDigest,freshnessDigest:base.freshnessDigest,...overrides});
const payload='verified-output';

test('exact verified artifact is reusable without granting authority',()=>{
  const artifact=createArtifactRecord(base,payload),d=evaluateArtifactReuse({claim:claim(),artifact,payload,current:current()});
  assert.equal(d.outcome,'HIT'); assert.equal(d.reason,'VERIFIED_ARTIFACT_REUSABLE'); assert.equal(d.artifactId,artifact.artifactId);
  assert.equal(d.authorityGranted,false); assert.equal(d.executionStarted,false);
});

test('changed input identity is a clean miss',()=>{
  const artifact=createArtifactRecord(base,payload),d=evaluateArtifactReuse({claim:claim({workKey:H('9')}),artifact,payload,current:current()});
  assert.equal(d.outcome,'MISS'); assert.equal(d.reason,'WORK_KEY_CHANGED');
});

test('compatibility and acceptance mismatches refuse only that reuse edge',()=>{
  const artifact=createArtifactRecord(base,payload);
  assert.equal(evaluateArtifactReuse({claim:claim({compatibilityDigest:H('8')}),artifact,payload,current:current()}).reason,'COMPATIBILITY_MISMATCH');
  assert.equal(evaluateArtifactReuse({claim:claim({acceptanceDigest:H('7')}),artifact,payload,current:current()}).reason,'ACCEPTANCE_MISMATCH');
});

test('stale provenance or freshness refuses reuse',()=>{
  const artifact=createArtifactRecord(base,payload);
  assert.equal(evaluateArtifactReuse({claim:claim(),artifact,payload,current:current({provenanceDigest:H('6')})}).reason,'PROVENANCE_STALE');
  assert.equal(evaluateArtifactReuse({claim:claim(),artifact,payload,current:current({freshnessDigest:H('5')})}).reason,'FRESHNESS_STALE');
});
test('payload corruption becomes UNKNOWN, never a fresh hit',()=>{
  const artifact=createArtifactRecord(base,payload),d=evaluateArtifactReuse({claim:claim(),artifact,payload:'tampered',current:current()});
  assert.equal(d.outcome,'UNKNOWN'); assert.equal(d.reason,'PAYLOAD_INTEGRITY_FAILED');
});

test('independent verification never reuses producer execution',()=>{
  const artifact=createArtifactRecord(base,payload),d=evaluateArtifactReuse({claim:claim({reusePolicy:'INDEPENDENT_EXECUTION_REQUIRED'}),artifact,payload,current:current()});
  assert.equal(d.outcome,'REFUSED'); assert.equal(d.reason,'INDEPENDENT_EXECUTION_REQUIRED');
});

test('durable refusal wins over otherwise valid hit',()=>{
  const artifact=createArtifactRecord(base,payload);
  const refusal=createRefusalRecord({claimId:'claim-1',artifactId:artifact.artifactId,reason:'KNOWN_BAD_ENVIRONMENT',evidenceDigest:H('1')});
  const d=evaluateArtifactReuse({claim:claim(),artifact,payload,current:current(),refusals:[refusal]});
  assert.equal(d.outcome,'REFUSED'); assert.equal(d.reason,'KNOWN_BAD_ENVIRONMENT'); assert.equal(d.refusalId,refusal.refusalId);
});

test('torn or malformed refusal evidence makes reuse UNKNOWN',()=>{
  const artifact=createArtifactRecord(base,payload);
  const d=evaluateArtifactReuse({claim:claim(),artifact,payload,current:current(),refusals:[{schema:'broken'}]});
  assert.equal(d.outcome,'UNKNOWN'); assert.equal(d.reason,'REFUSAL_EVIDENCE_INVALID');
});

test('local artifact store is immutable and idempotent',()=>{
  const root=mkdtempSync(join(tmpdir(),'othrys-artifact-'));
  try{
    const a=materializeArtifact(root,base,payload),b=materializeArtifact(root,base,payload);
    assert.equal(a.status,'MATERIALIZED'); assert.equal(b.status,'EXISTS');
    assert.equal(readFileSync(a.paths.payload,'utf8'),payload);
    assert.equal(findArtifactByWorkKey(root,base.workKey).artifactId,a.record.artifactId);
    writeFileSync(a.paths.payload,'corrupt','utf8');
    assert.throws(()=>materializeArtifact(root,base,payload),/ARTIFACT_STORE_CONFLICT/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
test('refusal ledger is append-only, idempotent and torn state is UNKNOWN',()=>{
  const root=mkdtempSync(join(tmpdir(),'othrys-refusal-'));
  try{
    const artifact=createArtifactRecord(base,payload),refusal=createRefusalRecord({claimId:'claim-1',artifactId:artifact.artifactId,reason:'STALE_TOOLCHAIN',evidenceDigest:H('2')});
    assert.equal(appendRefusal(root,refusal).status,'APPENDED'); assert.equal(appendRefusal(root,refusal).status,'EXISTS');
    let ledger=readRefusals(root); assert.equal(ledger.status,'OK'); assert.equal(ledger.records.length,1);
    const path=join(root,'.othrys','artifact-refusals.jsonl'); writeFileSync(path,readFileSync(path,'utf8')+'{"torn":','utf8');
    ledger=readRefusals(root); assert.equal(ledger.status,'UNKNOWN'); assert.equal(ledger.reason,'REFUSAL_LEDGER_TORN');
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('missing artifact is a legal MISS and incomplete current evidence is UNKNOWN',()=>{
  assert.equal(evaluateArtifactReuse({claim:claim(),artifact:null,payload,current:current()}).outcome,'MISS');
  const artifact=createArtifactRecord(base,payload);
  const d=evaluateArtifactReuse({claim:claim(),artifact,payload,current:{provenanceDigest:base.provenanceDigest}});
  assert.equal(d.outcome,'UNKNOWN'); assert.equal(d.reason,'CURRENT_EVIDENCE_INCOMPLETE');
});
