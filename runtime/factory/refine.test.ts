import test from "node:test";
import assert from "node:assert/strict";
import { beginRefinement, completeRefinement, refinementLineage, FactoryRefineError } from "./refine.ts";

const waiting = Object.freeze({
  orosId: "oros-x",
  status: "WAITING_OPERATOR_ACCEPTANCE",
  candidateCommit: "parent123",
  artifactSha256: "a".repeat(64),
  operatorDecision: null,
  released: false
});

test("feedback is normalized, sourced and content-bound", () => {
  const intent = beginRefinement(waiting, "  Add retry hint  ", "operator");
  assert.equal(intent.feedback, "Add retry hint");
  assert.equal(intent.feedbackSource, "operator");
  assert.match(intent.feedbackDigest, /^[0-9a-f]{64}$/);
  assert.equal(intent.parentCandidateCommit, "parent123");
});

test("only waiting candidates may refine", () => {
  assert.throws(() => beginRefinement({...waiting,status:"ACCEPTED"}, "x", "operator"), /REFINE_NOT_ALLOWED/);
});

test("empty feedback and source fail closed", () => {
  assert.throws(() => beginRefinement(waiting, " ", "operator"), /FEEDBACK_REQUIRED/);
  assert.throws(() => beginRefinement(waiting, "x", " "), /FEEDBACK_SOURCE_REQUIRED/);
});
test("child candidate must be distinct and evidenced", () => {
  const intent = beginRefinement(waiting, "Improve copy", "operator");
  assert.throws(() => completeRefinement(intent, "parent123", "b".repeat(64)), /CHILD_MUST_DIFFER/);
  assert.throws(() => completeRefinement(intent, "child456", ""), /CHILD_EVIDENCE_REQUIRED/);
  const result = completeRefinement(intent, "child456", "b".repeat(64));
  assert.equal(result.status, "WAITING_OPERATOR_ACCEPTANCE");
  assert.equal(result.operatorDecision, null);
  assert.equal(result.released, false);
});

test("lineage preserves parent, child and feedback digest", () => {
  const intent = beginRefinement(waiting, "Improve copy", "ai-advisory");
  const result = completeRefinement(intent, "child456", "b".repeat(64));
  assert.deepEqual(refinementLineage(result), {
    parent: "parent123",
    child: "child456",
    feedbackDigest: intent.feedbackDigest,
    source: "ai-advisory"
  });
});

test("refine result cannot masquerade as acceptance", () => {
  const intent = beginRefinement(waiting, "Improve copy", "operator");
  const result = completeRefinement(intent, "child456", "b".repeat(64));
  assert.notEqual(result.status, "ACCEPTED");
  assert.equal(result.released, false);
  assert.equal(result.operatorDecision, null);
});
