import test from "node:test";
import assert from "node:assert/strict";
import { createAdvisoryProposal } from "./proposal.ts";
import { qualifyProposal, selectQualifiedFeedback } from "./qualification.ts";

const source="const offer = await constructAffiliateOffer({ query });\nconsole.log(JSON.stringify({ query, href: offer.href }));\n";
const proposal=createAdvisoryProposal({candidateCommit:"abc123",artifactSha256:"a".repeat(64),nodeId:"t590",model:"llama3.2",
  summary:"CLI candidate",suggestions:["Add explicit error handling around offer construction","Expose providerId in JSON output"],risks:[]});
function review(checks:any[]){return{proposalDigest:proposal.proposalDigest,candidateCommit:proposal.candidateCommit,artifactSha256:proposal.artifactSha256,
  reviewerNode:"legion",reviewerModel:"qwen3:8b",checks};}

test("independent grounded review qualifies supported suggestions",()=>{
  const q=qualifyProposal(proposal,review([
    {suggestionIndex:0,verdict:"SUPPORTED",evidenceQuote:"const offer = await constructAffiliateOffer({ query });",evidenceTerms:["offer"],absentTokens:["try {"]},
    {suggestionIndex:1,verdict:"SUPPORTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:["providerId: offer.providerId"]}
  ]),source);
  assert.equal(q.status,"QUALIFIED_ADVISORY");
  assert.deepEqual([...q.eligibleSuggestionIndexes],[0,1]);
  assert.equal(q.authorityGranted,false);
});

test("fabricated evidence and false absence fail closed",()=>{
  assert.throws(()=>qualifyProposal(proposal,review([
    {suggestionIndex:0,verdict:"SUPPORTED",evidenceQuote:"fetch('/api')",evidenceTerms:["offer"],absentTokens:[]},
    {suggestionIndex:1,verdict:"REJECTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:[]}
  ]),source),/EVIDENCE_QUOTE_NOT_FOUND/);
  assert.throws(()=>qualifyProposal(proposal,review([
    {suggestionIndex:0,verdict:"SUPPORTED",evidenceQuote:"const offer",evidenceTerms:["offer"],absentTokens:["console.log"]},
    {suggestionIndex:1,verdict:"REJECTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:[]}
  ]),source),/ABSENCE_CLAIM_FAILED/);
});
test("same proposer and reviewer is rejected",()=>{
  const r=review([
    {suggestionIndex:0,verdict:"SUPPORTED",evidenceQuote:"const offer",evidenceTerms:["offer"],absentTokens:[]},
    {suggestionIndex:1,verdict:"REJECTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:[]}
  ]); r.reviewerNode="t590";
  assert.throws(()=>qualifyProposal(proposal,r,source),/REVIEWER_NOT_INDEPENDENT/);
});

test("no supported suggestions produces rejected advisory",()=>{
  const q=qualifyProposal(proposal,review([
    {suggestionIndex:0,verdict:"REJECTED",evidenceQuote:"const offer",evidenceTerms:["offer"],absentTokens:[]},
    {suggestionIndex:1,verdict:"REJECTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:[]}
  ]),source);
  assert.equal(q.status,"REJECTED_ADVISORY");
  assert.throws(()=>selectQualifiedFeedback(q,0,"gpt-control"),/PROPOSAL_NOT_QUALIFIED/);
});

test("only eligible qualified suggestion can become feedback",()=>{
  const q=qualifyProposal(proposal,review([
    {suggestionIndex:0,verdict:"REJECTED",evidenceQuote:"const offer",evidenceTerms:["offer"],absentTokens:[]},
    {suggestionIndex:1,verdict:"SUPPORTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:["providerId: offer.providerId"]}
  ]),source);
  assert.throws(()=>selectQualifiedFeedback(q,0,"gpt-control"),/SUGGESTION_NOT_ELIGIBLE/);
  assert.throws(()=>selectQualifiedFeedback(q,1,"ai"),/APPROVER_NOT_AUTHORIZED/);
  const selected=selectQualifiedFeedback(q,1,"gpt-control");
  assert.equal(selected.feedback,"Expose providerId in JSON output");
  assert.equal(selected.authorityGranted,false);
  assert.match(selected.qualificationDigest,/^[0-9a-f]{64}$/);
});

test("non-substantive evidence and invalid lexical grounding fail closed",()=>{
  assert.throws(()=>qualifyProposal(proposal,review([
    {suggestionIndex:0,verdict:"SUPPORTED",evidenceQuote:"=== CANDIDATE ===",evidenceTerms:["candidate"],absentTokens:[]},
    {suggestionIndex:1,verdict:"REJECTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:[]}
  ]),"=== CANDIDATE ===\n"+source),/EVIDENCE_QUOTE_NON_SUBSTANTIVE/);
  assert.throws(()=>qualifyProposal(proposal,review([
    {suggestionIndex:0,verdict:"SUPPORTED",evidenceQuote:"const offer",evidenceTerms:["missing"],absentTokens:[]},
    {suggestionIndex:1,verdict:"REJECTED",evidenceQuote:"console.log(JSON.stringify({ query, href: offer.href }));",evidenceTerms:["json"],absentTokens:[]}
  ]),source),/EVIDENCE_TERM_FAILED/);
});
