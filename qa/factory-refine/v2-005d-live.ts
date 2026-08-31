import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TrustCanalAdmission } from "../../runtime/trust-canal/admission.ts";
import { AdmissionLedger } from "../../runtime/trust-canal/ledger.ts";
import { prepareEngineering, verifyMutationScope } from "../../runtime/hephaestus/authority.ts";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";
import { beginRefinement, completeRefinement, refinementLineage } from "../../runtime/factory/refine.ts";
import { factoryBuildRequirement } from "../../runtime/factory/placement.ts";

const root="C:/Users/othry/Projects/othrys-os";
const source="C:/Users/othry/Projects/oros/find-this-item-v2";
const workspace="C:/Users/othry/Projects/oros/.proof-find-this-item-v2-005d";
const evidence=join(process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".","OTHRYS","v2-005d-refine");
rmSync(workspace,{recursive:true,force:true}); rmSync(evidence,{recursive:true,force:true}); mkdirSync(evidence,{recursive:true});
const clone=spawnSync("git",["clone","--quiet",source,workspace],{encoding:"utf8"}); if(clone.status!==0) throw new Error(clone.stderr);
function git(...args:string[]){const p=spawnSync("git",["-C",workspace,...args],{encoding:"utf8"});if(p.status!==0)throw new Error(p.stderr);return p.stdout.trim();}
git("checkout","--quiet","24b99ab9b9420c407d9eed01d23e0cf2f52a73d8");
git("config","user.email","othrys@local"); git("config","user.name","OTHRYS Factory Proof");
const parentIndex=readFileSync(join(workspace,"index.mjs"),"utf8");
const parentArtifact=createHash("sha256").update(parentIndex).digest("hex");
const parentRun={orosId:"oros-find-item-v2",status:"WAITING_OPERATOR_ACCEPTANCE",candidateCommit:git("rev-parse","HEAD"),artifactSha256:parentArtifact,operatorDecision:null,released:false};
const feedback="Expose providerId in the JSON result so future UI and agent consumers can identify offer provenance without parsing the URL.";
const intent=beginRefinement(parentRun,feedback,"gpt-control-advisory-proof");
const t590Url=process.env.OTHRYS_T590_URL ?? "http://192.168.0.188:8765";
const health=await (await fetch(t590Url+"/health")).json();
const requirement=factoryBuildRequirement();
const legionRaw=spawnSync("python",[join(root,"runtime/mycelium/census_cli.py"),"--node-id","legion","--root",root,"--worker",join(root,"runtime/workers/legion_qwen_worker_v01.py")],{encoding:"utf8"});
if(legionRaw.status!==0)throw new Error("legion census failed");
const legion=JSON.parse(legionRaw.stdout).envelope;
const routed=spawnSync("python",[join(root,"runtime/mycelium/route_cli.py")],{input:JSON.stringify({envelopes:[legion,health.node],capability:requirement.capability,request:requirement.resources}),encoding:"utf8"});
if(routed.status!==0)throw new Error(routed.stdout||routed.stderr||"route failed");
const selectedNode=JSON.parse(routed.stdout).node_id;
if(selectedNode!=="legion")throw new Error(`engineering refinement must route to legion, got ${selectedNode}`);
const missionId="V2-005D-LIVE";
const actor={role:"gpt-control",channel:"v2"};
const engineeringCommand={
  missionId,title:"Refine Find This Item proof candidate",
  goal:`Refine index.mjs according to this frozen feedback: ${intent.feedback}`,
  constraints:["modify only index.mjs","preserve constructAffiliateOffer call and Block import","no new dependencies","no network","do not accept or release anything"],
  workspace,allowedPaths:["index.mjs"],forbiddenPaths:["README.md",".git/"],
  acceptance:{commands:["node index.mjs GI Joe emits valid JSON"],criteria:["output.providerId equals ebay-epn","existing href/disclosureRequired/relHints remain","blank query still exits 2","only index.mjs changes"]},
  maxAttempts:3
};
const rawCommand=JSON.stringify(engineeringCommand);
const ledger=new AdmissionLedger({path:join(evidence,"admission.jsonl")});
const canal=new TrustCanalAdmission(ledger,[actor]);
const admitted=canal.admit({missionId,command:rawCommand,actor,context:"V2-005D disposable refinement proof"});
const plan=prepareEngineering(admitted.record,rawCommand);
const workerEvidence:any[]=[]; let failurePacket="";

