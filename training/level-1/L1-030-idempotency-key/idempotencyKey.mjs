import { createHash } from 'node:crypto';

function canonicalize(value) {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new RangeError('number must be finite');
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean' || value === null) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    let result = '{';
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      result += JSON.stringify(key) + ':' + canonicalize(value[key]);
      if (i < keys.length - 1) result += ',';
    }
    return result + '}';
  }
  throw new TypeError('Invalid value type');
}

export function idempotencyKey(value, options = {}) {
  const namespace = options.namespace || 'othrys';
  if (typeof namespace !== 'string' || namespace.trim() === '') throw new RangeError('namespace must be a non-empty string');
  const canonicalized = canonicalize(value);
  const hash = createHash('sha256').update(canonicalized, 'utf8').digest('hex');
  return `${namespace.trim()}:${hash}`;
}
