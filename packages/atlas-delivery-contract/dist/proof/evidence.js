// @othrys-core/atlas-delivery-contract — synced from titan/atlas/dist-contract.
// Do not edit here. Change titan/atlas/src, run `npm run atlas:publish` in othrys-core,
// then `npm run sync` in this package.
// ---------------------------------------------------------------------------
// The Proof Engine — the canonical evidence contract (Mission 007).
//
// THE GAP THIS EXISTS TO CLOSE
//
// The Genesis audit found that Othrys detects architectural state but does not
// measure operational reality. Mission 007's investigation found the sharpest
// instance of that, in this very package:
//
//   `AtlasStatus.tested` is documented as "implemented with passing executable
//   tests". The collector assigns it from `hasTestFile(srcDir)` — a FILE
//   EXISTING (collector/build.ts:119). A package whose every test is skipped, or
//   failing, or has never once been run, reads `tested`.
//
// So "53 systems proven by executable tests" — which othrys.be says on four
// surfaces — actually means "53 packages contain a file matching *.test.ts".
// The word "executable" was doing work the code did not do.
//
// This module is the smallest honest fix: a record of something that ACTUALLY
// RAN. Not a telemetry stack. One narrow seam that can distinguish a file from
// an execution.
//
// WHAT IT DELIBERATELY DOES NOT DO
//
// It does not redefine `AtlasStatus`. The ladder is Mission 005's, it is sound,
// and a mission that quietly redefines "operational" to make a number look
// better is the exact failure this whole system is built to prevent. Evidence
// COMPLEMENTS the ladder; it does not replace it. See ADR-0047.
//
// THREE RULES MADE MECHANICAL
//   1. ABSENCE IS NEVER HEALTH. There is no code path from "no evidence" to
//      `verified`. `unknown` and `unavailable` are values, and they are the
//      DEFAULT — you must present a passing observation with provenance to get
//      anything better.
//   2. STALE IS NOT CURRENT. Freshness is applied by `assess()`, not stored. An
//      observation cannot age into permanence: the record says when it was
//      taken, and the reader is told how old that is, every time.
//   3. SIMULATED NEVER COUNTS. A simulated record is structurally excluded from
//      every operational aggregate (`countsAsProof` is false for it), so it
//      cannot be summed into a number that implies reality.
//
// BROWSER-SAFE. No `node:*`, no fs, no exec. The OBSERVER (scripts/observe.mjs)
// does the running; this module only describes the result. That split is what
// lets the contract publisher carry this to the website while the observer stays
// in othrys-core — proven by the same import-closure walk as the read model.
// ---------------------------------------------------------------------------
import { assertNoSecrets } from "../domain/atlas-model.js";
/** The evidence schema. Bumped when THIS record's shape changes. */
export const EVIDENCE_SCHEMA_VERSION = 1;
export const PROOF_STATUSES = [
    "verified", "failed", "stale", "unknown", "unavailable", "simulated",
];
/** Only these may be counted toward any claim about reality. */
export function countsAsProof(status) {
    return status === "verified";
}
// --- freshness --------------------------------------------------------------
/**
 * How long a passing verification speaks for the present.
 *
 * 24 hours, and the number is arguable — but its EXISTENCE is not. Without a
 * freshness policy, one green run in July would still be claiming health in
 * December, which is precisely how "tested" came to mean "a file exists".
 */
