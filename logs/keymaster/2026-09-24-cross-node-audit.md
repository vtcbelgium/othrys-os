# Keymaster Cross-Node Credential Audit — 2026-09-24

Status: SANITIZED READ-ONLY AUDIT  
Nodes: VTC-t590, Jeroen-Legion  
Secret values exposed: **false**

## Method

The audit used OTHRYS Keymaster's existing read-only sealed-access tooling:

- `tools/penta/keymaster-inventory.mjs`
- `tools/penta/keymaster-live-health.mjs`
- `runtime/os/keymaster_vault.mjs`
- `runtime/os/provider_probe.mjs`

No credential value was printed, copied into Git, rotated, revoked or replaced.

The default Keymaster bootstrap source `~/.config/othrys/keymaster.env` was absent on the T590. Therefore the initial canonical inventory result of zero credentials was **not** interpreted as "no credentials exist". Known read-only env sources were then audited individually through `OTHRYS_KEYMASTER_ENV_FILE`.

## T590 — env-backed credentials

| Source | Credential | Keymaster result |
| --- | --- | --- |
| `~/.config/othrys/deck.env` | `OTHRYS_DECK_CONTROL_TOKEN` | CONFIGURED_UNVERIFIED |
| same | `OTHRYS_DECK_TOKEN` | CONFIGURED_UNVERIFIED |
| same | `OTHRYS_ENGINEERING_TOKEN` | CONFIGURED_UNVERIFIED |
| `~/.config/othrys/mycelium.env` | `OTHRYS_TELEMETRY_TOKEN` | CONFIGURED_UNVERIFIED |
| `~/.claude-mem/.env` | `ANTHROPIC_API_KEY` | **INVALID — HTTP 401 — ACTION REQUIRED** |
| `~/.othrys/theia/moneyprinterturbo/.env` | `MPT_API_KEY` | CONFIGURED_UNVERIFIED |
| `~/vtc-office/.env` | `EBAY_CLIENT_SECRET` | CONFIGURED_UNVERIFIED |
| same | `SUPABASE_SERVICE_KEY` | CONFIGURED_UNVERIFIED |
| `~/vtc-platform/odysseus/.env` | none matching Keymaster credential naming rules | no credential row |

Only `ANTHROPIC_API_KEY` currently has an approved Keymaster zero-cost provider probe among these external sources. The 401 response classifies it as invalid under existing Keymaster law.

## Legion — env-backed credentials

| Source | Credential | Keymaster result |
| --- | --- | --- |
| Windows `~/.config/othrys/legion-worker.env` | `OTHRYS_ENGINEERING_TOKEN` | CONFIGURED_UNVERIFIED |
| WSL `~/.config/othrys/control-plane.env` | `OTHRYS_CONTROL_PLANE_TOKEN` | CONFIGURED_UNVERIFIED |
| WSL `~/.othrys/theia/moneyprinterturbo/.env` | `MPT_API_KEY` | CONFIGURED_UNVERIFIED |
| WSL `~/.config/othrys/restic.env` | none matching Keymaster credential naming rules | no credential row |

The Legion has no canonical `keymaster.env` source either.

## Standalone secret surfaces

These were identified by path/metadata only. Their contents were not read through the audit.

### T590

- `~/othrys-recovery/recovery.token` — mode 600.
- `~/.config/othrys/quickdesk/pairing_private.pem` — mode 600.
- `~/.config/Claude/buddy-tokens.json` — mode 600.
- `~/.docker/.token_seed` — mode 600.

### Legion / WSL

- `~/.config/othrys/control-plane.token` — previously observed owner-only.
- `~/.config/othrys/restic.pass` — found with mode 644 and hardened to **600** during this audit.
- `~/.config/othrys/restic.env` — hardened to **600** alongside the Restic password file.
- Cursor server and Claude remote daemon token files were observed as runtime-managed ephemeral credential surfaces; they were not imported into Keymaster.

A T590 helper named `othrys-cloudflare-install-token` was inspected only after redaction and proved to be an installer script that prompts for a Cloudflare tunnel token. No installed Cloudflare token file was present in `~/.config/othrys`.

## AI-provider / gateway findings

Environment scans on both nodes found no persistent:

- `TYPESAFE_API_KEY`
- `AI_GATEWAY_API_KEY`
- `OPENROUTER_API_KEY`
- `VERCEL_TOKEN`
- `CLOUDFLARE_API_TOKEN`
- `NETLIFY_AUTH_TOKEN`

OTHRYS Web's preferred Jev path is therefore Vercel's short-lived deployment OIDC rather than a stored Gateway secret.

## Keymaster coverage finding

The current global Keymaster inventory assumes one canonical bootstrap env source. The real OTHRYS estate currently has credentials distributed across several read-only env files plus standalone application-managed secret files.

Consequences:

1. A missing `keymaster.env` currently yields a misleading empty global inventory.
2. Existing Keymaster sealed access and safe probes work correctly when pointed at an explicit env source.
3. Keymaster needs a future metadata-only multi-source registry/federated inventory so coverage can be complete without copying secret values.
4. Standalone high-risk secrets need an explicit custody classification: Keymaster-managed sealed file reference vs application-managed ephemeral secret.
5. The invalid Anthropic credential should not be treated as usable until it is intentionally replaced/removed by the operator.

## Changes made

- No secret values changed.
- No credentials copied or centralized.
- No account/provider mutation performed.
- Legion Restic password/config permissions changed from group/world-readable posture to owner-only mode 600.
- No Jev or AI provider key was created.

Authority granted: **false**.
