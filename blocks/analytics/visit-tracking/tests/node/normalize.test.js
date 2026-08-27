import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePath, normalizeReferrerHost, isIso2 } from '../../src/normalize.js';

test('N5: normalizePath strips query params, non-hash fragments, trims and truncates', () => {
  assert.equal(normalizePath('/hello?query=1#hash'), '/hello');
  assert.equal(normalizePath('/pricing?ref=foo'), '/pricing');
  assert.equal(normalizePath('#/app/route?debug=1'), '#/app/route');
  assert.equal(normalizePath('  /spaces/path  '), '/spaces/path');
  assert.equal(normalizePath('?only=query'), null);
  assert.equal(normalizePath('#?only=hashquery'), null);
  assert.equal(normalizePath(''), null);
  assert.equal(normalizePath(null), null);
  assert.equal(normalizePath(123), null);

  const longPath = '/' + 'a'.repeat(300);
  const result = normalizePath(longPath);
  assert.equal(result.length, 200);
});

test('N6: normalizeReferrerHost extracts hostname and lowercases', () => {
  assert.equal(normalizeReferrerHost('https://Example.COM/path?foo=bar'), 'example.com');
  assert.equal(normalizeReferrerHost('http://SUB.domain.org:8080/test'), 'sub.domain.org');
  assert.equal(normalizeReferrerHost('github.com/repo'), 'github.com');
  assert.equal(normalizeReferrerHost('https://xyz.com', { disabled: true }), null);
  assert.equal(normalizeReferrerHost(''), null);
  assert.equal(normalizeReferrerHost(null), null);
  assert.equal(normalizeReferrerHost('not a valid url &&&'), null);
});

test('isIso2 validates 2-letter uppercase codes and rejects XX', () => {
  assert.equal(isIso2('US'), true);
  assert.equal(isIso2('gb'), true);
  assert.equal(isIso2('XX'), false);
  assert.equal(isIso2('xx'), false);
  assert.equal(isIso2('USA'), false);
  assert.equal(isIso2('12'), false);
  assert.equal(isIso2(null), false);
});
