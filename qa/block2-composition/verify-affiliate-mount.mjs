#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
const E={block_id:'block.monetization.affiliate-offer',block_version:'0.1.0',package:'@othrys-blocks/monetization-affiliate-offer',package_tree_digest:'f87bbdc437fb2f27e80f6e11cf9a9d327d7620218bc312505367dfa085e02c4e',relative_path:'blocks/monetization/affiliate-offer'};
function fail(code,message,detail={}){console.log(JSON.stringify({ok:false,code,message,...detail}));process.exitCode=2;}
const sha=b=>createHash('sha256').update(b).digest('hex');
function walk(root,dir=root,out=[]){for(const n of readdirSync(dir)){const p=join(dir,n),s=statSync(p),r=relative(root,p).split(sep).join('/');if(r.split('/').some(x=>['node_modules','test-results','.git'].includes(x)))continue;if(s.isDirectory())walk(root,p,out);else if(s.isFile())out.push(r);}return out;}
function digest(root){const files=walk(root).sort((a,b)=>Buffer.compare(Buffer.from(a),Buffer.from(b)));const m=files.map(r=>`${sha(readFileSync(join(root,r)))}  ${r}\n`).join('');return{files,digest:sha(Buffer.from(m))};}
const a=process.argv.slice(2),ri=a.indexOf('--v2-root'),li=a.indexOf('--lock');
if(ri<0) fail('INVALID_ARGS','--v2-root required');
else {const root=resolve(a[ri+1]),dir=join(root,E.relative_path);if(!existsSync(dir))fail('BLOCK_MISSING',`canonical V2 Block absent: ${dir}`);else{
 const t=digest(dir);if(t.files.length!==18||t.digest!==E.package_tree_digest)fail('DIGEST_MISMATCH','canonical V2 Block bytes differ',{actual:t.digest,file_count:t.files.length});else{
  const pkg=JSON.parse(readFileSync(join(dir,'package.json'),'utf8'));const mod=await import(`${pathToFileURL(join(dir,'src','index.js')).href}?v=${Date.now()}`);
  const actual={block_id:mod.BLOCK_ID,block_version:mod.BLOCK_VERSION,package:pkg.name};if(Object.keys(actual).some(k=>actual[k]!==E[k]))fail('IDENTITY_MISMATCH','executable identity differs',{actual,expected:E});
  else if(li>=0){const lock=JSON.parse(readFileSync(resolve(a[li+1]),'utf8'));const rb=(lock.resolved_blocks||[]).find(x=>x.block_id===E.block_id);const bad=[];for(const k of ['block_id','block_version','package','package_tree_digest'])if(!rb||rb[k]!==E[k])bad.push(k);if(!rb||rb.provenance?.path!==E.relative_path)bad.push('path');if(bad.length)fail('LOCK_MISMATCH','lock disagrees',{mismatches:bad});}
  if(!process.exitCode){const o=mod.constructAffiliateOffer({query:'Masters of the Universe',providerId:'ebay-epn',placementId:'v2-compose'},{attribution:{campaignId:'9990000001'}});if(!o.monetized||!o.disclosureRequired||!o.relHints.includes('sponsored'))fail('RUNTIME_CONTRACT_FAIL','offer contract failed');else console.log(JSON.stringify({ok:true,code:'MOUNT_VERIFIED',identity:actual,digest:t.digest,file_count:t.files.length,offer:{providerId:o.providerId,monetized:o.monetized,disclosureRequired:o.disclosureRequired,sponsored:o.relHints.includes('sponsored')},legacy_fallback:false}));}
 }}}
