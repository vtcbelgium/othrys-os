export function groupDuplicates(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array');
  }

  const groups = new Map();

  for (const item of items) {
    if (typeof item !== 'object' || item === null) {
      throw new TypeError('each item must be a plain object');
    }

    const id = item.id;
    const digest = item.digest;
    const size = item.size;

    if (typeof id !== 'string' || id.length === 0) {
      throw new TypeError('id must be a non-empty string');
    }

    if (typeof digest !== 'string' || digest.length === 0) {
      throw new TypeError('digest must be a non-empty string');
    }

    if (size !== undefined && (!Number.isFinite(size) || size < 0)) {
      throw new RangeError('size must be a finite nonnegative number or undefined');
    }

    const normalizedDigest = digest.trim().toLowerCase();

    if (!groups.has(normalizedDigest)) {
      groups.set(normalizedDigest, []);
    }

    const group = groups.get(normalizedDigest);
    group.push({ id, size });
  }

  const result = [];

  for (const [digest, members] of groups) {
    if (members.length < 2) {
      continue;
    }

    let sizeConsistent = true;
    const definedSizes = members.filter(m => m.size !== undefined).map(m => m.size);
    if (definedSizes.length > 0) {
      const firstDefinedSize = definedSizes[0];
      for (const s of definedSizes) {
        if (s !== firstDefinedSize) {
          sizeConsistent = false;
          break;
        }
      }
    } else {
      sizeConsistent = true;
    }

    const groupObj = Object.freeze({
      digest,
      ids: Object.freeze(members.map(m => m.id)),
      sizeConsistent
    });

    result.push(groupObj);
  }

  return Object.freeze(result);
}
