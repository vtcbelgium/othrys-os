import test from 'node:test';import assert from 'node:assert/strict';import {extractNamedFunction,adaptTypescriptFunctionToEsm} from './training_reuse.mjs';
test('extracts bounded named function',()=>{const s='x\nfunction f(a: string): string { if(a){ return a; } return \"\"; }\ny';const x=extractNamedFunction(s,'f');assert.ok(x.startsWith('function f'));assert.ok(x.endsWith('}'));});
test('adapts simple TypeScript signature to ESM',()=>{const x=adaptTypescriptFunctionToEsm('function f(a: string): string { return a; }','f');assert.equal(x,'export function f(a) { return a; }');});
