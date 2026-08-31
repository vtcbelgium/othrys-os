import test from 'node:test'; import assert from 'node:assert/strict';
import {resolveThreshold} from '../src/index.mjs';
const r=[{threshold:0,name:'A'},{threshold:100,name:'B'},{threshold:300,name:'C'}];
test('resolves current and next rung',()=>{const x=resolveThreshold(150,r);assert.equal(x.index,1);assert.deepEqual(x.current,{threshold:100,name:'B'});assert.deepEqual(x.next,{threshold:300,name:'C'});assert.equal(x.progress,.25);assert(Object.isFrozen(x));});
test('below first threshold clamps progress',()=>{const x=resolveThreshold(-10,r);assert.equal(x.index,0);assert.equal(x.progress,0);});
test('top rung has full progress and no next',()=>{const x=resolveThreshold(999,r);assert.equal(x.index,2);assert.equal(x.next,null);assert.equal(x.progress,1);});
test('rejects invalid values and ladders',()=>{assert.throws(()=>resolveThreshold(NaN,r),/INVALID_VALUE/);assert.throws(()=>resolveThreshold(1,[]),/INVALID_LADDER/);assert.throws(()=>resolveThreshold(1,[{threshold:0},{threshold:0}]),/INVALID_LADDER/);});
test('does not expose caller rung objects',()=>{const x=resolveThreshold(0,r);x.current.name='X';assert.equal(r[0].name,'A');});
