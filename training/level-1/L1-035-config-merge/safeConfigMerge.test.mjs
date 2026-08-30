import test from 'node:test';import assert from 'node:assert/strict';import {safeConfigMerge} from './safeConfigMerge.mjs';
test('deep merge',()=>assert.equal(JSON.stringify(safeConfigMerge({a:{x:1},b:1},{a:{y:2}})),JSON.stringify({a:{x:1,y:2},b:1})));
test('array replace',()=>assert.equal(JSON.stringify(safeConfigMerge({a:[1,2]},{a:[3]})),JSON.stringify({a:[3]})));
test('null proto deep frozen',()=>{const r=safeConfigMerge({a:{x:1}},{});assert.equal(Object.getPrototypeOf(r),null);assert.equal(Object.isFrozen(r),true);assert.equal(Object.isFrozen(r.a),true)});
test('sorted keys',()=>assert.deepEqual(Object.keys(safeConfigMerge({z:1,a:1},{m:1})),['a','m','z']));
test('no mutation',()=>{const b={a:{x:1}},o={a:{y:2}};safeConfigMerge(b,o);assert.deepEqual(b,{a:{x:1}});assert.deepEqual(o,{a:{y:2}})});
test('dangerous keys',()=>assert.throws(()=>safeConfigMerge({},JSON.parse('{"__proto__":{"x":1}}')),RangeError));
test('bad nonfinite',()=>assert.throws(()=>safeConfigMerge({a:Infinity},{}),RangeError));
test('bad undefined',()=>assert.throws(()=>safeConfigMerge({a:undefined},{}),TypeError));
