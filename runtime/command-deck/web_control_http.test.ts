import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import http from 'node:http';

const dir = dirname(fileURLToPath(import.meta.url));

async function startServer(port: number, ledger: string, auth: 'token' | 'verifier' = 'token', brainUrl = '') {
  const env = {
    ...process.env,
    OTHRYS_DECK_TOKEN: 'read-token',
    OTHRYS_DECK_CONTROL_TOKEN: auth === 'token' ? 'web-control-token' : '',
    OTHRYS_DECK_CONTROL_TOKEN_SHA256: auth === 'verifier'
      ? createHash('sha256').update('web-control-token', 'utf8').digest('hex')
      : '',
    OTHRYS_DECK_ADMISSION_LEDGER: ledger,
    OTHRYS_DECK_INTENT_FILE: join(dirname(ledger), 'intents.jsonl'),
    OTHRYS_LEGION_WORKSPACE: 'C:/Users/othry/Projects/othrys-os',
    OTHRYS_DECK_BIND: '127.0.0.1',
    OTHRYS_DECK_PORT: String(port),
    OTHRYS_LIGHT_WARMUP: '0',
    ...(brainUrl ? {
      OTHRYS_LEGION_WORKER_URL: brainUrl,
      OTHRYS_ENGINEERING_TOKEN: 'brain-test-token',
    } : {}),
  };
  const child = spawn(process.execPath, [join(dir, 'server.mjs')], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server timeout')), 4000);
    child.stdout.on('data', (data) => {
      if (String(data).includes('"ready":true')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on('exit', (code) => reject(new Error('server exited ' + code)));
  });
  return child;
}



async function startBrainStub(port: number) {
  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/brain/router') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'NOT_FOUND' }));
      return;
    }
    let raw = '';
    for await (const chunk of req) raw += String(chunk);
    const body = JSON.parse(raw);
    if (body.token !== 'brain-test-token') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'BRAIN_UNAUTHORIZED' }));
      return;
    }
    const observation = {
      schema: 'othrys.os.jev-observation.v1',
      mode: 'TRAINING',
      runDigest: 'a'.repeat(64),
      observationDigest: 'b'.repeat(64),
      circuitId: 'router',
      provider: 'OPENROUTER',
      requestedModel: 'jev-1.13.0',
      resolvedModel: 'typesafe/jev-1.13-20260917',
      questionSetId: 'router.v1',
      answers: {
        task_type: { type: 'choice', choice: 'status' },
        needs_repo: { type: 'noul', noul: 0.8 },
        needs_web: { type: 'noul', noul: 0.1 },
        needs_execution: { type: 'noul', noul: 0.03 },
        risk: { type: 'score', score: 0 },
      },
      usage: { input_tokens: 100, output_tokens: 20, cost: 0.0000042 },
      authorityGranted: false,
      actionApplied: false,
      executionStarted: false,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      brain: {
        schema: 'othrys.legion.brain-response.v1',
        observation,
        transport: { provider: 'OPENROUTER', latencyMs: 250, actualCostUsd: 0.0000042 },
        authorityGranted: false,
        actionApplied: false,
        executionStarted: false,
      },
    }));
  });
  await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', resolve));
  return server;
}

function command(missionId: string, text = 'Inspect current OTHRYS state.') {
  return {
    missionId,
    command: text,
    actor: { role: 'ceo', channel: 'othrys-web' },
    context: 'Web command contract test.',
  };
}

