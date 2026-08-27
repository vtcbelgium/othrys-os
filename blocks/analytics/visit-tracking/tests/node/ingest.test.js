import test from 'node:test';
import assert from 'node:assert/strict';
import { ingest } from '../../src/core.js';
import { createMemoryStorageBridge } from '../../src/bridges/memory.js';
import { VisitTrackingError } from '../../src/errors.js';

test('N7: Ingest successfully normalizes and stores record via bridge', async () => {
  const storage = createMemoryStorageBridge();
  const fixedDate = new Date('2025-05-10T12:00:00Z');

  const res = await ingest({
    path: '/blog/first-post?utm_source=twitter#intro',
    referrer: 'https://twitter.com/post/123?s=20',
    ip: '203.0.113.195',
    userAgent: 'CustomBrowser/1.0',
  }, {
    salt: 'test-salt-fixture',
    persistVisit: storage.persistVisit,
    resolveCountry: async () => 'US',
    now: () => fixedDate,
  });

  assert.equal(res.ok, true);
  assert.equal(res.stored, true);
  assert.equal(storage.records.length, 1);

  const saved = storage.records[0];
  assert.equal(saved.path, '/blog/first-post');
  assert.equal(saved.referrerHost, 'twitter.com');
  assert.equal(saved.country, 'US');
  assert.equal(saved.occurredAt, fixedDate.toISOString());
  assert.equal(typeof saved.visitorHash, 'string');
  assert.equal(saved.visitorHash.length, 64);

  // Exact key contract check
  assert.deepEqual(Object.keys(saved).sort(), ['country', 'occurredAt', 'path', 'referrerHost', 'visitorHash']);
});

test('N7b: resolveCountry throws -> country null and visit still persisted', async () => {
  const storage = createMemoryStorageBridge();
  const res = await ingest({
    path: '/about',
    ip: '203.0.113.195',
  }, {
    salt: 'test-salt-fixture',
    persistVisit: storage.persistVisit,
    resolveCountry: async () => {
      throw new Error('Geo service failure');
    },
  });

  assert.equal(res.ok, true);
  assert.equal(res.stored, true);
  assert.equal(storage.records.length, 1);
  assert.equal(storage.records[0].country, null);
  assert.equal(storage.records[0].path, '/about');
});

test('N7c: resolveCountry returns XX -> country null, visit persisted', async () => {
  const storage = createMemoryStorageBridge();
  const res = await ingest({
    path: '/pricing',
    ip: '203.0.113.195',
  }, {
    salt: 'test-salt-fixture',
    persistVisit: storage.persistVisit,
    resolveCountry: async () => 'XX',
  });

  assert.equal(res.ok, true);
  assert.equal(res.stored, true);
  assert.equal(storage.records.length, 1);
  assert.equal(storage.records[0].country, null);
  assert.equal(storage.records[0].path, '/pricing');
});

test('N8: Ingest treats empty/noise path as noise without persisting', async () => {
  const storage = createMemoryStorageBridge();
  const res = await ingest({
    path: '   ?only=query   ',
  }, {
    salt: 'test-salt-fixture',
    persistVisit: storage.persistVisit,
  });

  assert.equal(res.ok, true);
  assert.equal(res.stored, false);
  assert.equal(res.noise, true);
  assert.equal(storage.records.length, 0);
});

test('N9: Ingest rejects missing salt or missing storage bridge', async () => {
  const storage = createMemoryStorageBridge();

  await assert.rejects(
    () => ingest({ path: '/home' }, { persistVisit: storage.persistVisit }),
    (err) => err instanceof VisitTrackingError && err.code === 'missing_salt'
  );

  await assert.rejects(
    () => ingest({ path: '/home' }, { salt: 'test-salt-fixture' }),
    (err) => err instanceof VisitTrackingError && err.code === 'missing_storage_bridge'
  );
});
