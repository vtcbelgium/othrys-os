import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp} from './candidate.mjs';
test('clamp bounds inclusively',()=>{
  assert.equal(clamp(5,0,10),5);
  assert.equal(clamp(-2,0,10),0);
  assert.equal(clamp(20,0,10),10);
  assert.equal(clamp(0,0,0),0);
  assert.equal(clamp(2.5,1,2),2);
});
