import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const q=JSON.parse(readFileSync(new URL('../../docs/V2-011J/FINAL_QUARRY_CENSUS.json',import.meta.url),'utf8'));
test('final quarry is closed over the complete GitHub and local review envelope',()=>{
 assert.equal(q.status,'CLOSED');assert.equal(q.unreviewed,0);
 assert.equal(q.scope.githubRepos,11);assert.equal(q.scope.githubTruncatedTrees,0);
 assert.ok(q.scope.githubBlobs>=8950);assert.equal(q.scope.localUniquePlanBodies,127);
 assert.ok(q.scope.localUniqueTaggedCode>=5326);assert.ok(q.scope.duplicateCodeCopiesCollapsed>=46049);
});
test('all 43 candidates have one terminal disposition and evidence',()=>{
 assert.equal(q.candidates.length,43);assert.equal(new Set(q.candidates.map(x=>x.id)).size,43);
 assert.ok(q.candidates.every(x=>x.evidence.length&&x.reviewed===true&&x.finalDisposition&&x.target&&x.authorityGranted===false&&x.executionStarted===false));
 assert.equal(Object.values(q.finalCounts).reduce((a,b)=>a+b,0),43);assert.equal(q.automaticAdmission,false);
});
test('Odysseus is concept-only because its lineage is AGPL',()=>{
 assert.equal(q.odysseusPolicy.license,'AGPL-3.0-or-later');assert.equal(q.odysseusPolicy.codeTransplantAllowed,false);
 assert.ok(q.candidates.filter(x=>x.finalDisposition==='REFERENCE_ONLY_LICENSE_BOUND').every(x=>x.target==='Great Library reference'));
});