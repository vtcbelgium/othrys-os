/** The evidence schema. Bumped when THIS record's shape changes. */
export declare const EVIDENCE_SCHEMA_VERSION: 1;
/**
 * What an observation can conclude. Deliberately small and hard to misuse.
 *
 * There is no "healthy", no "ok", no "green" — those are moods. Each of these
 * names a distinct epistemic state, and the difference between the last four is
 * the whole point of this mission:
 */
export type ProofStatus = "verified" | "failed" | "stale" | "unknown" | "unavailable" | "simulated";
export declare const PROOF_STATUSES: readonly ProofStatus[];
/** Only these may be counted toward any claim about reality. */
export declare function countsAsProof(status: ProofStatus): boolean;
/** What was observed. `repository` is all this slice can honestly address:
 *  Othrys runs no service, so there is no process to reach. */
export interface ProofSubject {
    readonly kind: "repository";
    /** e.g. "othrys-core". Never a filesystem path. */
    readonly id: string;
}
/**
 * The assertion under test. One claim in this slice, on purpose.
 *
 * `verification-suite-passes` is a claim about a COMMAND at a COMMIT. It is not
 * a claim that the software works, that it is deployed, or that anyone uses it.
 * Naming it narrowly is what stops it being read as more than it is.
 */
export type ProofClaimKind = "verification-suite-passes";
export interface ProofClaim {
    readonly kind: ProofClaimKind;
    /** Human-readable, and deliberately modest. */
    readonly statement: string;
}
/** What actually happened when the observer ran. */
export interface ProofObservation {
    /** The command, as run. Sanitized: no paths, no env, no arguments carrying values. */
    readonly command: string;
    /** null when the command could not be started at all. */
    readonly exitCode: number | null;
    readonly durationMs: number | null;
    /** True only for exitCode === 0. Stored separately so a reader never has to
     *  remember that 0 means success. */
    readonly passed: boolean;
    /** Sanitized, bounded summary. NEVER raw stdout/stderr — that carries absolute
     *  paths, environment detail, and whatever a failing test decided to print. */
    readonly summary: string;
}
/** Who observed it, against what, and in what state. Enough to reproduce it. */
export interface ProofProvenance {
    /** The observer's identity and version — an observation is attributable. */
    readonly observer: string;
    readonly observerVersion: string;
    /** The commit observed. A git object id or "unknown" — never free text. */
    readonly commit: string;
    readonly shortCommit: string;
    /** Was the tree clean? A dirty tree means the commit does NOT describe what
     *  ran, which is the difference between reproducible and anecdotal. */
    readonly treeClean: boolean | "unknown";
    /** How the observation was obtained. `live` = the observer ran it just now. */
    readonly mode: "live" | "persisted" | "simulated" | "unavailable";
}
/** One canonical evidence record. Append-only; never edited. */
export interface EvidenceRecord {
    readonly schemaVersion: number;
    readonly subject: ProofSubject;
    readonly claim: ProofClaim;
    readonly observation: ProofObservation;
    readonly provenance: ProofProvenance;
    /** When the observation was made. */
    readonly observedAt: string;
    /**
     * The status AS RECORDED — never `stale`, because staleness is a function of
     * the reader's clock, not of the record. `assess()` applies freshness.
     */
    readonly status: Exclude<ProofStatus, "stale">;
}
/**
 * How long a passing verification speaks for the present.
 *
 * 24 hours, and the number is arguable — but its EXISTENCE is not. Without a
 * freshness policy, one green run in July would still be claiming health in
 * December, which is precisely how "tested" came to mean "a file exists".
 */
