import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { captureKnowledgeInbox, reviewKnowledgeInbox } from './mnemosyne.mjs';
import { buildKnowledgeZoneIndex } from './knowledge_zone_index.mjs';

test('reviewed knowledge derives Garden and R&D without new authority', () => {
  const root = mkdtempSync(join(tmpdir(), 'othrys-zones-'));
  try {
    const g = captureKnowledgeInbox(root, { title: 'idea', text: 'repeatable useful idea', source: 'operator', capturedAt: '2026-08-31T20:00:00Z' });
    reviewKnowledgeInbox(root, g.item.id, { decision: 'PROMOTE', classification: 'GARDEN', evidence: 'reviewed', reviewedAt: '2026-08-31T20:01:00Z' });
    const r = captureKnowledgeInbox(root, { title: 'experiment', text: 'bounded experiment', source: 'lab', capturedAt: '2026-08-31T20:02:00Z' });
    reviewKnowledgeInbox(root, r.item.id, { decision: 'PROMOTE', classification: 'R_AND_D', evidence: 'reviewed', reviewedAt: '2026-08-31T20:03:00Z' });
    const index = buildKnowledgeZoneIndex(root);
    assert.equal(index.garden.length, 1);
    assert.equal(index.researchAndDevelopment.length, 1);
    assert.equal(index.authorityGranted, false);
    assert.equal(index.mutationsPerformed, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('rejected intake never appears in either active zone', () => {
  const root = mkdtempSync(join(tmpdir(), 'othrys-zones-'));
  try {
    const c = captureKnowledgeInbox(root, { title: 'obsolete', text: 'temporary mechanism', source: 'legacy', capturedAt: '2026-08-31T20:00:00Z' });
    reviewKnowledgeInbox(root, c.item.id, { decision: 'REJECT', evidence: 'superseded', reviewedAt: '2026-08-31T20:01:00Z' });
    const index = buildKnowledgeZoneIndex(root);
    assert.equal(index.garden.length, 0); assert.equal(index.researchAndDevelopment.length, 0); assert.equal(index.rejected, 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
