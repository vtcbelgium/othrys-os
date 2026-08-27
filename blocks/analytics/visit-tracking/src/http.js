import { ingest } from './core.js';
import { VisitTrackingError } from './errors.js';

/**
 * Extract client IP from standard proxy headers or socket address.
 * @param {object} headers
 * @param {object} req
 * @returns {string}
 */
function extractIp(headers = {}, req = {}) {
  const fwd = headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  if (typeof headers['x-real-ip'] === 'string') {
    return headers['x-real-ip'].trim();
  }
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  return '';
}

/**
 * Create an HTTP handler function for visit ingestion endpoint.
 *
 * @param {object} options
 * @param {() => (string|Promise<string>)} options.getSalt
 * @param {(record: object) => Promise<void>} options.persistVisit
 * @param {(reqContext: object) => Promise<string|null>} [options.resolveCountry]
 * @param {boolean} [options.captureReferrer=true]
 * @param {() => Date} [options.now]
 * @returns {(req: object, res: object) => Promise<void>}
 */
export function createIngestHandler(options = {}) {
  const {
    getSalt,
    persistVisit,
    resolveCountry,
    captureReferrer = true,
    now,
  } = options;

  return async function handleVisitIngest(req, res) {
    const method = (req.method || 'GET').toUpperCase();
    if (method !== 'POST') {
      if (typeof res.status === 'function') {
        res.status(405).end();
      } else if (typeof res.writeHead === 'function') {
        res.writeHead(405);
        res.end();
      }
      return;
    }

    const respond = (status) => {
      if (typeof res.status === 'function') {
        res.status(status).end();
      } else if (typeof res.writeHead === 'function') {
        res.writeHead(status);
        res.end();
      }
    };

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // Body parse error => treat as noise => 204 not stored
        respond(204);
        return;
      }
    }

    if (!body || typeof body !== 'object') {
      respond(204);
      return;
    }

    let salt = '';
    try {
      salt = typeof getSalt === 'function' ? await getSalt() : '';
    } catch {
      respond(503);
      return;
    }

    if (!salt || typeof salt !== 'string' || salt.trim().length === 0) {
      respond(503);
      return;
    }

    const headers = req.headers || {};
    const ip = extractIp(headers, req);
    const userAgent = headers['user-agent'] || '';
    const referrer = headers['referer'] || headers['referrer'] || body.referrer || '';

    const request = {
      path: body.path,
      referrer,
      method,
      ip,
      userAgent,
      occurredAt: body.occurredAt,
      headers,
    };

    try {
      const result = await ingest(request, {
        salt,
        persistVisit,
        resolveCountry,
        captureReferrer,
        now,
      });

      // Stored or noise => 204 No Content
      respond(204);
    } catch (err) {
      if (err instanceof VisitTrackingError && err.code === 'storage_error') {
        respond(502);
      } else if (err instanceof VisitTrackingError && (err.code === 'missing_salt' || err.code === 'missing_storage_bridge')) {
        respond(503);
      } else {
        respond(204);
      }
    }
  };
}
