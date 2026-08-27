import test from "node:test";
import assert from "node:assert/strict";
import { createAdvisoryProposal, proposalMatchesCandidate, selectProposalFeedback } from "./proposal.ts";

const base={
  candidateCommit:"abc123",
  artifactSha256:"a".repeat(64),
  nodeId:"t590",
  model:"llama3.2",
  summary:"Small CLI with a clean affiliate-offer boundary.",
  suggestions:["Expose providerId in JSON output","Add --help usage text"],
  risks:["Do not duplicate Block monetization logic"]
};

test("proposal is authority-free and content-bound",()=>{
  const p=createAdvisoryProposal(base);
  assert.equal(p.status,"ADVISORY");
  assert.equal(p.authorityGranted,false);
  assert.match(p.proposalDigest,/^[0-9a-f]{64}$/);
  assert.equal(p.nodeId,"t590");
  assert.equal(p.model,"llama3.2");
});

test("proposal must contain bounded suggestions and evidence",()=>{
  assert.throws(()=>createAdvisoryProposal({...base,suggestions:[]}),/SUGGESTION_COUNT_INVALID/);
  assert.throws(()=>createAdvisoryProposal({...base,artifactSha256:"bad"}),/PROPOSAL_EVIDENCE_REQUIRED/);
  assert.throws(()=>createAdvisoryProposal({...base,suggestions:Array(6).fill("x")}),/SUGGESTION_COUNT_INVALID/);
});
test("only operator or gpt-control may select feedback",()=>{
  const p=createAdvisoryProposal(base);
  assert.throws(()=>selectProposalFeedback(p,0,"ai"),/APPROVER_NOT_AUTHORIZED/);
  assert.equal(selectProposalFeedback(p,1,"gpt-control").feedback,"Add --help usage text");
  assert.equal(selectProposalFeedback(p,0,"operator").authorityGranted,false);
});

test("selection cannot escape proposal bounds",()=>{
  const p=createAdvisoryProposal(base);
  assert.throws(()=>selectProposalFeedback(p,-1,"operator"),/INVALID_SUGGESTION_INDEX/);
  assert.throws(()=>selectProposalFeedback(p,99,"operator"),/INVALID_SUGGESTION_INDEX/);
});

test("proposal is exact-candidate scoped",()=>{
  const p=createAdvisoryProposal(base);
  assert.equal(proposalMatchesCandidate(p,"abc123","a".repeat(64)),true);
  assert.equal(proposalMatchesCandidate(p,"different","a".repeat(64)),false);
  assert.equal(proposalMatchesCandidate(p,"abc123","b".repeat(64)),false);
});

test("tampered authority is rejected",()=>{
  const p:any={...createAdvisoryProposal(base),authorityGranted:true};
  assert.throws(()=>selectProposalFeedback(p,0,"operator"),/INVALID_ADVISORY_PROPOSAL/);
  assert.equal(proposalMatchesCandidate(p,"abc123","a".repeat(64)),false);
});
