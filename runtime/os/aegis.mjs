import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inspectHecatoncheiresPosture } from './hecatoncheires_posture.mjs';

export const AEGIS_SCHEMA = 'othrys.os.aegis-event.v1';
export const AEGIS_DECISIONS = Object.freeze([
  'PASS', 'OBSERVE', 'WARN', 'RESTRICT', 'DENY', 'LOCK'
]);
export const AEGIS_RISK_STATES = Object.freeze([
  'GREEN', 'AMBER', 'ORANGE', 'RED', 'BLACK'
]);
export const HARD_BOUNDARY_CLASSES = Object.freeze([
  'AEGIS_POLICY_TAMPER',
  'RECOVERY_BACKUP_DESTRUCTION',
  'MASTER_SECRET_EXTRACTION',
  'SECURITY_LOGGING_DISABLE',
  'SENTINEL_TAKEOVER'
]);

const DECISION_RANK = new Map(AEGIS_DECISIONS.map((value, index) => [value, index]));
const SECRET_KEY = /(password|secret|token|cookie|authorization|api.?key|credential.?value)/i;
const SECRET_VALUE = /(Bearer\s+[A-Za-z0-9._~-]{12,}|sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9]{20,})/i;
const HEX64 = /^[a-f0-9]{64}$/;
const CONSEQUENTIAL_ACTIONS = new Set([
  'write', 'modify', 'delete', 'execute', 'run', 'shell', 'deploy',
  'install', 'connect', 'export', 'copy', 'resolve', 'takeover',
  'disable', 'grant-admin', 'replace', 'tamper'
]);

const REQUIRED = Object.freeze([
  'timestamp', 'host', 'actor', 'actorClass', 'mission', 'action',
  'target', 'source', 'result', 'correlationId'
]);
const OPTIONAL = Object.freeze([
  'sessionId', 'tool', 'provenance', 'provenanceTrust',
  'networkDestination', 'credentialClass', 'identityStatus',
  'capabilityStatus', 'missionStatus', 'endpointVerdict',
  'anomalyScore', 'consequential', 'sensitiveTarget',
  'hardBoundaryClass', 'riskState', 'findings',
  'runtimeHash', 'modelHash', 'policyVersion'
]);
const EVENT_KEYS = new Set([...REQUIRED, ...OPTIONAL]);

const clean = value => String(value ?? '').trim();
const safeString = value => {
  const text = clean(value);
  return text && SECRET_VALUE.test(text) ? '[REDACTED_SECRET_VALUE]' : text;
};
const isObject = value => typeof value === 'object' && value !== null && !Array.isArray(value);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, stable(value[key])])
  );
}

export function sha256Text(value) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex');
}

export function redactAegisTelemetry(value) {
  if (Array.isArray(value)) return value.map(redactAegisTelemetry);
  if (!isObject(value)) {
    if (typeof value === 'string' && SECRET_VALUE.test(value)) return '[REDACTED_SECRET_VALUE]';
    return value;
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (SECRET_KEY.test(key)) return [key, '[REDACTED]'];
    return [key, redactAegisTelemetry(item)];
  }));
}

export function classifyAegisHardBoundary(event) {
  const action = clean(event?.action).toLowerCase();
  const target = clean(event?.target).toLowerCase();
  const mutates = new Set(['write', 'modify', 'delete', 'replace', 'disable', 'tamper']);
  const extracts = new Set(['read', 'copy', 'export', 'dump', 'resolve', 'exfiltrate']);
  if (target.startsWith('aegis:policy') && mutates.has(action)) return 'AEGIS_POLICY_TAMPER';
  if (target.startsWith('recovery:backup') && ['delete', 'destroy', 'overwrite', 'tamper'].includes(action)) return 'RECOVERY_BACKUP_DESTRUCTION';
  if (target.startsWith('keymaster:master') && extracts.has(action)) return 'MASTER_SECRET_EXTRACTION';
  if (target.startsWith('security:logging') && ['disable', 'delete', 'stop', 'tamper'].includes(action)) return 'SECURITY_LOGGING_DISABLE';
  if (target.startsWith('sentinel:control') && ['takeover', 'replace', 'disable', 'grant-admin', 'tamper'].includes(action)) return 'SENTINEL_TAKEOVER';
  return null;
}

