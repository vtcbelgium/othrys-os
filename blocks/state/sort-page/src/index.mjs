import {promises as fs} from 'node:fs'; import {dirname} from 'node:path'; import {randomUUID} from 'node:crypto';
const badKeys=new Set(['__proto__','prototype','constructor']); const clone=v=>structuredClone(v), plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
function canon(v,seen=new Set()){
 if(v===null||typeof v==='string'||typeof v==='boolean')return v;
 if(typeof v==='number'){if(!Number.isFinite(v))throw new Error('INVALID_RECORD');return v;}
 if(typeof v!=='object'||seen.has(v))throw new Error('INVALID_RECORD');seen.add(v);
 if(Array.isArray(v)){const a=v.map(x=>canon(x,seen));seen.delete(v);return a;}
 const o={};for(const k of Object.keys(v).sort()){if(badKeys.has(k))throw new Error('INVALID_RECORD');o[k]=canon(v[k],seen);}seen.delete(v);return o;
}
function records(v){if(!Array.isArray(v))throw new Error('INVALID_RECORD');const ids=new Set();return v.map(r=>{if(!plain(r)||typeof r.id!=='string'||!r.id||r.id.trim()!==r.id||ids.has(r.id))throw new Error('INVALID_RECORD');ids.add(r.id);return canon(r);});}
async function load(p){try{const raw=await fs.readFile(p,'utf8'),v=records(JSON.parse(raw));if(JSON.stringify(v)!==raw)throw 0;return v;}catch(e){if(e?.code==='ENOENT')return [];throw new Error('STATE_CORRUPT');}}
async function persist(p,v){await fs.mkdir(dirname(p),{recursive:true});const t=`${p}.${process.pid}.${randomUUID()}.tmp`;try{await fs.writeFile(t,JSON.stringify(v),'utf8');await fs.rename(t,p);}catch(e){try{await fs.unlink(t);}catch{}throw e;}}
function spec(q){if(q===undefined)return {sort:[],offset:0,limit:20};if(!plain(q)||!Object.keys(q).every(k=>['sort','offset','limit'].includes(k)))throw new Error('INVALID_QUERY');const offset=q.offset===undefined?0:q.offset,limit=q.limit===undefined?20:q.limit,sort=q.sort===undefined?[]:q.sort;if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>100||!Array.isArray(sort))throw new Error('INVALID_QUERY');const keys=new Set(),out=[];for(const s of sort){if(!plain(s)||Object.keys(s).sort().join(',')!=='direction,key'||typeof s.key!=='string'||!s.key||!['asc','desc'].includes(s.direction)||keys.has(s.key))throw new Error('INVALID_QUERY');keys.add(s.key);out.push({key:s.key,direction:s.direction});}return {sort:out,offset,limit};}
const rank=v=>typeof v==='number'?0:typeof v==='string'?1:typeof v==='boolean'?2:3;
function cmpVal(a,b,dir){const an=a==null,bn=b==null;if(an||bn){if(an&&bn)return 0;const c=an?1:-1;return dir==='asc'?c:-c;}if((typeof a==='object')||(typeof b==='object'))throw new Error('INVALID_QUERY');let c=0;if(typeof a===typeof b){if(typeof a==='number'||typeof a==='string')c=a<b?-1:a>b?1:0;else if(typeof a==='boolean')c=a===b?0:(a?1:-1);}else c=rank(a)-rank(b);return dir==='asc'?c:-c;}
export function createSortPageStore(filePath){
 if(typeof filePath!=='string'||!filePath)throw new TypeError('filePath');
 async function replace(input){const next=records(input);await load(filePath);await persist(filePath,next);return clone(next);}
 async function page(input){const q=spec(input),xs=await load(filePath),wrapped=xs.map((r,i)=>({r,i}));for(const s of q.sort)for(const x of xs){const v=x[s.key];if(v!==null&&v!==undefined&&!['number','string','boolean'].includes(typeof v))throw new Error('INVALID_QUERY');}wrapped.sort((a,b)=>{for(const s of q.sort){const c=cmpVal(a.r[s.key],b.r[s.key],s.direction);if(c)return c;}return a.i-b.i;});return clone({items:wrapped.slice(q.offset,q.offset+q.limit).map(x=>x.r),total:xs.length,offset:q.offset,limit:q.limit});}
 return Object.freeze({replace,page});
}
