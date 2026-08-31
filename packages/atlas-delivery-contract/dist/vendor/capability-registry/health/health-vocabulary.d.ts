/**
 * The canonical operational state — the mission's calibrated vocabulary. Each
 * value is a DISTINCT condition with distinct remediation; none is a synonym for
 * another. "not-configured" (no reference exists) ≠ "unverified" (reference exists,
 * never checked) ≠ "invalid" (checked, rejected) ≠ "provider-unavailable"
 * (the provider, not us, is down).
 */
export type OperationalState = "unknown" | "not-configured" | "configured" | "unverified" | "healthy" | "degraded" | "quota-limited" | "rate-limited" | "expired" | "revoked" | "invalid" | "insufficient-scope" | "provider-unavailable" | "project-suspended" | "network-unreachable" | "validation-blocked" | "disabled-by-policy" | "account-action-required" | "rotation-due" | "deprecated" | "superseded";
export declare const OPERATIONAL_STATES: readonly OperationalState[];
/** Which kind of thing a state is describing. The same word ("degraded") means
 *  something different about a CREDENTIAL vs a PROVIDER, so a fact must say which. */
export type StateFacet = "credential" | "provider" | "capability";
/** States that describe a CREDENTIAL's own condition. */
export declare const CREDENTIAL_STATES: readonly OperationalState[];
/** States that describe the PROVIDER's condition (not our credential). */
export declare const PROVIDER_STATES: readonly OperationalState[];
/** States that describe a CAPABILITY's catalog condition. */
export declare const CAPABILITY_STATES: readonly OperationalState[];
/** Canonical operational readiness — reused verbatim from the Registry record so a
 *  state projects to the same readiness everywhere. */
export type Readiness = "ready" | "limited" | "disabled" | "unverified";
/** Incident severity — reused from Keymaster's incident model (info/warning/critical). */
export type IncidentSeverity = "info" | "warning" | "critical";
/** States where the capability is fully usable right now. */
export declare const OK_STATES: ReadonlySet<OperationalState>;
/** States that require a human (typically the CEO) to act. */
export declare const ACTION_REQUIRED_STATES: ReadonlySet<OperationalState>;
/** States that are transient and MAY clear on their own (retry is appropriate). */
export declare const TRANSIENT_STATES: ReadonlySet<OperationalState>;
/** States that are end-of-life for a capability (no retry restores them). */
export declare const TERMINAL_CAPABILITY_STATES: ReadonlySet<OperationalState>;
export declare function isOk(state: OperationalState): boolean;
export declare function needsHumanAction(state: OperationalState): boolean;
export declare function isTransient(state: OperationalState): boolean;
/** Is an automatic retry appropriate? Only for transient, provider/network-side
 *  conditions — never for a credential the CEO must fix (that would just spin). */
export declare function retryAppropriate(state: OperationalState): boolean;
/** Map a state to the readiness it implies — the single source of that projection. */
export declare function readinessOf(state: OperationalState): Readiness;
/** Map a state to a default incident severity. Calibrated, not collapsed. */
export declare function severityOf(state: OperationalState): IncidentSeverity;
/** Is a transition from `from` to `to` allowed? A self-transition (re-observing the
 *  same state) is always allowed. */
export declare function canTransition(from: OperationalState, to: OperationalState): boolean;
/** The states reachable from `from` in one step (excluding self). */
export declare function nextStates(from: OperationalState): readonly OperationalState[];
/** A deterministic remediation class per state — the "what should happen" without
 *  naming a provider. Concrete provider steps come from Keymaster's RemediationGuide;
 *  this is the neutral routing on top of it. */
export interface RemediationClass {
    readonly state: OperationalState;
    /** Must a human (CEO) act? */
    readonly userMustAct: boolean;
    /** Is an automatic retry appropriate? */
    readonly autoRetry: boolean;
    /** The class of action, in neutral terms. */
    readonly action: "none" | "wait-and-retry" | "provide-credential" | "replace-credential" | "widen-scope" | "reactivate-account" | "re-enable" | "migrate-to-successor" | "await-provider" | "investigate";
    /** One neutral sentence the website can show above the provider-specific guide. */
    readonly summary: string;
}
export declare function remediationClass(state: OperationalState): RemediationClass;
/** Guard: is a string a valid canonical state? */
export declare function isOperationalState(value: string): value is OperationalState;
//# sourceMappingURL=health-vocabulary.d.ts.map