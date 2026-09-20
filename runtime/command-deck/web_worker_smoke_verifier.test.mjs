import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyWebDocumentationSmoke } from "./web_worker_smoke_verifier.mjs";

test("T590 verifier passes only exact bounded documentation smoke evidence", () => {
  const d = mkdtempSync(join(tmpdir(), "web-smoke-verify-"));
  try {
    const dispatch = join(d, "dispatch.json");
    const worker = join(d, "worker.json");
    const out = join(d, "verify.json");
    writeFileSync(dispatch, JSON.stringify({
      schema:"othrys.os.dispatch-ticket.v1",status:"DISPATCH_AUTHORIZED",
      missionId:"V2-011O",jobId:"JOB-x",builderId:"qwen3-builder"
    }));
    writeFileSync(worker, JSON.stringify({
      schema_version:"othrys.worker-result.v0.1",mission_id:"V2-011O",job_id:"JOB-x",
      builder_id:"qwen3-builder",ok:true,
      allowed_paths:["docs/BUILDER-SMOKE-TEST.md"],
      changed_files:["docs/BUILDER-SMOKE-TEST.md"],out_of_scope_changes:[],
      diff:"+++ b/docs/BUILDER-SMOKE-TEST.md\n+# OTHRYS Builder Smoke Test\n+## Purpose\n+chat is not canonical state\n+## Verification Checklist\n"
    }));
    const result = verifyWebDocumentationSmoke(dispatch, worker, out);
    assert.equal(result.verdict, "PASS");
    assert.ok(Object.values(result.checks).every(Boolean));
    assert.equal(JSON.parse(readFileSync(out,"utf8")).verifier,"T590");
  } finally { rmSync(d,{recursive:true,force:true}); }
});

test("scope escape fails verification", () => {
  const d = mkdtempSync(join(tmpdir(), "web-smoke-verify-bad-"));
  try {
    const dispatch = join(d, "dispatch.json");
    const worker = join(d, "worker.json");
    const out = join(d, "verify.json");
    writeFileSync(dispatch, JSON.stringify({
      schema:"othrys.os.dispatch-ticket.v1",status:"DISPATCH_AUTHORIZED",
      missionId:"V2-011O",jobId:"JOB-x",builderId:"qwen3-builder"
    }));
    writeFileSync(worker, JSON.stringify({
      schema_version:"othrys.worker-result.v0.1",mission_id:"V2-011O",job_id:"JOB-x",
      builder_id:"qwen3-builder",ok:true,
      allowed_paths:["docs/BUILDER-SMOKE-TEST.md"],
      changed_files:["docs/BUILDER-SMOKE-TEST.md","oops.txt"],out_of_scope_changes:["oops.txt"],
      diff:"+++ b/docs/BUILDER-SMOKE-TEST.md\n+# OTHRYS Builder Smoke Test\n+## Purpose\n+chat is not canonical state\n+## Verification Checklist\n"
    }));
    const result = verifyWebDocumentationSmoke(dispatch, worker, out);
    assert.equal(result.verdict, "FAIL");
    assert.equal(result.checks.exactScope,false);
  } finally { rmSync(d,{recursive:true,force:true}); }
});
