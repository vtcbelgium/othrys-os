import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');

test('Level 3.5 canonical gateway service replaces the active Deck service name', () => {
  const gateway = readFileSync(resolve(root, 'runtime/command-deck/othrys-os-gateway.service'), 'utf8');
  assert.match(gateway, /Description=OTHRYS OS gateway service/);
  assert.match(gateway, /ExecStart=.*runtime\/command-deck\/server\.mjs/);
  assert.match(gateway, /Conflicts=othrys-command-deck\.service/);
  assert.doesNotMatch(gateway, /worker|apply-permit|authority-grant/i);
});

test('admission watcher orders behind the canonical gateway service', () => {
  const watcher = readFileSync(resolve(root, 'runtime/command-deck/othrys-admission-watcher.service'), 'utf8');
  assert.match(watcher, /After=network-online\.target othrys-os-gateway\.service/);
  assert.doesNotMatch(watcher, /After=.*othrys-command-deck\.service/);
});
