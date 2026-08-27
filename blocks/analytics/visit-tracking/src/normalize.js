/**
 * Path, referrer, and country normalization utilities for visit tracking.
 */

/**
 * Normalize request or beacon path.
 * - If starts with #, keep hash route but cut at first ?
 * - Else cut at first ? and first #
 * - Trim whitespace
 * - Truncate to max 200 chars
 * - Empty after strip OR exactly '#' => null (noise)
 *
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizePath(raw) {
  if (typeof raw !== 'string') return null;
  let p = raw.trim();
  if (!p) return null;

  if (p.startsWith('#')) {
    const qIdx = p.indexOf('?');
    if (qIdx !== -1) {
      p = p.slice(0, qIdx);
    }
  } else {
    const qIdx = p.indexOf('?');
    if (qIdx !== -1) {
      p = p.slice(0, qIdx);
    }
    const hIdx = p.indexOf('#');
    if (hIdx !== -1) {
      p = p.slice(0, hIdx);
    }
  }

  p = p.trim();
  if (!p || p === '#') return null;
  if (p.length > 200) {
    p = p.slice(0, 200);
  }
  return p;
}

/**
 * Normalize referrer to lowercase hostname only, <=100 chars.
 *
 * @param {unknown} raw
 * @param {{ disabled?: boolean }} [options]
 * @returns {string|null}
 */
export function normalizeReferrerHost(raw, { disabled = false } = {}) {
  if (disabled || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    // If no protocol, try prepending http:// for parsing
    const candidate = trimmed.includes('://') ? trimmed : `http://${trimmed}`;
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    if (!host) return null;
    return host.slice(0, 100);
  } catch {
    return null;
  }
}

/**
 * Check if a country code is valid ISO 3166-1 alpha-2 (exactly 2 A-Z, rejects 'XX').
 *
 * @param {unknown} code
 * @returns {boolean}
 */
export function isIso2(code) {
  if (typeof code !== 'string') return false;
  const upper = code.trim().toUpperCase();
  if (upper === 'XX') return false;
  return /^[A-Z]{2}$/.test(upper);
}
