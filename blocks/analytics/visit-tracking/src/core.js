import { VisitTrackingError } from './errors.js';
import { normalizePath, normalizeReferrerHost, isIso2 } from './normalize.js';
import { visitorHash } from './hash.js';

/**
 * Ingest a visit request and persist it via storage bridge.
 *
 * Request: { path, referrer?, method?, ip?, userAgent?, occurredAt? }
 * Options: { salt, persistVisit, resolveCountry?, captureReferrer=true, now? }
 *
 * @param {object} request
 * @param {object} options
 * @returns {Promise<{ ok: boolean, stored: boolean, noise?: boolean, record?: object }>}
 */
export async function ingest(request = {}, options = {}) {
  const {
    salt,
    persistVisit,
    resolveCountry,
    captureReferrer = true,
    now = () => new Date(),
  } = options;

  if (typeof persistVisit !== 'function') {
    throw new VisitTrackingError('missing_storage_bridge', 'Storage bridge persistVisit function is required');
  }

  if (!salt || typeof salt !== 'string' || salt.trim().length === 0) {
    throw new VisitTrackingError('missing_salt', 'Non-empty salt is required for visit ingestion');
  }

  const normalizedPath = normalizePath(request.path);
  if (!normalizedPath) {
    return { ok: true, stored: false, noise: true };
  }

  const occurredDate = request.occurredAt ? new Date(request.occurredAt) : now();
  const occurredAtIso = occurredDate.toISOString();
  const day = occurredAtIso.slice(0, 10);

  const hash = visitorHash({
    day,
    ip: request.ip || '',
    ua: request.userAgent || '',
    salt,
  });

  let country = null;
  if (typeof resolveCountry === 'function') {
    try {
      const resolved = await resolveCountry(request);
      if (resolved && isIso2(resolved)) {
        country = resolved.toUpperCase();
      }
    } catch {
      // Never fail ingest on country resolution failure
      country = null;
    }
  }

  const referrerHost = normalizeReferrerHost(request.referrer, { disabled: !captureReferrer });

  const record = {
    path: normalizedPath,
    visitorHash: hash,
    occurredAt: occurredAtIso,
    country,
    referrerHost,
  };

  try {
    await persistVisit(record);
  } catch (err) {
    throw new VisitTrackingError('storage_error', `Failed to persist visit: ${err.message || String(err)}`, { cause: err });
  }

  return {
    ok: true,
    stored: true,
    record,
  };
}
