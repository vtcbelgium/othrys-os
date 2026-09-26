import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const readJson = (relative) => JSON.parse(readFileSync(resolve(root, relative), 'utf8'));

test('Level 2.5 closure remains complete after later operator advancement', () => {
  const manifest = readJson('docs/training/TRAINING_MANIFEST.json');
  assert.equal(manifest.level2_5Consolidation.status, 'COMPLETE');
  assert.equal(manifest.level2.status, 'COMPLETE');
  assert.equal(manifest.authorityGranted, false);
  assert.equal(manifest.automaticAdmission, false);
  assert.equal(manifest.automaticLevelAdvance, false);
});

test('Level 2.5 closeout receipt records that it did not unlock Level 3', () => {
  const receipt = readJson('docs/training/LEVEL_2_5_CONSOLIDATION_RECEIPT.json');
  assert.equal(receipt.status, 'COMPLETE');
  assert.equal(receipt.currentLevel, 2);
  assert.equal(receipt.level3Status, 'LOCKED');
  assert.equal(receipt.authorityGranted, false);
  assert.equal(receipt.automaticAdmission, false);
  assert.equal(receipt.automaticLevelAdvance, false);
  assert.match(receipt.nextLevelUnlock, /operator command only/i);
});

test('canonical runtime service templates share the deployment checkout', () => {
  const expectedRoots = new Map([
    ['runtime/command-deck/othrys-command-deck.service', /%h\/Othrys-Runtime\/othrys-os-main/],
    ['runtime/command-deck/othrys-os-gateway.service', /%h\/Othrys-Runtime\/othrys-os-main/],
    ['runtime/command-deck/othrys-admission-watcher.service', /%h\/Othrys-Runtime\/othrys-os-main/],
    ['runtime/estate/othrys-estate-sync.service', /%h\/Othrys-Runtime\/othrys-os-main/],
  ]);
  for (const [file, canonicalRoot] of expectedRoots) {
    const text = readFileSync(resolve(root, file), 'utf8');
    assert.doesNotMatch(text, /othrys-v2-verify|othrys-hub|othrys-core/);
    assert.doesNotMatch(text, /%h\/othrys-os(?:\/|\n)/);
    assert.match(text, canonicalRoot);
  }
});

test('Keymaster bootstrap source has no retired Jarvis fallback', () => {
  const text = readFileSync(resolve(root, 'runtime/os/keymaster_vault.mjs'), 'utf8');
  assert.doesNotMatch(text, /join\(home,'jarvis'/);
  assert.match(text, /\.config','othrys','keymaster\.env/);
});
