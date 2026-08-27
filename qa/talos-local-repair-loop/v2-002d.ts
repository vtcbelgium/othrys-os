import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { runLoop, replay } from "../../runtime/talos-kernel/loop.ts";

const root = resolve(import.meta.dirname, "../..");
const runRoot = join(process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".", "OTHRYS", "v2-002d-proof");
const workspace = join(runRoot, "workspace");
const evidence = join(runRoot, "evidence");
rmSync(runRoot, { recursive: true, force: true });
mkdirSync(workspace, { recursive: true });
mkdirSync(evidence, { recursive: true });
writeFileSync(join(workspace, "value.txt"), "VALUE=0\n", "utf8");

function git(...args: string[]) {
  const r = spawnSync("git", ["-C", workspace, ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr || `git failed: ${args.join(" ")}`);
}
git("init"); git("config", "user.email", "othrys@local"); git("config", "user.name", "OTHRYS");
git("add", "."); git("commit", "-m", "baseline");

let verifierFailure = "";
const attempts: any[] = [];
async function work(attempt: number) {
  const dir = join(evidence, `attempt-${attempt}`);
  mkdirSync(dir, { recursive: true });
  const requestPath = join(dir, "request.json");
  const resultPath = join(dir, "result.json");
  const logPath = join(dir, "worker.log");
  const pidPath = join(dir, "worker.pid");
  const task = attempt === 1
    ? "Read value.txt. Replace it with exactly VALUE=1 followed by one newline. Modify only value.txt. Call finish."
    : `Independent verifier failed the prior attempt: ${verifierFailure}. Repair value.txt to satisfy that verifier. Modify only value.txt. Call finish.`;
  writeFileSync(requestPath, JSON.stringify({
    schema_version: "othrys.worker-request.v0.1", job_id: `V2-002D-A${attempt}`,
    node_id: "legion", capability: "engineering.patch", workspace, task,
    allowed_paths: ["value.txt"], deny_paths: [".git"], timeout_sec: 120,
  }, null, 2));
  const launch = spawnSync("python", [join(root, "runtime/workers/launch_worker.py"),
    "--request", requestPath, "--result", resultPath, "--log", logPath, "--pid-file", pidPath],
    { encoding: "utf8" });
  if (launch.status !== 0) return { ok: false as const, reason: launch.stderr || "launch failed", retryable: true };
  const deadline = Date.now() + 150_000;
  while (!existsSync(resultPath) && Date.now() < deadline) await new Promise(r => setTimeout(r, 500));
  if (!existsSync(resultPath)) return { ok: false as const, reason: "worker result timeout", retryable: true };
  const result = JSON.parse(readFileSync(resultPath, "utf8"));
  attempts.push({ attempt, task, worker: result });
  if (!result.ok) return { ok: false as const, reason: result.reason || "worker failed", retryable: true };
  return { ok: true as const, outputRef: resultPath };
}

async function verify(_outputRef: string) {
  const actual = readFileSync(join(workspace, "value.txt"), "utf8");
  const ok = actual === "VALUE=2\n";
  verifierFailure = ok ? "" : `expected exact VALUE=2\\n; actual=${JSON.stringify(actual)}`;
  const attempt = attempts.at(-1)?.attempt ?? 0;
  writeFileSync(join(evidence, `attempt-${attempt}`, "verifier.json"), JSON.stringify({ ok, expected: "VALUE=2\\n", actual, failure_packet: verifierFailure }, null, 2));
  return ok;
}

let tick = 1_000;
const run = await runLoop("V2-002D", { maxAttempts: 5, baseDelayMs: 1, maxDelayMs: 1 }, {
  work, verify, now: () => tick++, iso: () => new Date(1787810000000 + tick++).toISOString(),
});
const finalValue = readFileSync(join(workspace, "value.txt"), "utf8");
const report = {
  mission_id: "V2-002D",
  state: run.state,
  replay_state: replay(run),
  attempts: run.attempts,
  final_value: finalValue,
  controlled_failure_injection: "attempt 1 requested VALUE=1 while verifier required VALUE=2",
  verifier_independent: true,
  attempt_evidence: attempts.map(a => ({ attempt: a.attempt, worker_ok: a.worker.ok, changed_files: a.worker.changed_files, out_of_scope_changes: a.worker.out_of_scope_changes, duration_sec: a.worker.duration_sec })),
  event_types: run.events.map(e => e.t),
};
writeFileSync(join(root, "qa/talos-local-repair-loop/V2-002D.report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (run.state !== "SUCCEEDED" || replay(run) !== "SUCCEEDED" || run.attempts < 2 || finalValue !== "VALUE=2\n") process.exit(2);
