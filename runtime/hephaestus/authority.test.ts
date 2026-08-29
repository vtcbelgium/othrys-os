import assert from "node:assert/strict";


import { join } from "node:path";
import test from "node:test";
import { makeTestTemp } from "../test_temp.mjs";
import { TrustCanalAdmission } from "../trust-canal/admission.ts";
import { AdmissionLedger } from "../trust-canal/ledger.ts";
import { buildRepairTask, HephaestusRejectedError, prepareEngineering, verifyMutationScope } from "./authority.ts";

const actor = { role: "gpt-control", channel: "v2" };
function command(missionId = "V2-HEPH-001") {
  return JSON.stringify({ missionId, title: "Bounded build", goal: "Change value.txt to VALUE=2", constraints: ["smallest change"],
    workspace: "C:/scratch", allowedPaths: ["value.txt"], forbiddenPaths: [],
    acceptance: { commands: ["node verify.mjs"], criteria: ["value is exact"] }, maxAttempts: 3 });
}
function admit(rawCommand: string, missionId = "V2-HEPH-001") {
  const path = join(makeTestTemp("othrys-heph-"), "admission.jsonl");
  const canal = new TrustCanalAdmission(new AdmissionLedger({ path, now: () => "2026-08-27T09:00:00.000Z" }), [actor]);
  return canal.admit({ missionId, command: rawCommand, actor, context: "engineering" }).record;
}

test("admitted command becomes frozen engineering plan", () => {
  const raw = command(); const plan = prepareEngineering(admit(raw), raw);
  assert.equal(plan.missionId, "V2-HEPH-001");
  assert.match(plan.commandDigest, /^[a-f0-9]{64}$/); assert.match(plan.acceptanceDigest, /^[a-f0-9]{64}$/);
  assert.deepEqual(plan.allowedPaths, ["value.txt"]); assert.ok(Object.isFrozen(plan));
  assert.match(plan.buildTask, /Modify only the allowed paths/);
});
test("tampered command is rejected against Trust Canal digest", () => {
  const raw = command(); const record = admit(raw);
  assert.throws(() => prepareEngineering(record, raw.replace("VALUE=2", "VALUE=3")), (e) => e instanceof HephaestusRejectedError && e.code === "COMMAND_DIGEST_MISMATCH");
});

test("mission identity must match admission", () => {
  const raw = command("V2-OTHER"); const record = admit(raw, "V2-HEPH-001");
  assert.throws(() => prepareEngineering(record, raw), (e) => e instanceof HephaestusRejectedError && e.code === "MISSION_BINDING_MISMATCH");
});

test("platform forbidden scope is rejected", () => {
  const raw = JSON.stringify({ ...JSON.parse(command()), allowedPaths: ["runtime/talos-kernel/loop.ts"] });
  const record = admit(raw);
  assert.throws(() => prepareEngineering(record, raw), (e) => e instanceof HephaestusRejectedError && e.code === "FORBIDDEN_SCOPE");
});

test("strict engineering command rejects extra fields", () => {
  const raw = JSON.stringify({ ...JSON.parse(command()), surprise: true }); const record = admit(raw);
  assert.throws(() => prepareEngineering(record, raw), (e) => e instanceof HephaestusRejectedError && e.code === "COMMAND_FIELDS_INVALID");
});
test("repair task carries verifier evidence without changing frozen acceptance", () => {
  const raw = command(); const plan = prepareEngineering(admit(raw), raw); const digest = plan.acceptanceDigest;
  const repair = buildRepairTask(plan, "expected VALUE=2\\n; actual VALUE=1\\n");
  assert.match(repair, /Verifier evidence/); assert.match(repair, /VALUE=1/); assert.equal(plan.acceptanceDigest, digest);
  assert.match(repair, /Do not broaden scope or weaken acceptance/);
});

test("mutation scope accepts only exact allowed paths", () => {
  const raw = command(); const plan = prepareEngineering(admit(raw), raw);
  assert.doesNotThrow(() => verifyMutationScope(plan, ["value.txt"]));
  assert.throws(() => verifyMutationScope(plan, ["other.txt"]), (e) => e instanceof HephaestusRejectedError && e.code === "MUTATION_SCOPE_VIOLATION");
});

test("attempt budget is bounded to five", () => {
  const raw = JSON.stringify({ ...JSON.parse(command()), maxAttempts: 6 }); const record = admit(raw);
  assert.throws(() => prepareEngineering(record, raw), (e) => e instanceof HephaestusRejectedError && e.code === "MAX_ATTEMPTS_INVALID");
});
