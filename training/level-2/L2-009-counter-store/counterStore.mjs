import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const validName=n=>typeof n==='string'&&n.length>0;
function finite(v,e){if(typeof v!=='number')throw new TypeError(e);if(!Number.isFinite(v))throw new RangeError(e);return v;}
function validState(s){if(!plain(s)||Object.keys(s).length!==1||!plain(s.counters))return false;for(const [k,v] of Object.entries(s.counters))if(!validName(k)||typeof v!=='number'||!Number.isFinite(v))return false;return true;}
async function load(p){try{const s=JSON.parse(await fs.readFile(p,'utf8'));if(!validState(s))throw 0;return s;}catch(e){if(e?.code==='ENOENT')return {counters:{}};if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){const t=`${p}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(p),{recursive:true});try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
export function createCounterStore(filePath){if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath must be a non-empty string');
 async function get(name){if(!validName(name))throw new TypeError('INVALID_NAME');const s=await load(filePath);return Object.hasOwn(s.counters,name)?s.counters[name]:0;}
 async function change(name,delta,sign){if(!validName(name))throw new TypeError('INVALID_NAME');finite(delta,'INVALID_DELTA');const s=await load(filePath),cur=Object.hasOwn(s.counters,name)?s.counters[name]:0,next=cur+sign*delta;if(!Number.isFinite(next))throw new RangeError('COUNTER_OVERFLOW');s.counters[name]=next;await persist(filePath,s);return next;}
 async function increment(name,delta=1){return change(name,delta,1);}
 async function decrement(name,delta=1){return change(name,delta,-1);}
 async function set(name,value){if(!validName(name))throw new TypeError('INVALID_NAME');finite(value,'INVALID_VALUE');const s=await load(filePath);s.counters[name]=value;await persist(filePath,s);return value;}
 async function remove(name){if(!validName(name))throw new TypeError('INVALID_NAME');const s=await load(filePath);if(!Object.hasOwn(s.counters,name))return false;delete s.counters[name];await persist(filePath,s);return true;}
 async function list(){const s=await load(filePath),o={};for(const k of Object.keys(s.counters).sort())o[k]=s.counters[k];return o;}
 async function clear(){await load(filePath);await persist(filePath,{counters:{}});}
 return Object.freeze({get,increment,decrement,set,remove,list,clear});
}
