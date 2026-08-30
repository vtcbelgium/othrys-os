import test from 'node:test';import assert from 'node:assert/strict';import {checkMetadata} from './checkMetadata.mjs';
const schema={title:{required:true,type:'string',minLength:2},count:{type:'number'},slug:{type:'string',pattern:'^[a-z-]+$'}};
test('valid frozen',()=>{const r=checkMetadata({title:'Hi',count:2,slug:'hi-x'},schema);assert.equal(r.valid,true);assert.equal(Object.isFrozen(r),true);assert.equal(Object.isFrozen(r.missing),true);assert.equal(Object.isFrozen(r.invalid),true)});
test('missing',()=>assert.deepEqual(checkMetadata({},schema).missing,['title']));
test('invalid type',()=>assert.equal(checkMetadata({title:'Hi',count:'2'},schema).invalid[0].field,'count'));
test('min length',()=>assert.equal(checkMetadata({title:'H'},schema).invalid[0].reason,'minLength'));
test('pattern',()=>assert.equal(checkMetadata({title:'Hi',slug:'No!'},schema).invalid[0].reason,'pattern'));
test('unknown metadata allowed',()=>assert.equal(checkMetadata({title:'Hi',extra:1},schema).valid,true));
test('bad rule throws',()=>assert.throws(()=>checkMetadata({}, {x:{type:'wat'}}),RangeError));
