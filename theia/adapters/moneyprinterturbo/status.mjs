import { readFile } from 'node:fs/promises';
import { createMoneyPrinterTurboAdapter } from './adapter.mjs';
import { normalizeCapabilityRecord } from '../../../runtime/os/capability_registry.mjs';

const capabilityPath = new URL('./capability.json', import.meta.url);
const raw = JSON.parse(await readFile(capabilityPath, 'utf8'));
const capability = normalizeCapabilityRecord(raw, { now: raw.lastVerifiedAt || raw.asOf });

let liveHealth = 'DOWN';
let detail = null;
try {
  detail = await createMoneyPrinterTurboAdapter().health();
  liveHealth = detail.health;
} catch (error) {
  detail = { error: error?.code || error?.message || 'MPT_HEALTH_FAILED' };
}

process.stdout.write(JSON.stringify({
  schema: 'othrys.theia.adapter-status.v1',
  capabilityId: capability.id,
  provider: capability.provider,
  readiness: capability.readiness,
  certifiedHealth: capability.health,
  liveHealth,
  lifecycle: capability.lifecycle,
  lastVerifiedAt: capability.lastVerifiedAt,
  detail,
  secretValuesExposed: false,
  authorityGranted: false
}, null, 2) + '\n');
