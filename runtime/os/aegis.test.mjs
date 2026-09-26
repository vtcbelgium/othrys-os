import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { validateProjectManifest } from './project_manifest.mjs';
import {
  assertAegisMonotonic,
  chainAegisEvent,
  classifyAegisHardBoundary,
  composeAegisAuthority,
  createAegisEvent,
  evaluateAegisEvent,
  evaluateAegisEventFailClosed,
  inspectAegisPosture,
  redactAegisTelemetry,
  strongerAegisDecision,
  validateAegisEvent,
  verifyAegisChain
} from './aegis.mjs';

const root = resolve(import.meta.dirname, '../..');
const base = overrides => createAegisEvent({
  timestamp: '2026-09-26T18:00:00.000Z',
  host: 'PC',
  actor: 'jev',
  actorClass: 'AGENT',
  mission: 'AEGIS-TEST-001',
  action: 'read',
  target: 'repo:README.md',
  source: 'labyrinth',
  result: 'OBSERVED',
  correlationId: 'corr-aegis-1',
  identityStatus: 'VERIFIED',
  capabilityStatus: 'PRESENT',
  missionStatus: 'BOUND',
  provenanceTrust: 'TRUSTED',
  endpointVerdict: 'CLEAR',
  consequential: true,
  sensitiveTarget: false,
  anomalyScore: 0,
  ...overrides
}, { uuid: () => 'fixed-uuid' });

test('normal bounded event does not manufacture authority', () => {
  const event = base({});
  assert.deepEqual(validateAegisEvent(event), []);
  assert.equal(evaluateAegisEvent(event).decision, 'PASS');
  assert.deepEqual(composeAegisAuthority({ baseGranted: false, aegisDecision: 'PASS' }), {
    baseGranted: false,
    aegisDecision: 'PASS',
    effectiveGranted: false,
    restricted: false
  });
});

test('hard boundary is an unconditional LOCK', () => {
  const event = base({ hardBoundaryClass: 'AEGIS_POLICY_TAMPER', anomalyScore: 0 });
  const decision = evaluateAegisEvent(event);
  assert.equal(decision.decision, 'LOCK');
  assert.ok(decision.reasons.includes('hard-boundary:AEGIS_POLICY_TAMPER'));
});

test('missing mission identity or capability fail closed for consequential work', () => {
  assert.equal(evaluateAegisEvent(base({ missionStatus: 'UNBOUND' })).decision, 'DENY');
  assert.equal(evaluateAegisEvent(base({ identityStatus: 'UNKNOWN' })).decision, 'DENY');
  assert.equal(evaluateAegisEvent(base({ capabilityStatus: 'MISSING' })).decision, 'DENY');
});

test('security decisions are monotonic and cannot be talked down', () => {
  assert.equal(strongerAegisDecision('WARN', 'PASS', 'DENY'), 'DENY');
  assert.equal(assertAegisMonotonic('WARN', 'DENY'), true);
  assert.throws(() => assertAegisMonotonic('DENY', 'WARN'), /AEGIS_SECURITY_CANNOT_DEESCALATE/);
  assert.equal(evaluateAegisEvent(base({}), { minimumDecision: 'DENY' }).decision, 'DENY');
});

test('Aegis can restrict granted authority but never create it', () => {
  const restricted = composeAegisAuthority({ baseGranted: true, aegisDecision: 'RESTRICT' });
  assert.equal(restricted.effectiveGranted, true);
  assert.equal(restricted.restricted, true);
  assert.equal(composeAegisAuthority({ baseGranted: true, aegisDecision: 'DENY' }).effectiveGranted, false);
  assert.equal(composeAegisAuthority({ baseGranted: false, aegisDecision: 'PASS' }).effectiveGranted, false);
});

test('endpoint and anomaly evidence only escalate', () => {
  assert.equal(evaluateAegisEvent(base({ endpointVerdict: 'SUSPICIOUS' })).decision, 'RESTRICT');
  assert.equal(evaluateAegisEvent(base({ endpointVerdict: 'MALICIOUS' })).decision, 'DENY');
  assert.equal(evaluateAegisEvent(base({ anomalyScore: 0.75 })).decision, 'RESTRICT');
  assert.equal(evaluateAegisEvent(base({ anomalyScore: 0.95 })).decision, 'DENY');
});

test('secret-shaped telemetry is redacted recursively', () => {
  const value = redactAegisTelemetry({
    apiKey: 'secret-value',
    nested: { authorization: 'Bearer abcdefghijklmnop', safe: 'ok' },
    message: 'use sk-abcdefghijklmnopqrs for this'
  });
  assert.equal(value.apiKey, '[REDACTED]');
  assert.equal(value.nested.authorization, '[REDACTED]');
  assert.equal(value.nested.safe, 'ok');
  assert.equal(value.message, '[REDACTED_SECRET_VALUE]');
});

