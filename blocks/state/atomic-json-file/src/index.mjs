import {promises as fs} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
const clone=v=>structuredClone(v);
export function createAtomicJsonFile(filePath,{missingValue=null,validate=()=>true}={}){
  if(typeof filePath!=='string'||!filePath) throw new TypeError('INVALID_PATH');
  if(typeof validate!=='function') throw new TypeError('INVALID_VALIDATOR');
  async function read(){try{const raw=await fs.readFile(filePath,'utf8');let value;try{value=JSON.parse(raw);}catch{throw new Error('STATE_CORRUPT');}let ok=false;try{ok=validate(value)===true;}catch{}if(!ok)throw new Error('STATE_CORRUPT');return clone(value);}catch(e){if(e?.code==='ENOENT')return clone(missingValue);throw e;}}
  async function replace(value){let ok=false;try{ok=validate(value)===true;}catch{}if(!ok)throw new Error('INVALID_STATE');let copy,raw;try{copy=clone(value);raw=JSON.stringify(copy);if(raw===undefined)throw 0;}catch{throw new Error('INVALID_STATE');}await fs.mkdir(dirname(filePath),{recursive:true});const temp=`${filePath}.${process.pid}.${randomUUID()}.tmp`;try{await fs.writeFile(temp,raw,'utf8');await fs.rename(temp,filePath);}finally{await fs.rm(temp,{force:true}).catch(()=>{});}return clone(copy);}
  return Object.freeze({read,replace});
}
