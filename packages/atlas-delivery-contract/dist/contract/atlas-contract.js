// @othrys-core/atlas-delivery-contract — synced from titan/atlas/dist-contract.
// Do not edit here. Change titan/atlas/src, run `npm run atlas:publish` in othrys-core,
// then `npm run sync` in this package.
// ---------------------------------------------------------------------------
// The Atlas DELIVERY CONTRACT — the seam between othrys-core and the website
// (Mission 006 · Phase 2).
//
// othrys-core owns Atlas truth and generation. The website CONSUMES it, and must
// never become a second source of architectural truth. This module is the shape
// of what crosses that boundary: a versioned, browser-safe envelope around the
// Mission-005 `AtlasGraph`, carrying the summaries and provenance a product
// surface needs so the website computes presentation, never truth.
//
// It reuses the Mission-005 model — it does not fork it. `nodes` and `edges` ARE
// `AtlasNode`/`AtlasEdge`; the summaries below are DERIVED from them by
// `buildContract`, deterministically, so a consumer can render an overview
// without walking 177 nodes and without inventing a number of its own.
//
// THREE RULES MADE MECHANICAL:
//   1. NO SECRET, EVER. `buildContract` runs `assertGraphClean` before it returns,
//      and `validateContract` re-scans at the website boundary. Secret-freedom is
//      asserted on BOTH sides of the seam: the producer proves it, and the
//      consumer refuses to trust that proof.
//   2. FORWARD-COMPATIBLE, EXPLICITLY. `contractVersion` gates the envelope and
//      `schemaVersion` gates the graph. A consumer meeting a newer contract says
//      so plainly and renders nothing, rather than silently mis-reading fields.
//   3. UNKNOWN IS A VALUE. `knownUnknowns` is carried across the seam intact.
//      A fact the collector could not determine stays unknown in the browser; it
//      is never defaulted, rounded, or quietly dropped to make a card look full.
//
// This module is BROWSER-SAFE: no `node:*`, no fs, no env, no network. That is
// not a convention — `scripts/publish-contract.mjs` walks this module's import
// closure and refuses to publish if any of it reaches a Node builtin.
// ---------------------------------------------------------------------------
import { ATLAS_SCHEMA_VERSION, assertGraphClean, assertNoSecrets, validateGraph, } from "../domain/atlas-model.js";
import { noProof, validateEvidence } from "../proof/evidence.js";
/**
 * The envelope version. Bumped when the CONTRACT shape changes (not the graph).
 *
 * v2 (Mission 007) adds `proof`: the Proof Engine's summary of what has actually
 * been OBSERVED to run, as opposed to what the collector can infer from files.
 * The bump is the mechanism working as designed — a website built against v1
 * refuses a v2 contract outright rather than silently rendering a shape it does
 * not understand.
 */
export const ATLAS_CONTRACT_VERSION = 2;
/** The largest payload the seam will carry. A contract that outgrows this is a
 *  design signal (the website should page or summarise), not a reason to raise
 *  the cap silently. Enforced by the publisher, re-checked at the boundary. */
export const MAX_CONTRACT_BYTES = 4 * 1024 * 1024;
/** Health states that mean "a human should look at this". Ordered worst-first;
 *  `worstHealth` uses this order, so the ordering is behaviour, not decoration. */
export const HEALTH_ATTENTION = [
    "revoked", "invalid", "expired", "account-action-required", "project-suspended",
    "provider-unavailable", "insufficient-scope", "quota-limited", "rate-limited",
    "degraded", "rotation-due", "network-unreachable", "validation-blocked",
];
/** Worst-first health precedence for aggregation. Anything absent ranks last. */
const HEALTH_ORDER = [
    ...HEALTH_ATTENTION, "deprecated", "superseded", "unverified", "not-configured",
    "disabled-by-policy", "configured", "unknown", "healthy", "n/a",
];
const RISK_ORDER = ["critical", "high", "medium", "low", "informational"];
const STATUS_ORDER = [
    "blocked", "unknown", "planned", "designed", "scaffolded", "tested", "operational", "deprecated",
];
/** The worst health in a set, by `HEALTH_ORDER`. `n/a` when nothing has health. */
export function worstHealth(healths) {
    let worst = "n/a";
    let worstRank = HEALTH_ORDER.length;
    for (const h of healths) {
        const rank = HEALTH_ORDER.indexOf(h);
        const effective = rank === -1 ? HEALTH_ORDER.length - 1 : rank;
        if (effective < worstRank) {
            worstRank = effective;
            worst = h;
        }
    }
    return worst;
}
function worstRisk(risks) {
    for (const level of RISK_ORDER)
        if (risks.includes(level))
            return level;
    return "informational";
}
/** The LEAST mature status present — a domain is only as ready as its weakest
 *  part. Never rounds up: a domain containing a `blocked` node reads `blocked`. */
