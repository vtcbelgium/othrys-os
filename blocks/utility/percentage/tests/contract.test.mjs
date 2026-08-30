import test from 'node:test';import assert from 'node:assert/strict';import {percentOf,percentChange,portion} from '../src/index.mjs';
test('percent of',()=>assert.equal(percentOf(25,200),12.5));
test('percent change up',()=>assert.equal(percentChange(100,125),25));
test('percent change negative base uses abs',()=>assert.equal(percentChange(-100,-50),50));
test('portion',()=>assert.equal(portion(240,15),36));
test('zero denominators',()=>{assert.throws(()=>percentOf(1,0),RangeError);assert.throws(()=>percentChange(0,1),RangeError)});
test('bad values',()=>assert.throws(()=>portion('100',10),TypeError));
test('negative zero normalized',()=>assert.equal(Object.is(portion(-0,5),-0),false));
