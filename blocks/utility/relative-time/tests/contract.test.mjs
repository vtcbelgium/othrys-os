import test from 'node:test'; import assert from 'node:assert/strict';
import {relativeTimeLabel} from '../src/index.mjs';
const now='2026-08-31T12:00:00.000Z';
test('labels seconds minutes hours days',()=>{assert.equal(relativeTimeLabel('2026-08-31T11:59:30.000Z',now),'just now');assert.equal(relativeTimeLabel('2026-08-31T11:59:00.000Z',now),'1 minute ago');assert.equal(relativeTimeLabel('2026-08-31T10:00:00.000Z',now),'2 hours ago');assert.equal(relativeTimeLabel('2026-08-29T12:00:00.000Z',now),'2 days ago');});
test('older values return stable date-only label',()=>{assert.equal(relativeTimeLabel('2026-08-20T09:30:00.000Z',now),'2026-08-20');});
test('future time fails closed',()=>{assert.throws(()=>relativeTimeLabel('2026-09-01T00:00:00.000Z',now),/FUTURE_TIME/);});
test('invalid inputs fail closed',()=>{for(const x of ['',null,'nope'])assert.throws(()=>relativeTimeLabel(x,now),/INVALID_TIME/);assert.throws(()=>relativeTimeLabel(now,'bad'),/INVALID_TIME/);});
