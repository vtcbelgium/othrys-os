export function generateChecklist(items, options = {}) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array');
  const allowOptional = options.allowOptional ?? true;
  if (typeof allowOptional !== 'boolean') throw new TypeError('allowOptional must be boolean');
  const seen = new Set();
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    let id, text, required = true, done = false;
    if (typeof raw === 'string') {
      id = `item-${i + 1}`; text = raw;
    } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      id = raw.id ?? `item-${i + 1}`;
      text = raw.text;
      if (raw.required !== undefined) { if (typeof raw.required !== 'boolean') throw new TypeError('required must be boolean'); required = raw.required; }
      if (raw.done !== undefined) { if (typeof raw.done !== 'boolean') throw new TypeError('done must be boolean'); done = raw.done; }
    } else throw new TypeError('item must be string or plain object');
    if (typeof id !== 'string' || id.trim() === '') throw new RangeError('id must be non-empty string');
    if (seen.has(id)) throw new RangeError('duplicate id');
    seen.add(id);
    text = String(text ?? '').trim().replace(/\s+/g,' ');
    if (!text) throw new RangeError('text cannot be empty');
    if (!allowOptional && required === false) continue;
    out.push(Object.freeze({id,text,required,done}));
  }
  return Object.freeze(out);
}
