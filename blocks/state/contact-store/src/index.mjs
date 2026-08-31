import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const clone=v=>structuredClone(v);
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exact=(o,a)=>plain(o)&&Object.keys(o).every(k=>a.includes(k));
function tags(v,e){if(!Array.isArray(v))throw new Error(e);return v.map(x=>{if(typeof x!=='string'||!x.trim())throw new Error(e);return x.trim();});}
function valid(c){return exact(c,['id','name','email','phone','tags'])&&typeof c.id==='string'&&c.id.length>0&&typeof c.name==='string'&&c.name.length>0&&c.name.trim()===c.name&&typeof c.email==='string'&&c.email.trim()===c.email&&c.email===c.email.toLowerCase()&&typeof c.phone==='string'&&c.phone.trim()===c.phone&&Array.isArray(c.tags)&&c.tags.every(x=>typeof x==='string'&&x.length>0&&x.trim()===x);}
async function load(p){try{const d=JSON.parse(await fs.readFile(p,'utf8'));if(!Array.isArray(d))throw 0;const ids=new Set();for(const c of d){if(!valid(c)||ids.has(c.id))throw 0;ids.add(c.id);}return d;}catch(e){if(e?.code==='ENOENT')return [];if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){const t=`${p}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(p),{recursive:true});try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
function canon(c){if(!exact(c,['id','name','email','phone','tags'])||!Object.hasOwn(c,'id')||!Object.hasOwn(c,'name')||!Object.hasOwn(c,'email')||!Object.hasOwn(c,'phone')||!Object.hasOwn(c,'tags')||typeof c.id!=='string'||!c.id||typeof c.name!=='string'||!c.name.trim()||typeof c.email!=='string'||typeof c.phone!=='string')throw new Error('INVALID_CONTACT');return{id:c.id,name:c.name.trim(),email:c.email.trim().toLowerCase(),phone:c.phone.trim(),tags:tags(c.tags,'INVALID_CONTACT')};}
function patch(c,p){if(!plain(p)||Object.keys(p).length===0||!Object.keys(p).every(k=>['name','email','phone','tags'].includes(k)))throw new Error('INVALID_PATCH');const o=clone(c);if(Object.hasOwn(p,'name')){if(typeof p.name!=='string'||!p.name.trim())throw new Error('INVALID_PATCH');o.name=p.name.trim();}if(Object.hasOwn(p,'email')){if(typeof p.email!=='string')throw new Error('INVALID_PATCH');o.email=p.email.trim().toLowerCase();}if(Object.hasOwn(p,'phone')){if(typeof p.phone!=='string')throw new Error('INVALID_PATCH');o.phone=p.phone.trim();}if(Object.hasOwn(p,'tags'))o.tags=tags(p.tags,'INVALID_PATCH');return o;}
export function createContactStore(filePath){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath must be a non-empty string');
 async function list(){return clone(await load(filePath));}
 async function get(id){const c=(await load(filePath)).find(x=>x.id===id);return c?clone(c):undefined;}
 async function add(input){const c=canon(input),s=await load(filePath);if(s.some(x=>x.id===c.id))throw new Error('DUPLICATE_ID');s.push(c);await persist(filePath,s);return clone(c);}
 async function update(id,p){const s=await load(filePath),i=s.findIndex(x=>x.id===id);if(i<0)throw new Error('NOT_FOUND');const c=patch(s[i],p);s[i]=c;await persist(filePath,s);return clone(c);}
 async function remove(id){const s=await load(filePath),i=s.findIndex(x=>x.id===id);if(i<0)throw new Error('NOT_FOUND');const [c]=s.splice(i,1);await persist(filePath,s);return clone(c);}
 return Object.freeze({list,get,add,update,remove});
}
