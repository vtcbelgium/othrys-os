export function statusOverlay(status) {
    switch (status) {
        case "operational": return { label: "Operational", icon: "●", tone: "good", accessibleText: "running in a real deployment" };
        // "carries", not "passes". The collector assigns `tested` from
        // hasTestFile(srcDir) — a FILE EXISTING (collector/build.ts). It cannot know
        // whether the test passes, is skipped, or has ever been run. This string used
        // to say "implemented with passing executable tests", and othrys.be rendered
        // it on four surfaces as "53 systems proven by executable tests". That was a
        // file-existence check reported as an execution (Mission 007, ADR-0047).
        // Whether a suite PASSES is the Proof Engine's claim, and only it can make it.
        case "tested": return { label: "Tested", icon: "✓", tone: "good", accessibleText: "carries executable tests (a test file exists; whether it passes is the Proof Engine's claim)" };
        case "scaffolded": return { label: "Scaffolded", icon: "▣", tone: "neutral", accessibleText: "implemented and compiles, not fully proven" };
        case "designed": return { label: "Designed", icon: "✎", tone: "neutral", accessibleText: "a design record exists; little or no code" };
        case "planned": return { label: "Planned", icon: "○", tone: "muted", accessibleText: "named in the roadmap, not built" };
        case "blocked": return { label: "Blocked", icon: "▲", tone: "bad", accessibleText: "cannot proceed — external dependency or gate" };
        case "deprecated": return { label: "Deprecated", icon: "⊘", tone: "warn", accessibleText: "superseded or discouraged" };
        case "unknown":
        default: return { label: "Unknown", icon: "?", tone: "muted", accessibleText: "status could not be determined from evidence" };
    }
}
export function healthOverlay(health) {
    switch (health) {
        case "healthy": return { label: "Healthy", icon: "✓", tone: "good", accessibleText: "verified working" };
        case "degraded": return { label: "Degraded", icon: "~", tone: "warn", accessibleText: "working but impaired (provider-side)" };
        case "quota-limited": return { label: "Quota-limited", icon: "◔", tone: "warn", accessibleText: "usage quota low or exhausted" };
        case "rate-limited": return { label: "Rate-limited", icon: "⏱", tone: "warn", accessibleText: "temporarily throttled" };
        case "expired": return { label: "Expired", icon: "⌛", tone: "bad", accessibleText: "credential lapsed" };
        case "revoked": return { label: "Revoked", icon: "⊗", tone: "bad", accessibleText: "credential withdrawn" };
        case "invalid": return { label: "Invalid", icon: "✕", tone: "bad", accessibleText: "credential rejected" };
        case "insufficient-scope": return { label: "Insufficient scope", icon: "◑", tone: "warn", accessibleText: "authenticated but under-privileged" };
        case "provider-unavailable": return { label: "Provider unavailable", icon: "⚠", tone: "bad", accessibleText: "the provider is down or unreachable" };
        case "project-suspended": return { label: "Project suspended", icon: "⏸", tone: "bad", accessibleText: "provider account/project paused" };
        case "network-unreachable": return { label: "Network unreachable", icon: "⌁", tone: "warn", accessibleText: "could not reach the provider" };
        case "validation-blocked": return { label: "Validation blocked", icon: "▤", tone: "warn", accessibleText: "validation could not run" };
        case "disabled-by-policy": return { label: "Disabled (policy)", icon: "⏻", tone: "muted", accessibleText: "deliberately turned off (safe default / CEO choice)" };
        case "account-action-required": return { label: "Account action needed", icon: "!", tone: "bad", accessibleText: "the provider account needs a human action" };
        case "rotation-due": return { label: "Rotation due", icon: "↻", tone: "warn", accessibleText: "a rotation window has opened" };
        case "not-configured": return { label: "Not configured", icon: "○", tone: "muted", accessibleText: "no credential configured" };
        case "configured": return { label: "Configured", icon: "◇", tone: "neutral", accessibleText: "a reference exists; not yet verified" };
        case "unverified": return { label: "Unverified", icon: "?", tone: "muted", accessibleText: "exists, never validated" };
        case "deprecated": return { label: "Deprecated", icon: "⊘", tone: "warn", accessibleText: "discouraged" };
        case "superseded": return { label: "Superseded", icon: "⇄", tone: "warn", accessibleText: "replaced by another" };
        case "n/a": return { label: "—", icon: "·", tone: "muted", accessibleText: "no runtime health" };
        case "unknown":
        default: return { label: "Unknown", icon: "?", tone: "muted", accessibleText: "no health information" };
    }
}
export function riskOverlay(risk) {
    switch (risk) {
        case "critical": return { label: "Critical", icon: "✕", tone: "bad", accessibleText: "critical architectural risk" };
        case "high": return { label: "High", icon: "▲", tone: "bad", accessibleText: "high risk" };
        case "medium": return { label: "Medium", icon: "◆", tone: "warn", accessibleText: "medium risk" };
        case "low": return { label: "Low", icon: "▽", tone: "neutral", accessibleText: "low risk" };
        case "informational":
        default: return { label: "Info", icon: "·", tone: "muted", accessibleText: "informational" };
    }
}
//# sourceMappingURL=overlays.js.map