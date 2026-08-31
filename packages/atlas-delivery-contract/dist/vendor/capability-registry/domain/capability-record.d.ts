/** Record schema version. Bumped only on an additive, backward-compatible change
 *  so every existing record stays valid. Stamped into each record and into the
 *  dashboard projection so a consumer can pin to a shape. */
export declare const CAPABILITY_RECORD_SCHEMA_VERSION: 1;
/** The kinds of capability the registry catalogs. Provider-neutral, extensible —
 *  each names a SHAPE of external capability, never a vendor. */
export type CapabilityCategory = "ai-provider" | "llm" | "embedding" | "image-model" | "speech" | "ocr" | "translation" | "vision" | "search-provider" | "browser-automation" | "vector-database" | "mcp-server" | "api" | "infrastructure" | "authentication" | "monitoring" | "documentation" | "developer-tool" | "orchestration" | "evaluation" | "dataset" | "other";
export declare const CAPABILITY_CATEGORIES: readonly CapabilityCategory[];
/** How proven a capability is — an editorial/observed read, not a measurement. */
export type Maturity = "experimental" | "beta" | "stable" | "mature" | "unknown";
/**
 * Where a capability sits in the catalog's LIFECYCLE. This is the record's
 * existence status — distinct from `readiness` (can we operate it today?) and
 * `health` (is the provider up right now?). Prometheus proposes; the catalog
 * promotes to active; deprecation/supersession/retirement are append-only facts.
 */
export type LifecycleStatus = "proposed" | "active" | "deprecated" | "superseded" | "retired";
export declare const LIFECYCLE_STATUSES: readonly LifecycleStatus[];
/**
 * Keymaster's OPERATIONAL verdict — the certification the directive names:
 * "marks capabilities Ready / Limited / Disabled". `unverified` is the honest
 * default before the quartermaster has assessed it.
 */
export type Readiness = "ready" | "limited" | "disabled" | "unverified";
export declare const READINESS_STATES: readonly Readiness[];
/** The provider's CURRENT health — the last observed operational state. */
export type Health = "healthy" | "degraded" | "down" | "unknown";
export declare const HEALTH_STATES: readonly Health[];
/** Whether the capability can be reached at all, given accounts/credentials. */
export type Availability = "generally-available" | "credentials-required" | "waitlist" | "restricted" | "unavailable" | "unknown";
export declare const AVAILABILITY_STATES: readonly Availability[];
/** Whether, and how, the capability needs a credential. Mirrors the partnership
 *  vocabulary so a discovery maps straight through — kept local so the registry
 *  depends on no other workspace. NO field ever holds the credential VALUE. */
export type CredentialRequirement = "none" | "api-key" | "oauth" | "bearer" | "github-app" | "account-token" | "unknown";
export declare const CREDENTIAL_REQUIREMENTS: readonly CredentialRequirement[];
/** The pricing posture — a filterable fact, not a price. */
export type PricingModel = "free" | "open-source" | "freemium" | "free-tier" | "usage-based" | "subscription" | "paid" | "unknown";
export declare const PRICING_MODELS: readonly PricingModel[];
/** Licensing posture — drives adoption-friction reasoning, NOT the legal
 *  commercial-use question (`commercialUse`, an orthogonal axis). */
export type License = "mit" | "apache-2.0" | "bsd" | "mpl-2.0" | "gpl" | "agpl" | "open-weight" | "source-available" | "bsl" | "sspl" | "proprietary-free" | "proprietary" | "unknown";
export declare const LICENSES: readonly License[];
/** Legal commercial-use posture — orthogonal to `license` openness. */
export type CommercialUse = "unrestricted" | "restricted" | "prohibited" | "unknown";
/** Free-tier facts — turns "marketed as free" into a filterable truth. */
export interface FreeTier {
    readonly available: boolean;
    /** Human-readable, honest until harvested: e.g. "2000 queries/month". */
    readonly detail?: string;
    /** The card-on-file trap: "free" that still demands a payment method. */
    readonly requiresPaymentMethod?: boolean;
}
/** A rate limit, described in plain terms. No secret, no auth detail. */
export interface RateLimit {
    /** e.g. "requests/minute", "tokens/day". */
    readonly scope: string;
    /** e.g. "60", "1M". Human-readable. */
    readonly limit: string;
}
/** A usage quota, described in plain terms. */
export interface Quota {
    readonly scope: string;
    readonly limit: string;
}
/** A documentation link. Label + https URL. */
export interface DocLink {
    readonly label: string;
    readonly url: string;
}
/**
 * One capability the registry knows about — the canonical record. Immutable by
 * convention (the registry replaces, never mutates in place). Every field is
 * METADATA; there is deliberately no field for a credential value.
 */