test('unknown event fields and malformed hashes are rejected', () => {
  assert.throws(() => createAegisEvent({ ...base({}), surprise: true }), /AEGIS_EVENT_FIELD_UNKNOWN/);
  const malformed = base({ runtimeHash: 'not-a-digest' });
  assert.ok(validateAegisEvent(malformed).includes('runtimeHash'));
});

test('event chain detects mutation and reordering', () => {
  const first = chainAegisEvent(base({ correlationId: 'c1' }));
  const second = chainAegisEvent(base({ correlationId: 'c2', action: 'write' }), first.eventDigest);
  assert.equal(verifyAegisChain([first, second]), true);
  assert.equal(verifyAegisChain([{ ...first, target: 'tampered' }, second]), false);
  assert.equal(verifyAegisChain([second, first]), false);
});

test('Aegis posture is Titan-class but negative-only and Trust Canal remains approval authority', () => {
  const posture = inspectAegisPosture(root);
  assert.equal(posture.titan, true);
  assert.equal(posture.authorityMode, 'NEGATIVE_ONLY');
  assert.equal(posture.grantAuthority, false);
  assert.equal(posture.approvalAuthority, 'trust-canal');
  assert.equal(posture.hecatoncheires.ok, true);
});

test('project manifest freezes Aegis as negative-only authority', () => {
  const manifest = JSON.parse(readFileSync(join(root, '.othrys', 'project.json'), 'utf8'));
  assert.doesNotThrow(() => validateProjectManifest(manifest));

  const grant = structuredClone(manifest);
  grant.securityPolicy.grantAuthority = true;
  assert.throws(() => validateProjectManifest(grant), /INVALID_AEGIS_SECURITY_POLICY/);

  const capability = structuredClone(manifest);
  capability.authorities.find(item => item.id === 'aegis').capabilities.push('security.allow');
  assert.throws(() => validateProjectManifest(capability), /AEGIS_CANNOT_HAVE_GRANT_CAPABILITY/);
});

test('Aegis cannot disappear from the control-plane security policy', () => {
  const manifest = JSON.parse(readFileSync(join(root, '.othrys', 'project.json'), 'utf8'));
  const missing = structuredClone(manifest);
  missing.authorities = missing.authorities.filter(item => item.id !== 'aegis');
  assert.throws(() => validateProjectManifest(missing), /AEGIS_AUTHORITY_REQUIRED/);
});

test('critical boundaries are derived even when caller omits the label', () => {
  const cases = [
    ['write', 'aegis:policy/main', 'AEGIS_POLICY_TAMPER'],
    ['delete', 'recovery:backup/known-good', 'RECOVERY_BACKUP_DESTRUCTION'],
    ['export', 'keymaster:master/vercel', 'MASTER_SECRET_EXTRACTION'],
    ['disable', 'security:logging/aegis', 'SECURITY_LOGGING_DISABLE'],
    ['takeover', 'sentinel:control/t590', 'SENTINEL_TAKEOVER']
  ];
  for (const [action, target, expected] of cases) {
    const event = base({ action, target, hardBoundaryClass: undefined });
    assert.equal(classifyAegisHardBoundary(event), expected);
    assert.equal(evaluateAegisEvent(event).decision, 'LOCK');
  }
});

test('malformed security evidence fails closed rather than granting by error', () => {
  const malformed = { action: 'read', target: 'repo:file' };
  const decision = evaluateAegisEventFailClosed(malformed);
  assert.equal(decision.decision, 'DENY');
  assert.equal(decision.invalidEvidence, true);

  const malformedCritical = { action: 'write', target: 'aegis:policy/main' };
  assert.equal(evaluateAegisEventFailClosed(malformedCritical).decision, 'LOCK');
});

test('secret-shaped values are redacted even in core string fields', () => {
  const event = base({ target: 'sk-abcdefghijklmnopqrs', source: 'Bearer abcdefghijklmnop' });
  assert.equal(event.target, '[REDACTED_SECRET_VALUE]');
  assert.equal(event.source, '[REDACTED_SECRET_VALUE]');
});

test('obvious execution actions remain consequential even when caller says false', () => {
  const event = base({
    action: 'execute',
    consequential: false,
    identityStatus: 'UNKNOWN',
    capabilityStatus: 'MISSING',
    missionStatus: 'UNBOUND'
  });
  assert.equal(evaluateAegisEvent(event).decision, 'DENY');
});

test('boolean security flags cannot be smuggled as strings', () => {
  const event = base({ consequential: 'false' });
  assert.ok(validateAegisEvent(event).includes('consequential'));
  assert.equal(evaluateAegisEventFailClosed(event).decision, 'DENY');
});
