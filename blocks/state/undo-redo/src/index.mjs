import {promises as fs} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
const badKeys=new Set(['__proto__','prototype','constructor']); const clone=v=>structuredClone(v);
function canon(v,seen=new Set()){
 if(v===null||typeof v==='string'||typeof v==='boolean')return v;
 if(typeof v==='number'){if(!Number.isFinite(v))throw new Error('INVALID_STATE');return v;}
 if(typeof v!=='object')throw new Error('INVALID_STATE'); if(seen.has(v))throw new Error('INVALID_STATE'); seen.add(v);
 if(Array.isArray(v)){const a=v.map(x=>canon(x,seen));seen.delete(v);return a;}
 const out={};for(const k of Object.keys(v).sort()){if(badKeys.has(k))throw new Error('INVALID_STATE');out[k]=canon(v[k],seen);}seen.delete(v);return out;
}
const shape=s=>s&&typeof s==='object'&&!Array.isArray(s)&&Object.keys(s).sort().join(',')==='current,future,past'&&Array.isArray(s.past)&&Array.isArray(s.future);
async function persist(p,s){await fs.mkdir(dirname(p),{recursive:true});const t=`${p}.${process.pid}.${randomUUID()}.tmp`;try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
async function load(p,limit){try{const raw=await fs.readFile(p,'utf8');const s=JSON.parse(raw);if(!shape(s)||s.past.length>limit||s.future.length>limit)throw 0;const c={current:canon(s.current),past:canon(s.past),future:canon(s.future)};if(JSON.stringify(c)!==raw)throw 0;return c;}catch(e){if(e?.code==='ENOENT')return {current:null,past:[],future:[]};if(e?.message==='INVALID_STATE')throw new Error('STATE_CORRUPT');throw new Error('STATE_CORRUPT');}}
export function createUndoRedoStore(filePath,{limit=20}={}){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath');if(!Number.isInteger(limit)||limit<1||limit>100)throw new RangeError('limit');
 async function current(){return clone((await load(filePath,limit)).current);}
 async function canUndo(){return (await load(filePath,limit)).past.length>0;} async function canRedo(){return (await load(filePath,limit)).future.length>0;}
 async function commit(next){const n=canon(next),s=await load(filePath,limit);s.past.push(s.current);if(s.past.length>limit)s.past=s.past.slice(-limit);s.current=n;s.future=[];await persist(filePath,s);return clone(n);}
 async function undo(){const s=await load(filePath,limit);if(!s.past.length)return false;s.future.push(s.current);if(s.future.length>limit)s.future=s.future.slice(-limit);s.current=s.past.pop();await persist(filePath,s);return clone(s.current);}
 async function redo(){const s=await load(filePath,limit);if(!s.future.length)return false;s.past.push(s.current);if(s.past.length>limit)s.past=s.past.slice(-limit);s.current=s.future.pop();await persist(filePath,s);return clone(s.current);}
 return Object.freeze({current,commit,undo,redo,canUndo,canRedo});
}
