import test from 'node:test';import assert from 'node:assert/strict';import {durationBetween,addDuration} from '../src/index.mjs';
test('one day',()=>{const r=durationBetween('2026-01-01T00:00:00Z','2026-01-02T00:00:00Z');assert.equal(r.milliseconds,86400000);assert.equal(r.hours,24);assert.equal(r.days,1);assert.equal(r.sign,1);assert.equal(Object.isFrozen(r),true)});
test('negative',()=>assert.equal(durationBetween('2026-01-02T00:00:00Z','2026-01-01T12:00:00Z').hours,-12));
test('zero sign',()=>assert.equal(durationBetween('2026-01-01','2026-01-01').sign,0));
test('fractional units exact',()=>assert.equal(durationBetween('2026-01-01T00:00:00Z','2026-01-01T00:00:01.500Z').seconds,1.5));
test('add duration',()=>assert.equal(addDuration('2026-01-01T00:00:00Z',3600000),'2026-01-01T01:00:00.000Z'));
test('Date input not mutated',()=>{const d=new Date('2026-01-01T00:00:00Z');addDuration(d,1000);assert.equal(d.toISOString(),'2026-01-01T00:00:00.000Z')});
test('invalid date/value',()=>{assert.throws(()=>durationBetween('wat','2026-01-01'),TypeError);assert.throws(()=>addDuration('2026-01-01',NaN),TypeError)});
