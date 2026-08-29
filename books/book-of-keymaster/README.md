# The Book of Keymaster

**Status:** OTHRYS OS housekeeping edition — evidence-bound, non-authoritative by itself.

## Purpose
Sanitized credential metadata, health classification and inert lifecycle policy.

## Current house law
Keymaster gives OTHRYS a truthful view of credential readiness without putting credential material into the House. The resident validates metadata-only records, classifies bounded health signals, projects per-record and global health, exposes inert risk policy, and creates non-executing remediation proposals.

The V2 resident deliberately carries no secret value, secret locator, vault handle, raw provider response, or runtime credential. It performs no provider calls and cannot store, replace, revoke, rotate, acquire, or resolve credentials.
Trust Canal remains approval authority for any future consequential credential action. Switchyard may consume sanitized health only. Rhea may consume sanitized health only. Kronos may depend on readiness evidence but owns no credential custody.

## Canonical evidence
- `V2-011D`
- `.othrys/project.json#systems/keymaster`
- `runtime/os/keymaster.mjs`

## Preserved quarry / provenance
- `othrys-core/titan/keymaster/**`
- Missions 046/051 and old Keymaster office evidence preserved by the Great Harvest

## Book rule
This Book must never become a vault, credential broker, account manager, scheduler, rotation engine, or second authority surface.