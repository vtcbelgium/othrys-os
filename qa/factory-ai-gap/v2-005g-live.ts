import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createAdvisoryProposal } from "../../runtime/factory/proposal.ts";
import { qualifyProposal } from "../../runtime/factory/qualification.ts";
import { decideQualifiedAIRefinement } from "../../runtime/factory/ai_refine.ts";

const root="C:/Users/othry/Projects/othrys-os";
const product="C:/Users/othry/Projects/oros/find-this-item-v2";
const e=JSON.parse(readFileSync(root+"/qa/factory-ai-advisory/V2-005E.report.json","utf8"));
const f=JSON.parse(readFileSync(root+"/qa/factory-ai-council/V2-005F.report.json","utf8"));
const a=JSON.parse(readFileSync(root+"/missions/V2-005A.result.json","utf8"));
const p=e.proposal;
const proposal=createAdvisoryProposal({candidateCommit:p.candidateCommit,artifactSha256:p.artifactSha256,nodeId:p.nodeId,model:p.model,
  summary:p.summary,suggestions:p.suggestions,risks:p.risks});
const candidate=readFileSync(product+"/index.mjs","utf8");
const readme=readFileSync(product+"/README.md","utf8");
const blockCore=readFileSync(root+"/blocks/monetization/affiliate-offer/src/core.js","utf8");
const sourceBundle=`=== CANDIDATE index.mjs ===\n${candidate}\n=== CANDIDATE README.md ===\n${readme}\n=== BLOCK core.js ===\n${blockCore}`;
const review=f.attempt_evidence[0].review;
const qualification=qualifyProposal(proposal,review,sourceBundle);
const run={orosId:a.oros_id,status:"WAITING_OPERATOR_ACCEPTANCE",candidateCommit:a.product_candidate_commit,
  artifactSha256:a.product_index_sha256,operatorDecision:null,released:false};
const selectedIndex=f.eligible_suggestion_indexes[0];
const decision=decideQualifiedAIRefinement(run,qualification,selectedIndex,"gpt-control");
function git(...args:string[]){const r=spawnSync("git",["-C",product,...args],{encoding:"utf8"});if(r.status!==0)throw new Error(r.stderr);return r.stdout.trim();}
const head=git("rev-parse","HEAD");
const dirty=git("status","--porcelain");
if(decision.decision!=="NO_CHANGE_JUSTIFIED")throw new Error(`unexpected decision ${decision.decision}`);
if(head!==a.product_candidate_commit)throw new Error(`candidate head moved: ${head}`);
if(dirty)throw new Error(`real candidate dirty: ${dirty}`);
if(decision.candidateCommit!==a.product_candidate_commit)throw new Error("candidate binding changed");
const report={mission_id:"V2-005G",verdict:"PASS",decision:decision.decision,
  candidate_commit:head,artifact_sha256:a.product_index_sha256,qualification_digest:qualification.qualificationDigest,
  selected_suggestion_index:selectedIndex,selected_feedback:qualification.proposal.suggestions[selectedIndex],
  negative_gap_evidence:[...(qualification.review.checks.find((x:any)=>x.suggestionIndex===selectedIndex)?.absentTokens??[])],
  qwen_invoked:false,mutation_performed:false,real_candidate_clean:true,operator_accepted:false,released:false,
  authorityGranted:false,boundary:"Qualified AI feedback without deterministic negative gap evidence is stopped before Hephaestus/Talos/Qwen."};
writeFileSync(root+"/qa/factory-ai-gap/V2-005G.report.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
