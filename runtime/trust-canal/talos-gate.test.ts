import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { TrustCanalAdmission, AuthorityRejectedError } from "./admission.ts";
import { AdmissionLedger } from "./ledger.ts";
import { runLoop } from "../talos-kernel/loop.ts";

const allowed = { role: "gpt-control", channel: "v2" };
function gate() {
  const path = join(mkdtempSync(join(tmpdir(), "othrys-gate-")), "admission.jsonl");
  return new TrustCanalAdmission(new AdmissionLedger({ path }), [allowed]);
}

async function executeAfterAdmission(raw: unknown, calls: { work: number }) {
  const admission = gate().admit(raw);
  return runLoop(admission.record.missionId, { maxAttempts: 1, baseDelayMs: 1, maxDelayMs: 1 }, {
    work: async () => { calls.work += 1; return { ok: true as const, outputRef: "proof" }; },
    verify: async () => true,
    now: () => 1,
    iso: () => "2026-08-27T09:00:00.000Z",
  });
}

test("rejected authority never reaches Talos work", async () => {
  const calls = { work: 0 };
  const raw = { missionId: "V2-GATE-BLOCK", command: "x", actor: { role: "worker", channel: "v2" }, context: "" };
  await assert.rejects(() => executeAfterAdmission(raw, calls), AuthorityRejectedError);
  assert.equal(calls.work, 0);
});
test("admitted mission can enter Talos and succeed", async () => {
  const calls = { work: 0 };
  const raw = { missionId: "V2-GATE-PASS", command: "x", actor: allowed, context: "" };
  const run = await executeAfterAdmission(raw, calls);
  assert.equal(calls.work, 1);
  assert.equal(run.state, "SUCCEEDED");
});
