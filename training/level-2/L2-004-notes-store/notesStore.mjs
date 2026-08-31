import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const clone=v=>structuredClone(v);
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exactKeys=(o,allowed)=>plain(o)&&Object.keys(o).every(k=>allowed.includes(k));
function canonTags(tags,error){if(!Array.isArray(tags)) throw new Error(error);return tags.map(t=>{if(typeof t!=='string'||!t.trim()) throw new Error(error);return t.trim();});}
function validPersisted(n){return exactKeys(n,['id','title','body','tags'])&&typeof n.id==='string'&&n.id.length>0&&typeof n.title==='string'&&n.title.length>0&&n.title.trim()===n.title&&typeof n.body==='string'&&n.body.trim()===n.body&&Array.isArray(n.tags)&&n.tags.every(t=>typeof t==='string'&&t.length>0&&t.trim()===t);}
async function load(filePath){try{const data=JSON.parse(await fs.readFile(filePath,'utf8'));if(!Array.isArray(data)) throw new Error('STATE_CORRUPT');const ids=new Set();for(const n of data){if(!validPersisted(n)||ids.has(n.id)) throw new Error('STATE_CORRUPT');ids.add(n.id);}return data;}catch(e){if(e?.code==='ENOENT') return [];if(e?.message==='STATE_CORRUPT') throw e;throw new Error('STATE_CORRUPT');}}
async function persist(filePath,state){const temp=`${filePath}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(filePath),{recursive:true});try{await fs.writeFile(temp,JSON.stringify(state),'utf8');await fs.rename(temp,filePath);}catch(e){try{await fs.unlink(temp);}catch{}throw e;}}
function canonical(input){if(!exactKeys(input,['id','title','body','tags'])||!Object.hasOwn(input,'id')||!Object.hasOwn(input,'title')||!Object.hasOwn(input,'body')||!Object.hasOwn(input,'tags')||typeof input.id!=='string'||!input.id||typeof input.title!=='string'||!input.title.trim()||typeof input.body!=='string') throw new Error('INVALID_NOTE');return {id:input.id,title:input.title.trim(),body:input.body.trim(),tags:canonTags(input.tags,'INVALID_NOTE')};}
function patchNote(note,patch){
  if(!plain(patch)||Object.keys(patch).length===0||!Object.keys(patch).every(k=>['title','body','tags'].includes(k))) throw new Error('INVALID_PATCH');
  const out=clone(note);
  if(Object.hasOwn(patch,'title')){if(typeof patch.title!=='string'||!patch.title.trim())throw new Error('INVALID_PATCH');out.title=patch.title.trim();}
  if(Object.hasOwn(patch,'body')){if(typeof patch.body!=='string')throw new Error('INVALID_PATCH');out.body=patch.body.trim();}
  if(Object.hasOwn(patch,'tags')) out.tags=canonTags(patch.tags,'INVALID_PATCH');
  return out;
}
export function createNotesStore(filePath){
  if(typeof filePath!=='string'||!filePath) throw new TypeError('filePath must be a non-empty string');
  async function list(){return clone(await load(filePath));}
  async function get(id){const n=(await load(filePath)).find(x=>x.id===id);return n?clone(n):undefined;}
  async function add(input){const n=canonical(input),state=await load(filePath);if(state.some(x=>x.id===n.id))throw new Error('DUPLICATE_ID');state.push(n);await persist(filePath,state);return clone(n);}
  async function update(id,patch){const state=await load(filePath),i=state.findIndex(x=>x.id===id);if(i<0)throw new Error('NOT_FOUND');const n=patchNote(state[i],patch);state[i]=n;await persist(filePath,state);return clone(n);}
  async function remove(id){const state=await load(filePath),i=state.findIndex(x=>x.id===id);if(i<0)throw new Error('NOT_FOUND');const [n]=state.splice(i,1);await persist(filePath,state);return clone(n);}
  return Object.freeze({list,get,add,update,remove});
}
