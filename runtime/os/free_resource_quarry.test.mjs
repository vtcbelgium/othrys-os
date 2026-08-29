import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const quarry=JSON.parse(readFileSync(new URL('../../docs/V2-011J/FREE_RESOURCE_QUARRY.json',import.meta.url),'utf8'));

test('free resource quarry is intelligence only',()=>{assert.equal(quarry.schema,'othrys.os.free-resource-quarry.v1');assert.equal(quarry.authorityGranted,false);assert.equal(quarry.automaticAdmission,false);assert.equal(quarry.policy,'ZERO_MARGINAL_COST_FIRST_RESERVE_LAST_10_PERCENT');});
test('all remote free resources require qualification',()=>{const remote=quarry.candidates.filter(x=>x.class.startsWith('FREE_REMOTE'));assert.ok(remote.length>=4);assert.ok(remote.every(x=>x.admission==='QUALIFICATION_REQUIRED'));});
test('retired providers are rejected instead of silently routed',()=>{const retired=quarry.candidates.find(x=>x.id==='github-models');assert.equal(retired.status,'REJECT');assert.match(retired.reason,/retired/i);});