import test from 'node:test';import assert from 'node:assert/strict';import {checkSchema} from './checkSchema.mjs';
test('valid',()=>assert.deepEqual(checkSchema({a:'xx'},{a:{required:true,type:'string',minLength:2}}),[]));
test('missing',()=>assert.deepEqual(checkSchema({}, {a:{required:true}}),[{field:'a',code:'MISSING'}]));
test('type',()=>assert.deepEqual(checkSchema({a:1},{a:{type:'string'}}),[{field:'a',code:'TYPE'}]));
test('multiple order',()=>assert.deepEqual(checkSchema({a:'x',b:'BAD'},{a:{minLength:2},b:{pattern:'^[a-z]+$'}}),[{field:'a',code:'MIN_LENGTH'},{field:'b',code:'PATTERN'}]));
test('array and object',()=>{assert.deepEqual(checkSchema({a:[]},{a:{type:'array'}}),[]);assert.deepEqual(checkSchema({a:{}},{a:{type:'object'}}),[])});
test('frozen',()=>{const r=checkSchema({}, {a:{required:true}});assert.equal(Object.isFrozen(r),true);assert.equal(Object.isFrozen(r[0]),true)});
test('bad rule key',()=>assert.throws(()=>checkSchema({}, {a:{wat:true}}),RangeError));
test('bad regex',()=>assert.throws(()=>checkSchema({a:'x'},{a:{pattern:'['}}),RangeError));
