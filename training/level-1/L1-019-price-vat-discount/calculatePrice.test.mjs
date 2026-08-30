import test from 'node:test';import assert from 'node:assert/strict';import {calculatePrice} from './calculatePrice.mjs';
test('basic vat',()=>assert.deepEqual(calculatePrice(100,{vatPercent:21}),{subtotal:100,discount:0,net:100,vat:21,total:121,quantity:1,discountPercent:0,vatPercent:21}));
test('discount before vat',()=>assert.deepEqual(calculatePrice(100,{quantity:2,discountPercent:10,vatPercent:20}),{subtotal:200,discount:20,net:180,vat:36,total:216,quantity:2,discountPercent:10,vatPercent:20}));
test('frozen',()=>assert.equal(Object.isFrozen(calculatePrice(1)),true));
test('zero price allowed',()=>assert.equal(calculatePrice(0).total,0));
test('bad quantity',()=>assert.throws(()=>calculatePrice(1,{quantity:0}),RangeError));
test('bad percent',()=>assert.throws(()=>calculatePrice(1,{discountPercent:101}),RangeError));
test('unknown option',()=>assert.throws(()=>calculatePrice(1,{foo:1}),RangeError));
test('bad price type',()=>assert.throws(()=>calculatePrice('1'),TypeError));
