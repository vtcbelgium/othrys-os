import test from 'node:test';import assert from 'node:assert/strict';import {generateChecklist} from './generateChecklist.mjs';
test('strings normalize',()=>assert.deepEqual(generateChecklist(['  Do   thing  ']),[{id:'item-1',text:'Do thing',required:true,done:false}]));
test('provided fields',()=>assert.deepEqual(generateChecklist([{id:'x',text:'A',required:false,done:true}]),[{id:'x',text:'A',required:false,done:true}]));
test('allowOptional false omits',()=>assert.deepEqual(generateChecklist([{text:'A',required:false},{text:'B'}],{allowOptional:false}),[{id:'item-2',text:'B',required:true,done:false}]));
test('frozen deep',()=>{const r=generateChecklist(['A']);assert.equal(Object.isFrozen(r),true);assert.equal(Object.isFrozen(r[0]),true)});
test('duplicate id',()=>assert.throws(()=>generateChecklist([{id:'x',text:'A'},{id:'x',text:'B'}]),RangeError));
test('empty text',()=>assert.throws(()=>generateChecklist(['   ']),RangeError));
test('bad boolean',()=>assert.throws(()=>generateChecklist([{text:'A',done:1}]),TypeError));
test('no mutation',()=>{const x={text:' A '};generateChecklist([x]);assert.equal(x.text,' A ') });
