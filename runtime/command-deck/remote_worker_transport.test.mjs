import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { transportWorkerJob } from './remote_worker_transport.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'worker-transport-'));
  const requests = join(root, 'missions', 'worker-requests');
  const dispatches = join(root, 'missions', 'dispatch-tickets');
  mkdirSync(requests, { recursive: true });
  mkdirSync(dispatches, { recursive: true });
  const request = {
    schema_version: 'othrys.worker-request.v0.1',
    job_id: 'JOB-abc123',
    node_id: 'legion',
    capability: 'engineering.patch',
    workspace: 'C:/workspace',
    task: 'smoke',
    allowed_paths: ['docs/WEB-SMOKE.md'],
    deny_paths: [],
    timeout_sec: 30,
    metadata: { mission_id: 'V2-999A', builder_id: 'qwen3-builder', status: 'READY_FOR_DISPATCH' },
  };
  const requestRaw = JSON.stringify(request, null, 2) + '\n';
  const dispatch = {
    schema: 'othrys.os.dispatch-ticket.v1',
    ticketId: 'DISPATCH-abc123',
    jobId: request.job_id,
    missionId: request.metadata.mission_id,
    builderId: request.metadata.builder_id,
    requestDigest: createHash('sha256').update(requestRaw).digest('hex'),
    status: 'DISPATCH_AUTHORIZED',
    authorityGranted: true,
    executionStarted: false,
  };
  const requestPath = join(requests, 'JOB-abc123.json');
  const dispatchPath = join(dispatches, 'DISPATCH-abc123.json');
  writeFileSync(requestPath, requestRaw);
  writeFileSync(dispatchPath, JSON.stringify(dispatch, null, 2) + '\n');
  return { root, requestPath, dispatchPath, request, dispatch };
}

test('authorized dispatch is transported and stored as canonical worker evidence', async () => {
  const f = fixture();
  try {
    const worker = {
      schema_version: 'othrys.worker-result.v0.1',
      mission_id: f.dispatch.missionId,
      job_id: f.dispatch.jobId,
      node_id: 'legion',
      builder_id: f.dispatch.builderId,
      ok: true,
      allowed_paths: f.request.allowed_paths,
      changed_files: f.request.allowed_paths,
      out_of_scope_changes: [],
    };
    let sent;
    const result = await transportWorkerJob({
      root: f.root,
      requestPath: f.requestPath,
      dispatchPath: f.dispatchPath,
      baseUrl: 'http://legion:8766',
      token: 'secret',
      fetchImpl: async (url, init) => {
        sent = { url, body: JSON.parse(init.body) };
        return new Response(JSON.stringify({ ok: true, workerResult: worker }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      },
    });
    assert.equal(sent.url, 'http://legion:8766/jobs');
    assert.equal(sent.body.token, 'secret');
    assert.equal(result.status, 'WORKER_COMPLETED');
    assert.equal(result.executionStarted, true);
    const stored = JSON.parse(readFileSync(join(f.root, 'missions', 'V2-999A.worker-result.json'), 'utf8'));
    assert.equal(stored.job_id, 'JOB-abc123');
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
test('mismatched worker identity is rejected', async () => {
  const f = fixture();
  try {
    await assert.rejects(
      transportWorkerJob({
        root: f.root,
        requestPath: f.requestPath,
        dispatchPath: f.dispatchPath,
        baseUrl: 'http://legion:8766',
        token: 'secret',
        fetchImpl: async () => new Response(JSON.stringify({
          ok: true,
          workerResult: {
            schema_version: 'othrys.worker-result.v0.1',
            mission_id: 'V2-WRONG',
            job_id: f.dispatch.jobId,
            builder_id: f.dispatch.builderId,
            ok: true,
          },
        }), { status: 200, headers: { 'content-type': 'application/json' } }),
      }),
      /WORKER_RESULT_IDENTITY_MISMATCH/,
    );
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
