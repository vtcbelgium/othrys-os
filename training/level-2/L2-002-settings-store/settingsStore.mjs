import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const isPlain = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
function kind(v){ if(Array.isArray(v)) return 'array'; if(v===null) return 'null'; if(isPlain(v)) return 'object'; if(typeof v==='number'&&Number.isFinite(v)) return 'number'; if(['string','boolean'].includes(typeof v)) return typeof v; return 'invalid'; }
function jsonSafe(v, seen=new Set()){ const k=kind(v); if(k==='invalid') return false; if(k==='array'||k==='object'){ if(seen.has(v)) return false; seen.add(v); const vals=k==='array'?v:Object.values(v); for(const x of vals) if(!jsonSafe(x,seen)) return false; seen.delete(v); } return true; }
const clone = v => structuredClone(v);
function validateDefaults(defaults){ if(!isPlain(defaults)) throw new TypeError('DEFAULTS_TYPE'); for(const v of Object.values(defaults)) if(!jsonSafe(v)) throw new TypeError('DEFAULTS_TYPE'); }
function checkValue(value, expected){ if(!jsonSafe(value) || kind(value)!==kind(expected)) throw new Error('SETTING_TYPE'); }

async function load(filePath, defaults){
  try {
    const v=JSON.parse(await fs.readFile(filePath,'utf8'));
    if(!isPlain(v)) throw new Error('STATE_CORRUPT');
    for(const [k,x] of Object.entries(v)){ if(!Object.hasOwn(defaults,k) || !jsonSafe(x) || kind(x)!==kind(defaults[k])) throw new Error('STATE_CORRUPT'); }
    return v;
  } catch(e){ if(e?.code==='ENOENT') return {}; if(e?.message==='STATE_CORRUPT') throw e; throw new Error('STATE_CORRUPT'); }
}

async function persist(filePath,state){
  const temp=`${filePath}.${process.pid}.${randomUUID()}.tmp`; await fs.mkdir(dirname(filePath),{recursive:true});
  try{ await fs.writeFile(temp,JSON.stringify(state),'utf8'); await fs.rename(temp,filePath); }
  catch(e){ try{await fs.unlink(temp);}catch{} throw e; }
}
export function createSettingsStore(filePath,defaults){
  if(typeof filePath!=='string'||!filePath) throw new TypeError('INVALID_PATH'); validateDefaults(defaults); const base=clone(defaults);
  const known=k=>{ if(typeof k!=='string'||!Object.hasOwn(base,k)) throw new Error('UNKNOWN_SETTING'); };
  async function get(k){ known(k); const o=await load(filePath,base); return clone(Object.hasOwn(o,k)?o[k]:base[k]); }
  async function all(){ const o=await load(filePath,base); return clone({...base,...o}); }
  async function set(k,v){ known(k); checkValue(v,base[k]); const o=await load(filePath,base); o[k]=clone(v); await persist(filePath,o); }
  async function reset(k){ known(k); const o=await load(filePath,base); delete o[k]; await persist(filePath,o); }
  async function resetAll(){ await load(filePath,base); await persist(filePath,{}); }
  return Object.freeze({get,set,all,reset,resetAll});
}
