import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { level2Milestone } from '../../docs/training/milestones/LEVEL2_ROUTED_BUILD_ARTIFACT.mjs';

const json = (path) => JSON.parse(readFileSync(path, 'utf8'));

test('Level 2 solid foundation is sealed without unlocking Level 3', () => {
  const m = json('docs/training/TRAINING_MANIFEST.json');
  const r = json('docs/training/milestones/LEVEL2_SOLID_FOUNDATION_2026-09-01.json');
  assert.equal(m.currentLevel, 2);
  assert.equal(m.automaticLevelAdvance, false);
  assert.equal(m.automaticAdmission, false);
  assert.equal(m.authorityGranted, false);
  assert.equal(m.levels.find((x) => x.level === 3).status, 'LOCKED');
  assert.equal(r.status, 'SEALED_PENDING_OPERATOR_ADVANCE_ONLY');
  assert.equal(r.level3Status, 'LOCKED');
  assert.equal(r.authorityGranted, false);
  assert.equal(level2Milestone(), 'SOLID_LEVEL_2');
});

test('legacy route closure is evidence, never authority', () => {
  const r = json('docs/harvest/LEGACY_ROUTE_CLOSED_2026-09-01.json');
  assert.equal(r.status, 'CLOSED');
  assert.equal(r.authorityGranted, false);
  assert.equal(r.level3Unlocked, false);
  assert.equal(r.legion.liveExecutableLegacyDependencyHits, 0);
  assert.equal(r.t590.retiredCheckoutRootsFound, 0);
});
