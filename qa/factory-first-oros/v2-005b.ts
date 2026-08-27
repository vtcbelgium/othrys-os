import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { newFactoryRun, recordVerifiedCandidate, resumeDecision, saveFactoryRun } from "../../runtime/factory/run.ts";

const root = resolve(import.meta.dirname, "../..");
const prior = JSON.parse(readFileSync(join(root, "missions/V2-005A.result.json"), "utf8"));
const workspace = prior.workspace;
const candidateCommit = prior.product_candidate_commit;
const indexPath = join(workspace, "index.mjs");
const sha = createHash("sha256").update(readFileSync(indexPath)).digest("hex");
if (sha !== prior.product_index_sha256) throw new Error("candidate artifact hash drifted");
function git(...args: string[]) { const r = spawnSync("git", ["-C", workspace, ...args], { encoding: "utf8" }); if (r.status !== 0) throw new Error(r.stderr); return r.stdout.trim(); }
if (git("rev-parse", "HEAD") !== candidateCommit) throw new Error("candidate commit drifted");
if (git("status", "--porcelain")) throw new Error("candidate workspace dirty before persistence proof");
const planned = newFactoryRun({ orosId: prior.oros_id, product: prior.product, workspace, exactBlocks: [prior.exact_block] });
const waiting = recordVerifiedCandidate(planned, candidateCommit, sha);
if (resumeDecision(waiting) !== "WAIT_OPERATOR") throw new Error("wrong in-memory resume decision");
const runPath = join(process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".", "OTHRYS", "v2-factory", "runs", `${prior.oros_id}.json`);
saveFactoryRun(runPath, waiting);
const child = spawnSync("node", ["--experimental-strip-types", join(root, "qa/factory-first-oros/resume-child-005b.ts"), runPath], { encoding: "utf8" });
if (child.status !== 0) throw new Error(child.stderr || "resume child failed");
const resumed = JSON.parse(child.stdout.trim());
if (resumed.decision !== "WAIT_OPERATOR" || resumed.status !== "WAITING_OPERATOR_ACCEPTANCE" || resumed.released !== false) throw new Error(`resume crossed boundary: ${child.stdout}`);
if (git("rev-parse", "HEAD") !== candidateCommit || git("status", "--porcelain")) throw new Error("resume mutated product workspace");
const report = {
  mission_id: "V2-005B",
  oros_id: prior.oros_id,
  durable_run: runPath,
  candidate_commit: candidateCommit,
  artifact_sha256: sha,
  separate_process_resume: true,
  resumed,
  rebuild_invoked: false,
  operator_accept_invoked: false,
  release_invoked: false,
  product_workspace_clean: true,
  verdict: "PASS",
};
writeFileSync(join(root, "qa/factory-first-oros/V2-005B.report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));