function weakestStatus(statuses) {
    for (const s of STATUS_ORDER)
        if (statuses.includes(s))
            return s;
    return "unknown";
}
/** A git object id: 7–40 lowercase hex, or an honest `"unknown"`. */
const COMMIT_SHAPE = /^(unknown|[0-9a-f]{7,40})$/;
/** A git ref name, conservatively: no spaces, no control characters, no `..`. */
const REF_SHAPE = /^(unknown|[A-Za-z0-9._\-/]{1,200})$/;
const REPO_SHAPE = /^[A-Za-z0-9._-]{1,100}$/;
/**
 * Prove the revision is a revision — not free text, and not a place a secret
 * could hide. Throws with the offending field named.
 *
 * This runs INSTEAD OF the entropy scan for these four fields, and it is the
 * stricter of the two: the detector asks "does this look random?", while this
 * asks "is this exactly a git object id / ref name?" — a question a credential
 * cannot pass by accident.
 */
export function assertRevisionSafe(revision) {
    if (!REPO_SHAPE.test(revision.repository))
        throw new Error(`atlas contract revision.repository "${revision.repository}" is not a plain repository name`);
    if (!COMMIT_SHAPE.test(revision.commit))
        throw new Error(`atlas contract revision.commit is not a git object id or "unknown"`);
    if (!COMMIT_SHAPE.test(revision.shortCommit))
        throw new Error(`atlas contract revision.shortCommit is not a git object id or "unknown"`);
    if (!REF_SHAPE.test(revision.branch))
        throw new Error(`atlas contract revision.branch is not a plain git ref name`);
    if (typeof revision.dirty !== "boolean" && revision.dirty !== "unknown") {
        throw new Error(`atlas contract revision.dirty must be true, false, or "unknown"`);
    }
}
/**
 * Everything in the contract except the git object ids, which are proven by
 * SHAPE rather than scanned for entropy.
 *
 * Two places carry a commit: `revision` (which othrys-core state produced this
 * contract) and `proof.latest[].provenance` (which commit each observation was
 * taken at). Both are 40-char hex, both read as high-entropy tokens to the
 * hardened detector, and both are proven stricter than the heuristic could —
 * `assertRevisionSafe` and `validateEvidence` respectively. See ADR-0046 for the
 * reasoning; ADR-0047 applies the same rule to evidence rather than inventing a
 * second exemption.
 */
function withoutCommitIds(contract) {
    const { revision: _revision, proof, ...rest } = contract;
    return {
        ...rest,
        proof: {
            ...proof,
            latest: proof.latest.map((record) => {
                const { commit: _c, shortCommit: _s, ...provenance } = record.provenance;
                return { ...record, provenance };
            }),
        },
    };
}
/**
 * Locale-independent string order.
 *
 * NOT `localeCompare`: that consults ICU, so its result depends on the machine's
 * locale data. The contract must serialise to identical BYTES wherever it is
 * generated — a developer's laptop and CI must agree — so ordering here is by
 * code unit, which is fixed everywhere.
 */
