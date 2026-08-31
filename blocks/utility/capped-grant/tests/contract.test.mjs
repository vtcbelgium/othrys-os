import test from 'node:test'; import assert from 'node:assert/strict';
import {cappedGrant} from '../src/index.mjs';
test('grants full request under cap',()=>{assert.deepEqual(cappedGrant(10,50,20),{requested:10,cap:50,used:20,remaining:30,granted:10,capped:false});});
test('caps at remaining allowance',()=>{assert.deepEqual(cappedGrant(15,50,45),{requested:15,cap:50,used:45,remaining:5,granted:5,capped:true});});
test('exhausted cap grants zero',()=>{assert.equal(cappedGrant(5,50,60).granted,0);assert.equal(cappedGrant(5,50,60).capped,true);});
test('zero request is valid',()=>{assert.equal(cappedGrant(0,0,0).granted,0);});
test('invalid amounts fail closed',()=>{for(const x of [-1,NaN,Infinity])assert.throws(()=>cappedGrant(x,1,0),/INVALID_AMOUNT/);assert.throws(()=>cappedGrant(1,-1,0),/INVALID_AMOUNT/);assert.throws(()=>cappedGrant(1,1,-1),/INVALID_AMOUNT/);});
