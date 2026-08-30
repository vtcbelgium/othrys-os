export function validateIdentifier(input, policy = {}) {
  const defaults = {
    minLength: 1,
    maxLength: 64,
    pattern: '^[A-Za-z_][A-Za-z0-9_.-]*$',
    reserved: [],
    caseSensitiveReserved: true
  };
  if (policy === null || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new TypeError('policy must be a plain object');
  }
  const allowed = new Set(Object.keys(defaults));
  for (const key of Object.keys(policy)) {
    if (!allowed.has(key)) throw new RangeError(`Unknown policy key: ${key}`);
  }
  const p = { ...defaults, ...policy };
  if (!Number.isInteger(p.minLength)) throw new TypeError('minLength must be integer');
  if (p.minLength < 1) throw new RangeError('minLength must be >= 1');
  if (!Number.isInteger(p.maxLength)) throw new TypeError('maxLength must be integer');
  if (p.maxLength < p.minLength) throw new RangeError('maxLength must be >= minLength');
  if (typeof p.pattern !== 'string') throw new TypeError('pattern must be string');
  let regex;
  try { regex = new RegExp(p.pattern); } catch { throw new RangeError('Invalid regex'); }
  if (!Array.isArray(p.reserved) || p.reserved.some(x => typeof x !== 'string')) {
    throw new TypeError('reserved must be string array');
  }
  if (typeof p.caseSensitiveReserved !== 'boolean') throw new TypeError('caseSensitiveReserved must be boolean');
  if (typeof input !== 'string') throw new TypeError('input must be a string');

  const issues = [];
  if (input.length === 0) issues.push('EMPTY');
  if (input.length < p.minLength) issues.push('TOO_SHORT');
  if (input.length > p.maxLength) issues.push('TOO_LONG');
  if (!regex.test(input)) issues.push('PATTERN');

  const candidate = p.caseSensitiveReserved ? input : input.toLowerCase();
  const reserved = p.caseSensitiveReserved ? p.reserved : p.reserved.map(x => x.toLowerCase());
  if (reserved.includes(candidate)) issues.push('RESERVED');

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues)
  });
}
