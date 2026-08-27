# Logical Schema: Visit Record v1

Contract Port: `analytics.visit_ingest@1`

## Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `path` | `string` (max 200) | Yes | Normalized request path or hash route (without query strings or secondary fragments) |
| `visitorHash` | `string` (64 hex) | Yes | SHA-256 pseudonymous daily visitor hash (`YYYY-MM-DD|ip|ua|salt`) |
| `country` | `string` (ISO 2 alpha) | No | 2-letter uppercase ISO country code, or `null` if unresolved/invalid |
| `referrerHost` | `string` (max 100) | No | Normalized lowercase referrer hostname, or `null` if absent/disabled |
| `occurredAt` | `string` (ISO 8601 UTC) | Yes | Timestamp of the visit occurrence |

## Privacy & Invariants
- Raw IP addresses and User-Agent headers are NEVER stored.
- Full referrer URLs containing query parameters or user identifiers are NEVER stored.
- Cookies, LocalStorage, and SessionStorage are NOT utilized.
- Retention is HOST REQUIRED (retentionDays). The Block has no default and no scheduler.
