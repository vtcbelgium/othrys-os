import test from 'node:test'; import assert from 'node:assert/strict';
import {canonicalizeJson,stringifyCanonical} from '../src/index.mjs';
test('sorts object keys recursively and preserves arrays',()=>{const v={z:1,a:{y:2,x:3},arr:[{b:2,a:1},0]};assert.deepEqual(canonicalizeJson(v),{a:{x:3,y:2},arr:[{a:1,b:2},0],z:1});assert.deepEqual(v,{z:1,a:{y:2,x:3},arr:[{b:2,a:1},0]});});
test('stringification is deterministic',()=>{assert.equal(stringifyCanonical({b:1,a:2}),'{"a":2,"b":1}');assert.equal(stringifyCanonical({a:2,b:1}),'{"a":2,"b":1}');});
test('rejects unsafe keys',()=>{const v=JSON.parse('{"safe":{"constructor":1}}');assert.throws(()=>canonicalizeJson(v),/UNSAFE_KEY/);});
test('rejects non-json values and cycles',()=>{for(const v of [undefined,Infinity,NaN,()=>{},new Date()]) assert.throws(()=>canonicalizeJson(v),/INVALID_JSON/);const x={};x.self=x;assert.throws(()=>canonicalizeJson(x),/INVALID_JSON/);});
test('returns fresh values',()=>{const x={a:[1]};const y=canonicalizeJson(x);y.a.push(2);assert.deepEqual(x,{a:[1]});});
