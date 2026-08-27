import test from "node:test";
import assert from "node:assert/strict";
import { createAdvisoryProposal } from "./proposal.ts";
import { qualifyProposal } from "./qualification.ts";
import { decideQualifiedAIRefinement } from "./ai_refine.ts";

const run={
  status:"WAITING_OPERATOR_ACCEPTANCE",
  candidateCommit:"abc123",
  artifactSha256:"a".repeat(64),
  orosId:"oros-test",
  operatorDecision:null,
  released:false,
};
const proposal=createAdvisoryProposal({
  candidateCommit:run.candidateCommit,
  artifactSha256:run.artifactSha256,
  nodeId:"t590",
  model:"llama3.2",
  summary:"candidate review",
  suggestions:["Expose providerId in JSON output"],
  risks:[],
});
function qualification(absentTokens:string[]){
  const source="console.log(JSON.stringify({ href: offer.href }));\n";
  return qualifyProposal(proposal,{
    proposalDigest:proposal.proposalDigest,
    candidateCommit:proposal.candidateCommit,
    artifactSha256:proposal.artifactSha256,
    reviewerNode:"legion",
    reviewerModel:"qwen3:8b",
    checks:[{suggestionIndex:0,verdict:"SUPPORTED",evidenceQuote:"JSON.stringify",evidenceTerms:["json"],absentTokens,reason:"grounded"}],
  },source);
}
test("qualified AI without negative gap evidence cannot trigger churn",()=>{
  const decision=decideQualifiedAIRefinement(run,qualification([]),0,"gpt-control");
  assert.equal(decision.decision,"NO_CHANGE_JUSTIFIED");
  assert.equal(decision.candidateCommit,run.candidateCommit);
  assert.equal(decision.authorityGranted,false);
  assert.equal("intent" in decision,false);
});

test("verified absence evidence may enter existing Refine path",()=>{
  const decision=decideQualifiedAIRefinement(run,qualification(["providerId"]),0,"gpt-control");
  assert.equal(decision.decision,"REFINE_ALLOWED");
  assert.deepEqual([...decision.gapEvidence],["providerId"]);
  assert.equal(decision.intent.status,"REFINING");
  assert.match(decision.intent.feedbackSource,/^ai-qualified:/);
  assert.equal(decision.authorityGranted,false);
});

test("candidate binding remains exact",()=>{
  const wrong={...run,candidateCommit:"different"};
  assert.throws(()=>decideQualifiedAIRefinement(wrong,qualification(["providerId"]),0,"gpt-control"),/CANDIDATE_EVIDENCE_MISMATCH/);
});

test("AI cannot self-approve the gate",()=>{
  assert.throws(()=>decideQualifiedAIRefinement(run,qualification(["providerId"]),0,"ai"),/APPROVER_NOT_AUTHORIZED/);
});
