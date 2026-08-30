import test from 'node:test';import assert from 'node:assert/strict';import {generateFixture} from './generateFixture.mjs';
test('deterministic same',()=>assert.deepEqual(generateFixture({a:{type:'integer'}},7),generateFixture({a:{type:'integer'}},7)));
test('order independent',()=>assert.deepEqual(generateFixture({b:{type:'boolean'},a:{type:'integer'}},9),generateFixture({a:{type:'integer'},b:{type:'boolean'}},9)));
test('null proto frozen',()=>{const r=generateFixture({x:{type:'string'}},1);assert.equal(Object.getPrototypeOf(r),null);assert.equal(Object.isFrozen(r),true)});
test('bounds integer',()=>{const r=generateFixture({x:{type:'integer',min:5,max:5}},3);assert.equal(r.x,5)});
test('enum',()=>assert.ok(['a','b'].includes(generateFixture({x:{type:'enum',values:['a','b']}},2).x)));
test('string prefix',()=>assert.match(generateFixture({x:{type:'string',prefix:'pre'}},1).x,/^pre-\d+$/));
test('different seeds',()=>assert.notDeepEqual(generateFixture({x:{type:'integer'}},1),generateFixture({x:{type:'integer'}},2)));
test('bad rules',()=>{assert.throws(()=>generateFixture({x:{type:'integer',min:2,max:1}},1),RangeError);assert.throws(()=>generateFixture({x:{type:'enum',values:[]}},1),RangeError);assert.throws(()=>generateFixture({x:{type:'wat'}},1),RangeError)});
