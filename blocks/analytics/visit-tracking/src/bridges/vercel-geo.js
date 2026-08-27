import { isIso2 } from '../normalize.js';

/**
 * Vercel Edge/Serverless Geo resolution bridge.
 * Reads country code from `x-vercel-ip-country` header.
 * Rejects invalid codes or 'XX' and returns null.
 *
 * @returns {{ resolveCountry: (reqContext: object) => Promise<string|null> }}
 */
export function createVercelGeoBridge() {
  async function resolveCountry(reqContext = {}) {
    const headers = reqContext.headers || reqContext;
    let rawCode = null;

    if (typeof headers.get === 'function') {
      rawCode = headers.get('x-vercel-ip-country');
    } else if (typeof headers['x-vercel-ip-country'] === 'string') {
      rawCode = headers['x-vercel-ip-country'];
    } else if (typeof headers['X-Vercel-Ip-Country'] === 'string') {
      rawCode = headers['X-Vercel-Ip-Country'];
    }

    if (rawCode && isIso2(rawCode)) {
      return rawCode.toUpperCase();
    }
    return null;
  }

  return { resolveCountry };
}
