import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const map=JSON.parse(readFileSync(new URL('../../docs/V2-011J/PANDAOS_CLOSED_CATALOGUE_GAP_MAP.json',import.meta.url),'utf8'));
const cold=JSON.parse(readFileSync(new URL('../../docs/V2-011J/LOCAL_SEARCH_BENCHMARK.json',import.meta.url),'utf8'));
const warm=JSON.parse(readFileSync(new URL('../../docs/V2-011J/LOCAL_SEARCH_BENCHMARK_WARM.json',import.meta.url),'utf8'));

test('Panda H1-H16 are exhaustively classified with only supervised visual control partial',()=>{assert.equal(map.h1ToH16.length,16);assert.equal(new Set(map.h1ToH16.map(x=>x.id)).size,16);assert.equal(map.missingCount,1);assert.deepEqual(map.missing,['H16']);assert.equal(map.h1ToH16.find(x=>x.id==='H16').status,'PARTIAL_GATED');assert.equal(map.uiWorkStarted,false);});
test('autonomous operations remains honestly not earned',()=>{assert.equal(map.steps.find(x=>x.step===8).status,'NOT_YET');assert.equal(map.authorityGranted,false);assert.equal(map.executionStarted,false);});
test('local semantic search qualification is reproducible across cold and warm runs',()=>{for(const x of [cold,warm]){assert.equal(x.status,'PASS');assert.equal(x.accuracy,1);assert.equal(x.queryCount,12);assert.equal(x.model,'embeddinggemma:latest');assert.equal(x.freeLocal,true);assert.equal(x.authorityGranted,false);}assert.ok(warm.docEmbedMs<cold.docEmbedMs);});