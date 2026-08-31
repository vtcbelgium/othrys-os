import {promises as fs} from 'node:fs'; import {dirname} from 'node:path'; import {randomUUID,createHash} from 'node:crypto';
const bad=new Set(['__proto__','prototype','constructor']), clone=v=>structuredClone(v), rootOk=v=>v!==null&&typeof v==='object';
function canon(v){if(Array.isArray(v))return v.map(canon);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort()){if(bad.has(k))throw new Error('UNSAFE');o[k]=canon(v[k]);}return o;}return v;}
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
async function readState(p){try{const v=JSON.parse(await fs.readFile(p,'utf8'));if(!rootOk(v))throw 0;return canon(v);}catch(e){if(e?.code==='ENOENT')return {};throw new Error('STATE_CORRUPT');}}
async function atomic(p,text){await fs.mkdir(dirname(p),{recursive:true});const t=`${p}.${process.pid}.${randomUUID()}.tmp`;try{await fs.writeFile(t,text,'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
async function readBackup(p){try{const e=JSON.parse(await fs.readFile(p,'utf8'));if(!e||typeof e!=='object'||Array.isArray(e)||Object.keys(e).sort().join(',')!=='schema,sha256,state'||e.schema!=='othrys.state.backup.v1'||typeof e.sha256!=='string'||!rootOk(e.state))throw 0;const s=canon(e.state);if(hash(s)!==e.sha256)throw 0;return{schema:e.schema,sha256:e.sha256,state:s};}catch{throw new Error('BACKUP_INVALID');}}
export function createBackupRestore(statePath){
 if(typeof statePath!=='string'||!statePath)throw new TypeError('statePath');
 async function create(backupPath){const state=await readState(statePath),env={schema:'othrys.state.backup.v1',sha256:hash(state),state};await atomic(backupPath,JSON.stringify(env));return clone(env);}
 async function verify(backupPath){await readBackup(backupPath);return true;}
 async function restore(backupPath){const env=await readBackup(backupPath);await atomic(statePath,JSON.stringify(env.state));return clone(env.state);}
 return Object.freeze({create,verify,restore});
}
