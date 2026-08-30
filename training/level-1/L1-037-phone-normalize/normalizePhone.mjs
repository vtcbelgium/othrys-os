const frozen = (normalized, valid, reason) => Object.freeze({ normalized, valid, reason });

export function normalizePhone(input, regionHint = null) {
  if (typeof input !== 'string') throw new TypeError('Phone must be a string');
  let cleaned = input.trim();
  if (cleaned === '') return frozen('', false, 'EMPTY');

  let international = false;
  if (cleaned.startsWith('00')) {
    international = true;
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('+')) {
    international = true;
    cleaned = cleaned.slice(1);
  }

  cleaned = cleaned.replace(/[\s\-()./]/g, '');
  if (!/^\d+$/.test(cleaned)) return frozen('', false, 'FORMAT');

  if (international) {
    if (cleaned.length < 8 || cleaned.length > 15) return frozen('', false, 'LENGTH');
    return frozen('+' + cleaned, true, null);
  }

  if (regionHint === null) return frozen('', false, 'REGION');
  if (regionHint === 'BE') {
    const local = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    if (local.length === 0) return frozen('', false, 'EMPTY');
    const normalized = '+32' + local;
    const digits = normalized.slice(1);
    if (digits.length < 8 || digits.length > 15) return frozen('', false, 'LENGTH');
    return frozen(normalized, true, null);
  }

  if (regionHint === 'US') {
    if (cleaned.length === 10) return frozen('+1' + cleaned, true, null);
    if (cleaned.length === 11 && cleaned.startsWith('1')) return frozen('+' + cleaned, true, null);
    return frozen('', false, 'LENGTH');
  }

  return frozen('', false, 'REGION');
}
