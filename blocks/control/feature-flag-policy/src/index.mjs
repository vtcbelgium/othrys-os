const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function createFeatureFlagPolicy(rows,{aliases={},unknown='fallback',fallback=true}={}){
  if(!Array.isArray(rows)||!plain(aliases)||!['fallback','enabled','disabled'].includes(unknown)||typeof fallback!=='boolean')throw new TypeError('INVALID_POLICY');
  const flags=new Map();
  for(const r of rows){if(!plain(r)||typeof r.key!=='string'||!r.key.trim()||typeof r.enabled!=='boolean')throw new Error('INVALID_FLAG');const k=r.key.trim();if(flags.has(k))throw new Error('DUPLICATE_FLAG');flags.set(k,r.enabled);}
  const alias=new Map(Object.entries(aliases));
  return Object.freeze({enabled(key){if(typeof key!=='string'||!key)throw new TypeError('INVALID_KEY');const k=alias.get(key)??key;if(flags.has(k))return flags.get(k);return unknown==='enabled'?true:unknown==='disabled'?false:fallback;},disabled(key){return !this.enabled(key);}});
}
