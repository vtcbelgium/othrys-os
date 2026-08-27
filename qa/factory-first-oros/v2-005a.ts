import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { TrustCanalAdmission } from "../../runtime/trust-canal/admission.ts";
import { AdmissionLedger } from "../../runtime/trust-canal/ledger.ts";
import { buildRepairTask, prepareEngineering, verifyMutationScope } from "../../runtime/hephaestus/authority.ts";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";
import { makeEngineeringCommand, parseOrosBrief, resolveExactBlocks } from "../../runtime/factory/plan.ts";

const root = resolve(import.meta.dirname, "../..");
const workspace = "C:/Users/othry/Projects/oros/find-this-item-v2";
const evidence = join(process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".", "OTHRYS", "v2-005a-factory");
if (existsSync(workspace)) throw new Error(`workspace already exists: ${workspace}`);
rmSync(evidence, { recursive: true, force: true }); mkdirSync(evidence, { recursive: true }); mkdirSync(workspace, { recursive: true });
writeFileSync(join(workspace, "index.mjs"), "// Factory TODO\n", "utf8");
writeFileSync(join(workspace, "README.md"), "# Find This Item\n\nBuilt by OTHRYS V2 Factory proof.\n", "utf8");
function git(...args: string[]) { const r = spawnSync("git", ["-C", workspace, ...args], { encoding: "utf8" }); if (r.status !== 0) throw new Error(r.stderr); }
git("init"); git("config", "user.email", "othrys@local"); git("config", "user.name", "OTHRYS Factory"); git("add", "."); git("commit", "-m", "factory baseline");
const brief = parseOrosBrief({
  orosId: "oros-find-item-v2", name: "Find This Item", productType: "node-cli",
  objective: "Build index.mjs. Import { constructAffiliateOffer } from ../../othrys-v2/blocks/monetization/affiliate-offer/src/index.js. Read query from process.argv.slice(2).join(\" \").trim(); if empty print usage to stderr and exit 2. Call constructAffiliateOffer({query, providerId: \"ebay-epn\", placementId: \"find-this-item-v2\"}, {attribution:{campaignId: \"9990000001\"}}). Print JSON.stringify({query, href: offer.href, disclosureRequired: offer.disclosureRequired, relHints: offer.relHints}). Do not hardcode or reconstruct provider URL logic.",
  exactBlocks: [{ blockId: "block.monetization.affiliate-offer", blockVersion: "0.1.0", admissionPath: "admissions/block.monetization.affiliate-offer@0.1.0.json" }],
});
const resolvedBlocks = resolveExactBlocks(root, brief);
const command = makeEngineeringCommand(brief, resolvedBlocks, workspace, ["index.mjs"]);
const rawCommand = JSON.stringify(command);
const actor = { role: "gpt-control", channel: "v2" };
const ledger = new AdmissionLedger({ path: join(evidence, "admission.jsonl") });
const canal = new TrustCanalAdmission(ledger, [actor]);
const admitted = canal.admit({ missionId: command.missionId, command: rawCommand, actor, context: "V2-005A first Factory Oros" });
const plan = prepareEngineering(admitted.record, rawCommand);
let failurePacket = "";
const workerEvidence: any[] = [];
async function work(attempt: number) {
  const dir = join(evidence, `attempt-${attempt}`); mkdirSync(dir, { recursive: true });
  const requestPath = join(dir, "request.json"), resultPath = join(dir, "result.json"), logPath = join(dir, "worker.log"), pidPath = join(dir, "worker.pid");
  const task = attempt === 1 ? plan.buildTask : buildRepairTask(plan, failurePacket || "previous worker attempt did not produce a verified product");
  writeFileSync(requestPath, JSON.stringify({ schema_version: "othrys.worker-request.v0.1", job_id: `${command.missionId}-A${attempt}`, node_id: "legion", capability: "engineering.patch", workspace, task, allowed_paths: [...plan.allowedPaths], deny_paths: [...plan.forbiddenPaths], timeout_sec: 120 }, null, 2));
  const launch = spawnSync("python", [join(root, "runtime/workers/launch_worker.py"), "--request", requestPath, "--result", resultPath, "--log", logPath, "--pid-file", pidPath], { encoding: "utf8" });
  if (launch.status !== 0) return { ok: false as const, reason: launch.stderr || "launch failed", retryable: true };
  const deadline = Date.now() + 150_000;
  while (!existsSync(resultPath) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 500));
  if (!existsSync(resultPath)) return { ok: false as const, reason: "worker result timeout", retryable: true };
  const result = JSON.parse(readFileSync(resultPath, "utf8"));
  if (!result.ok) { failurePacket = String(result.reason || "worker failed"); return { ok: false as const, reason: failurePacket, retryable: true }; }
  verifyMutationScope(plan, result.changed_files ?? []);
  workerEvidence.push({ attempt, duration_sec: result.duration_sec, changed_files: result.changed_files, out_of_scope_changes: result.out_of_scope_changes, tool_trace: result.runtime_evidence?.tool_trace ?? [] });
  return { ok: true as const, outputRef: resultPath };
}

function runProduct(args: string[]) { return spawnSync("node", [join(workspace, "index.mjs"), ...args], { encoding: "utf8" }); }
async function verify() {
  const source = readFileSync(join(workspace, "index.mjs"), "utf8");
  if (!source.includes('../../othrys-v2/blocks/monetization/affiliate-offer/src/index.js')) { failurePacket = "must import exact canonical Block #2 source by relative path"; return false; }
  if (/mkevt|mkcid|campid|customid/i.test(source)) { failurePacket = "affiliate provider logic copied into Oros instead of using Block"; return false; }
  const okRun = runProduct(["Masters", "of", "the", "Universe"]);
  if (okRun.status !== 0) { failurePacket = `product exit ${okRun.status}: ${okRun.stderr}`; return false; }
  let payload: any;
  try { payload = JSON.parse(okRun.stdout.trim()); } catch { failurePacket = `stdout not JSON: ${okRun.stdout}`; return false; }
  const href = String(payload.href || "");
  if (payload.query !== "Masters of the Universe" || !href.startsWith("https://www.ebay.com/") || payload.disclosureRequired !== true || !Array.isArray(payload.relHints) || !payload.relHints.includes("sponsored")) { failurePacket = `product contract mismatch: ${JSON.stringify(payload)}`; return false; }
  const empty = runProduct([]);
  if (empty.status === 0) { failurePacket = "empty query must fail closed"; return false; }
  failurePacket = "";
  return true;
}

let tick = 5000;
const run = await runLoop(command.missionId, { maxAttempts: plan.maxAttempts, baseDelayMs: 1, maxDelayMs: 1 }, { work, verify, now: () => tick++, iso: () => new Date(1787845000000 + tick++).toISOString() });
let product: any = null;
if (run.state === "SUCCEEDED") { const finalRun = runProduct(["Masters", "of", "the", "Universe"]); if (finalRun.status === 0 && finalRun.stdout.trim()) product = JSON.parse(finalRun.stdout.trim()); }
const report = { mission_id: "V2-005A", oros_id: brief.orosId, product: brief.name, factory_status: run.state === "SUCCEEDED" ? "WAITING_OPERATOR_ACCEPTANCE" : run.state, released: false, exact_blocks: resolvedBlocks, trust_admitted: true, hephaestus_frozen: true, talos_state: run.state, replay_state: replay(run), attempts: run.attempts, worker_evidence: workerEvidence, product_output: product, workspace };
writeFileSync(join(root, "qa/factory-first-oros/V2-005A.report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (run.state !== "SUCCEEDED" || replay(run) !== "SUCCEEDED") process.exit(2);
