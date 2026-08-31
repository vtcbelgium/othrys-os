import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const clone=v=>structuredClone(v);
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exact=(o,a)=>plain(o)&&Object.keys(o).every(k=>a.includes(k));
function tags(v,e){if(!Array.isArray(v))throw new Error(e);return v.map(x=>{if(typeof x!=='string'||!x.trim())throw new Error(e);return x.trim();});}
function url(v,e){if(typeof v!=='string'||!v.trim())throw new Error(e);let u;try{u=new URL(v.trim());}catch{throw new Error(e);}if(!['http:','https:'].includes(u.protocol))throw new Error(e);return u.toString();}
function valid(b){return exact(b,['id','url','title','tags'])&&typeof b.id==='string'&&b.id.length>0&&typeof b.url==='string'&&(()=>{try{return url(b.url,'X')===b.url}catch{return false}})()&&typeof b.title==='string'&&b.title.trim()===b.title&&Array.isArray(b.tags)&&b.tags.every(x=>typeof x==='string'&&x.length>0&&x.trim()===x);}
async function load(p){try{const d=JSON.parse(await fs.readFile(p,'utf8'));if(!Array.isArray(d))throw 0;const ids=new Set();for(const b of d){if(!valid(b)||ids.has(b.id))throw 0;ids.add(b.id);}return d;}catch(e){if(e?.code==='ENOENT')return [];if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){const t=`${p}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(p),{recursive:true});try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
function canon(b){if(!exact(b,['id','url','title','tags'])||!['id','url','title','tags'].every(k=>Object.hasOwn(b,k))||typeof b.id!=='string'||!b.id||typeof b.title!=='string')throw new Error('INVALID_BOOKMARK');return{id:b.id,url:url(b.url,'INVALID_BOOKMARK'),title:b.title.trim(),tags:tags(b.tags,'INVALID_BOOKMARK')};}
function patch(b,p){if(!plain(p)||Object.keys(p).length===0||!Object.keys(p).every(k=>['url','title','tags'].includes(k)))throw new Error('INVALID_PATCH');const o=clone(b);if(Object.hasOwn(p,'url'))o.url=url(p.url,'INVALID_PATCH');if(Object.hasOwn(p,'title')){if(typeof p.title!=='string')throw new Error('INVALID_PATCH');o.title=p.title.trim();}if(Object.hasOwn(p,'tags'))o.tags=tags(p.tags,'INVALID_PATCH');return o;}
export function createBookmarkStore(filePath){if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath must be a non-empty string');
 async function list(){return clone(await load(filePath));}
 async function get(id){const b=(await load(filePath)).find(x=>x.id===id);return b?clone(b):undefined;}
 async function add(input){const b=canon(input),s=await load(filePath);if(s.some(x=>x.id===b.id))throw new Error('DUPLICATE_ID');s.push(b);await persist(filePath,s);return clone(b);}
 async function update(id,p){const s=await load(filePath),i=s.findIndex(x=>x.id===id);if(i<0)throw new Error('NOT_FOUND');const b=patch(s[i],p);s[i]=b;await persist(filePath,s);return clone(b);}
 async function remove(id){const s=await load(filePath),i=s.findIndex(x=>x.id===id);if(i<0)throw new Error('NOT_FOUND');const [b]=s.splice(i,1);await persist(filePath,s);return clone(b);}
 return Object.freeze({list,get,add,update,remove});
}
