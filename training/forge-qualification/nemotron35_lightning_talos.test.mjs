import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {add} from './local_nemotron3_5-lightning-30b-a3b/candidate.mjs';
const result=JSON.parse(readFileSync(new URL('./nemotron35_lightning_worker_result.json',import.meta.url),'utf8'));
test('candidate behavior is exact',()=>assert.equal(add(2,3),5));
test('worker reports successful bounded mutation',()=>{assert.equal(result.ok,true);assert.deepEqual(result.changed_files,['training/forge-qualification/local_nemotron3_5-lightning-30b-a3b/candidate.mjs']);assert.deepEqual(result.out_of_scope_changes,[]);});
test('builder identity is bound',()=>{assert.equal(result.builder_id,'local.nemotron3.5-lightning-30b-a3b');assert.equal(result.capability_selection.model,'nemotron-3.5-lightning:30b-a3b');});
test('candidate source stays minimal',()=>{const s=readFileSync(new URL('./local_nemotron3_5-lightning-30b-a3b/candidate.mjs',import.meta.url),'utf8').trim();assert.equal(s,'export function add(a,b){return a+b}');});