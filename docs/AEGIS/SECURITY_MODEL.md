# Aegis Security Model

**Status:** ACTIVE FOUNDATION / NEGATIVE AUTHORITY ONLY
**Titan:** Aegis
**Primary invariant:** Aegis may reduce effective authority but cannot create it.

## Trust boundaries
Aegis assumes any agent, model, prompt, tool response, dependency, or local runtime may become compromised.

The hard security boundary therefore lives outside model reasoning wherever practical:
- Trust Canal admission;
- operating-system permissions and sandboxing;
- Keymaster secret custody;
- endpoint security and network policy;
- content-bound runtime/model identity;
- independent logs/recovery evidence.

AI judgment is a sensor. It is never the only lock.

## Monotonic verdict lattice
`PASS < OBSERVE < WARN < RESTRICT < DENY < LOCK`

Combining security evidence always selects the stronger verdict. De-escalation requires a new governed event/workflow outside the current evaluation; an agent cannot talk a live verdict down.

## Authority composition
Aegis receives a pre-existing authority state from the rest of OTHRYS.

`effectiveGranted = baseGranted AND aegisDecision < DENY`

Therefore:
- base denied + Aegis PASS = denied;
- base granted + Aegis DENY = denied;
- base granted + Aegis RESTRICT = granted only under the separately enforced restricted capability set.

Aegis has no `ALLOW` verdict. PASS means “Aegis adds no further restriction,” not “execution is authorized.”

## Hard LOCK classes
- `AEGIS_POLICY_TAMPER`
- `RECOVERY_BACKUP_DESTRUCTION`
- `MASTER_SECRET_EXTRACTION`
- `SECURITY_LOGGING_DISABLE`
- `SENTINEL_TAKEOVER`

These classes are deterministic and cannot be downgraded by model output.

## Consequential fail-closed checks
Consequential actions are denied if Mission binding, workload identity, or required capability is absent/invalid.

## Agent identity
Language/style fingerprinting is supporting evidence only.

Preferred identity stack, in descending hardness:
1. hardware/workload identity when available;
2. signed or protected runtime/session identity;
3. exact runtime/model content digest and provenance;
4. Mission-bound short-lived capability;
5. sandbox/network location;
6. process/tool behavior history;
7. linguistic/interaction “accent.”

A copied accent must not cross a cryptographic or capability boundary.

## Telemetry privacy
Aegis records metadata required to reconstruct security events, not secrets.

Raw passwords, bearer tokens, cookies, API keys, and credential values are forbidden from durable Aegis telemetry. Redaction is defense-in-depth; callers remain responsible for not supplying unnecessary sensitive content.

## Hecatoncheires
Hecatoncheires is not a competing security authority. It is the many-handed defensive posture/enforcement family beneath Aegis.
Its existing eleven-hand posture remains independently evidence-scored as PRESENT_AND_TESTED, PARTIAL, or ABSENT.

## Current non-goals
This foundation does not yet:
- kill processes;
- mutate firewall rules;
- revoke credentials;
- quarantine files;
- claim prompt-injection detection is reliable;
- claim TPM/attestation is implemented;
- claim off-host logging is implemented;
- claim sandboxing is universal.

Those features require explicit adapters, negative tests, rollback/recovery proof and independent Talos verification before authority expands.

## Failure rule
Security mechanism failure must never silently become permission.

Malformed consequential evidence is denied. Missing identity/capability/Mission evidence is denied. Aegis implementation failure is an incident, not an authorization path.

## Evidence
- `runtime/os/aegis.mjs`
- `runtime/os/aegis.test.mjs`
- `docs/HECATONCHEIRES_POSTURE.json`
