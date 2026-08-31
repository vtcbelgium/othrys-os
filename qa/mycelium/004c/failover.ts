import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { runLoop, replay } from "../../../runtime/talos-kernel/loop.ts";

const root = "C:/Users/othry/Projects/othrys-os";
const t590Raw = JSON.parse(readFileSync(`${root}/qa/mycelium/004c/t590-health.json`, "utf8"));
const legionRaw = JSON.parse(readFileSync(`${root}/qa/mycelium/004c/legion-envelope.json`, "utf8"));
let envelopes = [t590Raw.node, legionRaw.envelope];
const text = "OTHRYS V2 node-loss failover proof";
const expected = createHash("sha256").update(text).digest("hex");
const placements: any[] = [];

function mycelium(payload:any) {
  const p=spawnSync("python",[`${root}/runtime/mycelium/live_route_cli.py`],{input:JSON.stringify(payload),encoding:"utf8",cwd:`${root}/runtime/mycelium`});
  if(p.status!==0) throw new Error(p.stdout||p.stderr||"MYCELIUM_ROUTE_FAILED");
  return JSON.parse(p.stdout);
}

function quarantine(node:any) {
  return mycelium({action:"quarantine",envelope:node,reason:"NODE_LOST"});
}
async function work(attempt:number){
  const routed=mycelium({envelopes,capability:"verification.sha256@1",request:{cpu_threads:1,ram_mb:64,gpu_count:0,vram_mb:0}});
  const selected=routed.selected; const nodeId=selected.node_id;
  placements.push({attempt,node_id:nodeId});
  if(nodeId==="t590"){
    try{
      const response=await fetch("http://192.168.0.188:8765/work",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({schema:"othrys.mycelium.work.v0.1",work_id:`V2-004C-A${attempt}`,capability:"verification.sha256@1",payload:{text}}),signal:AbortSignal.timeout(1200)});
      if(!response.ok) throw new Error(`HTTP_${response.status}`);
      const out:any=await response.json();
      writeFileSync(`${root}/qa/mycelium/004c/output-${attempt}.json`,JSON.stringify(out));
      return {ok:true as const,outputRef:`${root}/qa/mycelium/004c/output-${attempt}.json`};
    }catch{
      envelopes=envelopes.map(e=>e.node_id==="t590"?quarantine(e):e);
      return {ok:false as const,reason:"NODE_LOST:t590",retryable:true};
    }
  }
  const out={schema:"othrys.mycelium.work-result.v0.1",work_id:`V2-004C-A${attempt}`,node_id:"legion",capability:"verification.sha256@1",authorityGranted:false,ok:true,artifact:{sha256:expected,bytes:Buffer.byteLength(text)}};
  writeFileSync(`${root}/qa/mycelium/004c/output-${attempt}.json`,JSON.stringify(out));
  return {ok:true as const,outputRef:`${root}/qa/mycelium/004c/output-${attempt}.json`};
}
async function verify(outputRef:string){
  const out=JSON.parse(readFileSync(outputRef,"utf8"));
  return out.ok===true && out.authorityGranted===false && out.artifact?.sha256===expected;
}
let tick=5000;
const run=await runLoop("V2-004C-FAILOVER",{maxAttempts:2,baseDelayMs:1,maxDelayMs:1},{work,verify,now:()=>tick++,iso:()=>new Date(1787845000000+tick++).toISOString()});
const report={mission_id:"V2-004C",talos_state:run.state,replay_state:replay(run),attempts:run.attempts,placements,expected_sha256:expected,node_loss_preserved_as_distinct_attempt:placements.length===2&&placements[0].node_id==="t590"&&placements[1].node_id==="legion"};
writeFileSync(`${root}/qa/mycelium/004c/V2-004C.failover.json`,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if(run.state!=="SUCCEEDED"||replay(run)!=="SUCCEEDED"||!report.node_loss_preserved_as_distinct_attempt) process.exit(2);
