import test from 'node:test';import assert from 'node:assert/strict';import {nextRetry} from '../src/index.mjs';
test('first',()=>assert.deepEqual(nextRetry({attempt:1,maxAttempts:3}),{retry:true,nextAttempt:2,delayMs:1000,reason:'RETRY'}));
test('exponential',()=>assert.equal(nextRetry({attempt:3,maxAttempts:5,baseDelayMs:100,multiplier:3}).delayMs,900));
test('cap',()=>assert.equal(nextRetry({attempt:5,maxAttempts:6,baseDelayMs:1000,maxDelayMs:5000,multiplier:2}).delayMs,5000));
test('deterministic jitter',()=>assert.equal(nextRetry({attempt:1,maxAttempts:2,baseDelayMs:1000,jitter:.25}).delayMs,1250));
test('refuse',()=>assert.deepEqual(nextRetry({attempt:3,maxAttempts:3}),{retry:false,nextAttempt:null,delayMs:null,reason:'MAX_ATTEMPTS'}));
test('frozen',()=>assert.equal(Object.isFrozen(nextRetry({attempt:1,maxAttempts:2})),true));
test('bad integer',()=>assert.throws(()=>nextRetry({attempt:1.2,maxAttempts:2}),RangeError));
test('bad jitter',()=>assert.throws(()=>nextRetry({attempt:1,maxAttempts:2,jitter:2}),RangeError));
