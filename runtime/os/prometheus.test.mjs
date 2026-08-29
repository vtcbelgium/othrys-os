import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrometheusEvidenceArtifact, PROMETHEUS_POLICY, recommendPrometheusCapabilities, scorePrometheusCapability } from './prometheus.mjs';

const cap=(id,over={})=>({
  id,name:id,category:'browser-automation',license:'apache-2.0',status:'active',
  ratings:{freeTier:1,quality:0.9,maintenance:0.9,integrationEase:0.8,latency:0.7},
  evidenceGrade:'editorial-prior',asOf:'2026-08-20',sources:['https://example.test'],legal:true,...over
});

test('Prometheus policy preserves the qualified cap-score-v1 weights',()=>{
  assert.equal(PROMETHEUS_POLICY.id,'cap-score-v1');
  assert.ok(Math.abs(Object.values(PROMETHEUS_POLICY.weights).reduce((a,x)=>a+x,0)-1)<1e-12);
  assert.equal(PROMETHEUS_POLICY.minViableQuality,0.4);
});

test('score is deterministic, explainable and authority-free',()=>{
  const a=scorePrometheusCapability(cap('a'),{asOf:'2026-08-29'});
  const b=scorePrometheusCapability(cap('a'),{asOf:'2026-08-29'});
  assert.deepEqual(a,b);
  assert.equal(a.eligible,true);
  assert.equal(a.authorityGranted,false);
  assert.equal(Object.values(a.contributions).reduce((n,x)=>n+x,0),a.fitness);
});
test('below-floor quality cannot be bought by free/open signals',()=>{
  const out=scorePrometheusCapability(cap('weak',{ratings:{freeTier:1,quality:0.2,maintenance:1,integrationEase:1,latency:1}}),{asOf:'2026-08-29'});
  assert.equal(out.eligible,false);
  assert.equal(out.tier,'avoid');
  assert.match(out.eligibilityFailures[0],/quality/);
});

test('future-dated evidence is suspect rather than freshest',()=>{
  const out=scorePrometheusCapability(cap('future',{asOf:'2099-01-01'}),{asOf:'2026-08-29'});
  assert.equal(out.stale,true);
  assert.equal(out.caveat,'future-dated');
});

test('recommendation filters hard constraints and remains intelligence only',()=>{
  const out=recommendPrometheusCapabilities({category:'browser-automation',mustBeFree:true,openSourceOnly:true},[
    cap('paid',{ratings:{freeTier:0,quality:1,maintenance:1,integrationEase:1,latency:1}}),
    cap('open'),
    cap('wrong',{category:'coding-assistant'})
  ],{asOf:'2026-08-29'});
  assert.equal(out.recommendations[0].capability.id,'open');
  assert.equal(out.rejected.length,2);
  assert.equal(out.authorityGranted,false);
  assert.equal(out.executionStarted,false);
  assert.equal(out.knowledgeAdmitted,false);
});
test('evidence artifact is digest-bound and nested-key-order deterministic',()=>{
  const base={sourceId:'nvidia-api-catalog',sourceUrl:'https://integrate.api.nvidia.com/v1',retrievedAt:'2026-08-29T18:22:31Z',runId:'run-1'};
  const a=createPrometheusEvidenceArtifact({...base,facts:{publisher:'deepseek-ai',nested:{b:2,a:1}}});
  const b=createPrometheusEvidenceArtifact({...base,facts:{nested:{a:1,b:2},publisher:'deepseek-ai'}});
  assert.equal(a.contentDigest,b.contentDigest);
  assert.match(a.contentDigest,/^[0-9a-f]{64}$/);
  assert.equal(a.authorityGranted,false);
  assert.equal(a.knowledgeAdmitted,false);
  assert.equal(a.executionStarted,false);
});

test('unknown or illegal capability facts fail closed',()=>{
  assert.throws(()=>scorePrometheusCapability({id:'x'},{asOf:'2026-08-29'}),/PROMETHEUS_RATINGS_REQUIRED/);
  const out=scorePrometheusCapability(cap('illegal',{legal:false}),{asOf:'2026-08-29'});
  assert.equal(out.eligible,false);
  assert.ok(out.eligibilityFailures.includes('legal=false'));
});
