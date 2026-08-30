import test from 'node:test';
import assert from 'node:assert/strict';
import {jsonFormat} from './jsonFormat.mjs';

test('pretty canonical output',()=>assert.equal(jsonFormat('{"a":1,"b":[true,null]}'),'{'+'\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}\n'));
test('minify removes insignificant whitespace',()=>assert.equal(jsonFormat(' { "z" : 2, "a": 1 } ','minify'),'{"z":2,"a":1}'));
test('preserves parsed key order',()=>assert.equal(jsonFormat('{"z":2,"a":1}'),'{'+'\n  "z": 2,\n  "a": 1\n}\n'));
test('top-level scalar',()=>assert.equal(jsonFormat('true','minify'),'true'));
test('invalid json propagates SyntaxError',()=>assert.throws(()=>jsonFormat('{oops}'),SyntaxError));
test('unsupported mode fails closed as RangeError',()=>assert.throws(()=>jsonFormat('{}','wide'),RangeError));
