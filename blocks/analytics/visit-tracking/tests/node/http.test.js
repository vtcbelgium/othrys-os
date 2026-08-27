import test from 'node:test';
import assert from 'node:assert/strict';
import { createIngestHandler } from '../../src/http.js';
import { createMemoryStorageBridge } from '../../src/bridges/memory.js';

function createMockResponse() {
  return {
    statusCode: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    writeHead(code) {
      this.statusCode = code;
      return this;
    },
    end() {
      this.ended = true;
    },
  };
}

test('H1: GET request rejected with 405 Method Not Allowed', async () => {
  const storage = createMemoryStorageBridge();
  const handler = createIngestHandler({
    getSalt: () => 'test-salt-fixture',
    persistVisit: storage.persistVisit,
  });

  const req = { method: 'GET', headers: {}, body: {} };
  const res = createMockResponse();

  await handler(req, res);
  assert.equal(res.statusCode, 405);
});

test('H2: Malformed JSON body handled gracefully with 204 No Content', async () => {
  const storage = createMemoryStorageBridge();
  const handler = createIngestHandler({
    getSalt: () => 'test-salt-fixture',
    persistVisit: storage.persistVisit,
  });

  const req = { method: 'POST', headers: {}, body: '{invalid json...' };
  const res = createMockResponse();

  await handler(req, res);
  assert.equal(res.statusCode, 204);
  assert.equal(storage.records.length, 0);
});

test('H3: Missing or empty salt returns 503 Service Unavailable', async () => {
  const storage = createMemoryStorageBridge();
  const handler = createIngestHandler({
    getSalt: () => '',
    persistVisit: storage.persistVisit,
  });

  const req = { method: 'POST', headers: {}, body: { path: '/home' } };
  const res = createMockResponse();

  await handler(req, res);
  assert.equal(res.statusCode, 503);
  assert.equal(storage.records.length, 0);
});

test('H4: Successful POST ingests visit and returns 204 No Content', async () => {
  const storage = createMemoryStorageBridge();
  const handler = createIngestHandler({
    getSalt: () => 'test-salt-fixture',
    persistVisit: storage.persistVisit,
  });

  const req = {
    method: 'POST',
    headers: {
      'x-forwarded-for': '198.51.100.1',
      'user-agent': 'Mozilla/5.0 TestAgent',
      'referer': 'https://search.engine.com/search?q=test',
    },
    body: { path: '/landing' },
  };
  const res = createMockResponse();

  await handler(req, res);
  assert.equal(res.statusCode, 204);
  assert.equal(storage.records.length, 1);
  assert.equal(storage.records[0].path, '/landing');
  assert.equal(storage.records[0].referrerHost, 'search.engine.com');
});

test('H5: Storage bridge failure yields 502 Bad Gateway', async () => {
  const handler = createIngestHandler({
    getSalt: () => 'test-salt-fixture',
    persistVisit: async () => {
      throw new Error('Database connection down');
    },
  });

  const req = {
    method: 'POST',
    headers: {},
    body: { path: '/test-error' },
  };
  const res = createMockResponse();

  await handler(req, res);
  assert.equal(res.statusCode, 502);
});
