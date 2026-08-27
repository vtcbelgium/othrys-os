import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { TrustCanalAdmission } from "../../runtime/trust-canal/admission.ts";
import { AdmissionLedger } from "../../runtime/trust-canal/ledger.ts";
import { prepareEngineering, verifyMutationScope } from "../../runtime/hephaestus/authority.ts";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";
const root=resolve(import.meta.dirname,"../..");
const worker=join(root,"runtime/workers/legion_qwen_worker_v01.py");
const c=spawnSync("python",[join(root,"runtime/mycelium/census_cli.py"),"--node-id","legion","--root",root,"--worker",worker,"--capability","engineering.patch","--cpu-threads","2","--ram-mb","4096","--gpu-count","1","--vram-mb","6000"],{encoding:"utf8"});
if(c.status!==0) throw new Error(c.stderr); const node=JSON.parse(c.stdout);
if(!node.feasible||node.envelope.authorityGranted!==false||node.envelope.routing.distributed!==false) throw new Error("MYCELIUM_ENVELOPE_REJECTED");
const runRoot=join(process.env.LOCALAPPDATA??process.env.TEMP??".","OTHRYS","v2-004a-proof"),workspace=join(runRoot,"workspace"),evidence=join(runRoot,"evidence");
rmSync(runRoot,{recursive:true,force:true});mkdirSync(workspace,{recursive:true});mkdirSync(evidence,{recursive:true});writeFileSync(join(workspace,"node-proof.txt"),"PENDING\n");
function git(...args:string[]){const r=spawnSync("git",["-C",workspace,...args],{encoding:"utf8"});if(r.status!==0)throw new Error(r.stderr)}git("init");git("config","user.email","othrys@local");git("config","user.name","OTHRYS");git("add",".");git("commit","-m","baseline");
const missionId="V2-MYCELIUM-LEGION",actor={role:"gpt-control",channel:"v2"};
const command={missionId,title:"Mycelium Legion proof",goal:"Replace node-proof.txt with exactly MYCELIUM_NODE=legion followed by one newline.",constraints:["modify only node-proof.txt","smallest possible change"],workspace,allowedPaths:["node-proof.txt"],forbiddenPaths:[],acceptance:{commands:["exact bytes"],criteria:["MYCELIUM_NODE=legion\\n","no other changes"]},maxAttempts:3};
const raw=JSON.stringify(command),ledger=new AdmissionLedger({path:join(evidence,"admission.jsonl")}),canal=new TrustCanalAdmission(ledger,[actor]),ad=canal.admit({missionId,command:raw,actor,context:"V2-004A"}),plan=prepareEngineering(ad.record,raw);const attempts:any[]=[];
async function work(attempt:number){const d=join(evidence,`a${attempt}`);mkdirSync(d,{recursive:true});const rq=join(d,"request.json"),rs=join(d,"result.json"),lg=join(d,"worker.log"),pd=join(d,"worker.pid");writeFileSync(rq,JSON.stringify({schema_version:"othrys.worker-request.v0.1",job_id:`${missionId}-A${attempt}`,node_id:node.envelope.node_id,capability:"engineering.patch",workspace:plan.workspace,task:plan.buildTask,allowed_paths:[...plan.allowedPaths],deny_paths:[],timeout_sec:120},null,2));const l=spawnSync("python",[join(root,"runtime/workers/launch_worker.py"),"--request",rq,"--result",rs,"--log",lg,"--pid-file",pd],{encoding:"utf8"});if(l.status!==0)return{ok:false as const,reason:l.stderr||"launch",retryable:true};const deadline=Date.now()+150000;while(!existsSync(rs)&&Date.now()<deadline)await new Promise(r=>setTimeout(r,500));if(!existsSync(rs))return{ok:false as const,reason:"timeout",retryable:true};const rr=JSON.parse(readFileSync(rs,"utf8"));if(!rr.ok)return{ok:false as const,reason:rr.reason||"worker",retryable:true};verifyMutationScope(plan,rr.changed_files??[]);attempts.push({attempt,duration_sec:rr.duration_sec,node_id:rr.node_id,changed_files:rr.changed_files,node_before:rr.node_before,node_after:rr.node_after});return{ok:true as const,outputRef:rs}}
async function verify(){return readFileSync(join(workspace,"node-proof.txt"),"utf8")==="MYCELIUM_NODE=legion\n"}
let tick=5000;const run=await runLoop(missionId,{maxAttempts:3,baseDelayMs:1,maxDelayMs:1},{work,verify,now:()=>tick++,iso:()=>new Date(1787840000000+tick++).toISOString()});
const report={mission_id:"V2-004A",node_envelope:node.envelope,requested:node.requested,feasible:node.feasible,talos_state:run.state,replay_state:replay(run),attempts:run.attempts,worker_attempts:attempts,authority_granted:node.envelope.authorityGranted,distributed:node.envelope.routing.distributed};
writeFileSync(join(root,"qa/mycelium/V2-004A.report.json"),JSON.stringify(report,null,2)+"\n");console.log(JSON.stringify(report,null,2));
if(run.state!=="SUCCEEDED"||replay(run)!=="SUCCEEDED"||node.envelope.authorityGranted!==false||node.envelope.routing.distributed!==false)process.exit(2);
