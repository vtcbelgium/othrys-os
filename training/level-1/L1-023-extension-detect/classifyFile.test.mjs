import test from 'node:test';import assert from 'node:assert/strict';import {classifyFile} from './classifyFile.mjs';
test('image',()=>assert.deepEqual(classifyFile('photo.JPG'),{extension:'jpg',category:'image'}));
test('path basename',()=>assert.deepEqual(classifyFile('C:\\x\\data.JSON'),{extension:'json',category:'data'}));
test('multi dot',()=>assert.deepEqual(classifyFile('/a/archive.tar.gz'),{extension:'gz',category:'archive'}));
test('hidden no ext',()=>assert.deepEqual(classifyFile('.env'),{extension:'',category:'other'}));
test('no ext',()=>assert.deepEqual(classifyFile('README'),{extension:'',category:'other'}));
test('frozen',()=>assert.equal(Object.isFrozen(classifyFile('a.txt')),true));
test('bad',()=>assert.throws(()=>classifyFile(''),TypeError));
