const BAD = new Set(['__proto__','prototype','constructor']);
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
function canon(v, seen){
  if(v === null || typeof v === 'string' || typeof v === 'boolean') return v;
  if(typeof v === 'number' && Number.isFinite(v)) return v;
  if(Array.isArray(v)){ if(seen.has(v)) throw new Error('INVALID_JSON'); seen.add(v); const out=v.map(x=>canon(x,seen)); seen.delete(v); return out; }
  if(plain(v)){ if(seen.has(v)) throw new Error('INVALID_JSON'); seen.add(v); const out={}; for(const k of Object.keys(v).sort()){ if(BAD.has(k)) throw new Error('UNSAFE_KEY'); out[k]=canon(v[k],seen); } seen.delete(v); return out; }
  throw new Error('INVALID_JSON');
}
export function canonicalizeJson(value){ return canon(value,new Set()); }
export function stringifyCanonical(value){ return JSON.stringify(canonicalizeJson(value)); }
