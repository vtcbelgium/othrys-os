import { createHash } from "node:crypto";

export const FACTORY_REFINE_SCHEMA = "othrys.v2.factory-refine.v1";
export class FactoryRefineError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; this.name = "FactoryRefineError"; }
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function beginRefinement(run: any, feedback: string, source: string) {
  if (run?.status !== "WAITING_OPERATOR_ACCEPTANCE") throw new FactoryRefineError("REFINE_NOT_ALLOWED");
  if (!run.candidateCommit || !run.artifactSha256) throw new FactoryRefineError("PARENT_EVIDENCE_REQUIRED");
  const normalized = String(feedback ?? "").trim();
  const explicitSource = String(source ?? "").trim();
  if (!normalized) throw new FactoryRefineError("FEEDBACK_REQUIRED");
  if (!explicitSource) throw new FactoryRefineError("FEEDBACK_SOURCE_REQUIRED");
  return Object.freeze({
    schema: FACTORY_REFINE_SCHEMA,
    orosId: run.orosId,
    parentCandidateCommit: run.candidateCommit,
    parentArtifactSha256: run.artifactSha256,
    feedback: normalized,
    feedbackDigest: sha256(normalized),
    feedbackSource: explicitSource,
    status: "REFINING"
  });
}
export function completeRefinement(intent: any, childCommit: string, childArtifactSha256: string) {
  if (intent?.schema !== FACTORY_REFINE_SCHEMA || intent.status !== "REFINING") throw new FactoryRefineError("INVALID_REFINE_INTENT");
  if (!childCommit || !childArtifactSha256) throw new FactoryRefineError("CHILD_EVIDENCE_REQUIRED");
  if (childCommit === intent.parentCandidateCommit) throw new FactoryRefineError("CHILD_MUST_DIFFER");
  return Object.freeze({
    schema: FACTORY_REFINE_SCHEMA,
    orosId: intent.orosId,
    parentCandidateCommit: intent.parentCandidateCommit,
    parentArtifactSha256: intent.parentArtifactSha256,
    childCandidateCommit: childCommit,
    childArtifactSha256,
    feedback: intent.feedback,
    feedbackDigest: intent.feedbackDigest,
    feedbackSource: intent.feedbackSource,
    status: "WAITING_OPERATOR_ACCEPTANCE",
    operatorDecision: null,
    released: false
  });
}

export function refinementLineage(result: any) {
  if (result?.schema !== FACTORY_REFINE_SCHEMA || result.status !== "WAITING_OPERATOR_ACCEPTANCE") throw new FactoryRefineError("INVALID_REFINE_RESULT");
  return Object.freeze({
    parent: result.parentCandidateCommit,
    child: result.childCandidateCommit,
    feedbackDigest: result.feedbackDigest,
    source: result.feedbackSource
  });
}
