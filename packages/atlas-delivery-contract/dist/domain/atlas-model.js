import { looksLikeSecret } from "../vendor/capability-registry/domain/capability-record.js";
export const ATLAS_NODE_TYPES = [
    "othrys", "constitution", "titan", "oros", "constellation", "star", "bridge", "event-fabric",
    "capability", "event", "provider", "credential-reference", "knowledge-source", "library-wing", "vault",
    "store", "interface", "service", "application", "repository", "adr", "mission", "risk",
    "incident", "roadmap-item", "domain",
];
export const ATLAS_EDGE_TYPES = [
    "contains", "owns", "powers", "consumes", "provides", "depends-on", "publishes", "subscribes",
    "routes-through", "stores-in", "governed-by", "authenticated-by", "grants", "monitors",
    "preserves", "promotes-to", "implements", "documented-by", "blocked-by", "replaces",
    "supersedes", "connected-to",
];
export const ATLAS_STATUSES = [
    "operational", "tested", "scaffolded", "designed", "planned", "blocked", "deprecated", "unknown",
];
export const ATLAS_RISKS = ["informational", "low", "medium", "high", "critical"];
export const ATLAS_SCHEMA_VERSION = 1;
// --- stable ids -------------------------------------------------------------
/** Build a stable, collision-resistant node id: `<type>:<slug>`. */
export function nodeId(type, key) {
    return `${type}:${slug(key)}`;
}
/** Build a stable edge id from its endpoints and type. Deterministic. */
export function edgeId(type, from, to) {
    return `${type}:${from}->${to}`;
}
export function slug(s) {
    return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
// --- secret safety ----------------------------------------------------------
function isRecord(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
/** Throw if ANY string in the value graph is secret-shaped. Uses the same hardened
 *  detector the rest of Othrys uses (JWT/PEM/AWS/token/bearer/high-entropy). */
export function assertNoSecrets(value, path = "atlas") {
    if (typeof value === "string") {
        if (looksLikeSecret(value)) {
            throw new Error(`atlas field "${path}" carries secret-shaped content — the Atlas is browser-facing metadata, never a secret`);
        }
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((v, i) => assertNoSecrets(v, `${path}[${i}]`));
        return;
    }
    if (isRecord(value))
        for (const [k, v] of Object.entries(value))
            assertNoSecrets(v, `${path}.${k}`);
}
/** Prove a whole graph is browser-safe. Called before a snapshot is emitted. */
export function assertGraphClean(graph) {
    assertNoSecrets(graph, "graph");
}
/** Validate a graph's SHAPE and REFERENTIAL INTEGRITY. Empty issues = valid.
 *  Enforces: unique node ids; every edge endpoint resolves to a node; controlled
 *  vocabularies; a non-inferred node has at least one source; `operational`/`tested`
 *  requires evidence basis (docs alone can never make something operational). */
export function validateGraph(graph) {
    const issues = [];
    const fail = (path, message) => issues.push({ path, message });
    const ids = new Set();
    for (const n of graph.nodes) {
        if (ids.has(n.id))
            fail(n.id, "duplicate node id");
        ids.add(n.id);
        if (!ATLAS_NODE_TYPES.includes(n.type))
            fail(n.id, `unknown node type ${n.type}`);
        if (!ATLAS_STATUSES.includes(n.status))
            fail(n.id, `unknown status ${n.status}`);
        if (!ATLAS_RISKS.includes(n.risk))
            fail(n.id, `unknown risk ${n.risk}`);
        if (n.basis === "evidence" && n.sources.length === 0)
            fail(n.id, "evidence-basis node has no sources (provenance required)");
        if ((n.status === "operational" || n.status === "tested") && n.basis !== "evidence") {
            fail(n.id, `status "${n.status}" requires evidence basis — never inferred from documentation`);
        }
    }
    for (const e of graph.edges) {
        if (!ATLAS_EDGE_TYPES.includes(e.type))
            fail(e.id, `unknown edge type ${e.type}`);
        if (!ids.has(e.from))
            fail(e.id, `edge 'from' ${e.from} is not a node`);
        if (!ids.has(e.to))
            fail(e.id, `edge 'to' ${e.to} is not a node`);
    }
    return issues;
}
//# sourceMappingURL=atlas-model.js.map