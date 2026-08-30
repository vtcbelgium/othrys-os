function generateFixture(schema, seed = 1) {
  if (typeof schema !== 'object' || schema === null) {
    throw new TypeError('schema must be a plain object');
  }

  // Validate seed is a finite integer
  if (!Number.isFinite(seed) || !Number.isInteger(seed)) {
    throw new TypeError('seed must be a finite integer');
  }

  // Simple xorshift32 PRNG
  let state = seed >>> 0;

  function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }

  function nextInt(min, max) {
    const range = max - min + 1;
    return (next() % range) + min;
  }

  function nextFloat(min, max) {
    const range = max - min;
    return (next() / 0x100000000) * range + min;
  }

  function nextBool() {
    return next() % 2 === 0;
  }

  function nextEnum(values) {
    const idx = next() % values.length;
    return values[idx];
  }

  const result = Object.create(null);
  const keys = Object.keys(schema).sort();

  for (const key of keys) {
    const rule = schema[key];

    // Validate rule entry is a non-null plain object
    if (typeof rule !== 'object' || rule === null) {
      throw new TypeError('rule entries must be non-null plain objects');
    }

    const type = rule.type;

    if (type === 'string') {
      const prefix = rule.prefix || key;
      const suffix = nextInt(0, 9999);
      result[key] = `${prefix}-${suffix}`;
    } else if (type === 'integer') {
      const min = rule.min ?? 0;
      const max = rule.max ?? 100;
      if (min > max) {
        throw new RangeError(`min (${min}) cannot be greater than max (${max})`);
      }
      result[key] = nextInt(min, max);
    } else if (type === 'number') {
      const min = rule.min ?? 0;
      const max = rule.max ?? 1;
      if (min > max) {
        throw new RangeError(`min (${min}) cannot be greater than max (${max})`);
      }
      result[key] = nextFloat(min, max);
    } else if (type === 'boolean') {
      result[key] = nextBool();
    } else if (type === 'enum') {
      const values = rule.values;
      if (!Array.isArray(values) || values.length === 0) {
        throw new RangeError('enum values array cannot be empty');
      }
      result[key] = nextEnum(values);
    } else {
      throw new RangeError(`Unsupported rule type: ${type}`);
    }
  }

  return Object.freeze(result);
}

export { generateFixture };
