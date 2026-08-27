#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
const E={block_id:"block.analytics.visit-tracking",block_version:"0.1.1",package:"@othrys-blocks/analytics-visit-tracking",package_tree_digest:"edc34093eff4df0b04d4a09db7ede74594de5f76f0a8c0dbbf0f07c78ce47527",relative_path:"blocks/analytics/visit-tracking",maturity:"RAW"};
function fail(code,message,detail={}){console.log(JSON.stringify({ok:false,code,message,...detail}));process.exitCode=2;}
const sha=b=>createHash("sha256").update(b).digest("hex");
function walk(root,dir=root,out=[]){for(const n of readdirSync(dir)){const p=join(dir,n),s=statSync(p),r=relative(root,p).split(sep).join("/");if(r.split("/").some(x=>["node_modules","test-results",".git"].includes(x)))continue;if(s.isDirectory())walk(root,p,out);else if(s.isFile())out.push(r);}return out;}
function digest(root){const files=walk(root).sort((a,b)=>Buffer.compare(Buffer.from(a),Buffer.from(b)));const m=files.map(r=>`${sha(Buffer.from(readFileSync(join(root,r)).toString("binary").replace(/\r\n/g,"\n"),"binary"))}  ${r}\n`).join("");return{files,digest:sha(Buffer.from(m))};}
const a=process.argv.slice(2),ri=a.indexOf("--v2-root"),li=a.indexOf("--lock");
if(ri<0) fail("INVALID_ARGS","--v2-root required");
else {const root=resolve(a[ri+1]),dir=join(root,E.relative_path);
 if(!existsSync(dir))fail("BLOCK_MISSING",`canonical V2 Block absent: ${dir}`);
 else {const t=digest(dir);if(t.files.length!==21||t.digest!==E.package_tree_digest)fail("DIGEST_MISMATCH","canonical V2 Block bytes differ",{actual:t.digest,file_count:t.files.length});
 else {const pkg=JSON.parse(readFileSync(join(dir,"package.json"),"utf8"));const mod=await import(`${pathToFileURL(join(dir,"src","index.js")).href}?v=${Date.now()}`);const actual={block_id:mod.BLOCK_ID,block_version:mod.BLOCK_VERSION,package:pkg.name};if(Object.keys(actual).some(k=>actual[k]!==E[k]))fail("IDENTITY_MISMATCH","executable identity differs",{actual,expected:E});
  else {if(li>=0){const lock=JSON.parse(readFileSync(resolve(a[li+1]),"utf8"));const rb=(lock.resolved_blocks||[]).find(x=>x.block_id===E.block_id);const bad=[];for(const k of ["block_id","block_version","package","package_tree_digest"])if(!rb||rb[k]!==E[k])bad.push(k);if(!rb||rb.provenance?.path!==E.relative_path)bad.push("path");if(!rb||rb.maturity_at_resolution!==E.maturity)bad.push("maturity");if(bad.length)fail("LOCK_MISMATCH","lock disagrees",{mismatches:bad});}
   if(!process.exitCode){const bridge=mod.createMemoryStorageBridge();const result=await mod.ingest({path:"/proof?x=1",referrer:"https://Example.com/path",ip:"203.0.113.5",userAgent:"OTHRYS-003B",occurredAt:"2026-08-27T12:00:00.000Z"},{salt:"v2-003b-proof-salt",persistVisit:bridge.persistVisit});const rec=bridge.records[0];if(!result.ok||!result.stored||bridge.records.length!==1||rec.path!=="/proof"||rec.referrerHost!=="example.com"||rec.visitorHash.length!==64)fail("RUNTIME_CONTRACT_FAIL","visit artifact contract failed");else console.log(JSON.stringify({ok:true,code:"MOUNT_VERIFIED",identity:actual,digest:t.digest,file_count:t.files.length,maturity:E.maturity,port:mod.PORT,artifact:{path:rec.path,referrerHost:rec.referrerHost,visitorHashLength:rec.visitorHash.length},legacy_fallback:false}));}
  }
 }
}}