test('SPEC-031 Web bridge admits durably and returns Web-compatible status', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'othrys-web-bridge-'));
  const ledger = join(tmp, 'admission.jsonl');
  const port = 18821;
  let child = await startServer(port, ledger);
  try {
    let response = await fetch('http://127.0.0.1:' + port + '/healthz');
    assert.equal(response.status, 200);

    response = await fetch('http://127.0.0.1:' + port + '/v1/commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command('WEB-TEST-001')),
    });
    assert.equal(response.status, 401);

    response = await fetch('http://127.0.0.1:' + port + '/v1/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer web-control-token',
      },
      body: JSON.stringify(command('WEB-TEST-001')),
    });
    assert.equal(response.status, 202);
    const admitted = await response.json();
    assert.equal(admitted.status, 'accepted');
    assert.equal(admitted.state, 'ADMITTED');
    assert.equal(admitted.canonical, true);
    assert.equal(admitted.stage, 'Awaiting governed planning');
    assert.match(admitted.promptDigest, /^[a-f0-9]{64}$/);
    assert.equal(admitted.evidence[0].type, 'command.admitted');

    response = await fetch('http://127.0.0.1:' + port + '/v1/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer web-control-token',
      },
      body: JSON.stringify(command('WEB-TEST-001')),
    });
    assert.equal(response.status, 202);
    assert.equal(readFileSync(ledger, 'utf8').trim().split(/\r?\n/).length, 1);

    child.kill();
    await new Promise((resolve) => child.once('exit', resolve));
    child = await startServer(port, ledger);

    response = await fetch(
      'http://127.0.0.1:' + port + '/v1/commands/WEB-TEST-001',
      { headers: { Authorization: 'Bearer web-control-token' } },
    );
    assert.equal(response.status, 200);
    const restored = await response.json();
    assert.equal(restored.promptDigest, admitted.promptDigest);
    assert.equal(restored.admittedAt, admitted.admittedAt);

    response = await fetch('http://127.0.0.1:' + port + '/v1/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer web-control-token',
      },
      body: JSON.stringify(command('WEB-TEST-001', 'Different command.')),
    });
    assert.equal(response.status, 409);
    const conflict = await response.json();
    assert.equal(conflict.error, 'MISSION_ID_CONFLICT');
  } finally {
    child.kill();
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('SPEC-031 bridge never grants execution authority', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'othrys-web-bridge-auth-'));
  const ledger = join(tmp, 'admission.jsonl');
  const port = 18822;
  const child = await startServer(port, ledger);
  try {
    const response = await fetch('http://127.0.0.1:' + port + '/v1/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer web-control-token',
      },
      body: JSON.stringify(command('WEB-TEST-002')),
    });
    const body = await response.json();
    assert.equal(response.status, 202);
    assert.equal('executionStarted' in body, false);
    assert.equal('authorityGranted' in body, false);
    const stored = JSON.parse(readFileSync(ledger, 'utf8').trim());
    assert.equal(stored.actor.role, 'ceo');
    assert.equal(stored.actor.channel, 'othrys-web');
    assert.equal(stored.state, 'ADMITTED');
  } finally {
    child.kill();
    rmSync(tmp, { recursive: true, force: true });
  }
});


test('SPEC-031 Web bridge accepts a one-way bearer verifier without storing the plaintext token', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'othrys-web-bridge-verifier-'));
  const ledger = join(tmp, 'admission.jsonl');
  const port = 18823;
  const child = await startServer(port, ledger, 'verifier');
  try {
    let response = await fetch('http://127.0.0.1:' + port + '/readyz');
    assert.equal(response.status, 200);

    response = await fetch('http://127.0.0.1:' + port + '/v1/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer web-control-token',
      },
      body: JSON.stringify(command('WEB-TEST-VERIFIER')),
    });
    assert.equal(response.status, 202);
    const body = await response.json();
    assert.equal(body.status, 'accepted');

    response = await fetch('http://127.0.0.1:' + port + '/v1/commands/WEB-TEST-VERIFIER', {
      headers: { Authorization: 'Bearer wrong-token' },
    });
    assert.equal(response.status, 401);
  } finally {
    child.kill();
    rmSync(tmp, { recursive: true, force: true });
  }
});


