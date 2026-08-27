import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createAdvisoryProposal } from "../../runtime/factory/proposal.ts";
import { qualifyProposal, selectQualifiedFeedback } from "../../runtime/factory/qualification.ts";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";

const root="C:/Users/othry/Projects/othrys-v2";
const product="C:/Users/othry/Projects/oros/find-this-item-v2";
const prior=JSON.parse(readFileSync(root+"/qa/factory-ai-advisory/V2-005E.report.json","utf8"));
const p=prior.proposal;
const proposal=createAdvisoryProposal({candidateCommit:p.candidateCommit,artifactSha256:p.artifactSha256,nodeId:p.nodeId,model:p.model,
  summary:p.summary,suggestions:p.suggestions,risks:p.risks});
const candidate=readFileSync(product+"/index.mjs","utf8");
const readme=readFileSync(product+"/README.md","utf8");
const blockCore=readFileSync(root+"/blocks/monetization/affiliate-offer/src/core.js","utf8");
const sourceBundle=`=== CANDIDATE index.mjs ===\n${candidate}\n=== CANDIDATE README.md ===\n${readme}\n=== BLOCK core.js ===\n${blockCore}`;
const evidenceOptions=sourceBundle.split(/\r?\n/).map(x=>x.trim()).filter(x=>x.length>=8&&!x.startsWith("==="));
const stop=new Set(["consider","adding","more","handle","cases","where","invalid","missing","support","multiple","objects","make","easier","manage","different","include","clear","instruction","construct","help","documentation"]);
function shortlist(suggestion:string){const words=[...new Set((suggestion.toLowerCase().match(/[a-z0-9_]+/g)??[]).filter(w=>w.length>=4&&!stop.has(w)))];return evidenceOptions.map((line,i)=>({line,i,score:words.reduce((n,w)=>n+(line.toLowerCase().includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,Math.min(8,evidenceOptions.length)).map(x=>x.line);}
const evidenceBySuggestion=proposal.suggestions.map(shortlist);
const t590=await (await fetch("http://192.168.0.188:8765/health")).json();
const legionRaw=spawnSync("python",[root+"/runtime/mycelium/census_cli.py","--node-id","legion","--root",root,"--worker",root+"/runtime/workers/legion_qwen_worker_v01.py"],{encoding:"utf8"});
if(legionRaw.status!==0)throw new Error("legion census failed");
const legion=JSON.parse(legionRaw.stdout).envelope;
const requirement={cpu_threads:1,ram_mb:1024,gpu_count:1,vram_mb:4500};
const routed=spawnSync("python",[root+"/runtime/mycelium/route_cli.py"],{input:JSON.stringify({envelopes:[legion,t590.node],capability:"advisory.fact-check@1",request:requirement}),encoding:"utf8"});
if(routed.status!==0)throw new Error(routed.stdout||routed.stderr||"route failed");
const selectedNode=JSON.parse(routed.stdout).node_id;
if(selectedNode!=="legion")throw new Error(`fact-check must route to legion, got ${selectedNode}`);
let failurePacket=""; const attempts:any[]=[]; let qualified:any=null;
function prompt(){return `You are an independent read-only fact checker. You have NO mutation, policy, acceptance, or release authority.
Review each proposal suggestion against the exact SOURCE BUNDLE. Return JSON only: {"checks":[{"suggestionIndex":0,"verdict":"SUPPORTED|REJECTED","evidenceIndex":0,"absentTokens":["optional exact token proven absent"],"reason":"short factual reason"}]}.
Return exactly one check for each suggestion index 0..${proposal.suggestions.length-1}. Use REJECTED if a suggestion rests on an unsupported claim, duplicates platform Block logic, or lacks source evidence. A SUPPORTED improvement must cite current source that motivates it; if support depends on something being absent, put at most 3 exact absent tokens in absentTokens. Never invent quotes.
PROPOSAL=${JSON.stringify({summary:proposal.summary,suggestions:proposal.suggestions,risks:proposal.risks})}
${failurePacket?`PREVIOUS DETERMINISTIC FAILURE=${failurePacket}\n`:""}SOURCE BUNDLE:\n${sourceBundle}`;}
async function work(attempt:number){
  const started=performance.now();
  const response=await fetch("http://127.0.0.1:11434/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    model:"qwen3:8b",prompt:prompt(),stream:false,format:"json",keep_alive:"30m",options:{temperature:0.1,num_ctx:8192,num_predict:1200}})});
  if(!response.ok)return{ok:false as const,reason:`ollama http ${response.status}`,retryable:true};
  const raw=await response.json(); let parsed:any;
  try{parsed=JSON.parse(raw.response??"{}");}catch{return{ok:false as const,reason:"review JSON parse failed",retryable:true};}
  const review={proposalDigest:proposal.proposalDigest,candidateCommit:proposal.candidateCommit,artifactSha256:proposal.artifactSha256,
    reviewerNode:selectedNode,reviewerModel:"qwen3:8b",checks:Array.isArray(parsed.checks)?parsed.checks.map((c:any)=>{const options=Number.isInteger(c.suggestionIndex)?evidenceBySuggestion[c.suggestionIndex]:undefined;const line=Array.isArray(options)&&Number.isInteger(c.evidenceIndex)&&c.evidenceIndex>=0&&c.evidenceIndex<options.length?options[c.evidenceIndex]:undefined;const words=[...new Set((String(proposal.suggestions[c.suggestionIndex]??"").toLowerCase().match(/[a-z0-9_]+/g)??[]).filter((w:string)=>w.length>=3))];const evidenceTerms=line?words.filter((w:string)=>line.toLowerCase().includes(w)).slice(0,5):[];return {...c,evidenceQuote:line??"",evidenceTerms};}):parsed.checks};
  const path=`${root}/qa/factory-ai-council/review-attempt-${attempt}.json`;
  writeFileSync(path,JSON.stringify(review,null,2)+"\n");
  attempts.push({attempt,duration_ms:Math.round((performance.now()-started)*100)/100,eval_count:raw.eval_count,load_duration:raw.load_duration,review});
  return{ok:true as const,outputRef:path};
}
async function verify(outputRef:string){
  const review=JSON.parse(readFileSync(outputRef,"utf8"));
  try{qualified=qualifyProposal(proposal,review,sourceBundle);failurePacket="";return true;}
  catch(e){failurePacket=e instanceof Error?e.message:String(e);return false;}
}
let tick=9000;
const loop=await runLoop("V2-005F-COUNCIL",{maxAttempts:3,baseDelayMs:1,maxDelayMs:1},{work,verify,now:()=>tick++,iso:()=>new Date(1787853000000+tick++).toISOString()});
if(loop.state!=="SUCCEEDED"||replay(loop)!=="SUCCEEDED"||!qualified)throw new Error(`council failed ${loop.state}: ${failurePacket}`);
let selected:any=null;
if(qualified.status==="QUALIFIED_ADVISORY"&&qualified.eligibleSuggestionIndexes.length){
  selected=selectQualifiedFeedback(qualified,qualified.eligibleSuggestionIndexes[0],"gpt-control");
}
const report={mission_id:"V2-005F",verdict:"PASS",proposer:{node:proposal.nodeId,model:proposal.model},reviewer:{node:selectedNode,model:"qwen3:8b"},
  route_requirement:requirement,talos:{state:loop.state,replay:replay(loop),attempts:loop.attempts},attempt_evidence:attempts,
  proposal_digest:proposal.proposalDigest,qualification_status:qualified.status,qualification_digest:qualified.qualificationDigest,
  eligible_suggestion_indexes:qualified.eligibleSuggestionIndexes,selected_feedback:selected,
  raw_proposal_directly_selectable:false,authorityGranted:false,mutation_performed:false,operator_accepted:false,released:false,
  boundary:"Cross-model review plus deterministic exact-source evidence is required before proposal selection; selection still creates feedback only."};
writeFileSync(root+"/qa/factory-ai-council/V2-005F.report.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
