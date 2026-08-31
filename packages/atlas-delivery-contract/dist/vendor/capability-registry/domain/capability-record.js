// @othrys-core/atlas-delivery-contract — synced from titan/atlas/dist-contract.
// Do not edit here. Change titan/atlas/src, run `npm run atlas:publish` in othrys-core,
// then `npm run sync` in this package.
// ---------------------------------------------------------------------------
// Capability Registry — the canonical CapabilityRecord (Mission 003).
//
// THE SINGLE SOURCE OF TRUTH describing every external capability Othrys knows
// how to use — AI providers, LLMs, embeddings, image models, search providers,
// browser automation, OCR, speech, translation, vector databases, MCP servers,
// APIs, infrastructure, auth, monitoring, documentation sources, dev tools.
//
// A capability exists INDEPENDENTLY of whether a credential currently exists. A
// record is METADATA about a service — never a secret. There is no field for a
// key, and `assertNoSecrets` scrubs the whole graph before a record is admitted,
// so a value can never enter the encyclopedia even by accident.
//
// PROVIDER-NEUTRAL (Constitution Article 8). A provider's NAME is data carried in
// the `provider` field of a record built at runtime; no vendor brand is hardcoded
// in this module. The category vocabulary describes SHAPES of capability, not
// vendors — an image model is an image model whoever ships it.
//
// Pure data shapes + validation. No I/O, no Bridge types, no vendor assumptions.
// The registry (registry.ts) stores these; the fabric (events.ts) announces their
// lifecycle; the adapters (adapters/*) translate partner facts into them.
// ---------------------------------------------------------------------------
/** Record schema version. Bumped only on an additive, backward-compatible change
 *  so every existing record stays valid. Stamped into each record and into the
 *  dashboard projection so a consumer can pin to a shape. */
export const CAPABILITY_RECORD_SCHEMA_VERSION = 1;
export const CAPABILITY_CATEGORIES = [
    "ai-provider", "llm", "embedding", "image-model", "speech", "ocr", "translation",
    "vision", "search-provider", "browser-automation", "vector-database", "mcp-server",
    "api", "infrastructure", "authentication", "monitoring", "documentation",
    "developer-tool", "orchestration", "evaluation", "dataset", "other",
];
export const LIFECYCLE_STATUSES = [
    "proposed", "active", "deprecated", "superseded", "retired",
];
export const READINESS_STATES = ["ready", "limited", "disabled", "unverified"];
export const HEALTH_STATES = ["healthy", "degraded", "down", "unknown"];
export const AVAILABILITY_STATES = [
    "generally-available", "credentials-required", "waitlist", "restricted", "unavailable", "unknown",
];
export const CREDENTIAL_REQUIREMENTS = [
    "none", "api-key", "oauth", "bearer", "github-app", "account-token", "unknown",
];
export const PRICING_MODELS = [
    "free", "open-source", "freemium", "free-tier", "usage-based", "subscription", "paid", "unknown",
];
export const LICENSES = [
    "mit", "apache-2.0", "bsd", "mpl-2.0", "gpl", "agpl", "open-weight",
    "source-available", "bsl", "sspl", "proprietary-free", "proprietary", "unknown",
];
// --- secret safety ----------------------------------------------------------
/**
 * Heuristic: does a string look like a secret? Over-eager by design — a record is
 * appended to a permanent encyclopedia, so a missed secret is forever. Detects
 * long high-entropy tokens, common key prefixes, bearer/authorization fragments,
 * and private-key headers. Provider-neutral: it matches SHAPES, not brands.
 */
export function looksLikeSecret(value) {
    const s = value.trim();
    if (s.length === 0)
        return false;
    // Private key / certificate blocks.
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(s))
        return true;
    // Authorization / bearer fragments.
    if (/\b(bearer|authorization)\b\s*[:=]/i.test(s))
        return true;
    if (/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/.test(s))
        return true;
    // JWT (three base64url segments) — has dots, so the anchored high-entropy run
    // below would miss it. Matches Supabase-style anon/service tokens.
    if (/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{6,}/.test(s))
        return true;
    // Common credential key prefixes followed by a long token (kept generic:
    // sk-, pk-, ghp_, xox, AKIA…-style — brand-free, shape-based).
    if (/\b(sk|pk|rk|api[_-]?key|secret|token|passwd|password)[-_=: ]{1,3}[A-Za-z0-9/+_-]{16,}/i.test(s))
        return true;
    if (/\b(ghp|gho|ghu|ghs|ghr|xox[baprs])[-_][A-Za-z0-9]{16,}/.test(s))
        return true;
    if (/\bAKIA[0-9A-Z]{12,}\b/.test(s))
        return true;
    // A long, unbroken high-entropy token (no whitespace) — a bare key.
    if (/^[A-Za-z0-9/+_-]{32,}={0,2}$/.test(s) && !/\s/.test(s) && hasMixedEntropy(s))
        return true;
    return false;
}
/** A token with both letters and digits (and not an obvious word/hex-word) reads
 *  as key-like; a plain long word or a URL slug does not. */
