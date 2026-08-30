export function normalizeEmail(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }

  const trimmed = input.trim();
  if (trimmed === '') {
    return Object.freeze({ normalized: '', valid: false, reason: 'EMPTY' });
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'FORMAT' });
  }

  const [local, domain] = parts;
  if (local === '' || domain === '') {
    return Object.freeze({ normalized: trimmed, valid: false, reason: local === '' ? 'LOCAL' : 'DOMAIN' });
  }

  if (trimmed.length > 254) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'LENGTH' });
  }

  if (local.length > 64) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'LOCAL' });
  }

  const lowerDomain = domain.toLowerCase();
  if (lowerDomain !== domain && !/^[a-z0-9.-]+$/.test(lowerDomain)) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'DOMAIN' });
  }

  const labels = lowerDomain.split('.');
  if (labels.length < 2) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'DOMAIN' });
  }

  for (const label of labels) {
    if (label.length === 0 || label.length > 63) {
      return Object.freeze({ normalized: trimmed, valid: false, reason: 'DOMAIN' });
    }
    if (!/^[a-z0-9-]+$/.test(label)) {
      return Object.freeze({ normalized: trimmed, valid: false, reason: 'DOMAIN' });
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return Object.freeze({ normalized: trimmed, valid: false, reason: 'DOMAIN' });
    }
  }

  const tld = labels[labels.length - 1];
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'DOMAIN' });
  }

  const localChars = /^[a-z0-9._%+\-]+$/i.test(local);
  if (!localChars) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'LOCAL' });
  }

  if (local.startsWith('.') || local.endsWith('.')) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'LOCAL' });
  }

  if (local.includes('..')) {
    return Object.freeze({ normalized: trimmed, valid: false, reason: 'LOCAL' });
  }

  const normalized = `${local}@${lowerDomain}`;
  return Object.freeze({ normalized, valid: true, reason: null });
}
