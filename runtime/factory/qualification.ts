import { createHash } from "node:crypto";
import { FACTORY_PROPOSAL_SCHEMA } from "./proposal.ts";

export const FACTORY_QUALIFICATION_SCHEMA = "othrys.v2.factory-proposal-qualification.v1";
export class FactoryQualificationError extends Error {
  code: string;
  constructor(code:string){super(code);this.code=code;this.name="FactoryQualificationError";}
}
function digest(value:unknown){return createHash("sha256").update(JSON.stringify(value),"utf8").digest("hex");}

export function qualifyProposal(proposal:any,review:any,sourceBundle:string){
  if(proposal?.schema!==FACTORY_PROPOSAL_SCHEMA||proposal.status!=="ADVISORY"||proposal.authorityGranted!==false)throw new FactoryQualificationError("INVALID_RAW_PROPOSAL");
  if(typeof sourceBundle!=="string"||!sourceBundle)throw new FactoryQualificationError("SOURCE_BUNDLE_REQUIRED");
  if(!review||review.proposalDigest!==proposal.proposalDigest||review.candidateCommit!==proposal.candidateCommit||review.artifactSha256!==proposal.artifactSha256)throw new FactoryQualificationError("REVIEW_BINDING_MISMATCH");
  const reviewerNode=String(review.reviewerNode??"").trim(), reviewerModel=String(review.reviewerModel??"").trim();
  if(!reviewerNode||!reviewerModel)throw new FactoryQualificationError("REVIEWER_EVIDENCE_REQUIRED");
  if(reviewerNode===proposal.nodeId||reviewerModel===proposal.model)throw new FactoryQualificationError("REVIEWER_NOT_INDEPENDENT");
  if(!Array.isArray(review.checks)||review.checks.length!==proposal.suggestions.length)throw new FactoryQualificationError("REVIEW_CHECK_COUNT_MISMATCH");
  const seen=new Set<number>(), eligible:number[]=[];
  for(const check of review.checks){
    const index=check?.suggestionIndex;
    if(!Number.isInteger(index)||index<0||index>=proposal.suggestions.length||seen.has(index))throw new FactoryQualificationError("INVALID_REVIEW_INDEX");
    seen.add(index);
    if(check.verdict!=="SUPPORTED"&&check.verdict!=="REJECTED")throw new FactoryQualificationError("INVALID_REVIEW_VERDICT");
    const quote=String(check.evidenceQuote??"");
    if(!quote||!sourceBundle.includes(quote))throw new FactoryQualificationError("EVIDENCE_QUOTE_NOT_FOUND");
    if(quote.trim().startsWith("===")||quote.trim().length<8)throw new FactoryQualificationError("EVIDENCE_QUOTE_NON_SUBSTANTIVE");
    const terms=Array.isArray(check.evidenceTerms)?check.evidenceTerms:[];
    const suggestion=String(proposal.suggestions[index]??"").toLowerCase();
    const quoteLower=quote.toLowerCase();
    if(terms.length<1||terms.length>5||terms.some((x:any)=>typeof x!=="string"||x.length<3||!suggestion.includes(x.toLowerCase())||!quoteLower.includes(x.toLowerCase())))throw new FactoryQualificationError("EVIDENCE_TERM_FAILED");
    const absent=Array.isArray(check.absentTokens)?check.absentTokens:[];
    if(absent.length>3||absent.some((x:any)=>typeof x!=="string"||!x||sourceBundle.includes(x)))throw new FactoryQualificationError("ABSENCE_CLAIM_FAILED");
    if(check.verdict==="SUPPORTED")eligible.push(index);
  }
  const body={proposalDigest:proposal.proposalDigest,candidateCommit:proposal.candidateCommit,artifactSha256:proposal.artifactSha256,
    proposer:{nodeId:proposal.nodeId,model:proposal.model},reviewer:{nodeId:reviewerNode,model:reviewerModel},checks:review.checks,eligibleSuggestionIndexes:eligible};
  return Object.freeze({schema:FACTORY_QUALIFICATION_SCHEMA,status:eligible.length?"QUALIFIED_ADVISORY":"REJECTED_ADVISORY",authorityGranted:false,
    proposal,review:Object.freeze({...review}),eligibleSuggestionIndexes:Object.freeze([...eligible]),qualificationDigest:digest(body)});
}

export function selectQualifiedFeedback(qualification:any,index:number,approver:string){
  if(qualification?.schema!==FACTORY_QUALIFICATION_SCHEMA||qualification.status!=="QUALIFIED_ADVISORY"||qualification.authorityGranted!==false)throw new FactoryQualificationError("PROPOSAL_NOT_QUALIFIED");
  if(!qualification.eligibleSuggestionIndexes.includes(index))throw new FactoryQualificationError("SUGGESTION_NOT_ELIGIBLE");
  const actor=String(approver??"").trim();
  if(actor!=="operator"&&actor!=="gpt-control")throw new FactoryQualificationError("APPROVER_NOT_AUTHORIZED");
  const check=qualification.review.checks.find((x:any)=>x.suggestionIndex===index);
  if(!check)throw new FactoryQualificationError("REVIEW_CHECK_MISSING");
  return Object.freeze({feedback:qualification.proposal.suggestions[index],source:`ai-qualified:${qualification.qualificationDigest}`,selectedBy:actor,
    proposalDigest:qualification.proposal.proposalDigest,qualificationDigest:qualification.qualificationDigest,
    candidateCommit:qualification.proposal.candidateCommit,artifactSha256:qualification.proposal.artifactSha256,
    evidence:Object.freeze({verdict:check.verdict,evidenceQuote:check.evidenceQuote,evidenceTerms:Object.freeze([...(check.evidenceTerms??[])]),absentTokens:Object.freeze([...(check.absentTokens??[])]),reason:String(check.reason??"")}),
    authorityGranted:false});
}
