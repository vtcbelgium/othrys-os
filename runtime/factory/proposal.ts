import { createHash } from "node:crypto";

export const FACTORY_PROPOSAL_SCHEMA = "othrys.v2.factory-proposal.v1";
export class FactoryProposalError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; this.name = "FactoryProposalError"; }
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

export function createAdvisoryProposal(input: any) {
  if (!input || typeof input !== "object") throw new FactoryProposalError("INVALID_PROPOSAL");
  const candidateCommit=String(input.candidateCommit??"").trim();
  const artifactSha256=String(input.artifactSha256??"").trim();
  const nodeId=String(input.nodeId??"").trim();
  const model=String(input.model??"").trim();
  const summary=String(input.summary??"").trim();
  const suggestions=Array.isArray(input.suggestions)?input.suggestions.map((x:any)=>String(x).trim()).filter(Boolean):[];
  const risks=Array.isArray(input.risks)?input.risks.map((x:any)=>String(x).trim()).filter(Boolean):[];
  if(!candidateCommit||!/^[0-9a-f]{64}$/.test(artifactSha256)||!nodeId||!model||!summary) throw new FactoryProposalError("PROPOSAL_EVIDENCE_REQUIRED");
  if(suggestions.length<1||suggestions.length>5) throw new FactoryProposalError("SUGGESTION_COUNT_INVALID");
  const body={candidateCommit,artifactSha256,nodeId,model,summary,suggestions,risks};
  return Object.freeze({schema:FACTORY_PROPOSAL_SCHEMA,...body,proposalDigest:digest(body),status:"ADVISORY",authorityGranted:false});
}
export function selectProposalFeedback(_proposal:any,_index:number,_approver:string){
  throw new FactoryProposalError("PROPOSAL_NOT_QUALIFIED");
}

export function proposalMatchesCandidate(proposal:any,candidateCommit:string,artifactSha256:string):boolean{
  return proposal?.schema===FACTORY_PROPOSAL_SCHEMA&&proposal.authorityGranted===false&&proposal.candidateCommit===candidateCommit&&proposal.artifactSha256===artifactSha256;
}
