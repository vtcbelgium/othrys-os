// @othrys-core/atlas-delivery-contract — synced from titan/atlas/dist-contract.
// Do not edit here. Change titan/atlas/src, run `npm run atlas:publish` in othrys-core,
// then `npm run sync` in this package.
// ---------------------------------------------------------------------------
// The canonical operational-state vocabulary (Mission 004 · Phase 6).
//
// ONE shared vocabulary the whole intelligence foundation speaks — so a failure
// is never collapsed into "invalid". It lives in the Capability Registry (the
// provider-neutral catalog every Titan already consults) as a zero-dependency
// leaf, and each subsystem's native states map ONTO it:
//   • Keymaster's 17-state HealthState  → canonical (mapping in the composition)
//   • the Broker's coarse CredentialStatus → canonical (mapping in the composition)
//   • the Registry's own Health/Readiness/Availability → canonical (here)
//
// It is a RECONCILIATION vocabulary, not a replacement: Keymaster keeps its rich
// HealthState; this is the lingua franca for cross-Titan facts and the website
// read model. Four orthogonal axes are kept distinct on purpose:
//   1. OperationalState — the calibrated condition (what's wrong / right)
//   2. StateFacet       — is this a CREDENTIAL, PROVIDER, or CAPABILITY fact?
//   3. Readiness        — can we operate it now? (ready/limited/disabled/unverified)
//   4. IncidentSeverity — how loud should the alarm be?
//
// Provider-neutral: it names CONDITIONS, never vendors (Article 8).
// ---------------------------------------------------------------------------
// The mission names 19 states "at minimum"; two more (`account-action-required`,
// `rotation-due`) are added so Keymaster's richer 17-state HealthState maps onto
// this vocabulary WITHOUT information loss — a faithful reconciliation, not a
// lossy common denominator.
export const OPERATIONAL_STATES = [
    "unknown", "not-configured", "configured", "unverified", "healthy", "degraded",
    "quota-limited", "rate-limited", "expired", "revoked", "invalid", "insufficient-scope",
    "provider-unavailable", "project-suspended", "network-unreachable", "validation-blocked",
    "disabled-by-policy", "account-action-required", "rotation-due", "deprecated", "superseded",
];
/** States that describe a CREDENTIAL's own condition. */
export const CREDENTIAL_STATES = [
    "not-configured", "configured", "unverified", "healthy", "expired", "revoked",
    "invalid", "insufficient-scope", "quota-limited", "rate-limited", "disabled-by-policy",
    "account-action-required", "rotation-due", "unknown",
];
/** States that describe the PROVIDER's condition (not our credential). */
export const PROVIDER_STATES = [
    "healthy", "degraded", "provider-unavailable", "project-suspended",
    "network-unreachable", "rate-limited", "unknown",
];
/** States that describe a CAPABILITY's catalog condition. */
export const CAPABILITY_STATES = [
    "healthy", "degraded", "unverified", "disabled-by-policy", "deprecated", "superseded",
    "validation-blocked", "unknown",
];
// --- classification: what does a state MEAN? --------------------------------
/** States where the capability is fully usable right now. */
export const OK_STATES = new Set(["healthy", "quota-limited"]);
/** States that require a human (typically the CEO) to act. */
export const ACTION_REQUIRED_STATES = new Set([
    "expired", "revoked", "invalid", "insufficient-scope", "project-suspended", "not-configured",
    "account-action-required", "rotation-due",
]);
/** States that are transient and MAY clear on their own (retry is appropriate). */
export const TRANSIENT_STATES = new Set([
    "rate-limited", "provider-unavailable", "network-unreachable", "degraded", "validation-blocked",
]);
/** States that are end-of-life for a capability (no retry restores them). */
export const TERMINAL_CAPABILITY_STATES = new Set([
    "deprecated", "superseded",
]);
export function isOk(state) {
    return OK_STATES.has(state);
}
export function needsHumanAction(state) {
    return ACTION_REQUIRED_STATES.has(state);
}
export function isTransient(state) {
    return TRANSIENT_STATES.has(state);
}
/** Is an automatic retry appropriate? Only for transient, provider/network-side
 *  conditions — never for a credential the CEO must fix (that would just spin). */