async function work(attempt:number){
  const dir=join(evidence,`attempt-${attempt}`);mkdirSync(dir,{recursive:true});
  const request=join(dir,"request.json"),result=join(dir,"result.json"),log=join(dir,"worker.log"),pid=join(dir,"worker.pid");
  const task=attempt===1?plan.buildTask:`${plan.buildTask}\nPrevious verifier failure: ${failurePacket}`;
  writeFileSync(request,JSON.stringify({schema_version:"othrys.worker-request.v0.1",job_id:`${missionId}-A${attempt}`,node_id:selectedNode,capability:requirement.capability,workspace:plan.workspace,task,allowed_paths:[...plan.allowedPaths],deny_paths:[...plan.forbiddenPaths],timeout_sec:90},null,2));
  const launch=spawnSync("python",[join(root,"runtime/workers/launch_worker.py"),"--request",request,"--result",result,"--log",log,"--pid-file",pid],{encoding:"utf8"});
  if(launch.status!==0)return{ok:false as const,reason:launch.stderr||"launch failed",retryable:true};
  const deadline=Date.now()+120000;while(!existsSync(result)&&Date.now()<deadline)await new Promise(r=>setTimeout(r,250));
  if(!existsSync(result))return{ok:false as const,reason:"worker timeout",retryable:true};
  const rr=JSON.parse(readFileSync(result,"utf8"));
  workerEvidence.push({attempt,ok:rr.ok,duration_sec:rr.duration_sec,changed_files:rr.changed_files,reason:rr.reason,tool_trace:rr.runtime_evidence?.tool_trace??[]});
  if(!rr.ok)return{ok:false as const,reason:rr.reason||"worker failed",retryable:true};
  verifyMutationScope(plan,rr.changed_files??[]);return{ok:true as const,outputRef:result};
}
async function verify(_outputRef:string){
  const errors:string[]=[];
  const positive=spawnSync("node",["index.mjs","GI","Joe"],{cwd:workspace,encoding:"utf8"});
  if(positive.status!==0)errors.push(`positive exit=${positive.status}: ${positive.stderr}`);
  let data:any=null;try{data=JSON.parse(positive.stdout.trim());}catch{errors.push("positive output is not JSON");}
  if(data){
    if(data.query!=="GI Joe")errors.push(`query=${JSON.stringify(data.query)}`);
    if(data.providerId!=="ebay-epn")errors.push(`providerId=${JSON.stringify(data.providerId)}`);
    if(typeof data.href!=="string"||!data.href.includes("ebay"))errors.push("href missing ebay offer");
    if(data.disclosureRequired!==true)errors.push("disclosureRequired changed");
    if(!Array.isArray(data.relHints)||!data.relHints.includes("sponsored"))errors.push("sponsored rel missing");
  }
  const negative=spawnSync("node",["index.mjs"],{cwd:workspace,encoding:"utf8"});
  if(negative.status!==2)errors.push(`blank query exit=${negative.status}`);
  const changed=git("status","--short").split(/\r?\n/).filter(Boolean);
  if(changed.some(x=>!x.endsWith(" index.mjs")))errors.push(`unexpected git changes: ${changed.join(" | ")}`);
  const sourceNow=readFileSync(join(workspace,"index.mjs"),"utf8");
  if(!sourceNow.includes("constructAffiliateOffer"))errors.push("Block call removed");
  if(!sourceNow.includes("providerId"))errors.push("providerId not exposed");
  failurePacket=errors.join("; ");
  return errors.length===0;
}

let tick=5000;
const loop=await runLoop(missionId,{maxAttempts:3,baseDelayMs:1,maxDelayMs:1},{work,verify,now:()=>tick++,iso:()=>new Date(1787850000000+tick++).toISOString()});
if(loop.state!=="SUCCEEDED"||replay(loop)!=="SUCCEEDED")throw new Error(`refine loop ${loop.state}: ${failurePacket}`);
git("add","index.mjs");git("commit","-m","factory proof: expose provider provenance");
const childCommit=git("rev-parse","HEAD");
const childIndex=readFileSync(join(workspace,"index.mjs"),"utf8");
const childArtifact=createHash("sha256").update(childIndex).digest("hex");
const result=completeRefinement(intent,childCommit,childArtifact);
const report={mission_id:"V2-005D",verdict:"PASS",disposable:true,real_candidate_untouched:true,
  admission:{correlation_id:admitted.record.correlationId,command_digest:admitted.record.promptDigest,acceptance_digest:plan.acceptanceDigest},
  talos:{state:loop.state,replay:replay(loop),attempts:loop.attempts},mycelium:{selected_node:selectedNode,requirement,t590_engineering_capable:health.node.capabilities.includes("engineering.patch")},worker_evidence:workerEvidence,
  refinement:{intent,result,lineage:refinementLineage(result)},parent_index_sha256:parentArtifact,child_index_sha256:childArtifact,
  operator_accepted:false,released:false};
writeFileSync(join(root,"qa/factory-refine/V2-005D.report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
rmSync(workspace,{recursive:true,force:true});
