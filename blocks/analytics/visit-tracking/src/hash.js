import { createHash } from 'node:crypto';
import { VisitTrackingError } from './errors.js';

/**
 * Compute daily pseudonymous visitor hash.
 * Uses node:crypto sha256 with message: `${day}|${ip}|${ua}|${salt}`
 *
 * Day must be UTC YYYY-MM-DD format.
 * Missing/empty salt throws VisitTrackingError missing_salt — never hash with fallback salt.
 *
 * @param {object} params
 * @param {string} params.day - UTC YYYY-MM-DD
 * @param {string} [params.ip=''] - Client IP address
 * @param {string} [params.ua=''] - User-Agent header
 * @param {string} params.salt - Host-provided salt secret
 * @returns {string} 64-character lowercase hex digest
 */
export function visitorHash({ day, ip = '', ua = '', salt }) {
  if (!salt || typeof salt !== 'string' || salt.trim().length === 0) {
    throw new VisitTrackingError('missing_salt', 'A non-empty salt must be provided to compute visitor hash');
  }

  const d = day || new Date().toISOString().slice(0, 10);
  const message = `${d}|${ip || ''}|${ua || ''}|${salt}`;
  return createHash('sha256').update(message, 'utf8').digest('hex');
}
