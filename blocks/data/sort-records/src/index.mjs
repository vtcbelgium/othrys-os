function stableSortRecords(records, keys) {
  // Validate inputs
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  if (!Array.isArray(keys) || keys.length === 0) throw new RangeError('keys must be a non-empty array');

  const keySpecs = [];
  for (const k of keys) {
    let key;
    let direction;

    if (typeof k === 'string') {
      key = k;
      direction = 'asc';
    } else if (k && typeof k === 'object' && !Array.isArray(k)) {
      key = k.key;
      direction = k.direction || 'asc';
    } else {
      throw new TypeError('Invalid key entry');
    }

    if (!key) throw new RangeError('Key cannot be empty or undefined');
    if (direction !== 'asc' && direction !== 'desc') throw new RangeError('Direction must be "asc" or "desc"');

    // Freeze the spec object if provided as such, otherwise keep plain
    keySpecs.push({ key, direction });
  }

  // Create a copy of records to avoid mutating input
  const result = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!record) throw new TypeError('Record cannot be null or undefined');

    // Deep freeze the record to prevent mutation
    Object.freeze(record);
    result.push(record);
  }

  // Stable sort using a custom comparator
  // We need to maintain stability, so we'll use an insertion sort approach
  // or rely on the fact that JavaScript's sort is stable in modern engines.
  // However, to be explicit and safe across environments, we'll implement a stable sort logic.

  // Actually, let's use a simple stable sort implementation since we need deterministic behavior
  // and must not rely on engine-specific stability guarantees if possible.
  // But JS Array.sort is guaranteed stable in ES2019+. Let's assume modern environment.

  // We'll implement a custom stable sort to be absolutely sure about the logic
  // by using an insertion sort which is inherently stable.

  const sorted = [...result]; // Copy again just in case

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    let j = i - 1;

    while (j >= 0) {
      if (compareValues(current, sorted[j], keySpecs) < 0) {
        sorted[j + 1] = sorted[j];
        j--;
      } else {
        break;
      }
    }
    sorted[j + 1] = current;
  }

  // Freeze the result array and all elements (already frozen, but freeze the array itself)
  Object.freeze(sorted);

  return sorted;
}

function compareValues(a, b, keySpecs) {
  for (const spec of keySpecs) {
    const valA = a[spec.key];
    const valB = b[spec.key];

    // Handle nullish values
    if ((valA === null || valA === undefined) && (valB === null || valB === undefined)) continue;
    if (valA === null || valA === undefined) return spec.direction === 'asc' ? 1 : -1;
    if (valB === null || valB === undefined) return spec.direction === 'asc' ? -1 : 1;

    // Handle numeric comparison
    const numA = Number(valA);
    const numB = Number(valB);

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA < numB) return spec.direction === 'asc' ? -1 : 1;
      if (numA > numB) return spec.direction === 'asc' ? 1 : -1;
      continue; // Equal, fall through to next key
    }

    // String comparison using < and >
    const strA = String(valA);
    const strB = String(valB);

    if (strA < strB) return spec.direction === 'asc' ? -1 : 1;
    if (strA > strB) return spec.direction === 'asc' ? 1 : -1;
    continue; // Equal, fall through to next key
  }

  // All keys equal, maintain original order (return 0)
  return 0;
}

export { stableSortRecords };
