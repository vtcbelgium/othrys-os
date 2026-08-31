import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
const clone=v=>structuredClone(v), plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const validId=v=>typeof v==='string'&&v.length>0;
function dateOrd(s,e='INVALID_DATE'){if(typeof s!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(s))throw new Error(e);const [y,m,d]=s.split('-').map(Number),t=Date.UTC(y,m-1,d),x=new Date(t);if(x.getUTCFullYear()!==y||x.getUTCMonth()!==m-1||x.getUTCDate()!==d)throw new Error(e);return Math.floor(t/86400000);}
function validHabit(h){if(!plain(h)||Object.keys(h).length!==3||!['id','name','dates'].every(k=>Object.hasOwn(h,k))||!validId(h.id)||typeof h.name!=='string'||!h.name.length||h.name.trim()!==h.name||!Array.isArray(h.dates))return false;let prev=-Infinity;for(const d of h.dates){let o;try{o=dateOrd(d,'X')}catch{return false}if(o<=prev)return false;prev=o;}return true;}
function validState(s){if(!plain(s)||Object.keys(s).length!==1||!Array.isArray(s.habits))return false;const ids=new Set();for(const h of s.habits){if(!validHabit(h)||ids.has(h.id))return false;ids.add(h.id);}return true;}
async function load(p){try{const s=JSON.parse(await fs.readFile(p,'utf8'));if(!validState(s))throw 0;return s;}catch(e){if(e?.code==='ENOENT')return {habits:[]};if(e?.message==='STATE_CORRUPT')throw e;throw new Error('STATE_CORRUPT');}}
async function persist(p,s){const t=`${p}.${process.pid}.${randomUUID()}.tmp`;await fs.mkdir(dirname(p),{recursive:true});try{await fs.writeFile(t,JSON.stringify(s),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
function view(h){const dates=[...h.dates],ords=dates.map(d=>dateOrd(d)),runFrom=i=>{let n=1;for(let j=i;j>0&&ords[j]-ords[j-1]===1;j--)n++;return n;};let longest=0,run=0,prev;for(const o of ords){run=prev!==undefined&&o-prev===1?run+1:1;if(run>longest)longest=run;prev=o;}return {id:h.id,name:h.name,dates,currentStreak:ords.length?runFrom(ords.length-1):0,longestStreak:longest};}
export function createHabitTracker(filePath){if(typeof filePath!=='string'||!filePath)throw new TypeError('INVALID_PATH');
 async function add(id,name){if(!validId(id)||typeof name!=='string'||!name.trim())throw new Error('INVALID_HABIT');const s=await load(filePath);if(s.habits.some(h=>h.id===id))throw new Error('DUPLICATE_ID');const h={id,name:name.trim(),dates:[]};s.habits.push(h);await persist(filePath,s);return view(h);}
 async function checkIn(id,date){if(!validId(id))throw new Error('INVALID_HABIT');dateOrd(date);const s=await load(filePath),h=s.habits.find(x=>x.id===id);if(!h)throw new Error('NOT_FOUND');if(h.dates.includes(date))return false;h.dates.push(date);h.dates.sort();await persist(filePath,s);return true;}
 async function uncheck(id,date){if(!validId(id))throw new Error('INVALID_HABIT');dateOrd(date);const s=await load(filePath),h=s.habits.find(x=>x.id===id);if(!h)throw new Error('NOT_FOUND');const i=h.dates.indexOf(date);if(i<0)return false;h.dates.splice(i,1);await persist(filePath,s);return true;}
 async function get(id){if(!validId(id))throw new Error('INVALID_HABIT');const h=(await load(filePath)).habits.find(x=>x.id===id);return h?view(h):undefined;}
 async function list(){return (await load(filePath)).habits.map(view);}
 async function remove(id){if(!validId(id))throw new Error('INVALID_HABIT');const s=await load(filePath),i=s.habits.findIndex(x=>x.id===id);if(i<0)return false;s.habits.splice(i,1);await persist(filePath,s);return true;}
 return Object.freeze({add,checkIn,uncheck,get,list,remove});
}