export function retryAppropriate(state) {
    return isTransient(state);
}
/** Map a state to the readiness it implies — the single source of that projection. */
export function readinessOf(state) {
    switch (state) {
        case "healthy": return "ready";
        case "quota-limited":
        case "rate-limited":
        case "degraded":
        case "configured":
        case "provider-unavailable":
        case "network-unreachable":
        case "project-suspended":
        case "validation-blocked":
            return "limited"; // usable-ish or temporarily impaired, but not fully disabled
        case "rotation-due":
            return "limited"; // still usable, but rotate soon
        case "disabled-by-policy":
        case "revoked":
        case "invalid":
        case "expired":
        case "insufficient-scope":
        case "not-configured":
        case "account-action-required":
        case "deprecated":
        case "superseded":
            return "disabled";
        case "unverified":
        case "unknown":
        default:
            return "unverified";
    }
}
/** Map a state to a default incident severity. Calibrated, not collapsed. */
export function severityOf(state) {
    switch (state) {
        case "revoked":
        case "invalid":
        case "expired":
        case "project-suspended":
            return "critical";
        case "insufficient-scope":
        case "not-configured":
        case "provider-unavailable":
        case "quota-limited":
        case "rate-limited":
        case "degraded":
        case "network-unreachable":
        case "validation-blocked":
        case "account-action-required":
        case "rotation-due":
        case "deprecated":
        case "superseded":
            return "warning";
        case "healthy":
        case "configured":
        case "unverified":
        case "unknown":
        case "disabled-by-policy":
        default:
            return "info";
    }
}
// --- transition rules -------------------------------------------------------
/**
 * The allowed transitions. A calibrated state machine — a capability cannot jump
 * from `superseded` back to `healthy` (a superseded thing is replaced, not
 * revived), and `not-configured` must pass through `configured`/`unverified`
 * before it can be `healthy`. `unknown` is reachable from anywhere (we can always
 * lose information) and can go anywhere (the next signal re-establishes truth).
 */
const TRANSITIONS = {
    unknown: OPERATIONAL_STATES, // a fresh signal can establish any state
    "not-configured": ["configured", "unverified", "disabled-by-policy", "unknown", "deprecated", "superseded"],
    configured: ["unverified", "healthy", "invalid", "insufficient-scope", "provider-unavailable", "validation-blocked", "disabled-by-policy", "unknown"],
    unverified: ["healthy", "invalid", "insufficient-scope", "expired", "revoked", "provider-unavailable", "project-suspended", "network-unreachable", "validation-blocked", "quota-limited", "rate-limited", "degraded", "disabled-by-policy", "account-action-required", "rotation-due", "unknown"],
    healthy: ["degraded", "quota-limited", "rate-limited", "expired", "revoked", "invalid", "insufficient-scope", "provider-unavailable", "project-suspended", "network-unreachable", "disabled-by-policy", "account-action-required", "rotation-due", "deprecated", "superseded", "unverified", "unknown"],
    degraded: ["healthy", "provider-unavailable", "rate-limited", "disabled-by-policy", "unknown"],
    "quota-limited": ["healthy", "rate-limited", "disabled-by-policy", "unknown"],
    "rate-limited": ["healthy", "quota-limited", "degraded", "disabled-by-policy", "unknown"],
    expired: ["configured", "unverified", "healthy", "revoked", "disabled-by-policy", "unknown"], // re-onboard
    revoked: ["not-configured", "configured", "unverified", "disabled-by-policy", "unknown"], // re-issue
    invalid: ["configured", "unverified", "healthy", "revoked", "disabled-by-policy", "unknown"], // replace key
    "insufficient-scope": ["healthy", "unverified", "invalid", "disabled-by-policy", "unknown"], // widen scope
    "provider-unavailable": ["healthy", "degraded", "unverified", "project-suspended", "unknown"],
    "project-suspended": ["healthy", "unverified", "revoked", "disabled-by-policy", "unknown"], // reactivate
    "network-unreachable": ["healthy", "unverified", "provider-unavailable", "unknown"],
    "validation-blocked": ["unverified", "healthy", "disabled-by-policy", "unknown"],
    "disabled-by-policy": ["not-configured", "configured", "unverified", "healthy", "unknown"], // re-enable (CEO)
    "account-action-required": ["healthy", "unverified", "project-suspended", "disabled-by-policy", "unknown"], // CEO handles billing/onboarding
    "rotation-due": ["healthy", "unverified", "invalid", "revoked", "disabled-by-policy", "unknown"], // rotate the key
    deprecated: ["superseded", "disabled-by-policy", "unknown"],
    superseded: ["disabled-by-policy", "unknown"], // terminal-ish
};
/** Is a transition from `from` to `to` allowed? A self-transition (re-observing the
 *  same state) is always allowed. */
