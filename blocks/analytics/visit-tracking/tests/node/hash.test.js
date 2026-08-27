import test from 'node:test';
import assert from 'node:assert/strict';
import { visitorHash } from '../../src/hash.js';
import { VisitTrackingError } from '../../src/errors.js';

test('N1: Computes deterministic 64-hex SHA-256 hash', () => {
  const hash1 = visitorHash({
    day: '2025-01-01',
    ip: '192.168.1.1',
    ua: 'Mozilla/5.0',
    salt: 'test-salt-fixture',
  });
  const hash2 = visitorHash({
    day: '2025-01-01',
    ip: '192.168.1.1',
    ua: 'Mozilla/5.0',
    salt: 'test-salt-fixture',
  });

  assert.equal(typeof hash1, 'string');
  assert.equal(hash1.length, 64);
  assert.match(hash1, /^[0-9a-f]{64}$/);
  assert.equal(hash1, hash2);
});

test('N2: Day changes produce distinct hashes for same IP/UA/salt', () => {
  const day1 = visitorHash({
    day: '2025-01-01',
    ip: '1.2.3.4',
    ua: 'test-agent',
    salt: 'test-salt-fixture',
  });
  const day2 = visitorHash({
    day: '2025-01-02',
    ip: '1.2.3.4',
    ua: 'test-agent',
    salt: 'test-salt-fixture',
  });

  assert.notEqual(day1, day2);
});

test('N3: Salt changes produce distinct hashes', () => {
  const h1 = visitorHash({
    day: '2025-01-01',
    ip: '1.2.3.4',
    ua: 'test-agent',
    salt: 'salt-a',
  });
  const h2 = visitorHash({
    day: '2025-01-01',
    ip: '1.2.3.4',
    ua: 'test-agent',
    salt: 'salt-b',
  });

  assert.notEqual(h1, h2);
});

test('N4: Missing or empty salt throws missing_salt error and never hashes', () => {
  assert.throws(
    () => visitorHash({ day: '2025-01-01', ip: '1.2.3.4', ua: 'agent' }),
    (err) => err instanceof VisitTrackingError && err.code === 'missing_salt'
  );

  assert.throws(
    () => visitorHash({ day: '2025-01-01', ip: '1.2.3.4', ua: 'agent', salt: '' }),
    (err) => err instanceof VisitTrackingError && err.code === 'missing_salt'
  );

  assert.throws(
    () => visitorHash({ day: '2025-01-01', ip: '1.2.3.4', ua: 'agent', salt: '   ' }),
    (err) => err instanceof VisitTrackingError && err.code === 'missing_salt'
  );
});
