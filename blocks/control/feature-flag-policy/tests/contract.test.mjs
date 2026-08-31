import test from 'node:test'; import assert from 'node:assert/strict';
import {createFeatureFlagPolicy} from '../src/index.mjs';
test('resolves canonical flags and aliases',()=>{const p=createFeatureFlagPolicy([{key:'catalog',enabled:false},{key:'events',enabled:true}],{aliases:{database:'catalog'}});assert.equal(p.disabled('database'),true);assert.equal(p.enabled('events'),true);});
test('unknown fallback is explicit',()=>{assert.equal(createFeatureFlagPolicy([],{fallback:false}).enabled('x'),false);assert.equal(createFeatureFlagPolicy([],{unknown:'enabled'}).enabled('x'),true);assert.equal(createFeatureFlagPolicy([],{unknown:'disabled'}).enabled('x'),false);});
test('duplicates and malformed rows fail closed',()=>{assert.throws(()=>createFeatureFlagPolicy([{key:'a',enabled:true},{key:'a',enabled:false}]),/DUPLICATE_FLAG/);assert.throws(()=>createFeatureFlagPolicy([{key:'a',enabled:1}]),/INVALID_FLAG/);});
test('API frozen and source rows not exposed',()=>{const rows=[{key:'a',enabled:true}],p=createFeatureFlagPolicy(rows);rows[0].enabled=false;assert.equal(p.enabled('a'),true);assert(Object.isFrozen(p));});
