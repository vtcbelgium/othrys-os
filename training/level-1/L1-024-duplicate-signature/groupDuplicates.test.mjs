import test from 'node:test';import assert from 'node:assert/strict';import {groupDuplicates} from './groupDuplicates.mjs';
test('groups duplicates',()=>assert.deepEqual(groupDuplicates([{id:'a',digest:'AA'},{id:'b',digest:'aa'}]),[{digest:'aa',ids:['a','b'],sizeConsistent:true}]));
test('skip singles',()=>assert.deepEqual(groupDuplicates([{id:'a',digest:'x'}]),[]));
test('order first appearance',()=>assert.deepEqual(groupDuplicates([{id:'a',digest:'z'},{id:'b',digest:'x'},{id:'c',digest:'z'},{id:'d',digest:'x'}]).map(x=>x.digest),['z','x']));
test('size disagree',()=>assert.equal(groupDuplicates([{id:'a',digest:'x',size:1},{id:'b',digest:'x',size:2}])[0].sizeConsistent,false));
test('missing sizes true',()=>assert.equal(groupDuplicates([{id:'a',digest:'x'},{id:'b',digest:'x'}])[0].sizeConsistent,true));
test('frozen',()=>{const r=groupDuplicates([{id:'a',digest:'x'},{id:'b',digest:'x'}]);assert.equal(Object.isFrozen(r),true);assert.equal(Object.isFrozen(r[0]),true);assert.equal(Object.isFrozen(r[0].ids),true)});
test('bad',()=>assert.throws(()=>groupDuplicates([{id:'',digest:'x'}])));
