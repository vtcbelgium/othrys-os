import test from 'node:test';import assert from 'node:assert/strict';import {stableSortRecords} from '../src/index.mjs';
test('numeric asc and immutable',()=>{const a=[{n:10},{n:2}];const r=stableSortRecords(a,['n']);assert.deepEqual(r,[a[1],a[0]]);assert.deepEqual(a,[{n:10},{n:2}]);assert.equal(Object.isFrozen(r),true)});
test('stable ties',()=>{const a=[{k:'x',id:1},{k:'x',id:2}];assert.deepEqual(stableSortRecords(a,['k']).map(x=>x.id),[1,2])});
test('multi-key desc',()=>{const a=[{a:1,b:1},{a:1,b:2},{a:0,b:9}];assert.deepEqual(stableSortRecords(a,['a',{key:'b',direction:'desc'}]),[a[2],a[1],a[0]])});
test('null last asc',()=>{const a=[{x:null},{x:1},{x:undefined}];assert.equal(stableSortRecords(a,['x'])[0],a[1])});
test('lexical strings',()=>assert.deepEqual(stableSortRecords([{x:'b'},{x:'A'},{x:'a'}],['x']).map(r=>r.x),['A','a','b']));
test('invalid direction',()=>assert.throws(()=>stableSortRecords([{a:1}],[{key:'a',direction:'side'}]),RangeError));
test('empty keys invalid',()=>assert.throws(()=>stableSortRecords([],[])));
