import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { factoryBuildRequirement } from "../../runtime/factory/placement.ts";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";

const root = "C:/Users/othry/Projects/othrys-os";
const remoteUrl = process.env.OTHRYS_T590_URL;
if (!remoteUrl) throw new Error("OTHRYS_T590_URL required");
const requirement = factoryBuildRequirement();
const health = await (await fetch(remoteUrl + "/health")).json();
const legionRaw = spawnSync("python", [join(root,"runtime/mycelium/census_cli.py"),"--node-id","legion","--root",root,
  "--worker",join(root,"runtime/workers/legion_qwen_worker_v01.py")], {encoding:"utf8"});
if (legionRaw.status !== 0) throw new Error("legion census failed");
const legion = JSON.parse(legionRaw.stdout).envelope;
const routed = spawnSync("python", [join(root,"runtime/mycelium/route_cli.py")], {
  input: JSON.stringify({envelopes:[legion,health.node],capability:requirement.capability,request:requirement.resources}), encoding:"utf8"});
if (routed.status !== 0) throw new Error(routed.stdout || routed.stderr || "route failed");
const route = JSON.parse(routed.stdout);
if (route.node_id !== "legion") throw new Error(`engineering.patch must resolve to legion, got ${route.node_id}`);

const runRoot = join(process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".", "OTHRYS", "v2-005c-route");
const workspace = join(runRoot,"workspace"), evidence = join(runRoot,"evidence");
rmSync(runRoot,{recursive:true,force:true}); mkdirSync(workspace,{recursive:true}); mkdirSync(evidence,{recursive:true});
writeFileSync(join(workspace,"target.txt"),"VALUE=0\n","utf8");
function git(...args:string[]){const p=spawnSync("git",["-C",workspace,...args],{encoding:"utf8"});if(p.status!==0)throw new Error(p.stderr)}
git("init"); git("config","user.email","othrys@local"); git("config","user.name","OTHRYS"); git("add","."); git("commit","-m","baseline");
const workerAttempts:any[]=[];
const loop = await runLoop("V2-005C-FACTORY-ROUTE", {maxAttempts:3,baseDelayMs:5,maxDelayMs:25}, {
  work: async (attempt) => {
    const dir=join(evidence,`attempt-${attempt}`); mkdirSync(dir,{recursive:true});
    const request=join(dir,"request.json"), result=join(dir,"result.json"), log=join(dir,"worker.log"), pid=join(dir,"worker.pid");
    writeFileSync(request,JSON.stringify({schema_version:"othrys.worker-request.v0.1",job_id:`V2-005C-A${attempt}`,node_id:route.node_id,
      capability:requirement.capability,workspace,task:"In target.txt replace VALUE=0 with VALUE=7. Modify only target.txt.",allowed_paths:["target.txt"],deny_paths:[],timeout_sec:60},null,2));
    const launch=spawnSync("python",[join(root,"runtime/workers/launch_worker.py"),"--request",request,"--result",result,"--log",log,"--pid-file",pid],{encoding:"utf8"});
    if(launch.status!==0)return{ok:false as const,reason:launch.stderr||"launch failed",retryable:true};
    const deadline=Date.now()+90000; while(!existsSync(result)&&Date.now()<deadline) await new Promise(r=>setTimeout(r,250));
    if(!existsSync(result))return{ok:false as const,reason:"worker timeout",retryable:true};
    const rr=JSON.parse(readFileSync(result,"utf8")); workerAttempts.push({attempt,duration_sec:rr.duration_sec,changed_files:rr.changed_files,ok:rr.ok,reason:rr.reason});
    return rr.ok?{ok:true as const,outputRef:result}:{ok:false as const,reason:rr.reason||"worker failed",retryable:true};
  },
  verify: async () => readFileSync(join(workspace,"target.txt"),"utf8").trim() === "VALUE=7",
  now:(()=>{let n=1;return()=>n++;})(), iso:()=>"2026-08-27T15:45:00.000Z"
});
const report={mission_id:"V2-005C",verdict:loop.state==="SUCCEEDED"&&replay(loop)==="SUCCEEDED"?"PASS":"FAIL",
  factory_requirement:requirement,selected_node:route.node_id,talos:{state:loop.state,replay:replay(loop),attempts:loop.attempts},
  worker_attempts:workerAttempts,target:readFileSync(join(workspace,"target.txt"),"utf8"),
  t590_engineering_capable:health.node.capabilities.includes("engineering.patch"),
  boundary:"Factory requests capability/resources only; Mycelium selects node; Talos owns worker lifecycle."};
writeFileSync(join(root,"qa/factory-first-oros/V2-005C.report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if(report.verdict!=="PASS")process.exit(2);

