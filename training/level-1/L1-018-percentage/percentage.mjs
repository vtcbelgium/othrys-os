function percentOf(part, whole) {
  if (!Number.isFinite(part) || !Number.isFinite(whole)) {
    throw new TypeError('Arguments must be finite numbers');
  }
  if (whole === 0) {
    throw new RangeError('Whole cannot be zero');
  }
  const result = part / whole * 100;
  return norm(Number(result));
}

function percentChange(oldValue, newValue) {
  if (!Number.isFinite(oldValue) || !Number.isFinite(newValue)) {
    throw new TypeError('Arguments must be finite numbers');
  }
  if (oldValue === 0) {
    throw new RangeError('Old value cannot be zero');
  }
  const result = (newValue - oldValue) / Math.abs(oldValue) * 100;
  return norm(Number(result));
}

function portion(value, percent) {
  if (!Number.isFinite(value) || !Number.isFinite(percent)) {
    throw new TypeError('Arguments must be finite numbers');
  }
  const result = value * percent / 100;
  return norm(Number(result));
}

const norm = n => Object.is(n, -0) ? 0 : n;

export { percentOf, percentChange, portion };
