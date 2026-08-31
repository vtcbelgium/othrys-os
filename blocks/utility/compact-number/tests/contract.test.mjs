import test from 'node:test'; import assert from 'node:assert/strict';
import {compactNumber} from '../src/index.mjs';
test('leaves small values exact',()=>{assert.equal(compactNumber(999),'999');assert.equal(compactNumber(0),'0');});
test('compacts thousands millions billions',()=>{assert.equal(compactNumber(1000),'1K');assert.equal(compactNumber(1250),'1.3K');assert.equal(compactNumber(1_000_000),'1M');assert.equal(compactNumber(2_500_000_000),'2.5B');});
test('preserves negative sign',()=>{assert.equal(compactNumber(-1500),'-1.5K');});
test('accepts numeric strings but rejects nonfinite',()=>{assert.equal(compactNumber('1200'),'1.2K');for(const x of ['x',Infinity,NaN])assert.throws(()=>compactNumber(x),/INVALID_NUMBER/);});
