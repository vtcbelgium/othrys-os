import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FACTORY_MATURITY_ALLOWED, type ExactBlockRef, type OrosBrief, type ResolvedFactoryBlock } from "./contracts.ts";

export class FactoryRejectedError extends Error {
  constructor(code: string) { super(code); this.code = code; this.name = "FactoryRejectedError"; }
}

const BRIEF_KEYS = Object.freeze(["orosId", "name", "productType", "objective", "exactBlocks"]);
const BLOCK_KEYS = Object.freeze(["blockId", "blockVersion", "admissionPath"]);
function strictKeys(value: object, allowed: readonly string[], code: string) {
  const keys = Object.keys(value);
  if (keys.some((k) => !allowed.includes(k))) throw new FactoryRejectedError(code);
}
function text(value: unknown, code: string): string {
  if (typeof value !== "string" || !value.trim()) throw new FactoryRejectedError(code);
  return value.trim();
}

export function parseOrosBrief(raw: unknown): Readonly<OrosBrief> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new FactoryRejectedError("INVALID_BRIEF");
  strictKeys(raw, BRIEF_KEYS, "EXTRA_BRIEF_FIELD");
  const v = raw as Record<string, unknown>;
  if (!Array.isArray(v.exactBlocks) || v.exactBlocks.length < 1) throw new FactoryRejectedError("EXACT_BLOCK_REQUIRED");
  const exactBlocks = v.exactBlocks.map((item): Readonly<ExactBlockRef> => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new FactoryRejectedError("INVALID_BLOCK_REF");
    strictKeys(item, BLOCK_KEYS, "EXTRA_BLOCK_REF_FIELD");
    const b = item as Record<string, unknown>;
    return Object.freeze({ blockId: text(b.blockId, "BLOCK_ID_REQUIRED"), blockVersion: text(b.blockVersion, "BLOCK_VERSION_REQUIRED"), admissionPath: text(b.admissionPath, "ADMISSION_PATH_REQUIRED") });
  });
  return Object.freeze({ orosId: text(v.orosId, "OROS_ID_REQUIRED"), name: text(v.name, "NAME_REQUIRED"), productType: text(v.productType, "PRODUCT_TYPE_REQUIRED"), objective: text(v.objective, "OBJECTIVE_REQUIRED"), exactBlocks: Object.freeze(exactBlocks) });
}

export function resolveExactBlocks(v2Root: string, brief: Readonly<OrosBrief>): readonly Readonly<ResolvedFactoryBlock>[] {
  return Object.freeze(brief.exactBlocks.map((ref) => {
    const admissionFile = resolve(v2Root, ref.admissionPath);
    if (!existsSync(admissionFile)) throw new FactoryRejectedError("ADMISSION_MISSING");
    const a = JSON.parse(readFileSync(admissionFile, "utf8"));
    if (a.admission_status !== "ACTIVE_ADMITTED") throw new FactoryRejectedError("ADMISSION_INACTIVE");
    if (a.block_id !== ref.blockId || a.block_version !== ref.blockVersion) throw new FactoryRejectedError("BLOCK_IDENTITY_MISMATCH");
    const maturity = String(a.maturity_at_admission || "");
    if (!FACTORY_MATURITY_ALLOWED.includes(maturity)) throw new FactoryRejectedError("BLOCK_MATURITY_INELIGIBLE");
    const ownershipFile = resolve(v2Root, "docs", "training", "LEVEL_2_5_BLOCK_OWNERSHIP.json");
    if (!existsSync(ownershipFile)) throw new FactoryRejectedError("BLOCK_OWNERSHIP_MISSING");
    const ownership = JSON.parse(readFileSync(ownershipFile, "utf8"));
    const owned = (ownership.blocks || []).find((b: any) => b.package === String(a.package || "") && b.version === ref.blockVersion);
    if (!owned || ownership.canonicalRepository !== "vtcbelgium/othrys-blocks") throw new FactoryRejectedError("BLOCK_OWNERSHIP_MISSING");
    const canonicalPath = String(owned.path || "");
    const canonicalRoot = resolve(v2Root, String(ownership.canonicalLocalSibling || "../othrys-blocks"));
    if (!canonicalPath || !existsSync(resolve(canonicalRoot, canonicalPath))) throw new FactoryRejectedError("BLOCK_SOURCE_MISSING");
    return Object.freeze({
      blockId: ref.blockId,
      blockVersion: ref.blockVersion,
      admissionPath: ref.admissionPath,
      canonicalPath,
      maturity,
      packageName: String(a.package || ""),
      digest: String(a.package_tree_digest?.value || a.reconstruction?.digest || ""),
    });
  }));
}

export function makeEngineeringCommand(brief: Readonly<OrosBrief>, blocks: readonly Readonly<ResolvedFactoryBlock>[], workspace: string, allowedPaths: readonly string[]) {
  const exact = blocks.map((b) => `${b.blockId}@${b.blockVersion} => ${b.canonicalPath}`).join("; ");
  return Object.freeze({
    missionId: `FACTORY-${brief.orosId}`,
    title: `Build ${brief.name}`,
    goal: `${brief.objective}\nUse only these exact admitted Blocks when capability code is needed: ${exact}.`,
    constraints: Object.freeze(["smallest useful product", "no copied Block source", "no network calls during build", "no release or publish", "operator acceptance remains required"]),
    workspace,
    allowedPaths: Object.freeze([...allowedPaths]),
    forbiddenPaths: Object.freeze([".git", "node_modules"]),
    acceptance: Object.freeze({ commands: Object.freeze(["independent product verifier must pass"]), criteria: Object.freeze(["product runs", "exact Block source is imported, not copied", "no out-of-scope mutation"]) }),
    maxAttempts: 3,
  });
}


