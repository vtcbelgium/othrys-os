import { beginRefinement } from "./refine.ts";
import { selectQualifiedFeedback } from "./qualification.ts";

export const AI_REFINE_DECISION_SCHEMA = "othrys.v2.factory-ai-refine-decision.v1";

export class AIRefineGateError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = "AIRefineGateError";
  }
}

export function decideQualifiedAIRefinement(run: any, qualification: any, index: number, approver: string) {
  const selected = selectQualifiedFeedback(qualification, index, approver);
  if (run?.status !== "WAITING_OPERATOR_ACCEPTANCE") throw new AIRefineGateError("RUN_NOT_WAITING");
  if (selected.candidateCommit !== run.candidateCommit || selected.artifactSha256 !== run.artifactSha256) {
    throw new AIRefineGateError("CANDIDATE_EVIDENCE_MISMATCH");
  }
  const gaps = [...(selected.evidence?.absentTokens ?? [])];
  if (gaps.length === 0) {
    return Object.freeze({
      schema: AI_REFINE_DECISION_SCHEMA,
      decision: "NO_CHANGE_JUSTIFIED",
      candidateCommit: run.candidateCommit,
      artifactSha256: run.artifactSha256,
      feedback: selected.feedback,
      qualificationDigest: selected.qualificationDigest,
      authorityGranted: false,
    });
  }  const intent = beginRefinement(run, selected.feedback, selected.source);
  return Object.freeze({
    schema: AI_REFINE_DECISION_SCHEMA,
    decision: "REFINE_ALLOWED",
    candidateCommit: run.candidateCommit,
    artifactSha256: run.artifactSha256,
    qualificationDigest: selected.qualificationDigest,
    gapEvidence: Object.freeze(gaps),
    evidenceQuote: selected.evidence.evidenceQuote,
    intent,
    authorityGranted: false,
  });
}
