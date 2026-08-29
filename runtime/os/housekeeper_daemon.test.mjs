import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { HOUSEKEEPER_FAST_TESTS } from './housekeeper_daemon.mjs';

const root=resolve(import.meta.dirname,'../..');

test('Housekeeper fast path covers current anti-drift spine',()=>{
  const required=[
    'runtime/os/housekeeping_pulse.test.mjs','runtime/os/mnemosyne_estate.test.mjs','runtime/os/house_books.test.mjs',
    'runtime/os/front_door_contract.test.mjs','runtime/os/house_drift.test.mjs','runtime/os/component_contracts.test.mjs',
    'runtime/os/loop_laws.test.mjs','runtime/os/loop_registry.test.mjs','runtime/os/loop_trace.test.mjs','runtime/os/loop_projection.test.mjs'
  ];
  assert.deepEqual([...HOUSEKEEPER_FAST_TESTS],required);
  for(const rel of HOUSEKEEPER_FAST_TESTS)assert.equal(existsSync(join(root,...rel.split('/'))),true,rel);
});

test('Housekeeper fast path remains bounded and contains only focused tests',()=>{
  assert.ok(HOUSEKEEPER_FAST_TESTS.length<=12);
  assert.ok(HOUSEKEEPER_FAST_TESTS.every(x=>x.startsWith('runtime/os/')&&x.endsWith('.test.mjs')));
});
