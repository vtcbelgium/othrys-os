import test from 'node:test';import assert from 'node:assert/strict';import {csvToJson,jsonToCsv} from '../src/index.mjs';
test('csv basic + frozen',()=>{const r=csvToJson('a,b\n1,2');assert.deepEqual(r,[{a:'1',b:'2'}]);assert.equal(Object.isFrozen(r[0]),true)});
test('quoted csv',()=>assert.deepEqual(csvToJson('a,b\n1,"x,y"'),[{a:'1',b:'x,y'}]));
test('duplicate header',()=>assert.throws(()=>csvToJson('a,a\n1,2'),RangeError));
test('width mismatch',()=>assert.throws(()=>csvToJson('a,b\n1'),RangeError));
test('json basic',()=>assert.equal(jsonToCsv([{a:1,b:'x,y'}]),'a,b\n1,"x,y"'));
test('schema mismatch',()=>assert.throws(()=>jsonToCsv([{a:1},{b:2}]),RangeError));
test('empty both ways',()=>{assert.deepEqual(csvToJson(''),[]);assert.equal(jsonToCsv([]),'')});
