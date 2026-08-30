import test from 'node:test';import assert from 'node:assert/strict';import {textStats} from '../src/index.mjs';
test('empty',()=>assert.deepEqual(textStats(null),{chars:0,words:0,lines:0}));
test('basic',()=>assert.deepEqual(textStats('hello world'),{chars:11,words:2,lines:1}));
test('line endings',()=>assert.deepEqual(textStats('a\r\nb\rc'),{chars:6,words:3,lines:3}));
test('unicode code points',()=>assert.deepEqual(textStats('\u{1F600} x'),{chars:3,words:2,lines:1}));
test('whitespace-only words',()=>assert.deepEqual(textStats('   '),{chars:3,words:0,lines:1}));
test('result frozen',()=>assert.equal(Object.isFrozen(textStats('x')),true));
