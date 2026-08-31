import type { AtlasGraph } from "../domain/atlas-model.js";
export type DriftSeverity = "info" | "low" | "medium" | "high";
export interface DriftFinding {
    readonly code: string;
    readonly severity: DriftSeverity;
    readonly nodeId: string | null;
    readonly message: string;
    readonly remediation: string;
}
export interface DriftOptions {
    /** Optional: does a repo-relative path exist? Enables the source-validity check.
     *  When omitted, that check is skipped (never guessed). */
    readonly fileExists?: (repoRelativePath: string) => boolean;
}
export interface DriftReport {
    readonly findings: readonly DriftFinding[];
    readonly bySeverity: Readonly<Record<DriftSeverity, number>>;
    readonly checkedAt: string;
}
export declare function detectDrift(graph: AtlasGraph, now: string, opts?: DriftOptions): DriftReport;
/** Nodes present in code (packages) but absent from a provided inventory list —
 *  and inventory entries with no matching node. Pure; the caller supplies the
 *  inventory package names (from SYSTEM-INVENTORY) so nothing is inferred. */
export declare function inventoryDrift(graph: AtlasGraph, inventoryPackageNames: readonly string[]): DriftFinding[];
//# sourceMappingURL=drift.d.ts.map