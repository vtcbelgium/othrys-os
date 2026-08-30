import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const q=JSON.parse(readFileSync(new URL('../../docs/V2-011J/FINAL_QUARRY_CENSUS.json',import.meta.url),'utf8'));
test('final quarry census covers complete GitHub and local review envelope',()=>{
 assert.equal(q.status,'CENSUS_COMPLETE_REFINEMENT_PENDING');
 assert.equal(q.scope.githubRepos,11);assert.equal(q.scope.githubTruncatedTrees,0);
 assert.ok(q.scope.githubBlobs>=8950);assert.equal(q.scope.localUniquePlanBodies,127);
 assert.ok(q.scope.localUniqueTaggedCode>=5326);assert.ok(q.scope.duplicateCodeCopiesCollapsed>=46049);
});
test('every final quarry candidate is evidence-bound and inert',()=>{
 assert.equal(q.candidates.length,43);assert.equal(new Set(q.candidates.map(x=>x.id)).size,43);
 assert.ok(q.candidates.every(x=>x.evidence.length&&x.authorityGranted===false));
 assert.deepEqual(q.counts,{candidates:43,reuse:7,adapt:24,reference:7,blueprint:5});
 assert.equal(q.automaticAdmission,false);
});
