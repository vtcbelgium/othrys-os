import test from 'node:test';import assert from 'node:assert/strict';import {dedupeLines} from './dedupeLines.mjs';
test('stable first occurrence',()=>assert.deepEqual(dedupeLines(['b','a','b','c','a']),['b','a','c']));
test('converts scalars and preserves input',()=>{const src=[1,'1',2];assert.deepEqual(dedupeLines(src),['1','2']);assert.deepEqual(src,[1,'1',2]);});
test('trim option',()=>assert.deepEqual(dedupeLines([' a ','a',' b '],{trim:true}),['a','b']));
test('ignore empty after trim',()=>assert.deepEqual(dedupeLines(['',' ','a',''],{trim:true,ignoreEmpty:true}),['a']));
test('case insensitive preserves first spelling',()=>assert.deepEqual(dedupeLines(['Alpha','alpha','BETA','beta'],{caseSensitive:false}),['Alpha','BETA']));
test('non array fails closed',()=>assert.throws(()=>dedupeLines('a'),TypeError));