function hasMixedEntropy(s) {
    const hasLetter = /[A-Za-z]/.test(s);
    const hasDigit = /[0-9]/.test(s);
    return hasLetter && hasDigit;
}
function isRecord(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
/**
 * Walk a value graph and throw if ANY string is secret-shaped. The registry runs
 * this before admitting or updating a record — the encyclopedia stores metadata,
 * never a value, and this is the mechanical guarantee of that rule.
 */
export function assertNoSecrets(value, path = "record") {
    if (typeof value === "string") {
        if (looksLikeSecret(value)) {
            throw new Error(`capability record field "${path}" carries secret-shaped content — the registry stores metadata, never a secret`);
        }
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((v, i) => assertNoSecrets(v, `${path}[${i}]`));
        return;
    }
    if (isRecord(value)) {
        for (const [k, v] of Object.entries(value))
            assertNoSecrets(v, `${path}.${k}`);
    }
}
/**
 * Validate a record's SHAPE. Empty issues = valid. Enforces required identity and
 * the controlled vocabularies; URL fields must be https or null; and no string may
 * be secret-shaped (a separate hard guard is `assertNoSecrets`, used at write time).
 */
export function validateRecord(raw) {
    const issues = [];
    const fail = (field, message) => issues.push({ field, message });
    if (!isRecord(raw))
        return [{ field: ".", message: "record is not an object" }];
    if (typeof raw.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(raw.id))
        fail("id", "required lowercase slug ([a-z0-9-])");
    if (typeof raw.name !== "string" || raw.name.length === 0)
        fail("name", "required");
    if (typeof raw.provider !== "string" || raw.provider.length === 0)
        fail("provider", "required");
    if (typeof raw.description !== "string")
        fail("description", "required");
    if (!CAPABILITY_CATEGORIES.includes(raw.category))
        fail("category", `must be one of: ${CAPABILITY_CATEGORIES.join(", ")}`);
    if (!CREDENTIAL_REQUIREMENTS.includes(raw.credentialRequirement))
        fail("credentialRequirement", "invalid");
    if (!AVAILABILITY_STATES.includes(raw.availability))
        fail("availability", "invalid");
    if (!HEALTH_STATES.includes(raw.health))
        fail("health", "invalid");
    if (!READINESS_STATES.includes(raw.readiness))
        fail("readiness", "invalid");
    if (!LIFECYCLE_STATUSES.includes(raw.lifecycle))
        fail("lifecycle", "invalid");
    if (!PRICING_MODELS.includes(raw.pricing))
        fail("pricing", "invalid");
    if (!LICENSES.includes(raw.license))
        fail("license", "invalid");
    for (const arrField of ["features", "rateLimits", "quotas", "documentation", "onboarding", "alternatives", "sources", "tags"]) {
        if (!Array.isArray(raw[arrField]))
            fail(arrField, "must be an array");
    }
    for (const urlField of ["homepageUrl"]) {
        const v = raw[urlField];
        if (v !== null && (typeof v !== "string" || !v.startsWith("https://")))
            fail(urlField, "must be an https URL or null");
    }
    if (Array.isArray(raw.documentation)) {
        raw.documentation.forEach((d, i) => {
            if (!isRecord(d) || typeof d.url !== "string" || !d.url.startsWith("https://"))
                fail(`documentation[${i}].url`, "must be an https URL");
        });
    }
    // Metadata only — no field may carry a secret-shaped value.
    const walk = (v, p) => {
        if (typeof v === "string") {
            if (looksLikeSecret(v))
                fail(p, "value looks secret-shaped; the registry carries no credential value");
            return;
        }
        if (Array.isArray(v)) {
            v.forEach((x, i) => walk(x, `${p}[${i}]`));
            return;
        }
        if (isRecord(v))
            for (const [k, x] of Object.entries(v))
                walk(x, `${p}.${k}`);
    };
    walk(raw, "record");
    return issues;
}
//# sourceMappingURL=capability-record.js.map