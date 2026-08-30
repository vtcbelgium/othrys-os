export function normalizeIsoDate(input) {
  if (!(input instanceof Date) && typeof input !== 'string') {
    throw new TypeError('Expected Date or string');
  }
  if (input instanceof Date) {
    if (!Number.isFinite(input.getTime())) throw new RangeError('Invalid Date');
    return new Date(input.getTime()).toISOString();
  }

  const s = input.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const m = Number(dateOnly[2]);
    const d = Number(dateOnly[3]);
    const t = Date.UTC(y, m - 1, d);
    const check = new Date(t);
    if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
      throw new RangeError('Invalid Gregorian date');
    }
    return check.toISOString();
  }

  const zoned = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  if (!zoned.test(s)) throw new RangeError('Unsupported date format');
  const parsed = new Date(s);
  if (!Number.isFinite(parsed.getTime())) throw new RangeError('Invalid date');
  return parsed.toISOString();
}
