import { type AtlasGraph, type AtlasNode, type AtlasEdge, type AtlasHealth, type AtlasRisk, type AtlasStatus } from "../domain/atlas-model.js";
import type { DriftFinding, DriftSeverity } from "../drift/drift.js";
import { type ProofLedger } from "../proof/evidence.js";
/**
 * The envelope version. Bumped when the CONTRACT shape changes (not the graph).
 *
 * v2 (Mission 007) adds `proof`: the Proof Engine's summary of what has actually
 * been OBSERVED to run, as opposed to what the collector can infer from files.
 * The bump is the mechanism working as designed — a website built against v1
 * refuses a v2 contract outright rather than silently rendering a shape it does
 * not understand.
 */
export declare const ATLAS_CONTRACT_VERSION: 2;
/** The largest payload the seam will carry. A contract that outgrows this is a
 *  design signal (the website should page or summarise), not a reason to raise
 *  the cap silently. Enforced by the publisher, re-checked at the boundary. */
export declare const MAX_CONTRACT_BYTES: number;
/**
 * Which revision of othrys-core produced this contract. Every field may be
 * `"unknown"` — the generator never guesses a commit it cannot read.
 *
 * A git commit id is a 40-character mixed-case-hex string, which the shared
 * secret detector reads as a high-entropy token and rejects. That detector is
 * over-eager BY DESIGN and must not be weakened to let this through — so the
 * revision is proven by SHAPE instead (`assertRevisionSafe`), which is a stronger
 * guarantee than the entropy heuristic, not a hole in it: a value that is
 * certainly a git object id cannot also be a credential.
 */
export interface AtlasRevision {
    readonly repository: string;
    readonly commit: string;
    readonly shortCommit: string;
    readonly branch: string;
    /** `true`/`false` when git could be consulted; `"unknown"` when it could not. */
    readonly dirty: boolean | "unknown";
}
/** A top-level Atlas layer, summarised for the website's first view. Derived —
 *  the domain nodes themselves remain the truth in `nodes`. */
export interface AtlasDomainSummary {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly nodeCount: number;
    readonly status: AtlasStatus;
    readonly risk: AtlasRisk;
    /** The worst health among the domain's nodes, or `n/a` when none has health. */
    readonly health: AtlasHealth;
}
export interface AtlasHealthSummary {
    readonly byState: Readonly<Record<string, number>>;
    /** Nodes whose health warrants a human look. Derived from `HEALTH_ATTENTION`. */
    readonly attention: number;
    /** Nodes carrying a real runtime health (i.e. excluding `n/a`). */
    readonly withHealth: number;
    readonly unknown: number;
}
export interface AtlasRiskSummary {
    readonly byLevel: Readonly<Record<string, number>>;
    /** `high` + `critical`. The number the CEO is actually asking for. */
    readonly elevated: number;
}
export interface AtlasMaturitySummary {
    readonly byLevel: Readonly<Record<string, number>>;
    readonly unknown: number;
}
/** Readiness — the calibrated implementation ladder, counted. */
export interface AtlasReadinessSummary {
    readonly byStatus: Readonly<Record<string, number>>;
    /** Deliberately explicit: on this repo it is 0, and the website must say so. */
    readonly operational: number;
    readonly blocked: number;
    readonly unknown: number;
}
export interface AtlasDriftSummary {
    readonly findings: readonly DriftFinding[];
    readonly bySeverity: Readonly<Record<DriftSeverity, number>>;
    readonly checkedAt: string;
}
/** What the contract is made of — provenance in aggregate. The per-node
 *  `sources` remain on each node; this is the seam's own audit trail. */
export interface AtlasProvenanceSummary {
    readonly sourceKinds: Readonly<Record<string, number>>;
    readonly referenceCount: number;
    readonly evidenceNodes: number;
    readonly inferredNodes: number;
}
/** A fact the collector could NOT determine, carried across the seam intact. */
export interface AtlasKnownUnknown {
    readonly nodeId: string;
    readonly nodeName: string;
    readonly unknown: string;
}
/** Whether generation itself succeeded. A website showing a stale or failed
 *  snapshot must be able to SAY so (Phase 10) rather than render silence. */
