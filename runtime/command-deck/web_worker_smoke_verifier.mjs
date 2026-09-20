import { existsSync, readFileSync, writeFileSync } from "node:fs";

export class WorkerVerificationError extends Error {
  constructor(code) { super(code); this.code = code; this.name = "WorkerVerificationError"; }
}

function load(path) {
  if (!existsSync(path)) throw new WorkerVerificationError("EVIDENCE_MISSING");
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch { throw new WorkerVerificationError("EVIDENCE_INVALID"); }
}

function onePath(diff) {
  const paths = [...String(diff).matchAll(/^\+\+\+ b\/(.+)$/gm)].map((m) => m[1]);
  return [...new Set(paths)];
}

export function verifyWebDocumentationSmoke(dispatchPath, workerResultPath, outPath) {
  const dispatch = load(dispatchPath);
  const worker = load(workerResultPath);

  const changed = Array.isArray(worker.changed_files) ? worker.changed_files : [];
  const allowed = Array.isArray(worker.allowed_paths) ? worker.allowed_paths : [];
  const outside = Array.isArray(worker.out_of_scope_changes) ? worker.out_of_scope_changes : [];
  const diff = String(worker.diff ?? "");

  const checks = Object.freeze({
    dispatchIdentity:
      dispatch.schema === "othrys.os.dispatch-ticket.v1" &&
      dispatch.status === "DISPATCH_AUTHORIZED" &&
      dispatch.missionId === worker.mission_id &&
      dispatch.jobId === worker.job_id &&
      dispatch.builderId === worker.builder_id,
    workerSucceeded: worker.schema_version === "othrys.worker-result.v0.1" && worker.ok === true,
    exactScope:
      JSON.stringify(allowed) === JSON.stringify(["docs/BUILDER-SMOKE-TEST.md"]) &&
      JSON.stringify(changed) === JSON.stringify(["docs/BUILDER-SMOKE-TEST.md"]) &&
      outside.length === 0 &&
      JSON.stringify(onePath(diff)) === JSON.stringify(["docs/BUILDER-SMOKE-TEST.md"]),
    title: diff.includes("# OTHRYS Builder Smoke Test"),
    purpose: diff.includes("## Purpose"),
    chatStateBoundary: /chat.+not.+canonical state/i.test(diff),
    verificationChecklist: diff.includes("## Verification Checklist"),
  });

  const pass = Object.values(checks).every((value) => value === true);
  const record = Object.freeze({
    schema: "othrys.os.independent-verification.v1",
    missionId: String(dispatch.missionId ?? ""),
    jobId: String(dispatch.jobId ?? ""),
    verifier: "T590",
    verdict: pass ? "PASS" : "FAIL",
    checks,
    evidence: Object.freeze({
      dispatchTicket: dispatchPath,
      workerResult: workerResultPath,
      changedFiles: changed,
    }),
    authorityGranted: false,
    executionStarted: false,
  });

  writeFileSync(outPath, JSON.stringify(record, null, 2) + "\n", "utf8");
  return record;
}
