import test from 'node:test';import assert from 'node:assert/strict';import {markdownTable} from '../src/index.mjs';
test('basic sorted columns',()=>assert.equal(markdownTable([{b:2,a:1}]),'| a | b |\n| --- | --- |\n| 1 | 2 |'));
test('union missing',()=>assert.equal(markdownTable([{a:1},{b:2}]),'| a | b |\n| --- | --- |\n| 1 |  |\n|  | 2 |'));
test('custom columns',()=>assert.equal(markdownTable([{a:1,b:2}],{columns:['b','a']}),'| b | a |\n| --- | --- |\n| 2 | 1 |'));
test('escaping',()=>assert.equal(markdownTable([{x:'a|b\\c'}]),'| x |\n| --- |\n| a\\|b\\\\c |'));
test('newlines',()=>assert.equal(markdownTable([{x:'a\r\nb'}]),'| x |\n| --- |\n| a<br>b |'));
test('empty',()=>assert.equal(markdownTable([]),''));
test('bad nested',()=>assert.throws(()=>markdownTable([{x:{a:1}}]),TypeError));
test('bad columns',()=>assert.throws(()=>markdownTable([{a:1}],{columns:['a','a']}),RangeError));