export function strongerAegisDecision(...values) {
  let strongest = 'PASS';
  for (const raw of values) {
    const value = clean(raw) || 'PASS';
    if (!DECISION_RANK.has(value)) throw new Error('AEGIS_DECISION_INVALID');
    if (DECISION_RANK.get(value) > DECISION_RANK.get(strongest)) strongest = value;
  }
  return strongest;
}

export function assertAegisMonotonic(previous, next) {
  if (!DECISION_RANK.has(previous) || !DECISION_RANK.has(next)) throw new Error('AEGIS_DECISION_INVALID');
  if (DECISION_RANK.get(next) < DECISION_RANK.get(previous)) throw new Error('AEGIS_SECURITY_CANNOT_DEESCALATE');
  return true;
}

export function createAegisEvent(input = {}, options = {}) {
  if (!isObject(input)) throw new Error('AEGIS_EVENT_INVALID');
  for (const key of Object.keys(input)) if (!EVENT_KEYS.has(key)) throw new Error(`AEGIS_EVENT_FIELD_UNKNOWN:${key}`);
  const now = options.now ?? (() => new Date().toISOString());
  const uuid = options.uuid ?? randomUUID;
  const event = {
    schema: AEGIS_SCHEMA,
    timestamp: safeString(input.timestamp) || now(),
    host: safeString(input.host),
    actor: safeString(input.actor),
    actorClass: safeString(input.actorClass),
    mission: safeString(input.mission),
    action: safeString(input.action),
    target: safeString(input.target),
    source: safeString(input.source),
    result: safeString(input.result) || 'OBSERVED',
    correlationId: safeString(input.correlationId) || uuid()
  };
  for (const key of OPTIONAL) {
    if (input[key] !== undefined && input[key] !== null && input[key] !== '') {
      event[key] = redactAegisTelemetry(input[key]);
    }
  }
  return Object.freeze(event);
}

export function validateAegisEvent(event) {
  const issues = [];
  if (event?.schema !== AEGIS_SCHEMA) issues.push('schema');
  for (const field of REQUIRED) if (!clean(event?.[field])) issues.push(`required:${field}`);
  const enums = [
    ['actorClass', ['HUMAN', 'AGENT', 'SERVICE', 'PROCESS', 'SYSTEM', 'UNKNOWN']],
    ['identityStatus', ['VERIFIED', 'UNKNOWN', 'INVALID']],
    ['capabilityStatus', ['PRESENT', 'MISSING', 'NOT_REQUIRED']],
    ['missionStatus', ['BOUND', 'UNBOUND', 'MISMATCH']],
    ['provenanceTrust', ['TRUSTED', 'UNTRUSTED', 'UNKNOWN']],
    ['endpointVerdict', ['CLEAR', 'SUSPICIOUS', 'MALICIOUS', 'UNKNOWN']],
    ['riskState', AEGIS_RISK_STATES]
  ];
  for (const [field, allowed] of enums) {
    if (event?.[field] !== undefined && !allowed.includes(event[field])) issues.push(field);
  }
  for (const field of ['consequential', 'sensitiveTarget']) {
    if (event?.[field] !== undefined && typeof event[field] !== 'boolean') issues.push(field);
  }
  if (event?.anomalyScore !== undefined &&
      (typeof event.anomalyScore !== 'number' || event.anomalyScore < 0 || event.anomalyScore > 1)) issues.push('anomalyScore');
  for (const field of ['runtimeHash', 'modelHash']) {
    if (event?.[field] !== undefined && !HEX64.test(event[field])) issues.push(field);
  }
  if (event?.hardBoundaryClass !== undefined && !HARD_BOUNDARY_CLASSES.includes(event.hardBoundaryClass)) issues.push('hardBoundaryClass');
  return Object.freeze(issues);
}

