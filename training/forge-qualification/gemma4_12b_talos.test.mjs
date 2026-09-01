import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {add} from './local_gemma4-12b/candidate.mjs';
const result=JSON.parse(readFileSync(new URL('./gemma4_12b_worker_result.json',import.meta.url),'utf8'));
test('candidate behavior is exact',()=>assert.equal(add(2,3),5));
test('worker reports successful bounded mutation',()=>{assert.equal(result.ok,true);assert.deepEqual(result.changed_files,['training/forge-qualification/local_gemma4-12b/candidate.mjs']);assert.deepEqual(result.out_of_scope_changes,[]);});
test('builder identity is bound',()=>{assert.equal(result.builder_id,'local.gemma4-12b');assert.equal(result.capability_selection.model,'gemma4:12b');});
test('candidate source stays minimal',()=>{const s=readFileSync(new URL('./local_gemma4-12b/candidate.mjs',import.meta.url),'utf8').trim();assert.equal(s,'export function add(a,b){return a+b}');});