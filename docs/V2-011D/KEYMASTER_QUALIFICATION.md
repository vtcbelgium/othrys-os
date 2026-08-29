# V2-011D — Keymaster Resident Qualification

**Verdict:** QUALIFIED_FOR_ADAPTATION
**Great Harvest:** ADAPT

## Why Keymaster is next
Candidate comparison found real current stock in Keymaster, Nyx, Hermes, Visual Control, Hyperion-related intelligence and Metis. Keymaster has the clearest current OS dependency: V2 already excludes secrets and gates authority, but has no canonical credential metadata/health lifecycle domain. It complements rather than duplicates Trust Canal.

## Proven stock
- Sanitized credential manifest: metadata only; secret values forbidden.
- Pure 17-state credential health classifier from bounded signals.
- Inert per-risk validation policy; no scheduler and no billable validation method.
- High-risk access constraints as checkable policy data.
- SecretVault boundary: deny-by-default; secret can be used sealed but not read raw.
- Env bootstrap honestly refuses store/replace/revoke.
- Sanitized dashboard/incidents/remediation semantics.
## Proof
- Keymaster core security/domain/vault/validation: **68/68 PASS**.
- Mission 046 sanitized health excluding superseded Bell assertion: **8/8 PASS**.
- Mission 051 current remediation behavior: **8/8 PASS**.
- Old workspace `npm test --workspace othrys-keymaster` is blocked by a pre-existing BOM/PostCSS config discovery defect; direct test execution with equivalent Vitest globals proves the test bodies.
- Mission 046's old `one_degraded_one_alert` assertion is superseded by Mission 051 per-credential actionable Bell semantics; this is historical test drift, not a safe-core failure.

## V2 boundary
Trust Canal remains approval authority. Switchyard may consume sanitized credential/provider health but never resolves secrets. Rhea consumes sanitized health only. Kronos may depend on readiness evidence but does not absorb custody.

The first resident must not resolve or even carry secret values. To minimize exposure further than old Keymaster, V2 House inventory should not need a secret locator at all: credential identity, service/category/risk/configured/enabled/health/evidence timestamps/capability impact are enough for House intelligence. Vault-reference and sealed-secret use remain separately gated integration work.
## Reuse / adapt / defer / reject
**REUSE AS LAW:** no secret values in inventory/output; bounded structured health signals; closed health vocabulary; per-credential degradation; inert validation policy; explicit high-risk constraints; deny-by-default vault boundary; no raw secret return.

**ADAPT FIRST:** pure metadata-only inventory validator, health classifier, sanitized rollup, risk/policy projection, and non-executing remediation proposal. All outputs remain safe for House evidence and authority-free.

**DEFER:** vault resolution, sealed application to outbound requests, actual provider validation, rotation/replacement/revocation, encrypted/managed backend, account acquisition.

**REJECT FOR FIRST RESIDENT:** Hub Keymaster UI, Bell backend, scheduler, subprocess host, repo-state projections, Hermes/event fabric duplication, auto-rotation, provider calls, raw response bodies, any secret-bearing artifact.

## Next legal action
A separate House-admission mission may adapt the pure metadata/health/policy kernel. Secret resolution remains outside that admission.