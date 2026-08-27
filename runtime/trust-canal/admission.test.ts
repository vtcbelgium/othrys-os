import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { TrustCanalAdmission, AuthorityRejectedError } from "./admission.ts";
import { AdmissionLedger, LedgerCorruptionError, MissionConflictError } from "./ledger.ts";
import { BoundaryValidationError } from "./validation.ts";

const NOW = "2026-08-27T09:00:00.000Z";
const ACTOR = { role: "gpt-control", channel: "v2" };
function input(command = "build block") { return { missionId: "V2-TC-001", command, actor: ACTOR, context: "bounded" }; }
function makeCanal() {
  const dir = mkdtempSync(join(tmpdir(), "othrys-tc-"));
  const path = join(dir, "admission.jsonl");
  const ledger = new AdmissionLedger({ path, now: () => NOW });
  return { path, ledger, canal: new TrustCanalAdmission(ledger, [ACTOR]) };
}

test("strict input rejects extra fields before admission", () => {
  const { canal } = makeCanal();
  assert.throws(() => canal.admit({ ...input(), surprise: true }), (e) => e instanceof BoundaryValidationError && e.code === "BODY_FIELDS_INVALID");
});

test("unauthorized actor is rejected before durable admission", () => {
  const { canal, path } = makeCanal();
  assert.throws(() => canal.admit({ ...input(), actor: { role: "worker", channel: "v2" } }), AuthorityRejectedError);
  assert.throws(() => readFileSync(path, "utf8"));
});
test("admission binds mission correlation digest actor and durable receipt", () => {
  const { canal, path } = makeCanal();
  const result = canal.admit(input());
  assert.equal(result.created, true);
  assert.equal(result.record.missionId, "V2-TC-001");
  assert.equal(result.record.correlationId, "V2-TC-001");
  assert.match(result.record.promptDigest, /^[a-f0-9]{64}$/);
  assert.deepEqual(result.record.actor, ACTOR);
  assert.equal(result.record.state, "ADMITTED");
  assert.ok(readFileSync(path, "utf8").endsWith("\n"));
});

test("identical re-admission is idempotent", () => {
  const { canal } = makeCanal();
  const first = canal.admit(input());
  const second = canal.admit(input());
  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.deepEqual(second.record, first.record);
});

test("same mission with different command fails closed", () => {
  const { canal } = makeCanal();
  canal.admit(input("alpha"));
  assert.throws(() => canal.admit(input("beta")), MissionConflictError);
});
test("ledger reconstructs durable admission", () => {
  const { canal, path } = makeCanal();
  const first = canal.admit(input());
  const rebuilt = new AdmissionLedger({ path, now: () => NOW });
  assert.deepEqual(rebuilt.get(first.record.missionId), first.record);
});

test("torn ledger tail is rejected", () => {
  const dir = mkdtempSync(join(tmpdir(), "othrys-tc-torn-"));
  const path = join(dir, "admission.jsonl");
  writeFileSync(path, '{"broken":true}', "utf8");
  assert.throws(() => new AdmissionLedger({ path }), (e) => e instanceof LedgerCorruptionError && e.code === "LEDGER_TORN_TAIL");
});

test("invalid mission id is rejected", () => {
  const { canal } = makeCanal();
  assert.throws(() => canal.admit({ ...input(), missionId: " bad id " }), (e) => e instanceof BoundaryValidationError && e.code === "MISSION_ID_INVALID");
});

test("empty command is rejected", () => {
  const { canal } = makeCanal();
  assert.throws(() => canal.admit({ ...input(), command: "   " }), (e) => e instanceof BoundaryValidationError && e.code === "COMMAND_INVALID");
});