export function canTransition(from, to) {
    if (from === to)
        return true;
    return (TRANSITIONS[from] ?? []).includes(to);
}
/** The states reachable from `from` in one step (excluding self). */
export function nextStates(from) {
    return TRANSITIONS[from] ?? [];
}
export function remediationClass(state) {
    const base = { state, userMustAct: needsHumanAction(state), autoRetry: retryAppropriate(state) };
    switch (state) {
        case "healthy": return { ...base, action: "none", summary: "Operational — no action needed." };
        case "quota-limited": return { ...base, action: "wait-and-retry", summary: "Usable, but a usage quota is low or exhausted; it will recover or needs a plan change." };
        case "rate-limited": return { ...base, action: "wait-and-retry", summary: "Temporarily throttled; it should clear on its own — automatic retry is appropriate." };
        case "degraded":
        case "provider-unavailable":
        case "network-unreachable":
            return { ...base, action: "await-provider", summary: "The provider (not the credential) is impaired or unreachable; wait and retry." };
        case "not-configured": return { ...base, action: "provide-credential", summary: "No credential is configured; the CEO must provide one to enable this." };
        case "unverified":
        case "configured": return { ...base, action: "investigate", autoRetry: false, summary: "A credential exists but has not been verified; a governed read-only check is needed." };
        case "invalid":
        case "expired": return { ...base, action: "replace-credential", summary: "The credential was rejected or has lapsed; the CEO should generate and enter a fresh one." };
        case "revoked": return { ...base, action: "replace-credential", summary: "The credential was withdrawn; the CEO must issue and enter a new one." };
        case "insufficient-scope": return { ...base, action: "widen-scope", summary: "Authenticated but under-privileged; the credential needs broader scope." };
        case "project-suspended": return { ...base, action: "reactivate-account", summary: "The provider account/project is suspended; the CEO must reactivate it." };
        case "account-action-required": return { ...base, action: "reactivate-account", summary: "The provider account needs a human action (billing, onboarding, or reactivation) before this can be used." };
        case "rotation-due": return { ...base, action: "replace-credential", summary: "The credential still works but a rotation window has opened; the CEO should rotate it." };
        case "disabled-by-policy": return { ...base, action: "re-enable", summary: "Deliberately disabled; a CEO decision is required to re-enable it." };
        case "validation-blocked": return { ...base, action: "investigate", summary: "Validation could not run (no adapter or not permitted); state is honestly unverified." };
        case "deprecated":
        case "superseded": return { ...base, action: "migrate-to-successor", summary: "Discouraged or replaced; migrate consumers to the successor capability." };
        case "unknown":
        default:
            return { ...base, action: "investigate", summary: "No information yet; a validation or discovery pass is needed." };
    }
}
/** Guard: is a string a valid canonical state? */
export function isOperationalState(value) {
    return OPERATIONAL_STATES.includes(value);
}
//# sourceMappingURL=health-vocabulary.js.map