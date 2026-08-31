import {promises as fs} from 'node:fs'; import {dirname} from 'node:path'; import {randomUUID} from 'node:crypto';
const badKeys=new Set(['__proto__','prototype','constructor']);
const clone=v=>structuredClone(v), rootOk=v=>v!==null&&typeof v==='object';
function canon(v){if(Array.isArray(v))return v.map(canon);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort()){if(badKeys.has(k))throw new Error('UNSAFE_KEY');out[k]=canon(v[k]);}return out;}return v;}
async function load(p){try{const v=JSON.parse(await fs.readFile(p,'utf8'));if(!rootOk(v))throw 0;return canon(v);}catch(e){if(e?.code==='ENOENT')return {};if(e?.message==='UNSAFE_KEY')throw new Error('STATE_CORRUPT');throw new Error('STATE_CORRUPT');}}
async function persist(p,v){await fs.mkdir(dirname(p),{recursive:true});const t=`${p}.${process.pid}.${randomUUID()}.tmp`;try{await fs.writeFile(t,JSON.stringify(v),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
export function createStateTransfer(filePath){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath');
 async function exportJson(){return JSON.stringify(await load(filePath));}
 async function read(){return clone(await load(filePath));}
 async function importJson(text){if(typeof text!=='string')throw new TypeError('text');let v;try{v=JSON.parse(text);if(!rootOk(v))throw 0;v=canon(v);}catch{throw new Error('INVALID_IMPORT');}await persist(filePath,v);return clone(v);}
 return Object.freeze({exportJson,importJson,read});
}
