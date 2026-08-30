import test from 'node:test';import assert from 'node:assert/strict';import {jsonValidate} from '../src/index.mjs';
test('valid object frozen',()=>{const r=jsonValidate('{"a":1}');assert.deepEqual(r,{valid:true,error:null,position:null,line:null,column:null});assert.equal(Object.isFrozen(r),true)});
test('valid scalar',()=>assert.equal(jsonValidate('null').valid,true));
test('invalid never throws',()=>assert.equal(jsonValidate('{oops}').valid,false));
test('invalid result frozen',()=>assert.equal(Object.isFrozen(jsonValidate('{oops}')),true));
test('position implies computed line and column',()=>{const input='{\n  "a": 1,\n  oops\n}';const r=jsonValidate(input);if(r.position!==null){const pre=input.slice(0,r.position);const lines=pre.split('\n');assert.equal(r.line,lines.length);assert.equal(r.column,lines.at(-1).length+1)}});
