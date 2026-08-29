# The Book of Keymaster

**Status:** OTHRYS OS credential-custody edition — evidence-bound and non-authoritative by itself.

## Purpose
Keymaster is the OS custody boundary for credentials: inventory, sanitized health, policy, and sealed use of approved local bootstrap secrets without exposing secret material to the House.

## Current house law
The House stores only metadata. Secret values stay outside canonical project state in an external bootstrap vault/source. Keymaster may discover which credential names exist, classify their health, and resolve a credential only as a sealed object at an explicit use boundary.

A sealed credential may be applied to a provider request or subprocess environment, but serialization, logs, projections, reports, Prometheus events, Mnemosyne and Hermes never receive the raw value.

Trust Canal remains approval authority for consequential credential actions. Switchyard consumes sanitized health/capacity only. Prometheus discovers opportunities and requests gaps; Keymaster owns credential custody. Talos owns qualification proof. Rhea may consume sanitized health. Kronos may use readiness evidence but owns no credential custody.
## Canonical evidence
- `V2-011D` / `V2-011E` metadata resident foundation
- `runtime/os/keymaster.mjs`
- `runtime/os/keymaster_vault.mjs`
- old `envSecretVault.ts`, Credential Broker and Prometheus-Keymaster partnership preserved by Great Harvest

## Bootstrap rule
The current local `.env` source is read-only. Keymaster may resolve from it, but may not write, rotate, replace, revoke, or copy secrets back into project files. A future managed vault must sit behind the same custody boundary.

## Partnership maxim
**Prometheus discovers. Keymaster evaluates/custodies. Talos qualifies. The operator approves acquisition.** Missing credentials are search prompts, not automatic rejection; deliberate disablement is not a gap.
