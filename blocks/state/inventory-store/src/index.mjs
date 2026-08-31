import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const clone=v=>structuredClone(v);
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exact=(o,a)=>plain(o)&&Object.keys(o).every(k=>a.includes(k));
const finiteNonneg=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
function valid(i){return exact(i,['id','name','quantity','unit','price'])&&typeof i.id==='string'&&i.id.length>0&&typeof i.name==='string'&&i.name.length>0&&i.name.trim()===i.name&&finiteNonneg(i.quantity)&&typeof i.unit==='string'&&i.unit.length>0&&i.unit.trim()===i.unit&&finiteNonneg(i.price);}
async function load(p){try{const d=JSON.parse(await fs.readFile(p,'utf8'));if(!Array.isArray(d))throw 0;const ids=new Set();for(const i of d){if(!valid(i)||ids.has(i.id))throw 0;ids.add(i.id);}return d;}catch(e){if(e?.code==='ENOENT')return [];if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){const t=`${p}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(p),{recursive:true});try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
function canon(i){if(!exact(i,['id','name','quantity','unit','price'])||!Object.hasOwn(i,'id')||!Object.hasOwn(i,'name')||!Object.hasOwn(i,'quantity')||!Object.hasOwn(i,'unit')||!Object.hasOwn(i,'price')||typeof i.id!=='string'||!i.id||typeof i.name!=='string'||!i.name.trim()||!finiteNonneg(i.quantity)||typeof i.unit!=='string'||!i.unit.trim()||!finiteNonneg(i.price))throw new Error('INVALID_ITEM');return{id:i.id,name:i.name.trim(),quantity:i.quantity,unit:i.unit.trim(),price:i.price};}
function patch(i,p){if(!plain(p)||Object.keys(p).length===0||!Object.keys(p).every(k=>['name','quantity','unit','price'].includes(k)))throw new Error('INVALID_PATCH');const o=clone(i);if(Object.hasOwn(p,'name')){if(typeof p.name!=='string'||!p.name.trim())throw new Error('INVALID_PATCH');o.name=p.name.trim();}if(Object.hasOwn(p,'quantity')){if(!finiteNonneg(p.quantity))throw new Error('INVALID_PATCH');o.quantity=p.quantity;}if(Object.hasOwn(p,'unit')){if(typeof p.unit!=='string'||!p.unit.trim())throw new Error('INVALID_PATCH');o.unit=p.unit.trim();}if(Object.hasOwn(p,'price')){if(!finiteNonneg(p.price))throw new Error('INVALID_PATCH');o.price=p.price;}return o;}
export function createInventoryStore(filePath){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath must be a non-empty string');
 async function list(){return clone(await load(filePath));}
 async function get(id){const i=(await load(filePath)).find(x=>x.id===id);return i?clone(i):undefined;}
 async function add(input){const i=canon(input),s=await load(filePath);if(s.some(x=>x.id===i.id))throw new Error('DUPLICATE_ID');s.push(i);await persist(filePath,s);return clone(i);}
 async function update(id,p){const s=await load(filePath),n=s.findIndex(x=>x.id===id);if(n<0)throw new Error('NOT_FOUND');const i=patch(s[n],p);s[n]=i;await persist(filePath,s);return clone(i);}
 async function remove(id){const s=await load(filePath),n=s.findIndex(x=>x.id===id);if(n<0)throw new Error('NOT_FOUND');const [i]=s.splice(n,1);await persist(filePath,s);return clone(i);}
 async function adjust(id,delta){if(typeof delta!=='number'||!Number.isFinite(delta)||delta===0)throw new Error('INVALID_PATCH');const s=await load(filePath),n=s.findIndex(x=>x.id===id);if(n<0)throw new Error('NOT_FOUND');const q=s[n].quantity+delta;if(q<0)throw new Error('RANGE');s[n]={...s[n],quantity:q};await persist(filePath,s);return clone(s[n]);}
 return Object.freeze({list,get,add,update,remove,adjust});
}
