import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { reconcileActiveMission } from "./mission_state_reconcile.mjs";

test("normal mission result reconciles stale RUNNING state", () => {
  const root = mkdtempSync(join(tmpdir(), "othrys-reconcile-"));
  try {
    mkdirSync(join(root, "missions"), { recursive: true });
    writeFileSync(join(root, "missions", "V2-123A.result.json"), JSON.stringify({
      mission_id: "V2-123A", verdict: "PASS"
    }));
    const out = reconcileActiveMission(root, { mission_id: "V2-123A", status: "RUNNING" });
    assert.equal(out.activeMission.status, "COMPLETE");
    assert.equal(out.reconciliation.evidenceKind, "MISSION_RESULT");
    assert.equal(out.reconciliation.authorityGranted, false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("legacy V2-011K requires both matching milestone and report", () => {
  const root = mkdtempSync(join(tmpdir(), "othrys-reconcile-training-"));
  try {
    mkdirSync(join(root, "docs", "training"), { recursive: true });
    writeFileSync(join(root, "docs", "training", "LEVEL_1_MILESTONE.json"), JSON.stringify({
      mission: "V2-011K", status: "COMPLETE"
    }));
    writeFileSync(join(root, "docs", "training", "LEVEL_1_REPORT.md"),
      "# report\n\n**Mission:** V2-011K\n**Status:** COMPLETE\n");
    const out = reconcileActiveMission(root, { mission_id: "V2-011K", status: "RUNNING" });
    assert.equal(out.activeMission.status, "COMPLETE");
    assert.equal(out.activeMission.sourceStatus, "RUNNING");
    assert.equal(out.reconciliation.evidenceKind, "LEGACY_TRAINING_CLOSEOUT");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("missing evidence never changes the active state", () => {
  const root = mkdtempSync(join(tmpdir(), "othrys-reconcile-none-"));
  try {
    const active = { mission_id: "V2-999A", status: "RUNNING" };
    const out = reconcileActiveMission(root, active);
    assert.deepEqual(out.activeMission, active);
    assert.equal(out.reconciliation, null);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
