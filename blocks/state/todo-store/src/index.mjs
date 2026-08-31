import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const clone=v=>structuredClone(v);
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const exactKeys=(o,allowed)=>plain(o)&&Object.keys(o).every(k=>allowed.includes(k));
function validTodo(t){return exactKeys(t,['id','text','done'])&&typeof t.id==='string'&&t.id.length>0&&typeof t.text==='string'&&t.text.trim()===t.text&&t.text.length>0&&typeof t.done==='boolean';}
async function load(filePath){
  try{
    const data=JSON.parse(await fs.readFile(filePath,'utf8'));
    if(!Array.isArray(data)) throw new Error('STATE_CORRUPT');
    const ids=new Set();
    for(const t of data){if(!validTodo(t)||ids.has(t.id)) throw new Error('STATE_CORRUPT');ids.add(t.id);}
    return data;
  }catch(e){if(e?.code==='ENOENT') return [];if(e?.message==='STATE_CORRUPT') throw e;throw new Error('STATE_CORRUPT');}
}
async function persist(filePath,state){
  const temp=`${filePath}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(filePath),{recursive:true});
  try{await fs.writeFile(temp,JSON.stringify(state),'utf8');await fs.rename(temp,filePath);}catch(e){try{await fs.unlink(temp);}catch{}throw e;}
}
function canonical(todo){
  if(!exactKeys(todo,['id','text','done'])||typeof todo.id!=='string'||!todo.id||typeof todo.text!=='string'||!todo.text.trim()||(todo.done!==undefined&&typeof todo.done!=='boolean')) throw new Error('INVALID_TODO');
  return {id:todo.id,text:todo.text.trim(),done:todo.done??false};
}
export function createTodoStore(filePath){
  async function list(){return clone(await load(filePath));}
  async function get(id){if(typeof id!=='string') throw new TypeError('INVALID_ID');const t=(await load(filePath)).find(x=>x.id===id);return t?clone(t):undefined;}
  async function add(input){const todo=canonical(input),state=await load(filePath);if(state.some(x=>x.id===todo.id)) throw new Error('DUPLICATE_ID');state.push(todo);await persist(filePath,state);return clone(todo);}
  async function update(id,patch){
    if(typeof id!=='string') throw new TypeError('INVALID_ID');if(!plain(patch)||Object.keys(patch).length===0||Object.keys(patch).some(k=>!['text','done'].includes(k))) throw new Error('INVALID_PATCH');
    if(patch.text!==undefined&&(typeof patch.text!=='string'||!patch.text.trim())) throw new Error('INVALID_PATCH');if(patch.done!==undefined&&typeof patch.done!=='boolean') throw new Error('INVALID_PATCH');
    const state=await load(filePath),todo=state.find(x=>x.id===id);if(!todo) throw new Error('NOT_FOUND');if(patch.text!==undefined) todo.text=patch.text.trim();if(patch.done!==undefined) todo.done=patch.done;await persist(filePath,state);return clone(todo);
  }
  async function toggle(id){const state=await load(filePath),todo=state.find(x=>x.id===id);if(!todo) throw new Error('NOT_FOUND');todo.done=!todo.done;await persist(filePath,state);return clone(todo);}
  async function remove(id){const state=await load(filePath),i=state.findIndex(x=>x.id===id);if(i<0) throw new Error('NOT_FOUND');const [todo]=state.splice(i,1);await persist(filePath,state);return clone(todo);}
  return Object.freeze({list,get,add,update,toggle,remove});
}
