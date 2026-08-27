import { ingest } from '../../blocks/analytics/visit-tracking/src/index.js';import { createMemoryStorageBridge } from '../../blocks/analytics/visit-tracking/src/index.js';import { PORT } from '../../blocks/analytics/visit-tracking/src/index.js';

const salt = process.env.V2_003A_VISIT_SALT;
const output = process.env.V2_003A_OUTPUT;

const record = {
  path: "/catalog/item?utm=secret#private",
  referrer: "https://Example.COM/private/path?q=secret",
  ip: "203.0.113.9",
  userAgent: "OTHRYS-V2-003A",
  occurredAt: "2026-08-27T10:00:00.000Z"
};

const bridge = createMemoryStorageBridge();
const ingestResult = ingest(bridge, salt, record);

console.log(JSON.stringify(ingestResult, null, 2));