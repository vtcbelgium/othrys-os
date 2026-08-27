import type { AdmissionInput } from "./contracts.ts";
import { AdmissionLedger, type AdmissionResult } from "./ledger.ts";
import { parseAdmissionInput } from "./validation.ts";

export interface AuthorityRule {
  readonly role: string;
  readonly channel: string;
}

export class AuthorityRejectedError extends Error {
  constructor() { super("AUTHORITY_REJECTED"); this.name = "AuthorityRejectedError"; }
}

function authorityKey(rule: AuthorityRule): string { return `${rule.role}\0${rule.channel}`; }

export class TrustCanalAdmission {
  private readonly allowed: ReadonlySet<string>;
  private readonly ledger: AdmissionLedger;
  constructor(ledger: AdmissionLedger, rules: readonly AuthorityRule[]) {
    this.ledger = ledger;
    if (rules.length === 0) throw new TypeError("AUTHORITY_RULE_REQUIRED");
    this.allowed = new Set(rules.map(authorityKey));
  }

  admit(raw: unknown): AdmissionResult {
    const input: AdmissionInput = parseAdmissionInput(raw);
    if (!this.allowed.has(authorityKey(input.actor))) throw new AuthorityRejectedError();
    return this.ledger.admit(input);
  }
}