export interface CapabilityRecord {
    /** Stable slug id (e.g. "acme-search", "local-ocr"). Derived from the service
     *  name so Prometheus's discovery and Keymaster's certification address the
     *  same record. Provider-neutral: it is data, not a hardcoded brand. */
    readonly id: string;
    readonly name: string;
    /** Who ships it (org/community). Data, never used to hardcode a brand in code. */
    readonly provider: string;
    readonly category: CapabilityCategory;
    readonly description: string;
    readonly maturity: Maturity;
    /** Supported features, in plain terms (matched by search). */
    readonly features: readonly string[];
    readonly freeTier: FreeTier;
    readonly pricing: PricingModel;
    readonly license: License;
    readonly commercialUse: CommercialUse;
    readonly credentialRequirement: CredentialRequirement;
    readonly availability: Availability;
    readonly rateLimits: readonly RateLimit[];
    readonly quotas: readonly Quota[];
    readonly homepageUrl: string | null;
    readonly documentation: readonly DocLink[];
    /** Plain onboarding steps — how a human wires it. Never contains a secret. */
    readonly onboarding: readonly string[];
    readonly readiness: Readiness;
    readonly health: Health;
    /** ISO of the last verification, or null if never verified. */
    readonly lastVerifiedAt: string | null;
    readonly lifecycle: LifecycleStatus;
    /** Id of the capability that supersedes this one, if any. */
    readonly supersededBy: string | null;
    /** The Titan accountable for this record (e.g. "prometheus", "keymaster"). */
    readonly ownerTitan: string;
    /** Ids of comparable alternatives (the "compare it" graph edges). */
    readonly alternatives: readonly string[];
    /** Evidence URLs backing this record. No claim without a checkable source. */
    readonly sources: readonly string[];
    /** Exact-match retrieval tags (controlled vocabulary augments prose search). */
    readonly tags: readonly string[];
    readonly discoveredAt: string;
    readonly updatedAt: string;
    readonly schemaVersion: number;
}
/** The mutable slice of a record a caller may propose or patch. Identity,
 *  provenance timestamps, lifecycle transitions, and the schema version are the
 *  registry's to set — not a patch's. */
export type CapabilityDraft = Omit<CapabilityRecord, "updatedAt" | "schemaVersion" | "readiness" | "health" | "lastVerifiedAt" | "supersededBy" | "lifecycle"> & Partial<Pick<CapabilityRecord, "readiness" | "health" | "lastVerifiedAt" | "supersededBy" | "lifecycle">>;
/**
 * Heuristic: does a string look like a secret? Over-eager by design — a record is
 * appended to a permanent encyclopedia, so a missed secret is forever. Detects
 * long high-entropy tokens, common key prefixes, bearer/authorization fragments,
 * and private-key headers. Provider-neutral: it matches SHAPES, not brands.
 */
export declare function looksLikeSecret(value: string): boolean;
export interface RecordIssue {
    readonly field: string;
    readonly message: string;
}
/**
 * Walk a value graph and throw if ANY string is secret-shaped. The registry runs
 * this before admitting or updating a record — the encyclopedia stores metadata,
 * never a value, and this is the mechanical guarantee of that rule.
 */
export declare function assertNoSecrets(value: unknown, path?: string): void;
/**
 * Validate a record's SHAPE. Empty issues = valid. Enforces required identity and
 * the controlled vocabularies; URL fields must be https or null; and no string may
 * be secret-shaped (a separate hard guard is `assertNoSecrets`, used at write time).
 */
export declare function validateRecord(raw: unknown): RecordIssue[];
//# sourceMappingURL=capability-record.d.ts.map