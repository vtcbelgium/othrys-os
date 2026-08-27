import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { TrustCanalAdmission } from "../../runtime/trust-canal/admission.ts";
import { AdmissionLedger } from "../../runtime/trust-canal/ledger.ts";
import { buildRepairTask, prepareEngineering, verifyMutationScope } from "../../runtime/hephaestus/authority.ts";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";

const root = resolve(import.meta.dirname, "../..");
const consumerRel = "qa/block3-composition/consumer.mjs";
const consumer = join(root, consumerRel);
const runRoot = join(process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".", "OTHRYS", "v2-003a-proof");
const evidence = join(runRoot, "evidence");
const artifact = join(runRoot, "visit-record.json");
rmSync(runRoot, { recursive: true, force: true }); mkdirSync(evidence, { recursive: true });

const missionId = "V2-BLOCK3-LIVE";
const actor = { role: "gpt-control", channel: "v2" };
const engineeringCommand = {
  missionId, title: "Block 3 composition consumer",
  goal: `Implement qa/block3-composition/consumer.mjs as the smallest ESM consumer of V2 canonical block.analytics.visit-tracking. Import ingest, createMemoryStorageBridge and PORT from ../../blocks/analytics/visit-tracking/src/index.js. Require V2_003A_VISIT_SALT and V2_003A_OUTPUT from process.env. Ingest exactly {path:"/catalog/item?utm=secret#private", referrer:"https://Example.COM/private/path?q=secret", ip:"203.0.113.9", userAgent:"OTHRYS-V2-003A", occurredAt:"2026-08-27T10:00:00.000Z"} and write only the returned record as pretty JSON to V2_003A_OUTPUT.`,
  constraints: ["modify only qa/block3-composition/consumer.mjs", "no copied Block logic", "no hardcoded salt", "no network", "use analytics.visit_ingest@1 through the canonical Block export"],
  workspace: root, allowedPaths: [consumerRel], forbiddenPaths: ["blocks/", "runtime/", "admissions/", "GPT_LOG.jsonl", "GPT_STATE.json", "V2_BUILD_BACKLOG.md"],
  acceptance: {
    commands: ["node qa/block3-composition/consumer.mjs with V2_003A_VISIT_SALT and V2_003A_OUTPUT must emit one valid visit-record@1 artifact"],
    criteria: ["PORT equals analytics.visit_ingest@1", "path strips query/fragment", "referrer is hostname-only", "visitorHash is 64 lowercase hex", "country is null without geo Bridge", "missing salt fails and emits no artifact", "worker changes only consumer.mjs"]
  }, maxAttempts: 3
};
const rawCommand = JSON.stringify(engineeringCommand);
const ledger = new AdmissionLedger({ path: join(evidence, "admission.jsonl") });
const canal = new TrustCanalAdmission(ledger, [actor]);
const admitted = canal.admit({ missionId, command: rawCommand, actor, context: "V2-003A Block 3 composition" });
const plan = prepareEngineering(admitted.record, rawCommand);
let failurePacket = "";
let workerFailurePacket = "";
const attemptEvidence: any[] = [];

async function work(attempt: number) {
  const dir = join(evidence, `attempt-${attempt}`); mkdirSync(dir, { recursive: true });
  const requestPath = join(dir, "request.json"), resultPath = join(dir, "result.json"), logPath = join(dir, "worker.log"), pidPath = join(dir, "worker.pid");
  const task = attempt === 1 ? plan.buildTask : failurePacket ? buildRepairTask(plan, failurePacket) : `${plan.buildTask}\n\nPrevious worker-stage failure: ${workerFailurePacket}\nWhen calling write_file, include path exactly: ${consumerRel}. Do not omit the path argument.`;
  writeFileSync(requestPath, JSON.stringify({ schema_version: "othrys.worker-request.v0.1", job_id: `${missionId}-A${attempt}`, node_id: "legion", capability: "engineering.patch", workspace: plan.workspace, task,
    allowed_paths: [...plan.allowedPaths], deny_paths: [...plan.forbiddenPaths], timeout_sec: 120 }, null, 2));
  const launch = spawnSync("python", [join(root, "runtime/workers/launch_worker.py"), "--request", requestPath,
    "--result", resultPath, "--log", logPath, "--pid-file", pidPath], { encoding: "utf8" });
  if (launch.status !== 0) return { ok: false as const, reason: launch.stderr || "launch failed", retryable: true };
  const deadline = Date.now() + 150_000;
  while (!existsSync(resultPath) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 500));
  if (!existsSync(resultPath)) return { ok: false as const, reason: "worker result timeout", retryable: true };
  const result = JSON.parse(readFileSync(resultPath, "utf8"));
  if (!result.ok) { workerFailurePacket = result.reason || "worker failed"; return { ok: false as const, reason: workerFailurePacket, retryable: true }; }
  verifyMutationScope(plan, result.changed_files ?? []);
  attemptEvidence.push({ attempt, duration_sec: result.duration_sec, changed_files: result.changed_files,
    out_of_scope_changes: result.out_of_scope_changes, tool_trace: result.runtime_evidence?.tool_trace ?? [] });
  return { ok: true as const, outputRef: resultPath };
}

