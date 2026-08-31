import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const clone=v=>structuredClone(v), plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const validId=v=>typeof v==='string'&&v.length>0;
function iso(s,e='INVALID_TIME'){if(typeof s!=='string')throw new Error(e);const d=new Date(s);if(Number.isNaN(d.getTime())||d.toISOString()!==s)throw new Error(e);return d.getTime();}
function validEntry(x){if(!plain(x)||Object.keys(x).length!==4||!['id','label','startedAt','stoppedAt'].every(k=>Object.hasOwn(x,k))||!validId(x.id)||typeof x.label!=='string'||!x.label.length||x.label.trim()!==x.label)return false;let a;try{a=iso(x.startedAt,'X')}catch{return false}if(x.stoppedAt!==null){let b;try{b=iso(x.stoppedAt,'X')}catch{return false}if(b<=a)return false;}return true;}
function validState(s){if(!plain(s)||Object.keys(s).length!==1||!Array.isArray(s.entries))return false;const ids=new Set();for(const e of s.entries){if(!validEntry(e)||ids.has(e.id))return false;ids.add(e.id);}return true;}
async function load(p){try{const s=JSON.parse(await fs.readFile(p,'utf8'));if(!validState(s))throw 0;return s;}catch(e){if(e?.code==='ENOENT')return {entries:[]};if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){const t=`${p}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(p),{recursive:true});try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
const view=e=>({...clone(e),durationMs:e.stoppedAt===null?null:Date.parse(e.stoppedAt)-Date.parse(e.startedAt)});
export function createTimeTracker(filePath){if(typeof filePath!=='string'||!filePath)throw new TypeError('INVALID_PATH');
 async function start(id,label,startedAt){if(!validId(id)||typeof label!=='string'||!label.trim())throw new Error('INVALID_ENTRY');iso(startedAt);const s=await load(filePath);if(s.entries.some(e=>e.id===id))throw new Error('DUPLICATE_ID');const e={id,label:label.trim(),startedAt,stoppedAt:null};s.entries.push(e);await persist(filePath,s);return view(e);}
 async function stop(id,stoppedAt){if(!validId(id))throw new Error('INVALID_ENTRY');const b=iso(stoppedAt),s=await load(filePath),e=s.entries.find(x=>x.id===id);if(!e)throw new Error('NOT_FOUND');if(e.stoppedAt!==null)throw new Error('ALREADY_STOPPED');if(b<=Date.parse(e.startedAt))throw new Error('INVALID_TIME');e.stoppedAt=stoppedAt;await persist(filePath,s);return view(e);}
 async function get(id){if(!validId(id))throw new Error('INVALID_ENTRY');const e=(await load(filePath)).entries.find(x=>x.id===id);return e?view(e):undefined;}
 async function list(){return (await load(filePath)).entries.map(view);}
 async function remove(id){if(!validId(id))throw new Error('INVALID_ENTRY');const s=await load(filePath),i=s.entries.findIndex(x=>x.id===id);if(i<0)return false;s.entries.splice(i,1);await persist(filePath,s);return true;}
 return Object.freeze({start,stop,get,list,remove});
}
