import { createHash } from "node:crypto";
import type { AdmissionRecord } from "../trust-canal/contracts.ts";
import type { EngineeringCommand, FrozenEngineeringPlan } from "./contracts.ts";

const TOP_KEYS = new Set(["missionId", "title", "goal", "constraints", "workspace", "allowedPaths", "forbiddenPaths", "acceptance", "maxAttempts"]);
const ACCEPTANCE_KEYS = new Set(["commands", "criteria"]);
const PLATFORM_FORBIDDEN = [
  ".git", ".env", "secrets", "GPT_STATE.json", "GPT_LOG.jsonl",
  "runtime/talos-kernel", "runtime/trust-canal", "runtime/hephaestus",
] as const;

export class HephaestusRejectedError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; this.name = "HephaestusRejectedError"; }
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: ReadonlySet<string>, code: string): void {
  const actual = Object.keys(value);
  if (actual.length !== keys.size || actual.some((key) => !keys.has(key))) throw new HephaestusRejectedError(code);
}
function parseString(value: unknown, code: string): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new HephaestusRejectedError(code);
  return value;
}
function parseStrings(value: unknown, code: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new HephaestusRejectedError(code);
  }
  return Object.freeze([...value] as string[]);
}
function normalizePath(value: string): string {
  const normalized = value.replace(/\\/g, "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized) || normalized.split("/").includes("..")) {
    throw new HephaestusRejectedError("PATH_INVALID");
  }
  return normalized.replace(/\/$/, "");
}
function forbidden(path: string, missionForbidden: readonly string[]): boolean {
  const p = normalizePath(path);
  return [...PLATFORM_FORBIDDEN, ...missionForbidden.map(normalizePath)].some((f) => p === f || p.startsWith(`${f}/`));
}

export function parseEngineeringCommand(raw: string): EngineeringCommand {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new HephaestusRejectedError("COMMAND_JSON_INVALID"); }
  if (!isObject(value)) throw new HephaestusRejectedError("COMMAND_INVALID");
  exactKeys(value, TOP_KEYS, "COMMAND_FIELDS_INVALID");
  if (!isObject(value.acceptance)) throw new HephaestusRejectedError("ACCEPTANCE_INVALID");
  exactKeys(value.acceptance, ACCEPTANCE_KEYS, "ACCEPTANCE_FIELDS_INVALID");
  const missionId = parseString(value.missionId, "MISSION_ID_REQUIRED");
  const title = parseString(value.title, "TITLE_REQUIRED");
  const goal = parseString(value.goal, "GOAL_REQUIRED");
  const workspace = parseString(value.workspace, "WORKSPACE_REQUIRED");
  const constraints = parseStrings(value.constraints, "CONSTRAINTS_INVALID");
  const allowedPaths = parseStrings(value.allowedPaths, "ALLOWED_PATHS_INVALID").map(normalizePath);
  if (allowedPaths.length === 0) throw new HephaestusRejectedError("ALLOWED_PATHS_REQUIRED");
  const forbiddenPaths = parseStrings(value.forbiddenPaths, "FORBIDDEN_PATHS_INVALID").map(normalizePath);
  if (allowedPaths.some((path) => forbidden(path, forbiddenPaths))) throw new HephaestusRejectedError("FORBIDDEN_SCOPE");
  const commands = parseStrings(value.acceptance.commands, "ACCEPTANCE_COMMANDS_INVALID");
  if (commands.length === 0) throw new HephaestusRejectedError("ACCEPTANCE_COMMANDS_REQUIRED");
  const criteria = parseStrings(value.acceptance.criteria, "ACCEPTANCE_CRITERIA_INVALID");
  if (!Number.isInteger(value.maxAttempts) || (value.maxAttempts as number) < 1 || (value.maxAttempts as number) > 5) {
    throw new HephaestusRejectedError("MAX_ATTEMPTS_INVALID");
  }
  return Object.freeze({ missionId, title, goal, constraints, workspace,
    allowedPaths: Object.freeze([...allowedPaths]), forbiddenPaths: Object.freeze([...forbiddenPaths]),
    acceptance: Object.freeze({ commands, criteria }), maxAttempts: value.maxAttempts as number });
}

function acceptanceDigest(command: EngineeringCommand): string {
  return sha256(JSON.stringify({ allowedPaths: command.allowedPaths, forbiddenPaths: command.forbiddenPaths,
    commands: command.acceptance.commands, criteria: command.acceptance.criteria }));
}
function buildTask(command: EngineeringCommand): string {
  return [
    `Mission: ${command.title}`,
    `Objective: ${command.goal}`,
    command.constraints.length ? `Constraints:\n${command.constraints.map((c) => `- ${c}`).join("\n")}` : "",
    `Allowed paths:\n${command.allowedPaths.map((p) => `- ${p}`).join("\n")}`,
    `Acceptance:\n${command.acceptance.commands.map((c) => `- ${c}`).join("\n")}`,
    "Make the smallest change that satisfies the acceptance checks.",
    "Do not weaken, remove, or rewrite the acceptance checks.",
    "Modify only the allowed paths. Do not push, deploy, or access secrets.",
  ].filter(Boolean).join("\n\n");
}

export function prepareEngineering(admission: AdmissionRecord, rawCommand: string): FrozenEngineeringPlan {
  if (sha256(rawCommand) !== admission.promptDigest) throw new HephaestusRejectedError("COMMAND_DIGEST_MISMATCH");
  const command = parseEngineeringCommand(rawCommand);
  if (command.missionId !== admission.missionId || command.missionId !== admission.correlationId) {
    throw new HephaestusRejectedError("MISSION_BINDING_MISMATCH");
  }
  return Object.freeze({ ...command, commandDigest: admission.promptDigest,
    acceptanceDigest: acceptanceDigest(command), buildTask: buildTask(command) });
}

export function buildRepairTask(plan: FrozenEngineeringPlan, failurePacket: string): string {
  const failure = failurePacket.trim();
  if (!failure) throw new HephaestusRejectedError("FAILURE_PACKET_REQUIRED");
  return [plan.buildTask, "REPAIR MODE: a previous attempt failed independent verification.",
    "Make the smallest correction. Do not broaden scope or weaken acceptance.", `Verifier evidence:\n${failure.slice(0, 4000)}`].join("\n\n");
}

export function verifyMutationScope(plan: FrozenEngineeringPlan, changedPaths: readonly string[]): void {
  const allowed = new Set(plan.allowedPaths);
  for (const raw of changedPaths) {
    const path = normalizePath(raw);
    if (!allowed.has(path) || forbidden(path, plan.forbiddenPaths)) throw new HephaestusRejectedError("MUTATION_SCOPE_VIOLATION");
  }
}