export function evaluateAegisEvent(event, options = {}) {
  const issues = validateAegisEvent(event);
  if (issues.length) throw new Error(`AEGIS_EVENT_REJECTED:${issues.join(',')}`);
  let decision = strongerAegisDecision(options.minimumDecision ?? 'PASS');
  const reasons = [];
  const raise = (next, reason) => {
    decision = strongerAegisDecision(decision, next);
    reasons.push(reason);
  };

  const hardBoundary = event.hardBoundaryClass ?? classifyAegisHardBoundary(event);
  const consequential = event.consequential === true || CONSEQUENTIAL_ACTIONS.has(clean(event.action).toLowerCase());
  const sensitiveTarget = event.sensitiveTarget === true || Boolean(clean(event.credentialClass));
  if (hardBoundary) raise('LOCK', `hard-boundary:${hardBoundary}`);
  if (event.endpointVerdict === 'MALICIOUS') raise('DENY', 'endpoint-malicious');
  if (event.endpointVerdict === 'SUSPICIOUS') raise('RESTRICT', 'endpoint-suspicious');
  if (event.missionStatus === 'MISMATCH') raise('DENY', 'mission-mismatch');
  if (consequential && event.missionStatus !== 'BOUND') raise('DENY', 'mission-not-bound');
  if (consequential && event.identityStatus !== 'VERIFIED') raise('DENY', 'identity-not-verified');
  if (consequential && event.capabilityStatus !== 'PRESENT') raise('DENY', 'capability-not-present');
  if (sensitiveTarget && event.provenanceTrust === 'UNTRUSTED') raise('DENY', 'untrusted-sensitive-provenance');

  if (event.anomalyScore >= 0.90) raise('DENY', 'anomaly-critical');
  else if (event.anomalyScore >= 0.70) raise('RESTRICT', 'anomaly-high');
  else if (event.anomalyScore >= 0.40) raise('WARN', 'anomaly-elevated');

  return Object.freeze({ decision, reasons: Object.freeze([...new Set(reasons)]) });
}

export function evaluateAegisEventFailClosed(event, options = {}) {
  try {
    return evaluateAegisEvent(event, options);
  } catch (error) {
    const hardBoundary = classifyAegisHardBoundary(event);
    return Object.freeze({
      decision: hardBoundary ? 'LOCK' : 'DENY',
      reasons: Object.freeze([
        ...(hardBoundary ? [`hard-boundary:${hardBoundary}`] : []),
        `invalid-security-evidence:${error instanceof Error ? error.message : 'UNKNOWN'}`
      ]),
      invalidEvidence: true
    });
  }
}

export function composeAegisAuthority({ baseGranted, aegisDecision }) {
  if (typeof baseGranted !== 'boolean') throw new Error('BASE_AUTHORITY_REQUIRED');
  if (!DECISION_RANK.has(aegisDecision)) throw new Error('AEGIS_DECISION_INVALID');
  const denied = DECISION_RANK.get(aegisDecision) >= DECISION_RANK.get('DENY');
  return Object.freeze({
    baseGranted,
    aegisDecision,
    effectiveGranted: baseGranted && !denied,
    restricted: baseGranted && aegisDecision === 'RESTRICT'
  });
}

export function chainAegisEvent(event, previousDigest = '0'.repeat(64)) {
  if (!HEX64.test(previousDigest)) throw new Error('AEGIS_PREVIOUS_DIGEST_INVALID');
  const issues = validateAegisEvent(event);
  if (issues.length) throw new Error(`AEGIS_EVENT_REJECTED:${issues.join(',')}`);
  const eventDigest = sha256Text(JSON.stringify(stable({ previousDigest, event })));
  return Object.freeze({ ...event, previousDigest, eventDigest });
}

export function verifyAegisChain(records) {
  let previousDigest = '0'.repeat(64);
  for (const record of records) {
    if (!HEX64.test(record?.eventDigest) || record.previousDigest !== previousDigest) return false;
    const { previousDigest: prev, eventDigest, ...event } = record;
    const expected = sha256Text(JSON.stringify(stable({ previousDigest: prev, event })));
    if (expected !== eventDigest) return false;
    previousDigest = eventDigest;
  }
  return true;
}

export function inspectAegisPosture(root) {
  const manifest = JSON.parse(readFileSync(join(root, '.othrys', 'project.json'), 'utf8'));
  const authority = manifest.authorities?.find(item => item.id === 'aegis') ?? null;
  const hecatoncheires = inspectHecatoncheiresPosture(root);
  return Object.freeze({
    schema: 'othrys.os.aegis-posture.v1',
    titan: authority?.id === 'aegis',
    authorityMode: authority?.authorityMode ?? null,
    grantAuthority: false,
    approvalAuthority: manifest.work?.approvalAuthority ?? null,
    hecatoncheires: Object.freeze({
      ok: hecatoncheires.ok,
      counts: hecatoncheires.counts,
      authorityGranted: hecatoncheires.authorityGranted
    })
  });
}