export const PROOF_FRESH_MS = 24 * 60 * 60 * 1000;
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
export function assess(record, now) {
    if (!record) {
        return { status: "unknown", ageMs: null, reason: "No observation has been recorded.", countsAsProof: false };
    }
    if (record.provenance.mode === "simulated" || record.status === "simulated") {
        return {
            status: "simulated",
            ageMs: null,
            reason: "This record is simulated. It is not an observation of anything and is never counted.",
            countsAsProof: false,
        };
    }
    if (record.status === "unavailable" || record.provenance.mode === "unavailable") {
        return { status: "unavailable", ageMs: null, reason: record.observation.summary, countsAsProof: false };
    }
    if (record.status === "failed" || !record.observation.passed) {
        return {
            status: "failed",
            ageMs: null,
            reason: `The verification ran and did not pass (exit ${record.observation.exitCode ?? "none"}).`,
            countsAsProof: false,
        };
    }
    // It passed. It still has to be attributable and current.
    if (!hasUsableProvenance(record)) {
        return {
            status: "unknown",
            ageMs: null,
            reason: "The observation passed but carries no usable provenance, so nothing can be reproduced from it. An unattributable pass is not evidence.",
            countsAsProof: false,
        };
    }
    const at = Date.parse(record.observedAt);
    if (Number.isNaN(at)) {
        return { status: "unknown", ageMs: null, reason: "The record carries no readable observation time.", countsAsProof: false };
    }
    const ageMs = now - at;
    if (ageMs < 0) {
        return {
            status: "unknown",
            ageMs,
            reason: "The observation is stamped in the future; a clock disagrees, so its age cannot be trusted.",
            countsAsProof: false,
        };
    }
    if (ageMs > PROOF_FRESH_MS) {
        return {
            status: "stale",
            ageMs,
            reason: `The verification passed, but ${describeAge(ageMs)} ago. It describes that moment, not this one.`,
            countsAsProof: false,
        };
    }
    return {
        status: "verified",
        ageMs,
        reason: `The verification ran ${describeAge(ageMs)} ago at ${record.provenance.shortCommit} and passed.`,
        countsAsProof: true,
    };
}
/**
 * Is there enough provenance to reproduce or inspect the observation?
 *
 * A pass with no commit is not evidence — you cannot go and check it. A pass
 * from a DIRTY tree is not evidence either, and this is the subtle one: the
 * commit does not describe what actually ran, so the result is unreproducible.
 * It is an anecdote about a working directory that no longer exists.
 */
export function hasUsableProvenance(record) {
    const p = record.provenance;
    if (!/^[0-9a-f]{7,40}$/.test(p.commit))
        return false;
    if (p.treeClean !== true)
        return false;
    if (p.observer.trim().length === 0 || p.observerVersion.trim().length === 0)
        return false;
    if (record.observation.command.trim().length === 0)
        return false;
    return true;
}
export function describeAge(ms) {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1)
        return "less than a minute";
    if (minutes < 60)
        return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"}`;
}
/**
 * A command safe to publish.
 *
 * Internal slashes are allowed (`--workspace titan/atlas` is legitimate), but no
 * token may BEGIN with `/` or `~`, and `..` is refused. That is the difference
 * between "npm run verify" and "/usr/local/bin/npm --prefix /home/you run verify"
 * — the second describes the machine, and this record is published to a browser.
 *
 * The first version of this pattern allowed a leading slash. A test caught it;
 * the `/home/` scan would have missed `/usr/local/bin/npm` entirely.
 */
const SAFE_COMMAND = /^[a-zA-Z0-9 :._@/-]{1,120}$/;
const ABSOLUTE_TOKEN = /(^|\s)[/~]/;
const TRAVERSAL = /\.\./;
function isPublishableCommand(command) {
    return SAFE_COMMAND.test(command) && !ABSOLUTE_TOKEN.test(command) && !TRAVERSAL.test(command);
}
/** Everything except the two git object ids, which are proven by shape instead. */
function withoutCommitFields(record) {
    const { commit: _commit, shortCommit: _shortCommit, ...provenance } = record.provenance;
    return { ...record, provenance };
}
/**
 * Validate a record's SHAPE before it is trusted or published.
 *
 * The command pattern is deliberately tight. A command is the one field an
 * observer composes from its own environment, so it is the one most likely to
 * carry an absolute path — and this record is published to a browser.
 */
