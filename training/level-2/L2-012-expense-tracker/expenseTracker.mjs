import {promises as fs} from 'node:fs'; import {dirname} from 'node:path'; import {randomUUID} from 'node:crypto';
const clone=v=>structuredClone(v), plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exact=(o,a)=>plain(o)&&Object.keys(o).every(k=>a.includes(k));
function dateOk(s){if(typeof s!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(s))return false;const [y,m,d]=s.split('-').map(Number),x=new Date(Date.UTC(y,m-1,d));return x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d;}
function canon(x,err='INVALID_EXPENSE'){if(!exact(x,['id','amount','currency','category','date','note'])||!['id','amount','currency','category','date','note'].every(k=>Object.hasOwn(x,k)))throw new Error(err);if(typeof x.id!=='string'||!x.id||typeof x.amount!=='number'||!Number.isFinite(x.amount)||x.amount<=0||typeof x.currency!=='string'||!/^[A-Z]{3}$/.test(x.currency)||typeof x.category!=='string'||!x.category.trim()||!dateOk(x.date)||typeof x.note!=='string')throw new Error(err);return{id:x.id,amount:x.amount,currency:x.currency,category:x.category.trim(),date:x.date,note:x.note.trim()};}
function valid(x){try{const c=canon(x,'STATE_CORRUPT');return JSON.stringify(c)===JSON.stringify(x);}catch{return false;}}
async function load(p){try{const a=JSON.parse(await fs.readFile(p,'utf8'));if(!Array.isArray(a))throw 0;const ids=new Set();for(const x of a){if(!valid(x)||ids.has(x.id))throw 0;ids.add(x.id);}return a;}catch(e){if(e?.code==='ENOENT')return [];if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){await fs.mkdir(dirname(p),{recursive:true});const t=`${p}.${process.pid}.${randomUUID()}.tmp`;try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
function patch(old,p){if(!plain(p)||Object.keys(p).length===0||!Object.keys(p).every(k=>['amount','currency','category','date','note'].includes(k)))throw new Error('INVALID_PATCH');const n={...old,...p};try{return canon(n,'INVALID_PATCH');}catch{throw new Error('INVALID_PATCH');}}
export function createExpenseTracker(filePath){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath');
 async function list(){return clone(await load(filePath));} async function get(id){const x=(await load(filePath)).find(v=>v.id===id);return x?clone(x):undefined;}
 async function add(input){const x=canon(input),s=await load(filePath);if(s.some(v=>v.id===x.id))throw new Error('DUPLICATE_ID');s.push(x);await persist(filePath,s);return clone(x);}
 async function update(id,p){const s=await load(filePath),i=s.findIndex(v=>v.id===id);if(i<0)throw new Error('NOT_FOUND');const x=patch(s[i],p);s[i]=x;await persist(filePath,s);return clone(x);}
 async function remove(id){const s=await load(filePath),i=s.findIndex(v=>v.id===id);if(i<0)throw new Error('NOT_FOUND');const [x]=s.splice(i,1);await persist(filePath,s);return clone(x);}
 async function summary(){const s=await load(filePath),bc={},cat={};for(const x of s){bc[x.currency]=(bc[x.currency]??0)+x.amount;(cat[x.category]??={})[x.currency]=(cat[x.category][x.currency]??0)+x.amount;}const sort=o=>Object.fromEntries(Object.entries(o).sort(([a],[b])=>a<b?-1:a>b?1:0));const c=sort(Object.fromEntries(Object.entries(cat).map(([k,v])=>[k,sort(v)])));return{count:s.length,totalByCurrency:sort(bc),totalByCategory:c};}
 return Object.freeze({list,get,add,update,remove,summary});
}
