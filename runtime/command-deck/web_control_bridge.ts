import { createHash, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AdmissionLedger,
  MissionConflictError,
  type AdmissionResult,
} from '../trust-canal/ledger.ts';
import {
  AuthorityRejectedError,
  TrustCanalAdmission,
} from '../trust-canal/admission.ts';
import { BoundaryValidationError, parseAdmissionInput } from '../trust-canal/validation.ts';

export type WebCommandReceipt = {
  readonly text: string;
  readonly status: 'accepted';
  readonly stage: 'Awaiting governed planning';
  readonly progress: 0;
  readonly correlationId: string;
  readonly canonical: true;
  readonly promptDigest: string;
  readonly commandBytes: number;
  readonly admittedAt: string;
  readonly state: 'ADMITTED';
  readonly evidence: readonly [{
    readonly seq: 1;
    readonly type: 'command.admitted';
    readonly at: string;
    readonly promptDigest: string;
  }];
};
export class WebControlBridgeError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
    this.name = 'WebControlBridgeError';
  }
}
export type WebCommandEnvelope = {
  readonly schema: 'othrys.os.web-command.v1';
  readonly missionId: string;
  readonly correlationId: string;
  readonly command: string;
  readonly context: string;
  readonly actor: { readonly role: string; readonly channel: string };
  readonly promptDigest: string;
  readonly admittedAt: string;
  readonly state: 'ADMITTED_AWAITING_PLANNING';
  readonly authorityGranted: false;
  readonly executionStarted: false;
};

function writeEnvelope(directory: string, raw: unknown, result: AdmissionResult): string | null {
  if (!directory.trim()) return null;
  const parsed = parseAdmissionInput(raw);
  const record = result.record;
  if (parsed.missionId !== record.missionId) throw new WebControlBridgeError('ENVELOPE_ID_MISMATCH', 500);
  const envelope: WebCommandEnvelope = Object.freeze({
    schema: 'othrys.os.web-command.v1',
    missionId: record.missionId,
    correlationId: record.correlationId,
    command: parsed.command,
    context: parsed.context,
    actor: parsed.actor,
    promptDigest: record.promptDigest,
    admittedAt: record.admittedAt,
    state: 'ADMITTED_AWAITING_PLANNING',
    authorityGranted: false,
    executionStarted: false,
  });
  mkdirSync(directory, { recursive: true });
  const target = join(directory, `${record.missionId}.json`);
  const text = JSON.stringify(envelope, null, 2) + '\n';
  if (existsSync(target)) {
    if (readFileSync(target, 'utf8') !== text) throw new WebControlBridgeError('ENVELOPE_CONFLICT', 409);
    return target;
  }
  const temp = target + '.tmp-' + process.pid;
  writeFileSync(temp, text, { encoding: 'utf8', mode: 0o600 });
  renameSync(temp, target);
  return target;
}


export function bearerAuthorized(
  header: string | string[] | undefined,
  expectedToken: string,
  expectedTokenSha256 = '',
): boolean {
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  const supplied = header.slice(7);

  if (expectedToken) {
    const a = Buffer.from(supplied, 'utf8');
    const b = Buffer.from(expectedToken, 'utf8');
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }

  if (/^[a-f0-9]{64}$/i.test(expectedTokenSha256)) {
    const suppliedDigest = createHash('sha256').update(supplied, 'utf8').digest();
    const expectedDigest = Buffer.from(expectedTokenSha256, 'hex');
    return suppliedDigest.length === expectedDigest.length
      && timingSafeEqual(suppliedDigest, expectedDigest);
  }

  return false;
}

function receipt(result: AdmissionResult): WebCommandReceipt {
  const record = result.record;
  return Object.freeze({
    text: result.created
      ? 'Command admitted to OTHRYS OS. Awaiting governed planning.'
      : 'Command already admitted to OTHRYS OS. Awaiting governed planning.',
    status: 'accepted',
    stage: 'Awaiting governed planning',
    progress: 0,
    correlationId: record.correlationId,
    canonical: true,
    promptDigest: record.promptDigest,
    commandBytes: record.commandBytes,
    admittedAt: record.admittedAt,
    state: 'ADMITTED',
    evidence: Object.freeze([Object.freeze({
      seq: 1 as const,
      type: 'command.admitted' as const,
      at: record.admittedAt,
      promptDigest: record.promptDigest,
    })]),
  });
}

export class WebControlBridge {
  private readonly ledger: AdmissionLedger;
  private readonly canal: TrustCanalAdmission;
  private readonly envelopeDir: string;

  constructor(ledgerPath: string, envelopeDir = '') {
    if (!ledgerPath.trim()) {
      throw new WebControlBridgeError('ADMISSION_LEDGER_REQUIRED', 503);
    }
    this.ledger = new AdmissionLedger({ path: ledgerPath });
    this.envelopeDir = envelopeDir;
    this.canal = new TrustCanalAdmission(this.ledger, [
      { role: 'ceo', channel: 'othrys-web' },
    ]);
  }

  admit(raw: unknown): WebCommandReceipt {
    try {
      const result = this.canal.admit(raw);
      writeEnvelope(this.envelopeDir, raw, result);
      return receipt(result);
    } catch (error) {
      if (error instanceof BoundaryValidationError) {
        throw new WebControlBridgeError(error.code, 400);
      }
      if (error instanceof AuthorityRejectedError) {
        throw new WebControlBridgeError('AUTHENTICATION_REFUSED', 403);
      }
      if (error instanceof MissionConflictError) {
        throw new WebControlBridgeError('MISSION_ID_CONFLICT', 409);
      }
      throw error;
    }
  }

  status(missionId: string): WebCommandReceipt {
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(missionId)) {
      throw new WebControlBridgeError('MISSION_ID_INVALID', 400);
    }
    const record = this.ledger.get(missionId);
    if (!record) {
      throw new WebControlBridgeError('MISSION_NOT_FOUND', 404);
    }
    return receipt({ record, created: false });
  }
}
