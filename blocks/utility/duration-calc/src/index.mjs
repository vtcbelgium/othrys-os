export function durationBetween(start, end) {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;

  if (!(s instanceof Date && !isNaN(s.getTime()))) {
    throw new TypeError('Invalid start date');
  }
  if (!(e instanceof Date && !isNaN(e.getTime()))) {
    throw new TypeError('Invalid end date');
  }

  const diffMs = e.getTime() - s.getTime();

  return Object.freeze({
    milliseconds: diffMs,
    seconds: diffMs / 1000,
    minutes: diffMs / (1000 * 60),
    hours: diffMs / (1000 * 60 * 60),
    days: diffMs / (1000 * 60 * 60 * 24),
    sign: diffMs === 0 ? 0 : diffMs > 0 ? 1 : -1,
  });
}

export function addDuration(input, milliseconds) {
  if (!Number.isFinite(milliseconds)) {
    throw new TypeError('milliseconds must be finite');
  }

  const base = typeof input === 'string' ? new Date(input) : input;
  if (!(base instanceof Date && !isNaN(base.getTime()))) {
    throw new TypeError('Invalid date input');
  }

  return new Date(base.getTime() + milliseconds).toISOString();
}
