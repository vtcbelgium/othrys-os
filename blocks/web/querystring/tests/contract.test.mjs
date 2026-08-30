import test from 'node:test';import assert from 'node:assert/strict';import {parseQuery,buildQuery} from '../src/index.mjs';
test('parse simple null proto frozen',()=>{const r=parseQuery('?b=2&a=1');assert.equal(Object.getPrototypeOf(r),null);assert.equal(Object.isFrozen(r),true);assert.equal(r.a,'1')});
test('parse duplicates frozen array',()=>{const r=parseQuery('a=1&a=2');assert.deepEqual(r.a,['1','2']);assert.equal(Object.isFrozen(r.a),true)});
test('decode plus',()=>assert.equal(parseQuery('q=hello+world').q,'hello world'));
test('build sorted',()=>assert.equal(buildQuery({b:2,a:1}),'a=1&b=2'));
test('build arrays',()=>assert.equal(buildQuery({a:['x','y']}),'a=x&a=y'));
test('null undefined empty',()=>assert.equal(buildQuery({a:null,b:undefined}),'a=&b='));
test('reject nested',()=>assert.throws(()=>buildQuery({a:{x:1}}),TypeError));