test('SPEC-031 Web bridge exposes the live system projection read-only', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'othrys-web-system-read-'));
  const ledger = join(tmp, 'admission.jsonl');
  const port = 18824;
  const child = await startServer(port, ledger, 'verifier');
  try {
    let response = await fetch('http://127.0.0.1:' + port + '/v1/system');
    assert.equal(response.status, 401);

    response = await fetch('http://127.0.0.1:' + port + '/v1/system', {
      headers: { Authorization: 'Bearer web-control-token' },
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.schema, 'othrys.command-deck.status.v1');
    assert.equal(body.authorityGranted, false);
    assert.equal(body.controlsEnabled, false);
    assert.ok('workState' in body);
    assert.ok('osSurface' in body);
    assert.ok('operatingMode' in body);
  } finally {
    child.kill();
    rmSync(tmp, { recursive: true, force: true });
  }
});


test('Web Builder activation is authenticated and fails closed without governed planning', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'othrys-web-activation-http-'));
  const ledger = join(tmp, 'admission.jsonl');
  const port = 18826;
  const child = await startServer(port, ledger, 'verifier');
  try {
    let response = await fetch('http://127.0.0.1:' + port + '/v1/commands/WEB-NOT-PLANNED/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowedWritePaths: ['docs/proof.md'] }),
    });
    assert.equal(response.status, 401);

    response = await fetch('http://127.0.0.1:' + port + '/v1/commands/WEB-NOT-PLANNED/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer web-control-token',
      },
      body: JSON.stringify({ allowedWritePaths: ['docs/proof.md'] }),
    });
    assert.equal(response.status, 409);
    const body = await response.json();
    assert.equal(body.error, 'GOVERNED_PLAN_REQUIRED');
    assert.equal(body.canonical, false);
  } finally {
    child.kill();
    rmSync(tmp, { recursive: true, force: true });
  }
});


test('full front door uses Jev brain, completes FAST read-only work, and returns persisted result', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'othrys-brain-e2e-'));
  const ledger = join(tmp, 'admission.jsonl');
  const deckPort = 18827;
  const brainPort = 18828;
  const brain = await startBrainStub(brainPort);
  const child = await startServer(deckPort, ledger, 'token', 'http://127.0.0.1:' + brainPort);
  try {
    const response = await fetch('http://127.0.0.1:' + deckPort + '/v1/commands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer web-control-token',
      },
      body: JSON.stringify(command('WEB-BRAIN-E2E', 'Inspect current OTHRYS status. Read only.')),
    });
    assert.equal(response.status, 202);
    const body = await response.json();
    assert.equal(body.dispatch.schema, 'othrys.os.web-command-plan.v1');
    assert.equal(body.dispatch.status, 'NO_MISSION_REQUIRED');
    assert.equal(body.dispatch.brainSource, 'JEV_CORTEX');
    assert.equal(body.dispatch.brainLane, 'FAST');
    assert.equal(body.dispatch.brainExecutor, 'deterministic.status');
    assert.equal(body.dispatch.brainResult.schema, 'othrys.os.brain-result.v1');
    assert.equal(body.dispatch.brainResult.status, 'COMPLETED');
    assert.equal(body.dispatch.brainResult.output.kind, 'SYSTEM_STATUS');
    assert.equal(body.dispatch.brainResult.readOnlyWorkPerformed, true);
    assert.equal(body.dispatch.brainResult.authorityGranted, false);
    assert.equal(body.dispatch.brainResult.executionStarted, false);

    const restored = await fetch('http://127.0.0.1:' + deckPort + '/v1/commands/WEB-BRAIN-E2E', {
      headers: { Authorization: 'Bearer web-control-token' },
    });
    const restoredBody = await restored.json();
    assert.equal(restoredBody.dispatch.brainResult.resultDigest, body.dispatch.brainResult.resultDigest);
    assert.equal(restoredBody.dispatch.brainDecisionDigest, body.dispatch.brainDecisionDigest);
  } finally {
    child.kill();
    brain.close();
    rmSync(tmp, { recursive: true, force: true });
  }
});
