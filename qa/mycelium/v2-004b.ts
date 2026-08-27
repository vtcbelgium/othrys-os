import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { replay, runLoop } from "../../runtime/talos-kernel/loop.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const remoteUrl = process.env.OTHRYS_T590_URL;
if (!remoteUrl) throw new Error("OTHRYS_T590_URL required");
const capability = "verification.sha256@1";
const requestResources = { cpu_threads: 1, ram_mb: 64, gpu_count: 0, vram_mb: 0 };
const text = "OTHRYS-V2-004B-TALOS-CROSS-NODE";
function legionEnvelope() {
  const p = spawnSync("python", [join(root,"runtime/mycelium/census_cli.py"),
    "--node-id","legion","--root",root,
    "--worker",join(root,"runtime/workers/legion_qwen_worker_v01.py"),
    "--capability",capability,"--cpu-threads","1","--ram-mb","64"],
    {encoding:"utf8"});
  if (p.status !== 0) throw new Error(p.stderr || "legion census failed");
  return JSON.parse(p.stdout).envelope;
}

const healthStart = performance.now();
const health = await (await fetch(remoteUrl + "/health")).json();
const healthMs = performance.now() - healthStart;
if (!health.ok || health.node?.authorityGranted !== false) throw new Error("invalid T590 health envelope");
const envelopes = [legionEnvelope(), health.node];
const routed = spawnSync("python", [join(root,"runtime/mycelium/route_cli.py")],
  {input:JSON.stringify({envelopes,capability,request:requestResources}),encoding:"utf8"});
if (routed.status !== 0) throw new Error(routed.stdout || routed.stderr || "route failed");
const route = JSON.parse(routed.stdout);
if (route.node_id !== "t590") throw new Error(`expected t590, got ${route.node_id}`);
let remoteResult: any = null;
let workMs = 0;
const run = await runLoop("V2-004B-CROSS-NODE", {maxAttempts:3,baseDelayMs:5,maxDelayMs:25}, {
  work: async (attempt) => {
    const work = {schema:"othrys.mycelium.work.v0.1",work_id:`V2-004B-A${attempt}`,
      capability,payload:{text}};
    const started = performance.now();
    const response = await fetch(remoteUrl + "/work", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(work)});
    workMs = performance.now() - started;
    remoteResult = await response.json();
    if (!response.ok || !remoteResult.ok) return {ok:false as const,reason:remoteResult.error || `HTTP_${response.status}`,retryable:true};
    return {ok:true as const,outputRef:`t590:${remoteResult.work_id}`};
  },
  verify: async () => {
    const expected = createHash("sha256").update(text,"utf8").digest("hex");
    return remoteResult?.node_id === "t590" && remoteResult?.authorityGranted === false &&
      remoteResult?.artifact?.sha256 === expected && remoteResult?.artifact?.bytes === Buffer.byteLength(text);
  },
  now: (() => { let n=1000; return () => n++; })(),
  iso: () => "2026-08-27T15:30:00.000Z",
});
const report = {
  mission_id:"V2-004B", verdict:run.state === "SUCCEEDED" && replay(run) === "SUCCEEDED" ? "PASS" : "FAIL",
  selected_node:route.node_id, capability, request_resources:requestResources,
  legion:{advertised:envelopes[0].advertised,capabilities:envelopes[0].capabilities,gpu:envelopes[0].physical.gpu},
  t590:{hostname:health.node.physical.hostname,platform:health.node.physical.platform,
        advertised:health.node.advertised,capabilities:health.node.capabilities,
        runtimes:health.node.physical.runtimes,ollama_models:health.node.physical.ollama_models},
  transport:{kind:health.transport,health_ms:Number(healthMs.toFixed(2)),work_ms:Number(workMs.toFixed(2))},
  talos:{state:run.state,replay:replay(run),attempts:run.attempts},
  artifact:remoteResult?.artifact, authorityGranted:false,
  boundary:"CPU/hash proof only; no remote shell, no engineering.patch on T590, no distributed CAS."
};
mkdirSync(here,{recursive:true});
writeFileSync(join(here,"V2-004B.report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if (report.verdict !== "PASS") process.exit(2);
