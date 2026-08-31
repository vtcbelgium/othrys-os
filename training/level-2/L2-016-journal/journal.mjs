import {promises as fs} from 'node:fs';
import {dirname} from 'node:path';
const badKeys=new Set(['__proto__','prototype','constructor']);
const clone=v=>structuredClone(v);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
function safe(v,seen=new Set()){
 if(v===null||typeof v==='string'||typeof v==='boolean')return;
 if(typeof v==='number'){if(!Number.isFinite(v))throw new Error('INVALID_EVENT');return;}
 if(typeof v!=='object')throw new Error('INVALID_EVENT');
 if(seen.has(v))throw new Error('INVALID_EVENT'); seen.add(v);
 if(Array.isArray(v)){for(const x of v)safe(x,seen);}else{for(const k of Object.keys(v)){if(badKeys.has(k))throw new Error('INVALID_EVENT');safe(v[k],seen);}}
 seen.delete(v);
}
function canonical(e){
 if(!plain(e)||Object.keys(e).sort().join(',')!=='at,data,id,type')throw new Error('INVALID_EVENT');
 if(typeof e.id!=='string'||!e.id||e.id.trim()!==e.id||typeof e.type!=='string'||!e.type||e.type.trim()!==e.type)throw new Error('INVALID_EVENT');
 if(typeof e.at!=='string'||new Date(e.at).toISOString()!==e.at)throw new Error('INVALID_EVENT'); safe(e.data);
 return {id:e.id,type:e.type,at:e.at,data:clone(e.data)};
}
async function load(p){
 let raw;try{raw=await fs.readFile(p,'utf8');}catch(e){if(e?.code==='ENOENT')return [];throw e;}
 const lines=raw.split('\n');if(lines.at(-1)==='')lines.pop();const out=[],ids=new Set();
 try{for(const line of lines){if(!line)throw 0;const e=canonical(JSON.parse(line));if(ids.has(e.id))throw 0;ids.add(e.id);if(JSON.stringify(e)!==line)throw 0;out.push(e);}}catch{throw new Error('STATE_CORRUPT');}
 return out;
}
export function createJournal(filePath){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath');
 async function list(){return clone(await load(filePath));}
 async function at(index){if(!Number.isInteger(index)||index<0)throw new TypeError('index');const xs=await load(filePath);return xs[index]===undefined?undefined:clone(xs[index]);}
 async function count(){return (await load(filePath)).length;}
 async function append(event){const e=canonical(event),xs=await load(filePath);if(xs.some(x=>x.id===e.id))throw new Error('DUPLICATE_ID');await fs.mkdir(dirname(filePath),{recursive:true});await fs.appendFile(filePath,JSON.stringify(e)+'\n','utf8');return clone(e);}
 return Object.freeze({append,list,at,count});
}
