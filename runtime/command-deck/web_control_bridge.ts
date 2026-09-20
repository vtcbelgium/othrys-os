import { timingSafeEqual } from 'node:crypto';
import {
  AdmissionLedger,
  MissionConflictError,
  type AdmissionResult,
} from '../trust-canal/ledger.ts';
import {
  AuthorityRejectedError,
  TrustCanalAdmission,
} from '../trust-canal/admission.ts';
import { BoundaryValidationError } from '../trust-canal/validation.ts';

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

export function bearerAuthorized(
  header: string | string[] | undefined,
  expectedToken: string,
): boolean {
  if (!expectedToken || typeof header !== 'string') return false;
  if (!header.startsWith('Bearer ')) return false;
  const supplied = header.slice(7);
  const a = Buffer.from(supplied, 'utf8');
  const b = Buffer.from(expectedToken, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
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

  constructor(ledgerPath: string) {
    if (!ledgerPath.trim()) {
      throw new WebControlBridgeError('ADMISSION_LEDGER_REQUIRED', 503);
    }
    this.ledger = new AdmissionLedger({ path: ledgerPath });
    this.canal = new TrustCanalAdmission(this.ledger, [
      { role: 'ceo', channel: 'othrys-web' },
    ]);
  }

  admit(raw: unknown): WebCommandReceipt {
    try {
      return receipt(this.canal.admit(raw));
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
