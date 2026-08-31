import type { OperationalState } from "../vendor/capability-registry/health/health-vocabulary.js";
/** The kinds of thing the Atlas maps. Each is a SHAPE in the architecture, never
 *  a vendor (Article 8) — a provider's identity is data on a `provider` node. */
export type AtlasNodeType = "othrys" | "constitution" | "titan" | "oros" | "constellation" | "star" | "bridge" | "event-fabric" | "capability" | "event" | "provider" | "credential-reference" | "knowledge-source" | "library-wing" | "vault" | "store" | "interface" | "service" | "application" | "repository" | "adr" | "mission" | "risk" | "incident" | "roadmap-item" | "domain";
export declare const ATLAS_NODE_TYPES: readonly AtlasNodeType[];
/** The relationships between nodes. Directed; `from` → `to`. */
export type AtlasEdgeType = "contains" | "owns" | "powers" | "consumes" | "provides" | "depends-on" | "publishes" | "subscribes" | "routes-through" | "stores-in" | "governed-by" | "authenticated-by" | "grants" | "monitors" | "preserves" | "promotes-to" | "implements" | "documented-by" | "blocked-by" | "replaces" | "supersedes" | "connected-to";
export declare const ATLAS_EDGE_TYPES: readonly AtlasEdgeType[];
/**
 * Implementation status — calibrated, and NEVER inferred from documentation. The
 * collector assigns these from real evidence: a test file present → `tested`; a
 * workspace that typechecks → `scaffolded`+; a Proposed ADR → `designed`; a
 * roadmap entry with no code → `planned`; a `blocked-by` edge → `blocked`.
 *
 * A CALIBRATION THIS LADDER CANNOT MAKE (Mission 007). `tested` means a test file
 * EXISTS. The collector reads the filesystem; it never runs anything, so it cannot
 * know whether that test passes, is skipped, or has ever executed. This comment
 * used to say "passing tests → tested", and the website faithfully reported "53
 * systems proven by executable tests" — a file-existence check rendered as an
 * execution. The ladder is not wrong; its description was. Whether something RAN
 * is the Proof Engine's question (`src/proof/evidence.ts`, ADR-0047), and it is
 * deliberately a separate axis rather than a new rung here.
 */
export type AtlasStatus = "operational" | "tested" | "scaffolded" | "designed" | "planned" | "blocked" | "deprecated" | "unknown";
export declare const ATLAS_STATUSES: readonly AtlasStatus[];
export type AtlasMaturity = "experimental" | "beta" | "stable" | "mature" | "frozen" | "unknown";
export type AtlasRisk = "informational" | "low" | "medium" | "high" | "critical";
export declare const ATLAS_RISKS: readonly AtlasRisk[];
/** Health uses the canonical Mission-004 vocabulary; `n/a` for things without a
 *  runtime health (a document, a risk). */
export type AtlasHealth = OperationalState | "n/a";
/** Whether a fact is grounded in checkable evidence or is an editorial inference. */
export type EvidenceBasis = "evidence" | "inferred";
/** One provenance reference — where a node/edge came from. Never a secret. */
export interface AtlasProvenance {
    /** The kind of source, e.g. "package.json", "titan.json", "adr", "capability-seed",
     *  "credential-manifest", "event-definition", "health-vocabulary", "inventory". */
    readonly kind: string;
    /** A repo-relative locator (path, or path#symbol). Never an absolute sensitive path. */
    readonly ref: string;
    /** Optional short, sanitized detail. */
    readonly detail?: string;
}
/** A node in the Atlas graph. Every field is metadata; there is no secret field. */
export interface AtlasNode {
    readonly id: string;
    readonly type: AtlasNodeType;
    readonly name: string;
    readonly status: AtlasStatus;
    readonly maturity: AtlasMaturity;
    readonly health: AtlasHealth;
    readonly risk: AtlasRisk;
    readonly owner: string | null;
    readonly description: string;
    readonly tags: readonly string[];
    /** The Atlas layer this node belongs to (for progressive disclosure). */
    readonly domain: string;
    /** Repo-relative implementation location, or null if not implemented. */
    readonly implementationLocation: string | null;
    /** Documentation references (repo-relative). */
    readonly docRefs: readonly string[];
    /** Evidence backing this node — at least one for a non-inferred node. */
    readonly sources: readonly AtlasProvenance[];
    /** Facts the collector could NOT determine — preserved, never invented. */
    readonly unknowns: readonly string[];
    /** ISO of last verification, or null. */
    readonly lastVerified: string | null;
    /** Evidence vs inference — the honesty flag. */
    readonly basis: EvidenceBasis;
}
/** A directed edge in the Atlas graph. */
export interface AtlasEdge {
    readonly id: string;
    readonly type: AtlasEdgeType;
    readonly from: string;
    readonly to: string;
    readonly sources: readonly AtlasProvenance[];
    readonly basis: EvidenceBasis;
    readonly note?: string;
}
/** The whole Atlas graph — the generated, secret-free read model. */
export interface AtlasGraph {
    readonly generatedAt: string;
    readonly nodes: readonly AtlasNode[];
    readonly edges: readonly AtlasEdge[];
    /** Counts by node type / status / basis — for the collector's own audit. */
    readonly summary: AtlasSummary;
    readonly schemaVersion: number;
}
export interface AtlasSummary {
    readonly nodeCount: number;
    readonly edgeCount: number;
    readonly byType: Readonly<Record<string, number>>;
    readonly byStatus: Readonly<Record<string, number>>;
    readonly byBasis: Readonly<Record<string, number>>;
    readonly evidenceNodes: number;
    readonly inferredNodes: number;
}
export declare const ATLAS_SCHEMA_VERSION: 1;
/** Build a stable, collision-resistant node id: `<type>:<slug>`. */
export declare function nodeId(type: AtlasNodeType, key: string): string;
/** Build a stable edge id from its endpoints and type. Deterministic. */
export declare function edgeId(type: AtlasEdgeType, from: string, to: string): string;
export declare function slug(s: string): string;
/** Throw if ANY string in the value graph is secret-shaped. Uses the same hardened
 *  detector the rest of Othrys uses (JWT/PEM/AWS/token/bearer/high-entropy). */
export declare function assertNoSecrets(value: unknown, path?: string): void;
/** Prove a whole graph is browser-safe. Called before a snapshot is emitted. */
export declare function assertGraphClean(graph: AtlasGraph): void;
export interface AtlasIssue {
    readonly path: string;
    readonly message: string;
}
/** Validate a graph's SHAPE and REFERENTIAL INTEGRITY. Empty issues = valid.
 *  Enforces: unique node ids; every edge endpoint resolves to a node; controlled
 *  vocabularies; a non-inferred node has at least one source; `operational`/`tested`
 *  requires evidence basis (docs alone can never make something operational). */
export declare function validateGraph(graph: AtlasGraph): AtlasIssue[];
//# sourceMappingURL=atlas-model.d.ts.map