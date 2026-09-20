import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';

import { handleWebControlRequest } from './web_control_http.ts';

function request(method: string, url: string, body?: unknown) {
  const stream = Readable.from(body === undefined ? [] : [JSON.stringify(body)]);
  return Object.assign(stream, {
    method,
    url,
    headers: {
      authorization: 'Bearer test-token',
      'content-type': 'application/json',
    },
  }) as any;
}

function response() {
  const state = { status: 0, body: '' };
  const value = {
    writeHead(code: number) { state.status = code; return value; },
    end(body?: unknown) { state.body = String(body ?? ''); return value; },
  } as any;
  return { value, state };
}
test('durable admission survives a later planner failure', async () => {
  const root = mkdtempSync(join(tmpdir(), 'web-control-resilience-'));
  const ledger = join(root, 'admission.jsonl');
  const envelopes = join(root, 'commands');
  try {
    const first = response();
    await handleWebControlRequest(
      request('POST', '/v1/commands', {
        missionId: 'WEB-RESILIENCE-001',
        command: 'Build a tiny governed proof.',
        actor: { role: 'ceo', channel: 'othrys-web' },
        context: 'resilience test',
      }),
      first.value,
      {
        token: 'test-token',
        ledgerPath: ledger,
        commandEnvelopeDir: envelopes,
        commandPlanner: () => {
          const error: any = new Error('allocator rejected sidecar');
          error.code = 'MISSION_ID_FILENAME_AMBIGUOUS';
          throw error;
        },
      },
    );

    assert.equal(first.state.status, 202);
    const admitted = JSON.parse(first.state.body);
    assert.equal(admitted.status, 'accepted');
    assert.equal(admitted.state, 'ADMITTED');
    assert.equal(admitted.planningDeferred, true);
    assert.equal(admitted.planningError, 'MISSION_ID_FILENAME_AMBIGUOUS');
    assert.match(readFileSync(ledger, 'utf8'), /WEB-RESILIENCE-001/);

    const restored = response();
    await handleWebControlRequest(
      request('GET', '/v1/commands/WEB-RESILIENCE-001'),
      restored.value,
      {
        token: 'test-token',
        ledgerPath: ledger,
        commandEnvelopeDir: envelopes,
        commandPlanner: () => {
          throw new Error('still broken');
        },
      },
    );
    assert.equal(restored.state.status, 200);
    const status = JSON.parse(restored.state.body);
    assert.equal(status.status, 'accepted');
    assert.equal(status.planningDeferred, true);
    assert.equal(status.planningError, 'PLANNING_FAILURE');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
