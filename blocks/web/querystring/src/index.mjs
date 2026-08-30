export function parseQuery(input) {
  if (input === undefined || input === null || typeof input !== 'string') {
    return Object.create(null);
  }

  const params = new URLSearchParams(input.startsWith('?') ? input : '?' + input);
  const result = Object.create(null);

  for (const [key, value] of params.entries()) {
    if (!(key in result)) {
      result[key] = value;
    } else if (Array.isArray(result[key])) {
      result[key].push(value);
    } else {
      result[key] = [result[key], value];
    }
  }

  for (const key of Object.keys(result)) {
    if (Array.isArray(result[key])) {
      result[key] = Object.freeze(result[key]);
    }
  }

  return Object.freeze(result);
}

export function buildQuery(obj) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('buildQuery expects a plain object or null-prototype object');
  }

  const params = new URLSearchParams();

  for (const key of Object.keys(obj).sort()) {
    const value = obj[key];

    if (value === null || value === undefined) {
      params.append(key, "");
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      params.append(key, String(value));
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined) {
          params.append(key, "");
        } else if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          params.append(key, String(item));
        } else {
          throw new TypeError('Nested objects/functions/symbols not allowed');
        }
      }
    } else {
      throw new TypeError('Nested objects/functions/symbols not allowed');
    }
  }

  return params.toString();
}
