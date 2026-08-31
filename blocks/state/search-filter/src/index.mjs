import {promises as fs} from 'node:fs'; import {dirname} from 'node:path'; import {randomUUID} from 'node:crypto';
const badKeys=new Set(['__proto__','prototype','constructor']); const clone=v=>structuredClone(v), plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
function canon(v,seen=new Set()){
 if(v===null||typeof v==='string'||typeof v==='boolean')return v;
 if(typeof v==='number'){if(!Number.isFinite(v))throw new Error('INVALID_RECORD');return v;}
 if(typeof v!=='object'||seen.has(v))throw new Error('INVALID_RECORD'); seen.add(v);
 if(Array.isArray(v)){const a=v.map(x=>canon(x,seen));seen.delete(v);return a;}
 const o={};for(const k of Object.keys(v).sort()){if(badKeys.has(k))throw new Error('INVALID_RECORD');o[k]=canon(v[k],seen);}seen.delete(v);return o;
}
function records(v){if(!Array.isArray(v))throw new Error('INVALID_RECORD');const ids=new Set();return v.map(r=>{if(!plain(r)||typeof r.id!=='string'||!r.id||r.id.trim()!==r.id||ids.has(r.id))throw new Error('INVALID_RECORD');ids.add(r.id);return canon(r);});}
async function load(p){try{const raw=await fs.readFile(p,'utf8'),v=records(JSON.parse(raw));if(JSON.stringify(v)!==raw)throw 0;return v;}catch(e){if(e?.code==='ENOENT')return [];throw new Error('STATE_CORRUPT');}}
async function persist(p,v){await fs.mkdir(dirname(p),{recursive:true});const t=`${p}.${process.pid}.${randomUUID()}.tmp`;try{await fs.writeFile(t,JSON.stringify(v),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
function qspec(q){if(q===undefined)return {text:'',fields:[],where:{}};if(!plain(q)||!Object.keys(q).every(k=>['text','fields','where'].includes(k)))throw new Error('INVALID_QUERY');const text=q.text===undefined?'':q.text;if(typeof text!=='string')throw new Error('INVALID_QUERY');const t=text.trim();const fields=q.fields===undefined?[]:q.fields;if(!Array.isArray(fields)||fields.some(x=>typeof x!=='string'||!x)||new Set(fields).size!==fields.length)throw new Error('INVALID_QUERY');if(t&&fields.length===0)throw new Error('INVALID_QUERY');const where=q.where===undefined?{}:q.where;if(!plain(where))throw new Error('INVALID_QUERY');for(const [k,v] of Object.entries(where)){if(!k||!(v===null||['string','number','boolean'].includes(typeof v))||typeof v==='number'&&!Number.isFinite(v))throw new Error('INVALID_QUERY');}return {text:t,fields,where};}
export function createSearchStore(filePath){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath');
 async function list(){return clone(await load(filePath));}
 async function replace(input){const next=records(input);await load(filePath);await persist(filePath,next);return clone(next);}
 async function query(spec){const q=qspec(spec),xs=await load(filePath),needle=q.text.toLocaleLowerCase('en-US');const out=xs.filter(r=>{for(const [k,v] of Object.entries(q.where))if(!Object.is(r[k],v))return false;if(!needle)return true;return q.fields.some(k=>typeof r[k]==='string'&&r[k].toLocaleLowerCase('en-US').includes(needle));});return clone(out);}
 return Object.freeze({replace,list,query});
}