function runConsumer(withSalt: boolean, out: string) {
  rmSync(out, { force: true });
  const env = { ...process.env, V2_003A_OUTPUT: out } as NodeJS.ProcessEnv;
  if (withSalt) env.V2_003A_VISIT_SALT = "proof-only-v2-003a-salt"; else delete env.V2_003A_VISIT_SALT;
  return spawnSync("node", [consumer], { cwd: root, env, encoding: "utf8" });
}
async function verify(_outputRef: string) {
  const attempt = attemptEvidence.at(-1)?.attempt ?? 0;
  const positive = runConsumer(true, artifact);
  let record: any = null; let errors: string[] = [];
  if (positive.status !== 0) errors.push(`positive exit=${positive.status}: ${positive.stderr}`);
  if (!existsSync(artifact)) errors.push("positive run emitted no artifact");
  if (existsSync(artifact)) {
    try { record = JSON.parse(readFileSync(artifact, "utf8")); } catch (e) { errors.push(`artifact json invalid: ${String(e)}`); }
  }
  const { createHash } = await import("node:crypto");
  const expectedHash = createHash("sha256").update("2026-08-27|203.0.113.9|OTHRYS-V2-003A|proof-only-v2-003a-salt", "utf8").digest("hex");
  const expectedKeys = ["country", "occurredAt", "path", "referrerHost", "visitorHash"];
  if (record) {
    if (JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(expectedKeys)) errors.push(`unexpected artifact keys: ${Object.keys(record).sort().join(",")}`);
    if (record.path !== "/catalog/item") errors.push(`path=${JSON.stringify(record.path)}`);
    if (record.referrerHost !== "example.com") errors.push(`referrerHost=${JSON.stringify(record.referrerHost)}`);
    if (record.country !== null) errors.push(`country=${JSON.stringify(record.country)}`);
    if (record.occurredAt !== "2026-08-27T10:00:00.000Z") errors.push(`occurredAt=${JSON.stringify(record.occurredAt)}`);
    if (record.visitorHash !== expectedHash) errors.push("visitorHash mismatch");
  }
  const negativeArtifact = join(runRoot, "negative-visit.json");
  const negative = runConsumer(false, negativeArtifact);
  if (negative.status === 0) errors.push("missing-salt negative control unexpectedly succeeded");
  if (existsSync(negativeArtifact)) errors.push("missing-salt negative control emitted artifact");
  const source = readFileSync(consumer, "utf8");
  if (!source.includes("PORT")) errors.push("consumer does not reference PORT export");
  if (source.includes("proof-only-v2-003a-salt")) errors.push("consumer hardcodes verifier salt");
  const ok = errors.length === 0;
  failurePacket = ok ? "" : errors.join("; ");
  writeFileSync(join(evidence, `attempt-${attempt}`, "verifier.json"), JSON.stringify({ ok, errors, record, expectedHash,
    positiveExit: positive.status, negativeExit: negative.status }, null, 2));
  return ok;
}

let tick = 3000;
const run = await runLoop(missionId, { maxAttempts: plan.maxAttempts, baseDelayMs: 1, maxDelayMs: 1 }, {
  work, verify, now: () => tick++, iso: () => new Date(1787820000000 + tick++).toISOString(),
});
const record = existsSync(artifact) ? JSON.parse(readFileSync(artifact, "utf8")) : null;
const report = { mission_id: "V2-003A", live_mission_id: missionId, admission_created: admitted.created,
  correlation_id: admitted.record.correlationId, command_digest: admitted.record.promptDigest,
  acceptance_digest: plan.acceptanceDigest, talos_state: run.state, replay_state: replay(run), attempts: run.attempts,
  block_id: "block.analytics.visit-tracking", block_version: "0.1.0", port: "analytics.visit_ingest@1",
  artifact: record, verifier_independent: true, attempt_evidence: attemptEvidence, event_types: run.events.map((e) => e.t) };
writeFileSync(join(root, "qa/block3-composition/V2-003A.report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (run.state !== "SUCCEEDED" || replay(run) !== "SUCCEEDED" || !record) process.exit(2);
