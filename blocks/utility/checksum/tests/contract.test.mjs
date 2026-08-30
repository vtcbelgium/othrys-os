import test from 'node:test';import assert from 'node:assert/strict';import {checksum} from '../src/index.mjs';
test('sha256 hello',()=>assert.equal(checksum('hello'),'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'));
test('sha512 length',()=>assert.equal(checksum('hello','sha512').length,128));
test('bytes same as string',()=>assert.equal(checksum(new TextEncoder().encode('hello')),checksum('hello')));
test('base64',()=>assert.equal(checksum('hello','sha256','base64'),'LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ='));
test('empty string valid',()=>assert.equal(checksum('').length,64));
test('bad algorithm',()=>assert.throws(()=>checksum('x','md5'),RangeError));
test('bad encoding',()=>assert.throws(()=>checksum('x','sha256','utf8'),RangeError));
test('bad input',()=>assert.throws(()=>checksum({}),TypeError));
