export const FACTORY_MATURITY_ALLOWED = Object.freeze(["REUSABLE", "CERTIFIED", "GOLDEN"]);

export interface ExactBlockRef {
  readonly blockId: string;
  readonly blockVersion: string;
  readonly admissionPath: string;
}

export interface OrosBrief {
  readonly orosId: string;
  readonly name: string;
  readonly productType: string;
  readonly objective: string;
  readonly exactBlocks: readonly ExactBlockRef[];
}

export interface ResolvedFactoryBlock {
  readonly blockId: string;
  readonly blockVersion: string;
  readonly admissionPath: string;
  readonly canonicalPath: string;
  readonly maturity: string;
  readonly packageName: string;
  readonly digest: string;
}