export function compareStable(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
function tally(values) {
    const out = {};
    for (const v of values)
        out[v] = (out[v] ?? 0) + 1;
    // Deterministic key order — the contract is byte-stable across runs.
    return Object.fromEntries(Object.entries(out).sort(([a], [b]) => compareStable(a, b)));
}
/**
 * Derive the contract from an already-built graph. Pure and deterministic: the
 * same graph + drift + revision always serialise to identical bytes.
 *
 * Throws if the graph is secret-shaped or structurally invalid — a broken graph
 * must never reach the seam, let alone a browser.
 */
export function buildContract(input) {
    const { graph, drift, revision } = input;
    // Producer-side proof. Both of these throw rather than emit something unsafe.
    assertGraphClean(graph);
    const issues = validateGraph(graph);
    if (issues.length > 0) {
        throw new Error(`atlas graph is invalid; refusing to build a contract: ${issues.slice(0, 3).map((i) => `${i.path}: ${i.message}`).join("; ")}`);
    }
    const domainNodes = graph.nodes.filter((n) => n.type === "domain");
    const domains = domainNodes.map((d) => {
        const members = graph.nodes.filter((n) => n.domain === d.id.replace(/^domain:/, "") || n.domain === d.id);
        return {
            id: d.id,
            name: d.name,
            description: d.description,
            nodeCount: members.length,
            status: weakestStatus(members.map((m) => m.status)),
            risk: worstRisk(members.map((m) => m.risk)),
            health: worstHealth(members.map((m) => m.health)),
        };
    }).sort((a, b) => compareStable(a.id, b.id));
    const healths = graph.nodes.map((n) => n.health);
    const health = {
        byState: tally(healths),
        attention: healths.filter((h) => HEALTH_ATTENTION.includes(h)).length,
        withHealth: healths.filter((h) => h !== "n/a").length,
        unknown: healths.filter((h) => h === "unknown").length,
    };
    const risks = graph.nodes.map((n) => n.risk);
    const risk = {
        byLevel: tally(risks),
        elevated: risks.filter((r) => r === "high" || r === "critical").length,
    };
    const maturities = graph.nodes.map((n) => n.maturity);
    const maturity = {
        byLevel: tally(maturities),
        unknown: maturities.filter((m) => m === "unknown").length,
    };
    const statuses = graph.nodes.map((n) => n.status);
    const readiness = {
        byStatus: tally(statuses),
        operational: statuses.filter((s) => s === "operational").length,
        blocked: statuses.filter((s) => s === "blocked").length,
        unknown: statuses.filter((s) => s === "unknown").length,
    };
    const allSources = graph.nodes.flatMap((n) => n.sources);
    const provenance = {
        sourceKinds: tally(allSources.map((s) => s.kind)),
        referenceCount: allSources.length,
        evidenceNodes: graph.summary.evidenceNodes,
        inferredNodes: graph.summary.inferredNodes,
    };
    const knownUnknowns = graph.nodes
        .flatMap((n) => n.unknowns.map((u) => ({ nodeId: n.id, nodeName: n.name, unknown: u })))
        .sort((a, b) => compareStable(a.nodeId, b.nodeId) || compareStable(a.unknown, b.unknown));
    const contract = {
        contractVersion: ATLAS_CONTRACT_VERSION,
        schemaVersion: graph.schemaVersion,
        generatedAt: graph.generatedAt,
        revision,
        nodes: graph.nodes,
        edges: graph.edges,
        domains,
        health,
        risk,
        maturity,
        readiness,
        drift,
        provenance,
        knownUnknowns,
        generation: input.generation ?? { ok: true, notes: [] },
        // Absent evidence yields `noProof()`, never an optimistic default.
        proof: input.proof ?? noProof(),
    };
    // Belt and braces: prove the DERIVED surface is clean too, not just the graph.
    // Git object ids are proven by shape rather than scanned — see `withoutCommitIds`.
    assertRevisionSafe(revision);
    for (const record of contract.proof.latest) {
        const issues = validateEvidence(record);
        if (issues.length > 0) {
            throw new Error(`atlas contract carries an invalid evidence record (${issues[0].path}: ${issues[0].message}) — a record that cannot be validated must never be published`);
        }
    }
    assertNoSecrets(withoutCommitIds(contract), "contract");
    return contract;
}
/** Serialise deterministically. Key order is the declaration order above, which
 *  is stable, so the published bytes only change when the truth changes. */
export function serialiseContract(contract) {
    return JSON.stringify(contract, null, 2);
}
function isRecord(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
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
export function validateContract(value, opts = {}) {
    const issues = [];
    const fail = (m) => ({ ok: false, issues: [...issues, m] });
    if (!isRecord(value))
        return fail("contract is not an object");
    // 1. Envelope version — forward-compatibility, stated explicitly.
    const cv = value.contractVersion;
    if (typeof cv !== "number")
        return fail("contract has no numeric contractVersion");
    if (cv > ATLAS_CONTRACT_VERSION) {
        return fail(`contract version ${cv} is newer than this website understands (${ATLAS_CONTRACT_VERSION}) — rebuild the website against the current contract`);
    }
    if (cv < ATLAS_CONTRACT_VERSION) {
        return fail(`contract version ${cv} is older than this website requires (${ATLAS_CONTRACT_VERSION}) — regenerate the Atlas contract in othrys-core`);
    }
    // 2. Graph schema version.
    const sv = value.schemaVersion;
    if (typeof sv !== "number")
        return fail("contract has no numeric schemaVersion");
    if (sv !== ATLAS_SCHEMA_VERSION) {
        return fail(`atlas schema version ${sv} does not match this website's model (${ATLAS_SCHEMA_VERSION})`);
    }
    // 3. Required fields present and of the right kind.
    for (const key of ["generatedAt", "revision", "nodes", "edges", "domains", "health", "risk", "maturity", "readiness", "drift", "provenance", "knownUnknowns", "generation", "proof"]) {
        if (!(key in value))
            issues.push(`contract is missing required field "${key}"`);
    }
    if (typeof value.generatedAt !== "string")
        issues.push("generatedAt must be an ISO string");
    if (!Array.isArray(value.nodes))
        issues.push("nodes must be an array");
    if (!Array.isArray(value.edges))
        issues.push("edges must be an array");
    if (issues.length > 0)
        return { ok: false, issues };
    // 4. Bounded payload — a contract that outgrew the seam is refused, not trimmed.
    const maxBytes = opts.maxBytes ?? MAX_CONTRACT_BYTES;
    const bytes = JSON.stringify(value).length;
    if (bytes > maxBytes) {
        return fail(`contract payload is ${bytes} bytes, over the ${maxBytes}-byte seam limit`);
    }
    // 5. The graph itself — vocabulary, unique ids, referential integrity, and the
    //    rule that "operational"/"tested" is never inferred from documentation.
    //    `nodes`/`edges` were array-checked above, but nothing checked what is INSIDE them,
    //    and `validateGraph` dereferences each element (`n.id`, `n.sources.length`). A single
    //    null or shapeless element therefore threw a TypeError straight out of the function
    //    documented to refuse a bad contract WHOLE — at the untrusted boundary, where the
    //    consumer expects `{ ok: false, issues }` and gets an exception instead. Guarded the
    //    same way step 6 already guards its own dereferences.
    let graphIssues;
    try {
        const graph = {
            generatedAt: value.generatedAt,
            nodes: value.nodes,
            edges: value.edges,
            schemaVersion: sv,
            summary: {
                nodeCount: value.nodes.length,
                edgeCount: value.edges.length,
                byType: {}, byStatus: {}, byBasis: {},
                evidenceNodes: 0, inferredNodes: 0,
            },
        };
        graphIssues = validateGraph(graph);
    }
    catch (err) {
        return fail(`contract graph is malformed: ${err instanceof Error ? err.message : "unreadable node or edge"}`);
    }
    if (graphIssues.length > 0) {
        return { ok: false, issues: graphIssues.slice(0, 10).map((i) => `${i.path}: ${i.message}`) };
    }
    // 6. Secret-freedom, re-proven on the consumer side. The producer asserted it;
    //    we do not take that on faith, because a leaked secret would be forever.
    //    The revision is proven by shape (a git id cannot hide a credential); the
    //    rest is scanned with the hardened detector.
    try {
        if (!isRecord(value.revision))
            return fail("contract revision must be an object");
        assertRevisionSafe(value.revision);
        // Every evidence record is re-validated at the boundary. The consumer does
        // not take the producer's word that a record is well-formed and path-free.
        const ledger = value.proof;
        if (!ledger || !Array.isArray(ledger.latest))
            return fail("contract proof ledger is missing or malformed");
        for (const record of ledger.latest) {
            const issues = validateEvidence(record);
            if (issues.length > 0)
                return fail(`evidence record rejected at the boundary: ${issues[0].path} — ${issues[0].message}`);
        }
        assertNoSecrets(withoutCommitIds(value), "contract");
    }
    catch (err) {
        return fail(err instanceof Error ? err.message : "contract failed the secret scan");
    }
    return { ok: true, issues: [], contract: value };
}
/** A snapshot older than this is `stale` — the website must say so out loud. */
export const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
export const AGING_AFTER_MS = 24 * 60 * 60 * 1000;
/**
 * How current is this Atlas? Pure — the caller supplies `now`, so freshness is
 * testable and never depends on a hidden clock.
 *
 * An unparseable or future timestamp yields `unknown`, never a comfortable
 * default: a website that cannot tell how old its truth is must admit it.
 */
export function freshness(contract, now) {
    if (!contract.generation.ok) {
        return {
            state: "generation-failed",
            ageMs: null,
            label: "Generation failed",
            detail: contract.generation.notes[0] ?? "The last Atlas generation did not complete. This view may be missing or wrong.",
        };
    }
    const at = Date.parse(contract.generatedAt);
    if (Number.isNaN(at)) {
        return { state: "unknown", ageMs: null, label: "Freshness unknown", detail: "The snapshot carries no readable generation time." };
    }
    const ageMs = now - at;
    if (ageMs < 0) {
        return { state: "unknown", ageMs, label: "Freshness unknown", detail: "The snapshot is stamped in the future; the clock or the generator disagrees with this machine." };
    }
    if (ageMs >= STALE_AFTER_MS) {
        return { state: "stale", ageMs, label: "Stale", detail: `Generated ${describeAge(ageMs)} ago. Regenerate the Atlas in othrys-core to refresh it.` };
    }
    if (ageMs >= AGING_AFTER_MS) {
        return { state: "aging", ageMs, label: "Aging", detail: `Generated ${describeAge(ageMs)} ago.` };
    }
    return { state: "fresh", ageMs, label: "Current", detail: `Generated ${describeAge(ageMs)} ago.` };
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
//# sourceMappingURL=atlas-contract.js.map