import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectTriadCovenant } from './triad_covenant.mjs';

test('Triad ownership is exclusive and the learning loop closes',()=>{const c=inspectTriadCovenant();assert.equal(c.exclusiveOwnership,true);assert.equal(c.loopClosed,true);assert.equal(c.duplicateOwnership.length,0);assert.equal(c.authorityGranted,false);});