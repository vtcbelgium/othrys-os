import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'docs', 'training', 'TRAINING_MANIFEST.json'), 'utf8'));
const receipt = JSON.parse(readFileSync(join(root, 'docs', 'training', 'LEVEL_2_5_TRAINING_DISPOSITION.json'), 'utf8'));
const terminal = new Set(receipt.terminalCategories);

test('all Level 1-2 jobs have a terminal Level 2.5 disposition', () => {
  const jobs = [...manifest.level1.jobs, ...manifest.level2.jobs];
  assert.equal(jobs.length, 64);
  for (const job of jobs) {
    assert.equal(terminal.has(job.finalTrainingDisposition), true, job.id);
    assert.equal(job.promotionAuthorityGranted, false, job.id);
  }
});

test('training disposition does not silently admit reusable Blocks', () => {
  const jobs = [...manifest.level1.jobs, ...manifest.level2.jobs];
  assert.equal(jobs.some(x => x.finalTrainingDisposition === 'BLOCK_CANDIDATE'), false);
  assert.equal(receipt.automaticBlockAdmission, false);
  assert.equal(receipt.authorityGranted, false);
});
