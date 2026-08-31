import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const pkg = (name) => JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'));

test('current distribution packages use OTHRYS OS identity', () => {
  const eventBus = pkg('event-bus');
  const atlas = pkg('atlas-delivery-contract');
  assert.equal(eventBus.name, '@othrys-os/event-bus');
  assert.equal(atlas.name, '@othrys-os/atlas-delivery-contract');
  assert.equal(eventBus.repository.url, 'git+https://github.com/vtcbelgium/othrys-os.git');
  assert.equal(atlas.repository.url, 'git+https://github.com/vtcbelgium/othrys-os.git');
});

test('event bus distribution remains executable', async () => {
  const mod = await import(pathToFileURL(join(root, 'packages', 'event-bus', 'dist', 'index.js')));
  const event = mod.createEvent('othrys.test', { ok: true });
  assert.equal(event.type, 'othrys.test');
  assert.equal(event.payload.ok, true);
});

test('Atlas distribution remains self-validating', async () => {
  const mod = await import(pathToFileURL(join(root, 'packages', 'atlas-delivery-contract', 'dist', 'index.js')));
  const contract = JSON.parse(readFileSync(join(root, 'packages', 'atlas-delivery-contract', 'dist', 'atlas-contract.json'), 'utf8'));
  assert.equal(mod.validateContract(contract).ok, true);
});