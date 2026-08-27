import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

export const FACTORY_RUN_SCHEMA = "othrys.v2.factory-run.v1";
export const FACTORY_RUN_STATUSES = Object.freeze(["PLANNED", "WAITING_OPERATOR_ACCEPTANCE", "ACCEPTED", "REJECTED", "RELEASED"]);
export class FactoryRunError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; this.name = "FactoryRunError"; }
}

export function newFactoryRun(input: { orosId: string; product: string; workspace: string; exactBlocks: unknown[] }) {
  return Object.freeze({ schema: FACTORY_RUN_SCHEMA, orosId: input.orosId, product: input.product, workspace: input.workspace, exactBlocks: Object.freeze([...input.exactBlocks]), status: "PLANNED", candidateCommit: null, artifactSha256: null, operatorDecision: null, released: false });
}

export function recordVerifiedCandidate(run: any, candidateCommit: string, artifactSha256: string) {
  if (run.status !== "PLANNED") throw new FactoryRunError("CANDIDATE_NOT_EXPECTED");
  if (!candidateCommit || !artifactSha256) throw new FactoryRunError("CANDIDATE_EVIDENCE_REQUIRED");
  return Object.freeze({ ...run, status: "WAITING_OPERATOR_ACCEPTANCE", candidateCommit, artifactSha256 });
}
export function resumeDecision(run: any): string {
  if (run.status === "WAITING_OPERATOR_ACCEPTANCE") return "WAIT_OPERATOR";
  if (run.status === "ACCEPTED") return "READY_RELEASE";
  if (run.status === "REJECTED") return "STOP_REJECTED";
  if (run.status === "RELEASED") return "DONE";
  if (run.status === "PLANNED") return "BUILD_REQUIRED";
  throw new FactoryRunError("INVALID_RUN_STATUS");
}

export function acceptCandidate(run: any, candidateCommit: string) {
  if (run.status !== "WAITING_OPERATOR_ACCEPTANCE") throw new FactoryRunError("NOT_WAITING_OPERATOR");
  if (candidateCommit !== run.candidateCommit) throw new FactoryRunError("CANDIDATE_COMMIT_MISMATCH");
  return Object.freeze({ ...run, status: "ACCEPTED", operatorDecision: "ACCEPT" });
}

export function canRelease(run: any, candidateCommit: string): boolean {
  return run.status === "ACCEPTED" && run.operatorDecision === "ACCEPT" && run.candidateCommit === candidateCommit && run.released === false;
}

export function saveFactoryRun(path: string, run: any) {
  const target = resolve(path); mkdirSync(dirname(target), { recursive: true });
  const tmp = `${target}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(run, null, 2) + "\n", { encoding: "utf8", flag: "wx" });
  renameSync(tmp, target);
  return target;
}

export function loadFactoryRun(path: string) {
  if (!existsSync(path)) throw new FactoryRunError("RUN_MISSING");
  let run: any;
  try { run = JSON.parse(readFileSync(path, "utf8")); } catch { throw new FactoryRunError("RUN_CORRUPT"); }
  if (!run || run.schema !== FACTORY_RUN_SCHEMA || !FACTORY_RUN_STATUSES.includes(run.status)) throw new FactoryRunError("RUN_INVALID");
  if (typeof run.orosId !== "string" || typeof run.workspace !== "string" || !Array.isArray(run.exactBlocks)) throw new FactoryRunError("RUN_INVALID");
  return Object.freeze(run);
}
