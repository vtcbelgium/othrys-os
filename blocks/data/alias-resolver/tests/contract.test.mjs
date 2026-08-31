import test from 'node:test'; import assert from 'node:assert/strict';
import {createAliasResolver} from '../src/index.mjs';
const r=createAliasResolver([{key:'off-topic',aliases:['misc'],value:{id:'off'}},{key:'gi-joe',aliases:['joe'],value:{id:'joe'}}],{fallbackKey:'off-topic'});
test('resolves canonical keys and aliases case-insensitively',()=>{assert.deepEqual(r.resolve('GI-JOE'),{id:'joe'});assert.deepEqual(r.resolve(' joe '),{id:'joe'});assert.equal(r.has('misc'),true);});
test('unknown uses declared fallback',()=>{assert.deepEqual(r.resolve('unknown'),{id:'off'});});
test('no fallback returns null',()=>{const x=createAliasResolver([{key:'a',value:1}]);assert.equal(x.resolve('b'),null);});
test('aliases cannot collide or shadow keys',()=>{assert.throws(()=>createAliasResolver([{key:'a',aliases:['x']},{key:'b',aliases:['x']}]),/ALIAS_CONFLICT/);assert.throws(()=>createAliasResolver([{key:'a'},{key:'A'}]),/DUPLICATE_KEY/);});
test('returned values are cloned and API frozen',()=>{const v=r.resolve('joe');v.id='x';assert.deepEqual(r.resolve('joe'),{id:'joe'});assert(Object.isFrozen(r));});
