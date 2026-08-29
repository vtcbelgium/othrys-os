import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, normalize, resolve, relative, isAbsolute } from 'node:path';

export const SCLEROTIUM_SCHEMA='othrys.os.sclerotium.v1';
export const RECOVERY_CLASSES=Object.freeze(['PRESERVE_EVIDENCE','REBUILD','REACQUIRE','REBIND','EXCLUDE']);
const PRESERVE=Object.freeze([
  '.othrys/project.json','BOOK_OF_GPT.md','FOUNDATION_LAWS.md','GPT_RAILS.md','GPT_STATE.json','books/BOOK_REGISTRY.json'
]);
const SECRET_KEY=/secret|token|password|api[_-]?key|credential/i;

const sha=value=>createHash('sha256').update(value).digest('hex');
export function portableTextDigest(bytes){
  const text=Buffer.isBuffer(bytes)?bytes.toString('utf8'):String(bytes);
  return sha(text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'));
}
function safeRelative(root,path){
  if(typeof path!=='string'||!path.trim()||isAbsolute(path)) throw new Error('RECOVERY_PATH_INVALID');
  const target=resolve(root,path),rel=relative(resolve(root),target);
  if(rel.startsWith('..')||isAbsolute(rel)) throw new Error('RECOVERY_PATH_ESCAPE');
  return normalize(path).replaceAll('\\','/');
}
function assertSecretFree(value,path='manifest'){
  if(Array.isArray(value)) return value.forEach((v,i)=>assertSecretFree(v,`${path}[${i}]`));
  if(!value||typeof value!=='object') return;
  for(const [k,v] of Object.entries(value)){
    if(SECRET_KEY.test(k)&&v!==null&&v!==false&&v!=='REDACTED'&&v!=='REFERENCE_ONLY') throw new Error(`RECOVERY_SECRET_PAYLOAD:${path}.${k}`);
    assertSecretFree(v,`${path}.${k}`);
  }
}
export function buildSclerotium(root,{sourceRevision='UNKNOWN'}={}){
  const projectPath=join(root,'.othrys','project.json');
  if(!existsSync(projectPath)) throw new Error('RECOVERY_PROJECT_MISSING');
  const project=JSON.parse(readFileSync(projectPath,'utf8'));
  const preserved=PRESERVE.map(path=>{
    const safe=safeRelative(root,path),full=join(root,safe);
    if(!existsSync(full)) throw new Error(`RECOVERY_REQUIRED_MISSING:${safe}`);
    return Object.freeze({id:`preserve:${safe}`,classification:'PRESERVE_EVIDENCE',path:safe,digest:portableTextDigest(readFileSync(full))});
  });
  const items=[...preserved,
    {id:'reacquire:repo-source',classification:'REACQUIRE',locator:'git:origin/main',revision:String(sourceRevision),projectId:project.projectId},
    {id:'rebuild:mnemosyne-derived',classification:'REBUILD',target:'.othrys/knowledge',from:'explicit project knowledge + Great Harvest catalogs'},
    {id:'rebind:ollama-legion',classification:'REBIND',bindingId:'ollama-legion',value:'REFERENCE_ONLY'},
    {id:'rebind:ollama-t590',classification:'REBIND',bindingId:'ollama-t590',value:'REFERENCE_ONLY'},
    {id:'rebind:command-deck-auth',classification:'REBIND',bindingId:'command-deck-auth',value:'REFERENCE_ONLY'},
    {id:'exclude:local-secrets',classification:'EXCLUDE',patterns:['.env*','*.pem','*.key','*token*','*credential*']},
    {id:'exclude:derived-runtime',classification:'EXCLUDE',patterns:['node_modules/**','.pytest_cache/**','__pycache__/**','.othrys/runtime/**']}
  ];
  const body={schema:SCLEROTIUM_SCHEMA,projectId:project.projectId,sourceRevision:String(sourceRevision),items,
    sourcePayloadCopied:false,secretsCopied:false,automaticRestore:false,authorityGranted:false,executionStarted:false};
  assertSecretFree(body);
  return Object.freeze({...body,manifestDigest:sha(JSON.stringify(body))});
}

export function verifySclerotium(root,manifest){
  if(!manifest||manifest.schema!==SCLEROTIUM_SCHEMA) return Object.freeze({ok:false,reason:'SCHEMA_INVALID',authorityGranted:false});
  try{ assertSecretFree(manifest); }catch{return Object.freeze({ok:false,reason:'SECRET_PAYLOAD_PRESENT',authorityGranted:false});}
  const project=JSON.parse(readFileSync(join(root,'.othrys','project.json'),'utf8'));
  if(manifest.projectId!==project.projectId) return Object.freeze({ok:false,reason:'WRONG_BODY',authorityGranted:false});
  if(manifest.authorityGranted!==false||manifest.executionStarted!==false||manifest.automaticRestore!==false||manifest.secretsCopied!==false||manifest.sourcePayloadCopied!==false)
    return Object.freeze({ok:false,reason:'POLICY_VIOLATION',authorityGranted:false});
  const ids=new Set();
  for(const item of manifest.items??[]){
    if(!item||!RECOVERY_CLASSES.includes(item.classification)||typeof item.id!=='string'||!item.id.trim()) return Object.freeze({ok:false,reason:'ITEM_INVALID',authorityGranted:false});
    if(ids.has(item.id)) return Object.freeze({ok:false,reason:'ITEM_DUPLICATE',authorityGranted:false});
    ids.add(item.id);
    if(item.classification==='PRESERVE_EVIDENCE'){
      let safe;
      try{ safe=safeRelative(root,item.path); }catch{return Object.freeze({ok:false,reason:'PATH_INVALID',authorityGranted:false});}
      const full=join(root,safe);
      if(!existsSync(full)) return Object.freeze({ok:false,reason:'PRESERVED_MISSING',itemId:item.id,authorityGranted:false});
      if(!/^[0-9a-f]{64}$/.test(item.digest)||portableTextDigest(readFileSync(full))!==item.digest)
        return Object.freeze({ok:false,reason:'PRESERVED_CORRUPT',itemId:item.id,authorityGranted:false});
    }
  }
  const expected={...manifest}; delete expected.manifestDigest;
  if(manifest.manifestDigest!==sha(JSON.stringify(expected))) return Object.freeze({ok:false,reason:'MANIFEST_CORRUPT',authorityGranted:false});
  return Object.freeze({ok:true,reason:'PASS',projectId:manifest.projectId,itemCount:manifest.items.length,
    preservedCount:manifest.items.filter(x=>x.classification==='PRESERVE_EVIDENCE').length,
    secretsCopied:false,automaticRestore:false,authorityGranted:false,executionStarted:false});
}
