import test from 'node:test';
import assert from 'node:assert/strict';
import { SELF_HONE_JOBS,selfHonePlan } from '../../tools/penta/self-hone.mjs';

test('self-hone delegates every core organ without authority',()=>{const p=selfHonePlan();assert.equal(p.authorityGranted,false);assert.equal(p.executionStarted,false);assert.equal(p.mnemosyneLogging,'AUTOMATIC');assert.ok(SELF_HONE_JOBS.some(x=>x.owner.includes('RHEA')));assert.ok(SELF_HONE_JOBS.some(x=>x.owner.includes('PROMETHEUS')));assert.ok(SELF_HONE_JOBS.some(x=>x.owner.includes('MNEMOSYNE')));assert.ok(SELF_HONE_JOBS.some(x=>x.owner.includes('TALOS')));assert.ok(SELF_HONE_JOBS.some(x=>x.owner.includes('HEPHAESTUS')));});
