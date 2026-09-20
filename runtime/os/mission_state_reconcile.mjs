import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch { return null; }
}

function resultCompletion(root, missionId) {
  const path = join(root, "missions", missionId + ".result.json");
  if (!existsSync(path)) return null;
  const value = readJson(path);
  if (!value || value.mission_id !== missionId) return null;
  const verdict = String(value.verdict ?? value.status ?? "");
  if (!/^(PASS|COMPLETE)/.test(verdict)) return null;
  return { source: path, kind: "MISSION_RESULT", verdict };
}

function legacyTrainingCompletion(root, missionId) {
  if (missionId !== "V2-011K") return null;
  const milestonePath = join(root, "docs", "training", "LEVEL_1_MILESTONE.json");
  const reportPath = join(root, "docs", "training", "LEVEL_1_REPORT.md");
  if (!existsSync(milestonePath) || !existsSync(reportPath)) return null;
  const milestone = readJson(milestonePath);
  const report = readFileSync(reportPath, "utf8");
  if (
    milestone?.mission !== missionId ||
    milestone?.status !== "COMPLETE" ||
    !report.includes("**Mission:** V2-011K") ||
    !report.includes("**Status:** COMPLETE")
  ) return null;
  return {
    source: [milestonePath, reportPath],
    kind: "LEGACY_TRAINING_CLOSEOUT",
    verdict: "COMPLETE",
  };
}

export function reconcileActiveMission(root, activeMission) {
  if (!activeMission || typeof activeMission !== "object") {
    return { activeMission: activeMission ?? null, reconciliation: null };
  }
  const missionId = String(activeMission.mission_id ?? "");
  const status = String(activeMission.status ?? "");
  if (!missionId || status === "COMPLETE") {
    return { activeMission, reconciliation: null };
  }

  const evidence = resultCompletion(root, missionId) ?? legacyTrainingCompletion(root, missionId);
  if (!evidence) return { activeMission, reconciliation: null };

  return {
    activeMission: Object.freeze({
      ...activeMission,
      status: "COMPLETE",
      sourceStatus: status,
      reconciledFromEvidence: true,
    }),
    reconciliation: Object.freeze({
      schema: "othrys.os.active-mission-reconciliation.v1",
      missionId,
      fromStatus: status,
      toStatus: "COMPLETE",
      evidenceKind: evidence.kind,
      evidence: evidence.source,
      verdict: evidence.verdict,
      authorityGranted: false,
      executionStarted: false,
    }),
  };
}
