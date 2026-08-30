import test from 'node:test';import assert from 'node:assert/strict';import {parseEnvMetadata} from './parseEnvMetadata.mjs';
test('names only',()=>assert.deepEqual(parseEnvMetadata('API_KEY=supersecret\nEMPTY=\n'),[{name:'API_KEY',present:true},{name:'EMPTY',present:false}]));
test('export comments',()=>assert.deepEqual(parseEnvMetadata('#x\n export FOO = bar \n'),[{name:'FOO',present:true}]));
test('duplicates first only',()=>assert.deepEqual(parseEnvMetadata('A=1\nA=\n'),[{name:'A',present:true}]));
test('skip malformed',()=>assert.deepEqual(parseEnvMetadata('NOPE\n1BAD=x\nGOOD=y'),[{name:'GOOD',present:true}]));
test('whitespace empty',()=>assert.deepEqual(parseEnvMetadata('A=   '),[{name:'A',present:false}]));
test('frozen',()=>{const r=parseEnvMetadata('A=x');assert.equal(Object.isFrozen(r),true);assert.equal(Object.isFrozen(r[0]),true)});
test('no secret leakage',()=>{const secret='S3CR3T_TOKEN_VALUE';const r=JSON.stringify(parseEnvMetadata('TOKEN='+secret));assert.equal(r.includes(secret),false)});
test('type',()=>assert.throws(()=>parseEnvMetadata(null),TypeError));
