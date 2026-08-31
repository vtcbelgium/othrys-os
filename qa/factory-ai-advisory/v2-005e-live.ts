import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createAdvisoryProposal, proposalMatchesCandidate, selectProposalFeedback } from "../../runtime/factory/proposal.ts";

const root="C:/Users/othry/Projects/othrys-os";
const product="C:/Users/othry/Projects/oros/find-this-item-v2";
const t590=process.env.OTHRYS_T590_URL ?? "http://192.168.0.188:8765";
function git(...args:string[]){const p=spawnSync("git",["-C",product,...args],{encoding:"utf8"});if(p.status!==0)throw new Error(p.stderr);return p.stdout.trim();}
const beforeHead=git("rev-parse","HEAD"), beforeStatus=git("status","--short");
const source=readFileSync(product+"/index.mjs","utf8");
const artifactSha256=createHash("sha256").update(source,"utf8").digest("hex");
const health=await (await fetch(t590+"/health")).json();
if(!health.node.capabilities.includes("advisory.product-critique@1"))throw new Error("T590 advisory capability not advertised");
const work={schema:"othrys.mycelium.work.v0.1",work_id:"V2-005E-CRITIQUE-001",capability:"advisory.product-critique@1",
  payload:{candidateCommit:beforeHead,artifactSha256,sourceText:source}};
const started=performance.now();
const remote=await (await fetch(t590+"/work",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(work)})).json();
const elapsedMs=Math.round((performance.now()-started)*100)/100;
if(!remote.ok||remote.authorityGranted!==false)throw new Error(`advisory failed: ${JSON.stringify(remote)}`);
const a=remote.artifact;
const proposal=createAdvisoryProposal({candidateCommit:a.candidateCommit,artifactSha256:a.artifactSha256,nodeId:remote.node_id,model:a.model,
  summary:a.summary,suggestions:a.suggestions,risks:a.risks});
if(!proposalMatchesCandidate(proposal,beforeHead,artifactSha256))throw new Error("proposal not bound to exact candidate");
let aiSelectionBlocked=false;
try{selectProposalFeedback(proposal,0,"ai");}catch{aiSelectionBlocked=true;}
if(!aiSelectionBlocked)throw new Error("AI unexpectedly selected its own proposal");
const afterHead=git("rev-parse","HEAD"), afterStatus=git("status","--short");
if(afterHead!==beforeHead||afterStatus!==beforeStatus)throw new Error("advisory lane mutated real product");
const report={mission_id:"V2-005E",verdict:"PASS_WITH_UNQUALIFIED_PROPOSAL",node_id:remote.node_id,model:a.model,elapsed_ms:elapsedMs,
  candidate_commit:beforeHead,artifact_sha256:artifactSha256,proposal,proposal_matches_candidate:true,
  ai_self_selection_blocked:aiSelectionBlocked,proposal_selected:false,qualification_status:"UNQUALIFIED",
  quality_issue:"Model asserted network/API behavior not established by candidate source; canonical Block source has no fetch/axios/http.request/https.request/XMLHttpRequest primitive.",
  real_product_unchanged:true,operator_accepted:false,released:false,
  boundary:"T590 AI may propose only. Live proposal is intentionally unselected until a separate evidence/fact-check qualification gate exists."};
writeFileSync(root+"/qa/factory-ai-advisory/V2-005E.report.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
