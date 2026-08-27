import { VisitTrackingError } from '../errors.js';

/**
 * Create Supabase PostgREST visit storage bridge.
 *
 * Note: Host must supply an insert-only credential (or scoped table role).
 * An estate-wide service-role credential is an anti-pattern and must not be the Block default.
 *
 * @param {object} options
 * @param {string} options.url - Supabase project URL (e.g. https://xyz.supabase.co)
 * @param {string} options.insertCredential - Scoped REST insert key/token (estate-wide service-role credential avoided)
 * @param {string} [options.table='page_visits'] - Target table name
 * @param {typeof fetch} [options.fetchFn=globalThis.fetch]
 * @returns {{ persistVisit: (record: object) => Promise<void> }}
 */
export function createSupabaseVisitBridge(options = {}) {
  const {
    url,
    insertCredential,
    table = 'page_visits',
    fetchFn = globalThis.fetch,
  } = options;

  if (!url || !insertCredential) {
    throw new VisitTrackingError('invalid_configuration', 'url and insertCredential are required for Supabase bridge');
  }

  const baseUrl = url.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/rest/v1/${encodeURIComponent(table)}`;

  async function persistVisit(record) {
    const payload = {
      path: record.path,
      visitor_hash: record.visitorHash,
      country: record.country || null,
      referrer_host: record.referrerHost || null,
      occurred_at: record.occurredAt,
    };

    let res;
    try {
      res = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'apikey': insertCredential,
          'Authorization': `Bearer ${insertCredential}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      throw new VisitTrackingError('storage_error', `Supabase fetch network failure: ${err.message}`, { cause: err });
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new VisitTrackingError('storage_error', `Supabase insert failed status ${res.status}: ${errBody}`);
    }
  }

  return { persistVisit };
}
