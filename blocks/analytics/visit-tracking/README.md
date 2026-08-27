# @othrys-blocks/analytics-visit-tracking

Privacy-preserving, cookieless, pseudonymous daily visit tracking block implementing Port `analytics.visit_ingest@1`.

## Features
- **Daily Ephemeral Hashing**: SHA-256 hash using UTC date, ephemeral IP, User-Agent, and host-provided salt.
- **Zero Tracking State**: No client cookies or local storage required.
- **Sanitized Inputs**: Path normalization (stripping query parameters and fragments) and referrer hostname sanitization.
- **Pluggable Bridges**: Includes Memory, Supabase REST, and Vercel Geo bridges.

## Usage
```js
import { ingest, createIngestHandler, createSupabaseVisitBridge } from '@othrys-blocks/analytics-visit-tracking';

const bridge = createSupabaseVisitBridge({
  url: process.env.SUPABASE_URL,
  insertCredential: process.env.ANALYTICS_INSERT_KEY,
});

const handler = createIngestHandler({
  getSalt: () => process.env.VISIT_TRACKING_SALT,
  persistVisit: bridge.persistVisit,
});
```
