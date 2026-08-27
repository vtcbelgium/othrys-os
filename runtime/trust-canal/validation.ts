import type { AdmissionActor, AdmissionInput, AdmissionRecord } from "./contracts.ts";
import { ADMISSION_RECORD_VERSION } from "./contracts.ts";

const TOP_KEYS = new Set(["missionId", "command", "actor", "context"]);
const ACTOR_KEYS = new Set(["role", "channel"]);
const RECORD_KEYS = new Set([
  "version", "missionId", "correlationId", "promptDigest", "commandBytes",
  "actor", "admittedAt", "state",
]);
const MISSION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ACTOR_VALUE = /^[a-z][a-z0-9._:-]{0,63}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const MAX_COMMAND_CHARS = 8_000;
const MAX_COMMAND_BYTES = 32_000;
const MAX_CONTEXT_CHARS = 32_000;

export class BoundaryValidationError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = "BoundaryValidationError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function assertExactKeys(value: Record<string, unknown>, expected: ReadonlySet<string>, code: string): void {
  const keys = Object.keys(value);
  if (keys.length !== expected.size || keys.some((key) => !expected.has(key))) {
    throw new BoundaryValidationError(code);
  }
}

function hasUnsafeUnicode(value: string): boolean {
  if (value.includes("\0")) return true;
  for (let i = 0; i < value.length; i += 1) {
    const unit = value.charCodeAt(i);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      i += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return true;
  }
  return false;
}

function parseMissionId(value: unknown): string {
  if (typeof value !== "string" || !MISSION_ID.test(value)) {
    throw new BoundaryValidationError("MISSION_ID_INVALID");
  }
  return value;
}
function parseActor(value: unknown): AdmissionActor {
  if (!isObject(value)) throw new BoundaryValidationError("ACTOR_INVALID");
  assertExactKeys(value, ACTOR_KEYS, "ACTOR_FIELDS_INVALID");
  if (typeof value.role !== "string" || !ACTOR_VALUE.test(value.role)) {
    throw new BoundaryValidationError("ACTOR_ROLE_INVALID");
  }
  if (typeof value.channel !== "string" || !ACTOR_VALUE.test(value.channel)) {
    throw new BoundaryValidationError("ACTOR_CHANNEL_INVALID");
  }
  return Object.freeze({ role: value.role, channel: value.channel });
}

export function parseAdmissionInput(value: unknown): AdmissionInput {
  if (!isObject(value)) throw new BoundaryValidationError("BODY_INVALID");
  assertExactKeys(value, TOP_KEYS, "BODY_FIELDS_INVALID");
  const missionId = parseMissionId(value.missionId);
  if (typeof value.command !== "string" || value.command.trim().length === 0 ||
      value.command.length > MAX_COMMAND_CHARS || Buffer.byteLength(value.command, "utf8") > MAX_COMMAND_BYTES ||
      hasUnsafeUnicode(value.command)) throw new BoundaryValidationError("COMMAND_INVALID");
  if (typeof value.context !== "string" || value.context.length > MAX_CONTEXT_CHARS || hasUnsafeUnicode(value.context)) {
    throw new BoundaryValidationError("CONTEXT_INVALID");
  }
  return Object.freeze({ missionId, command: value.command, actor: parseActor(value.actor), context: value.context });
}
function isIsoTimestamp(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

export function parseAdmissionRecord(value: unknown): AdmissionRecord {
  if (!isObject(value)) throw new BoundaryValidationError("LEDGER_RECORD_INVALID");
  assertExactKeys(value, RECORD_KEYS, "LEDGER_RECORD_FIELDS_INVALID");
  if (value.version !== ADMISSION_RECORD_VERSION) throw new BoundaryValidationError("LEDGER_VERSION_INVALID");
  const missionId = parseMissionId(value.missionId);
  if (value.correlationId !== missionId) throw new BoundaryValidationError("LEDGER_CORRELATION_INVALID");
  if (typeof value.promptDigest !== "string" || !SHA256.test(value.promptDigest)) {
    throw new BoundaryValidationError("LEDGER_DIGEST_INVALID");
  }
  if (typeof value.commandBytes !== "number" || !Number.isInteger(value.commandBytes) || value.commandBytes <= 0 || value.commandBytes > MAX_COMMAND_BYTES) {
    throw new BoundaryValidationError("LEDGER_COMMAND_BYTES_INVALID");
  }
  if (typeof value.admittedAt !== "string" || !isIsoTimestamp(value.admittedAt)) {
    throw new BoundaryValidationError("LEDGER_TIMESTAMP_INVALID");
  }
  if (value.state !== "ADMITTED") throw new BoundaryValidationError("LEDGER_STATE_INVALID");
  return Object.freeze({ version: ADMISSION_RECORD_VERSION, missionId, correlationId: missionId,
    promptDigest: value.promptDigest, commandBytes: value.commandBytes, actor: parseActor(value.actor),
    admittedAt: value.admittedAt, state: "ADMITTED" });
}


