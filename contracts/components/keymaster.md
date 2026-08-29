# Component Contract: The Book of Keymaster

**ID:** `keymaster`
**Book:** `books/book-of-keymaster/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Credential custody boundary: sanitized inventory/health/policy plus sealed, read-only use of approved bootstrap credentials.
**Inputs:** metadata/health facts, credential name/reference, explicit read-only consumer context
**Outputs:** sanitized readiness projection, inert policy/remediation proposal, or sealed credential object that cannot serialize its value
**Dependencies:** Trust Canal approval; Switchyard sanitized readiness; Prometheus discovery/gap requests; Talos qualification; Rhea health; Kronos readiness only
**Allowed touch:** metadata validation, health classification, inventory names/presence, read-only bootstrap resolution, sealed application at provider boundary
**Forbidden touch:** secret values in canonical state/logs/events; secret copying; plaintext lifecycle writes; raw provider bodies; auto account creation; billing; store/replace/revoke/rotate; scheduler; UI authority
**Authority:** NO_SELF_GRANT -- custody does not authorize acquisition, enablement, paid use or lifecycle mutation
**Evidence:** V2-011D; V2-011E; .othrys/project.json#systems/keymaster; runtime/os/keymaster.mjs; runtime/os/keymaster_vault.mjs

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: explicit inventory, health, or sealed read-only access request
- INPUT: finite sanitized facts plus an approved bootstrap reference when sealed access is required
- STATE: House remains secret-free; secret material stays only in external bootstrap source/closure
- BUDGET: one deterministic inventory/resolve operation per call
- EXIT CONDITION: sanitized result, sealed handle, proposal, or fail-closed denial
- EVIDENCE: runtime/os/keymaster.test.mjs; runtime/os/keymaster_vault.test.mjs
- STALL/FAILURE: malformed reference, missing credential, non-read-only consumer, secret serialization, unsafe lifecycle mutation or unknown policy fails closed
