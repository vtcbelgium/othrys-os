import test from 'node:test';import assert from 'node:assert/strict';import {idempotencyKey} from './idempotencyKey.mjs';
test('stable object order',()=>assert.equal(idempotencyKey({b:2,a:1}),idempotencyKey({a:1,b:2})));
test('different differs',()=>assert.notEqual(idempotencyKey({a:1}),idempotencyKey({a:2})));
test('shape',()=>assert.match(idempotencyKey({a:1}),/^othrys:[0-9a-f]{64}$/));
test('namespace trim',()=>assert.match(idempotencyKey({a:1},{namespace:' x '}),/^x:/));
test('array order matters',()=>assert.notEqual(idempotencyKey([1,2]),idempotencyKey([2,1])));
test('nested order stable',()=>assert.equal(idempotencyKey({x:{b:2,a:1}}),idempotencyKey({x:{a:1,b:2}})));
test('reject nonfinite',()=>assert.throws(()=>idempotencyKey({x:Infinity}),RangeError));
test('reject undefined',()=>assert.throws(()=>idempotencyKey({x:undefined}),TypeError));
