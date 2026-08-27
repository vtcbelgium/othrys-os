import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { acceptCandidate, canRelease, FactoryRunError, loadFactoryRun, newFactoryRun, recordVerifiedCandidate, resumeDecision, saveFactoryRun } from "./run.ts";

function candidate() {
  const run = newFactoryRun({ orosId: "oros-x", product: "X", workspace: "C:/x", exactBlocks: [{ blockId: "b", blockVersion: "1" }] });
  return recordVerifiedCandidate(run, "abc123", "f".repeat(64));
}

test("verified candidate persists and reloads", () => {
  const dir = mkdtempSync(join(tmpdir(), "othrys-factory-")); const path = join(dir, "run.json");
  saveFactoryRun(path, candidate()); const loaded = loadFactoryRun(path);
  assert.equal(loaded.status, "WAITING_OPERATOR_ACCEPTANCE");
  assert.equal(loaded.candidateCommit, "abc123");
});

test("resume waits for operator instead of rebuilding", () => {
  assert.equal(resumeDecision(candidate()), "WAIT_OPERATOR");
});

test("release is forbidden before acceptance", () => {
  assert.equal(canRelease(candidate(), "abc123"), false);
});
test("wrong candidate commit cannot be accepted", () => {
  assert.throws(() => acceptCandidate(candidate(), "wrong"), (e) => e instanceof FactoryRunError && e.code === "CANDIDATE_COMMIT_MISMATCH");
});

test("matching acceptance enables release but does not perform it", () => {
  const accepted = acceptCandidate(candidate(), "abc123");
  assert.equal(resumeDecision(accepted), "READY_RELEASE");
  assert.equal(canRelease(accepted, "abc123"), true);
  assert.equal(accepted.released, false);
});

test("corrupt durable run fails closed", () => {
  const dir = mkdtempSync(join(tmpdir(), "othrys-factory-")); const path = join(dir, "run.json");
  writeFileSync(path, "{broken", "utf8");
  assert.throws(() => loadFactoryRun(path), (e) => e instanceof FactoryRunError && e.code === "RUN_CORRUPT");
});
