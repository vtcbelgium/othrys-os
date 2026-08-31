const norm=v=>typeof v==='string'?v.trim().toLowerCase():'';
export function createAliasResolver(entries,{fallbackKey=null}={}){
  if(!Array.isArray(entries))throw new TypeError('INVALID_ENTRIES');
  const map=new Map(), canonical=new Map();
  for(const e of entries){if(!e||typeof e!=='object'||!norm(e.key)||('aliases'in e&&!Array.isArray(e.aliases)))throw new Error('INVALID_ENTRY');const key=norm(e.key);if(canonical.has(key))throw new Error('DUPLICATE_KEY');const value=structuredClone(e.value??e);canonical.set(key,value);for(const raw of [e.key,...(e.aliases||[])]){const a=norm(raw);if(!a)throw new Error('INVALID_ALIAS');if(map.has(a))throw new Error('ALIAS_CONFLICT');map.set(a,value);}}
  const fb=fallbackKey===null?null:map.get(norm(fallbackKey)); if(fallbackKey!==null&&!fb)throw new Error('INVALID_FALLBACK');
  return Object.freeze({resolve(input){const v=map.get(norm(input))??fb;return v===undefined||v===null?null:structuredClone(v);},has(input){return map.has(norm(input));}});
}
