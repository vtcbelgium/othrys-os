import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const readJson = (relative) => JSON.parse(readFileSync(resolve(root, relative), 'utf8'));

test('Level 2.5 may close without advancing or granting authority', () => {
  const manifest = readJson('docs/training/TRAINING_MANIFEST.json');
  const level3 = manifest.levels.find((entry) => entry.level === 3);
  assert.equal(manifest.currentLevel, 2);
  assert.equal(manifest.level2_5Consolidation.status, 'COMPLETE');
  assert.equal(manifest.authorityGranted, false);
  assert.equal(manifest.automaticAdmission, false);
  assert.equal(manifest.automaticLevelAdvance, false);
  assert.equal(level3?.status, 'LOCKED');
  assert.equal(level3?.authorityGranted, false);
});

test('Level 2.5 closeout receipt cannot unlock Level 3', () => {
  const receipt = readJson('docs/training/LEVEL_2_5_CONSOLIDATION_RECEIPT.json');
  assert.equal(receipt.status, 'COMPLETE');
  assert.equal(receipt.currentLevel, 2);
  assert.equal(receipt.level3Status, 'LOCKED');
  assert.equal(receipt.authorityGranted, false);
  assert.equal(receipt.automaticAdmission, false);
  assert.equal(receipt.automaticLevelAdvance, false);
  assert.match(receipt.nextLevelUnlock, /operator command only/i);
});