export interface AtlasGenerationInfo {
    readonly ok: boolean;
    readonly notes: readonly string[];
}
/** The whole contract — versioned, browser-safe, deterministic. */
export interface AtlasContract {
    readonly contractVersion: number;
    readonly schemaVersion: number;
    readonly generatedAt: string;
    readonly revision: AtlasRevision;
    readonly nodes: readonly AtlasNode[];
    readonly edges: readonly AtlasEdge[];
    readonly domains: readonly AtlasDomainSummary[];
    readonly health: AtlasHealthSummary;
    readonly risk: AtlasRiskSummary;
    readonly maturity: AtlasMaturitySummary;
    readonly readiness: AtlasReadinessSummary;
    readonly drift: AtlasDriftSummary;
    readonly provenance: AtlasProvenanceSummary;
    readonly knownUnknowns: readonly AtlasKnownUnknown[];
    readonly generation: AtlasGenerationInfo;
    /**
     * What has actually been OBSERVED to run (Mission 007).
     *
     * Everything else in this contract is what the collector can infer from files
     * in a repository. This is the only field that reports an EXECUTION — and it
     * is `noProof()` (empty, zero) unless an observer really ran. It is never
     * derived from the graph, because the graph cannot know whether anything ran.
     *
     * It carries RECORDS, not verdicts. A consumer calls `summariseProof(
     * contract.proof.latest, now)` and gets an answer against its own clock — so a
     * snapshot that sat for a week reports `stale`, not the "verified" it was
     * assessed as at generate time.
     */
    readonly proof: ProofLedger;
}
/** Health states that mean "a human should look at this". Ordered worst-first;
 *  `worstHealth` uses this order, so the ordering is behaviour, not decoration. */
export declare const HEALTH_ATTENTION: readonly AtlasHealth[];
/** The worst health in a set, by `HEALTH_ORDER`. `n/a` when nothing has health. */
export declare function worstHealth(healths: readonly AtlasHealth[]): AtlasHealth;
/**
 * Prove the revision is a revision — not free text, and not a place a secret
 * could hide. Throws with the offending field named.
 *
 * This runs INSTEAD OF the entropy scan for these four fields, and it is the
 * stricter of the two: the detector asks "does this look random?", while this
 * asks "is this exactly a git object id / ref name?" — a question a credential
 * cannot pass by accident.
 */
export declare function assertRevisionSafe(revision: AtlasRevision): void;
/**
 * Locale-independent string order.
 *
 * NOT `localeCompare`: that consults ICU, so its result depends on the machine's
 * locale data. The contract must serialise to identical BYTES wherever it is
 * generated — a developer's laptop and CI must agree — so ordering here is by
 * code unit, which is fixed everywhere.
 */
export declare function compareStable(a: string, b: string): number;
/**
 * Derive the contract from an already-built graph. Pure and deterministic: the
 * same graph + drift + revision always serialise to identical bytes.
 *
 * Throws if the graph is secret-shaped or structurally invalid — a broken graph
 * must never reach the seam, let alone a browser.
 */
export declare function buildContract(input: {
    readonly graph: AtlasGraph;
    readonly drift: AtlasDriftSummary;
    readonly revision: AtlasRevision;
    readonly generation?: AtlasGenerationInfo;
    /** The Proof Engine's ledger. Omitted → `noProof()`: empty, and zero.
     *  There is deliberately no way to default this to anything reassuring. */
    readonly proof?: ProofLedger;
}): AtlasContract;
/** Serialise deterministically. Key order is the declaration order above, which
 *  is stable, so the published bytes only change when the truth changes. */
export declare function serialiseContract(contract: AtlasContract): string;
export interface ContractValidation {
    readonly ok: boolean;
    readonly issues: readonly string[];
    /** Present only when `ok`. */
    readonly contract?: AtlasContract;
}
/**
 * Validate an untrusted payload at the WEBSITE boundary.
 *
 * The website does not trust the producer's word: it re-checks the envelope
 * version, the graph schema, the shape, referential integrity, the payload size,
 * and secret-freedom. A contract that fails is REFUSED whole — the website
 * renders an explicit error state rather than a half-read Atlas, because a
 * partially-understood architecture map is worse than an honest blank.
 */
export declare function validateContract(value: unknown, opts?: {
    readonly maxBytes?: number;
}): ContractValidation;
export type FreshnessState = "fresh" | "aging" | "stale" | "unknown" | "generation-failed";
export interface Freshness {
    readonly state: FreshnessState;
    readonly ageMs: number | null;
    readonly label: string;
    readonly detail: string;
}
/** A snapshot older than this is `stale` — the website must say so out loud. */
export declare const STALE_AFTER_MS: number;
export declare const AGING_AFTER_MS: number;
/**
 * How current is this Atlas? Pure — the caller supplies `now`, so freshness is
 * testable and never depends on a hidden clock.
 *
 * An unparseable or future timestamp yields `unknown`, never a comfortable
 * default: a website that cannot tell how old its truth is must admit it.
 */
export declare function freshness(contract: Pick<AtlasContract, "generatedAt" | "generation">, now: number): Freshness;
export declare function describeAge(ms: number): string;
//# sourceMappingURL=atlas-contract.d.ts.map