export function validateEvidence(value) {
    const issues = [];
    const fail = (path, message) => issues.push({ path, message });
    if (typeof value !== "object" || value === null)
        return [{ path: "record", message: "not an object" }];
    const r = value;
    if (r.schemaVersion !== EVIDENCE_SCHEMA_VERSION)
        fail("schemaVersion", `expected ${EVIDENCE_SCHEMA_VERSION}`);
    if (!r.subject || r.subject.kind !== "repository" || typeof r.subject.id !== "string" || r.subject.id.length === 0) {
        fail("subject", "must be a repository with an id");
    }
    if (r.subject && /[/\\]/.test(r.subject.id))
        fail("subject.id", "must be a name, never a path");
    if (!r.claim || r.claim.kind !== "verification-suite-passes")
        fail("claim", "unknown claim kind");
    if (!r.observation)
        fail("observation", "missing");
    else {
        if (!isPublishableCommand(r.observation.command ?? "")) {
            fail("observation.command", "absent, too long, or carries an absolute path / traversal — a command is published, and must not describe the machine");
        }
        if (typeof r.observation.passed !== "boolean")
            fail("observation.passed", "must be a boolean");
        if (r.observation.passed && r.observation.exitCode !== 0)
            fail("observation.passed", "claims a pass with a non-zero exit code");
        if ((r.observation.summary ?? "").length > 500)
            fail("observation.summary", "over 500 chars — summaries are bounded, and raw output is never carried");
    }
    if (!r.provenance)
        fail("provenance", "missing");
    else {
        if (!/^(unknown|[0-9a-f]{7,40})$/.test(r.provenance.commit ?? ""))
            fail("provenance.commit", "not a git object id or 'unknown'");
        if (!["live", "persisted", "simulated", "unavailable"].includes(r.provenance.mode ?? ""))
            fail("provenance.mode", "unknown mode");
    }
    if (typeof r.observedAt !== "string" || Number.isNaN(Date.parse(r.observedAt)))
        fail("observedAt", "not an ISO timestamp");
    // Compared as a plain string on purpose. `EvidenceRecord.status` excludes
    // "stale" at the TYPE level, so TypeScript reads this branch as dead — but
    // `validateEvidence` takes `unknown`, and untrusted input from disk is exactly
    // where a "stale" would arrive. The type is the promise; this is the check that
    // the promise was kept.
    const status = r.status;
    if (!status || !PROOF_STATUSES.includes(status) || status === "stale") {
        fail("status", "not a recordable status (a record is never born 'stale' — staleness is applied by assess() against the reader's clock)");
    }
    // The record is published to a browser. It may not carry a secret, and it may
    // not carry the machine that produced it.
    if (issues.length === 0) {
        try {
            // The commit fields are excluded from the ENTROPY scan and proven by SHAPE
            // instead — exactly as ADR-0046 does for the Atlas contract's revision, and
            // for the same reason: a 40-character git object id reads as a high-entropy
            // token to the hardened detector. The detector is over-eager by design and
            // is NOT weakened; the `/^(unknown|[0-9a-f]{7,40})$/` check above is the
            // stricter one, because a credential cannot pass as a git object id.
            assertNoSecrets(withoutCommitFields(value), "evidence");
        }
        catch (err) {
            fail("record", err instanceof Error ? err.message : "failed the secret scan");
        }
        const text = JSON.stringify(value);
        if (text.includes("/home/") || /[A-Z]:\\\\Users/.test(text))
            fail("record", "carries an absolute filesystem path");
    }
    return issues;
}
/** The empty ledger — what a consumer gets before anything was ever observed. */
export function noProof() {
    return { schemaVersion: EVIDENCE_SCHEMA_VERSION, latest: [], observationCount: 0 };
}
/** Reduce a history to the latest record per subject, for the seam. */
export function toLedger(records) {
    const latest = new Map();
    for (const record of records) {
        const key = `${record.subject.kind}:${record.subject.id}`;
        const held = latest.get(key);
        if (!held || Date.parse(record.observedAt) >= Date.parse(held.observedAt))
            latest.set(key, record);
    }
    return {
        schemaVersion: EVIDENCE_SCHEMA_VERSION,
        latest: [...latest.values()].sort((a, b) => a.subject.id.localeCompare(b.subject.id)),
        observationCount: records.length,
    };
}
/**
 * Summarise the latest record per subject.
 *
 * `records` is the whole append-only history; only the newest per subject can
 * speak for the present, and the rest are history — which is a different thing
 * and must never be mixed in.
 */
export function summariseProof(records, now) {
    const latest = new Map();
    for (const record of records) {
        const key = `${record.subject.kind}:${record.subject.id}`;
        const held = latest.get(key);
        if (!held || Date.parse(record.observedAt) >= Date.parse(held.observedAt))
            latest.set(key, record);
    }
    const subjects = [...latest.values()]
        .map((record) => ({
        subject: record.subject,
        claim: record.claim,
        assessment: assess(record, now),
        observedAt: record.observedAt,
        shortCommit: record.provenance.shortCommit,
        command: record.observation.command,
        mode: record.provenance.mode,
    }))
        .sort((a, b) => a.subject.id.localeCompare(b.subject.id));
    return {
        schemaVersion: EVIDENCE_SCHEMA_VERSION,
        subjects,
        verifiedCount: subjects.filter((s) => s.assessment.countsAsProof).length,
        totalSubjects: subjects.length,
        observationCount: records.length,
    };
}
/** The empty summary — what a reader derives before the engine has ever run.
 *  It says nothing is verified, and it is 0. It does not say "healthy". */
export function noProofSummary() {
    return { schemaVersion: EVIDENCE_SCHEMA_VERSION, subjects: [], verifiedCount: 0, totalSubjects: 0, observationCount: 0 };
}
//# sourceMappingURL=evidence.js.map