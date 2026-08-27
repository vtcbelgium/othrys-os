import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { appendDurable } from "./append-durable.ts";
import { ADMISSION_RECORD_VERSION, type AdmissionInput, type AdmissionRecord } from "./contracts.ts";
import { BoundaryValidationError, parseAdmissionRecord } from "./validation.ts";

export class LedgerCorruptionError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; this.name = "LedgerCorruptionError"; }
}

export class MissionConflictError extends Error {
  readonly missionId: string;
  constructor(missionId: string) { super("MISSION_ID_CONFLICT"); this.missionId = missionId; this.name = "MissionConflictError"; }
}

export interface AdmissionResult { readonly record: AdmissionRecord; readonly created: boolean; }
export interface AdmissionLedgerOptions { readonly path: string; readonly now?: () => string; }

function digestCommand(command: string): string {
  return createHash("sha256").update(command, "utf8").digest("hex");
}

export class AdmissionLedger {
  private readonly records = new Map<string, AdmissionRecord>();
  private readonly path: string;
  private readonly now: () => string;
  constructor(options: AdmissionLedgerOptions) {
    if (!options.path.trim()) throw new TypeError("LEDGER_PATH_REQUIRED");
    this.path = options.path;
    this.now = options.now ?? (() => new Date().toISOString());
    mkdirSync(dirname(this.path), { recursive: true });
    this.reconstruct();
  }

  admit(input: AdmissionInput): AdmissionResult {
    const promptDigest = digestCommand(input.command);
    const existing = this.records.get(input.missionId);
    if (existing) {
      if (existing.promptDigest !== promptDigest) throw new MissionConflictError(input.missionId);
      return Object.freeze({ record: existing, created: false });
    }
    const admittedAt = this.now();
    if (!Number.isFinite(Date.parse(admittedAt)) || new Date(admittedAt).toISOString() !== admittedAt) {
      throw new TypeError("CLOCK_INVALID");
    }
    const record: AdmissionRecord = Object.freeze({
      version: ADMISSION_RECORD_VERSION, missionId: input.missionId, correlationId: input.missionId,
      promptDigest, commandBytes: Buffer.byteLength(input.command, "utf8"),
      actor: Object.freeze({ ...input.actor }), admittedAt, state: "ADMITTED",
    });
    appendDurable(this.path, JSON.stringify(record));
    this.records.set(record.missionId, record);
    return Object.freeze({ record, created: true });
  }

  get(missionId: string): AdmissionRecord | undefined { return this.records.get(missionId); }
  private reconstruct(): void {
    if (!existsSync(this.path)) return;
    const content = readFileSync(this.path, "utf8");
    if (content.length === 0) return;
    if (!content.endsWith("\n")) throw new LedgerCorruptionError("LEDGER_TORN_TAIL");
    for (const line of content.slice(0, -1).split("\n")) {
      if (!line.trim()) throw new LedgerCorruptionError("LEDGER_EMPTY_RECORD");
      let parsed: unknown;
      try { parsed = JSON.parse(line); }
      catch { throw new LedgerCorruptionError("LEDGER_JSON_INVALID"); }
      let record: AdmissionRecord;
      try { record = parseAdmissionRecord(parsed); }
      catch (error) {
        if (error instanceof BoundaryValidationError) throw new LedgerCorruptionError(error.code);
        throw error;
      }
      if (this.records.has(record.missionId)) throw new LedgerCorruptionError("LEDGER_DUPLICATE_MISSION");
      this.records.set(record.missionId, record);
    }
  }
}


