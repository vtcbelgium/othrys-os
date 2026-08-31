import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

function keyOk(key){if(typeof key!=='string'||key.length===0)throw new TypeError('Key must be a non-empty string');}
function serializable(value){
  const t=typeof value;
  if(t==='undefined'||t==='function'||t==='symbol'||t==='bigint') throw new TypeError('Value must be JSON-serializable');
  try { const s=JSON.stringify(value); if(s===undefined) throw new Error(); JSON.parse(s); }
  catch { throw new TypeError('Value must be JSON-serializable'); }
}
async function load(filePath){
  let text;
  try { text=await fs.readFile(filePath,'utf8'); }
  catch(e){ if(e?.code==='ENOENT') return {}; throw e; }
  try { const v=JSON.parse(text); if(!v||Array.isArray(v)||typeof v!=='object') throw new Error(); return v; }
  catch { throw new Error('STATE_CORRUPT'); }
}
async function persist(filePath,state){
  await fs.mkdir(dirname(filePath),{recursive:true});
  const temp=`${filePath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try { await fs.writeFile(temp,JSON.stringify(state),'utf8'); await fs.rename(temp,filePath); }
  finally { try { await fs.unlink(temp); } catch {} }
}
export function createLocalKv(filePath){
  if(typeof filePath!=='string'||filePath.length===0) throw new TypeError('filePath must be a non-empty string');
  async function get(key){keyOk(key);return (await load(filePath))[key];}
  async function has(key){keyOk(key);return Object.prototype.hasOwnProperty.call(await load(filePath),key);}
  async function list(){const s=await load(filePath),out={};for(const k of Object.keys(s).sort())out[k]=s[k];return out;}
  async function set(key,value){keyOk(key);serializable(value);const s=await load(filePath);s[key]=value;await persist(filePath,s);return value;}
  async function remove(key){keyOk(key);const s=await load(filePath);const existed=Object.prototype.hasOwnProperty.call(s,key);delete s[key];await persist(filePath,s);return existed;}
  async function clear(){await load(filePath);await persist(filePath,{});}
  return Object.freeze({get,set,delete:remove,has,list,clear});
}
