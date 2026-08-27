import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { TrustCanalAdmission } from "../../runtime/trust-canal/admission.ts";
import { AdmissionLedger } from "../../runtime/trust-canal/ledger.ts";
import { buildRepairTask, prepareEngineering, verifyMutationScope } from "../../runtime/hephaestus/authority.ts";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";

const root = resolve(import.meta.dirname, "../..");
const runRoot = join(process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".", "OTHRYS", "v2-002f-proof");
const workspace = join(runRoot, "workspace");
const evidence = join(runRoot, "evidence");
rmSync(runRoot, { recursive: true, force: true }); mkdirSync(workspace, { recursive: true }); mkdirSync(evidence, { recursive: true });
writeFileSync(join(workspace, "value.txt"), "VALUE=0\n", "utf8");
function git(...args: string[]) { const r = spawnSync("git", ["-C", workspace, ...args], { encoding: "utf8" }); if (r.status !== 0) throw new Error(r.stderr); }
git("init"); git("config", "user.email", "othrys@local"); git("config", "user.name", "OTHRYS"); git("add", "."); git("commit", "-m", "baseline");

const missionId = "V2-HEPH-LIVE";
const actor = { role: "gpt-control", channel: "v2" };
const engineeringCommand = { missionId, title: "Live Hephaestus proof", goal: "Replace value.txt with exactly VALUE=2 followed by one newline.",
  constraints: ["smallest possible change", "modify only value.txt"], workspace, allowedPaths: ["value.txt"], forbiddenPaths: [],
  acceptance: { commands: ["value.txt bytes must equal VALUE=2\\n"], criteria: ["exact bytes", "no other file changes"] }, maxAttempts: 3 };
const rawCommand = JSON.stringify(engineeringCommand);
const ledger = new AdmissionLedger({ path: join(evidence, "admission.jsonl") });
const canal = new TrustCanalAdmission(ledger, [actor]);
const admitted = canal.admit({ missionId, command: rawCommand, actor, context: "V2-002F live integration" });
const plan = prepareEngineering(admitted.record, rawCommand);
let failurePacket = "";
const attemptEvidence: any[] = [];
async function work(attempt: number) {
  const dir = join(evidence, `attempt-${attempt}`); mkdirSync(dir, { recursive: true });
  const requestPath = join(dir, "request.json"), resultPath = join(dir, "result.json"), logPath = join(dir, "worker.log"), pidPath = join(dir, "worker.pid");
  const task = attempt === 1 ? plan.buildTask : buildRepairTask(plan, failurePacket);
  writeFileSync(requestPath, JSON.stringify({ schema_version: "othrys.worker-request.v0.1", job_id: `${missionId}-A${attempt}`,
    node_id: "legion", capability: "engineering.patch", workspace: plan.workspace, task,
    allowed_paths: [...plan.allowedPaths], deny_paths: [...plan.forbiddenPaths], timeout_sec: 120 }, null, 2));
  const launch = spawnSync("python", [join(root, "runtime/workers/launch_worker.py"), "--request", requestPath,
    "--result", resultPath, "--log", logPath, "--pid-file", pidPath], { encoding: "utf8" });
  if (launch.status !== 0) return { ok: false as const, reason: launch.stderr || "launch failed", retryable: true };
  const deadline = Date.now() + 150_000;
  while (!existsSync(resultPath) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 500));
  if (!existsSync(resultPath)) return { ok: false as const, reason: "worker result timeout", retryable: true };
  const result = JSON.parse(readFileSync(resultPath, "utf8"));
  if (!result.ok) return { ok: false as const, reason: result.reason || "worker failed", retryable: true };
  verifyMutationScope(plan, result.changed_files ?? []);
  attemptEvidence.push({ attempt, duration_sec: result.duration_sec, changed_files: result.changed_files,
    out_of_scope_changes: result.out_of_scope_changes, tool_trace: result.runtime_evidence?.tool_trace ?? [] });
  return { ok: true as const, outputRef: resultPath };
}
async function verify(_outputRef: string) {
  const actual = readFileSync(join(workspace, "value.txt"), "utf8");
  const attempt = attemptEvidence.at(-1)?.attempt ?? 0;
  const ok = actual === "VALUE=2\n";
  failurePacket = ok ? "" : `expected exact VALUE=2\\n; actual=${JSON.stringify(actual)}`;
  writeFileSync(join(evidence, `attempt-${attempt}`, "verifier.json"), JSON.stringify({ ok, actual, failurePacket }, null, 2));
  return ok;
}

let tick = 2000;
const run = await runLoop(missionId, { maxAttempts: plan.maxAttempts, baseDelayMs: 1, maxDelayMs: 1 }, {
  work, verify, now: () => tick++, iso: () => new Date(1787820000000 + tick++).toISOString(),
});
const finalValue = readFileSync(join(workspace, "value.txt"), "utf8");
const report = { mission_id: "V2-002F", live_mission_id: missionId, admission_created: admitted.created,
  correlation_id: admitted.record.correlationId, command_digest: admitted.record.promptDigest,
  acceptance_digest: plan.acceptanceDigest, talos_state: run.state, replay_state: replay(run), attempts: run.attempts,
  final_value: finalValue, verifier_independent: true, controlled_first_rejection: false, attempt_evidence: attemptEvidence,
  event_types: run.events.map((e) => e.t) };
writeFileSync(join(root, "qa/hephaestus-integration/V2-002F.report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (run.state !== "SUCCEEDED" || replay(run) !== "SUCCEEDED" || run.attempts < 1 || finalValue !== "VALUE=2\n") process.exit(2);

