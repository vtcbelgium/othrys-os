# Block Passport: Visit Tracking

| Field | Value |
| :--- | :--- |
| **ID** | `block.analytics.visit-tracking` |
| **Version** | `0.1.1` |
| **Category** | `PRODUCT` |
| **Maturity** | `RAW` |
| **Port** | `analytics.visit_ingest@1` |

## Purpose
Privacy-first, cookieless, pseudonymous daily visit tracking and ingestion block. Provides ephemeral cryptographic visitor hashing, path normalization, sanitized referrer extraction, optional geo lookup, and pluggable storage bridges.

## Port Contract
- **Interface**: `analytics.visit_ingest@1`
- **Primary Operation**: `ingest(request, options)`

## Dependencies & Host Requirements
- **Required Configuration**:
  - `salt`: Cryptographic secret string provided at runtime (never hardcoded, no default).
  - `persistVisit`: Storage bridge function accepting a validated visit record.
  - `retentionDays`: Storage retention policy (host required, no Block default and no scheduler).
- **Optional Configuration**:
  - `resolveCountry`: Async function resolving ISO 3166-1 alpha-2 country code from request headers.
  - `captureReferrer`: Boolean flag (default `true`) allowing host to suppress referrer hostname logging.

## Architectural Invariants
- **No Event Bus**: Operates synchronously / point-to-point through storage bridges without global event listeners.
- **No Client State**: Zero cookies, zero LocalStorage, zero SessionStorage.
- **Secrets by Reference**: Secrets (salt, DB keys) must be supplied dynamically by the host application environment.
- **Storage Isolation**: Storage adapter implementation is decoupled from core business logic.

## 0.1.1 PATCH
V2 packaging/digest-canonicalization correction only. Capability, Port, privacy, state, and runtime semantics are unchanged from 0.1.0. Maturity remains RAW.
