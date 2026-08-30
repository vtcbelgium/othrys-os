import test from 'node:test';import assert from 'node:assert/strict';import {estimateCost} from './estimateCost.mjs';
test('hours',()=>assert.deepEqual(estimateCost(80,2),{ratePerHour:80,duration:2,unit:'hours',hours:2,cost:160}));
test('minutes',()=>assert.equal(estimateCost(60,90,'minutes').cost,90));
test('seconds',()=>assert.equal(estimateCost(3600,30,'seconds').cost,30));
test('milliseconds',()=>assert.equal(estimateCost(3600,500,'milliseconds').cost,0.5));
test('frozen',()=>assert.equal(Object.isFrozen(estimateCost(1,1)),true));
test('zero',()=>assert.equal(estimateCost(0,0).cost,0));
test('negative range',()=>assert.throws(()=>estimateCost(-1,1),RangeError));
test('bad unit/type',()=>{assert.throws(()=>estimateCost('1',1),TypeError);assert.throws(()=>estimateCost(1,1,'days'),RangeError)});
