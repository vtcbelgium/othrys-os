import test from 'node:test';import assert from 'node:assert/strict';import {csvClean} from './csvClean.mjs';
test('normalizes CRLF',()=>assert.equal(csvClean('a,b\r\n1,2\r\n'),'a,b\n1,2'));
test('preserves spaces',()=>assert.equal(csvClean(' a , b '),' a , b '));
test('quoted comma',()=>assert.equal(csvClean('a,"b,c"\n1,2'),'a,"b,c"\n1,2'));
test('escaped quote',()=>assert.equal(csvClean('a,"b""c"'),'a,"b""c"'));
test('quoted newline',()=>assert.equal(csvClean('a,"b\nc"\r\n1,2'),'a,"b\nc"\n1,2'));
test('empty input',()=>assert.equal(csvClean(''),''));
test('unterminated quote',()=>assert.throws(()=>csvClean('a,"b'),SyntaxError));
