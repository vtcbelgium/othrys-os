const DANGEROUS = new Set(['__proto__','prototype','constructor']);
function isPlain(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null)}
function cloneValue(v){
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'){if(!Number.isFinite(v))throw new RangeError('non-finite number');return v}
  if(v===undefined||typeof v==='function'||typeof v==='symbol'||typeof v==='bigint')throw new TypeError('unsupported value');
  if(Array.isArray(v))return v.map(cloneValue);
  if(isPlain(v)){
    const out=Object.create(null);
    for(const k of Object.keys(v).sort()){if(DANGEROUS.has(k))throw new RangeError('dangerous key');out[k]=cloneValue(v[k])}
    return out;
  }
  throw new TypeError('unsupported object');
}
function mergeObjects(base,overlay){
  if(!isPlain(base)||!isPlain(overlay))throw new TypeError('inputs must be plain objects');
  const out=Object.create(null);
  const keys=[...new Set([...Object.keys(base),...Object.keys(overlay)])].sort();
  for(const k of keys){
    if(DANGEROUS.has(k))throw new RangeError('dangerous key');
    const hasB=Object.hasOwn(base,k),hasO=Object.hasOwn(overlay,k);
    if(hasB&&hasO&&isPlain(base[k])&&isPlain(overlay[k]))out[k]=mergeObjects(base[k],overlay[k]);
    else if(hasO)out[k]=cloneValue(overlay[k]);
    else out[k]=cloneValue(base[k]);
  }
  return out;
}
function deepFreeze(v){if(v&&typeof v==='object'){for(const x of Object.values(v))deepFreeze(x);Object.freeze(v)}return v}
export function safeConfigMerge(base,overlay){return deepFreeze(mergeObjects(base,overlay))}
