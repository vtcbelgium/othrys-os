import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const validId=id=>typeof id==='string'&&id.length>0;
function canonTags(v,e){if(!Array.isArray(v))throw new Error(e);const out=v.map(x=>{if(typeof x!=='string'||!x.trim())throw new Error(e);return x.trim();});if(new Set(out).size!==out.length)throw new Error(e);return out;}
function validState(s){if(!plain(s)||Object.keys(s).length!==1||!plain(s.records))return false;for(const [id,tags] of Object.entries(s.records)){if(!validId(id)||!Array.isArray(tags))return false;try{const c=canonTags(tags,'X');if(c.some((x,i)=>x!==tags[i]))return false;}catch{return false;}}return true;}
async function load(p){try{const s=JSON.parse(await fs.readFile(p,'utf8'));if(!validState(s))throw 0;return s;}catch(e){if(e?.code==='ENOENT')return {records:{}};if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){const t=`${p}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(p),{recursive:true});try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
export function createTagIndex(filePath){if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath must be a non-empty string');
 async function set(id,tags){if(!validId(id))throw new TypeError('INVALID_ID');const c=canonTags(tags,'INVALID_TAGS'),s=await load(filePath);s.records[id]=c;await persist(filePath,s);return [...c];}
 async function remove(id){if(!validId(id))throw new TypeError('INVALID_ID');const s=await load(filePath);if(!Object.hasOwn(s.records,id))return false;delete s.records[id];await persist(filePath,s);return true;}
 async function get(tag){if(typeof tag!=='string'||!tag.trim())throw new TypeError('INVALID_TAG');const t=tag.trim(),s=await load(filePath);return Object.entries(s.records).filter(([,xs])=>xs.includes(t)).map(([id])=>id).sort();}
 async function listTags(){const s=await load(filePath),all=new Set();for(const xs of Object.values(s.records))for(const x of xs)all.add(x);return [...all].sort();}
 async function clear(){await load(filePath);await persist(filePath,{records:{}});}
 return Object.freeze({set,remove,get,listTags,clear});
}