export declare const PROOF_FRESH_MS: number;
export interface ProofAssessment {
    readonly status: ProofStatus;
    readonly ageMs: number | null;
    /** Why this status, in words a human can check against the record. */
    readonly reason: string;
    /** May this be counted toward a claim about reality? */
    readonly countsAsProof: boolean;
}
/**
 * Apply the freshness policy to a record. THE ONLY WAY to a `verified` status.
 *
 * `now` is injected: freshness must be testable, and a hidden clock is how a
 * guard quietly stops guarding.
 *
 * Note the shape of this function — every branch that is not a live, passing,
 * attributable, current observation returns something that `countsAsProof`
 * rejects. There is no default case that falls through to good news.
 */
export declare function assess(record: EvidenceRecord | null | undefined, now: number): ProofAssessment;
/**
 * Is there enough provenance to reproduce or inspect the observation?
 *
 * A pass with no commit is not evidence — you cannot go and check it. A pass
 * from a DIRTY tree is not evidence either, and this is the subtle one: the
 * commit does not describe what actually ran, so the result is unreproducible.
 * It is an anecdote about a working directory that no longer exists.
 */
export declare function hasUsableProvenance(record: EvidenceRecord): boolean;
export declare function describeAge(ms: number): string;
export interface EvidenceIssue {
    readonly path: string;
    readonly message: string;
}
/**
 * Validate a record's SHAPE before it is trusted or published.
 *
 * The command pattern is deliberately tight. A command is the one field an
 * observer composes from its own environment, so it is the one most likely to
 * carry an absolute path — and this record is published to a browser.
 */
export declare function validateEvidence(value: unknown): EvidenceIssue[];
/**
 * The evidence that travels to a consumer. RECORDS, not conclusions.
 *
 * This distinction is the whole of rule 2, and it is easy to get wrong — the
 * first version of the Atlas contract embedded a computed `ProofSummary`,
 * assessments and `ageMs` included. That snapshot is taken at GENERATE time, so
 * a website rendering it would have shown "verified — 1 minute ago" for as long
 * as the contract sat there. A record that carries its own verdict cannot go
 * stale; it can only lie later.
 *
 * So the ledger carries evidence and a timestamp. The READER calls
 * `summariseProof(ledger.latest, now)` against its OWN clock and gets its own
 * answer. Freshness belongs to whoever is asking, not to whoever recorded.
 */
export interface ProofLedger {
    readonly schemaVersion: number;
    /** The latest record per subject — the only ones that can speak for the present. */
    readonly latest: readonly EvidenceRecord[];
    /** How many observations exist in total. 0 means the engine has never run. */
    readonly observationCount: number;
}
/** The empty ledger — what a consumer gets before anything was ever observed. */
export declare function noProof(): ProofLedger;
/** Reduce a history to the latest record per subject, for the seam. */
export declare function toLedger(records: readonly EvidenceRecord[]): ProofLedger;
/** The Proof Engine's answer, per subject, for a reader at a point in time. */
export interface ProofSummary {
    readonly schemaVersion: number;
    /** The latest record per subject, already assessed. */
    readonly subjects: readonly ProofSubjectSummary[];
    /** Subjects whose evidence currently counts. Never inferred from anything else. */
    readonly verifiedCount: number;
    readonly totalSubjects: number;
    /** How many observations exist at all. 0 means the engine has never run. */
    readonly observationCount: number;
}
export interface ProofSubjectSummary {
    readonly subject: ProofSubject;
    readonly claim: ProofClaim;
    readonly assessment: ProofAssessment;
    readonly observedAt: string | null;
    readonly shortCommit: string | null;
    readonly command: string | null;
    readonly mode: ProofProvenance["mode"] | null;
}
/**
 * Summarise the latest record per subject.
 *
 * `records` is the whole append-only history; only the newest per subject can
 * speak for the present, and the rest are history — which is a different thing
 * and must never be mixed in.
 */
export declare function summariseProof(records: readonly EvidenceRecord[], now: number): ProofSummary;
/** The empty summary — what a reader derives before the engine has ever run.
 *  It says nothing is verified, and it is 0. It does not say "healthy". */
export declare function noProofSummary(): ProofSummary;
//# sourceMappingURL=evidence.d.ts.map