import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planWebCommand } from './web_command_planner.ts';
import { activateWebCommand, WebCommandActivationError } from './web_command_activation.ts';

const selection = {
  schema: 'othrys.os.switchyard-selection.v1',
  outcome: 'SELECTED',
  selected: {
    id: 'qwen3-builder',
    label: 'Qwen3 8B · Legion',
    capabilities: ['engineering.build'],
    tier: 'STANDARD',
    costClass: 'ZERO',
    latencyClass: 'INTERACTIVE',
    locality: 'LOCAL',
    providerHealth: 'HEALTHY',
    certification: 'CERTIFIED',
    measuredTrust: 0.76,
  },
  reason: 'NATIVE_SWITCHYARD_SELECTED',
};

function fixture(activeMission: any = null) {
  const root = mkdtempSync(join(tmpdir(), 'web-builder-activation-'));
  mkdirSync(join(root, '.othrys'), { recursive: true });
  copyFileSync(join(process.cwd(), '.othrys', 'project.json'), join(root, '.othrys', 'project.json'));
  mkdirSync(join(root, 'missions', 'web-commands'), { recursive: true });
  writeFileSync(join(root, 'missions', 'V2-001A.json'), JSON.stringify({
    mission_id: 'V2-001A',
    title: 'Existing baseline',
    objective: 'Keep sequence non-empty.',
    status: 'CANONICAL_UNACTIVATED',
    authorityGranted: false,
    executionStarted: false,
  }) + '\n');
  const webCommandId = 'WEB-ACTIVATE-001';
  writeFileSync(join(root, 'missions', 'web-commands', webCommandId + '.json'), JSON.stringify({
    schema: 'othrys.os.web-command.v1',
    missionId: webCommandId,
    correlationId: webCommandId,
    command: 'Create docs/BUILDER-SMOKE-TEST.md and change no other file.',
    context: 'Builder activation test',
    actor: { role: 'ceo', channel: 'othrys-web' },
    promptDigest: 'a'.repeat(64),
    admittedAt: '2026-09-20T18:15:00.000Z',
    state: 'ADMITTED_AWAITING_PLANNING',
    authorityGranted: false,
    executionStarted: false,
  }, null, 2) + '\n');
  const intentFile = join(root, 'control', 'intents.jsonl');
  const ledgerPath = join(root, 'control', 'admission.jsonl');
  const plan = planWebCommand({
    root,
    webCommandId,
    envelopeDir: join(root, 'missions', 'web-commands'),
    intentFile,
    ledgerPath,
    activeMission,
  });
  return { root, webCommandId, intentFile, ledgerPath, plan };
}

test('planned Web build advances through existing governed gates to dispatch-ready', async () => {
  const f = fixture(null);
  try {
    assert.equal(f.plan.status, 'PLANNED_AWAITING_ACTIVATION');
    const out = await activateWebCommand({
      root: f.root,
      webCommandId: f.webCommandId,
      allowedWritePaths: ['docs/BUILDER-SMOKE-TEST.md'],
      workspace: 'C:/Users/othry/Projects/othrys-os',
      intentFile: f.intentFile,
      ledgerPath: f.ledgerPath,
      selection,
      activeMission: null,
      nowIso: '2026-09-20T18:16:00.000Z',
      timeoutSec: 180,
    });
    assert.equal(out.status, 'DISPATCH_READY');
    assert.equal(out.progress, 70);
    assert.equal(out.canonicalMissionId, 'V2-001B');
    assert.equal(out.builderId, 'qwen3-builder');
    assert.deepEqual(out.allowedWritePaths, ['docs/BUILDER-SMOKE-TEST.md']);
    assert.equal(out.authorityGranted, false);
    assert.equal(out.dispatchAuthorityGranted, true);
    assert.equal(out.executionStarted, false);
    assert.match(out.jobId, /^JOB-[0-9a-f]{24}$/);
    assert.ok(existsSync(join(f.root, 'missions', 'web-plans', f.webCommandId + '.activation.json')));
    assert.ok(existsSync(join(f.root, 'missions', 'worker-requests', out.jobId + '.json')));
    assert.ok(existsSync(join(f.root, 'missions', 'dispatch-tickets', out.dispatchTicketId + '.json')));
    const worker = JSON.parse(readFileSync(join(f.root, 'missions', 'worker-requests', out.jobId + '.json'), 'utf8'));
    assert.deepEqual(worker.allowed_paths, ['docs/BUILDER-SMOKE-TEST.md']);
    assert.equal(worker.workspace, 'C:/Users/othry/Projects/othrys-os');

    const replay = await activateWebCommand({
      root: f.root,
      webCommandId: f.webCommandId,
      allowedWritePaths: ['docs/BUILDER-SMOKE-TEST.md'],
      workspace: 'C:/Users/othry/Projects/othrys-os',
      intentFile: f.intentFile,
      ledgerPath: f.ledgerPath,
      selection,
      activeMission: null,
      nowIso: '2026-09-20T18:20:00.000Z',
    });
    assert.deepEqual(replay, out);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test('One Mission Rule blocks Web activation before scope or dispatch is materialized', async () => {
  const f = fixture({ mission_id: 'V2-011K', status: 'RUNNING' });
  try {
    assert.equal(f.plan.status, 'QUEUED_ACTIVE_MISSION');
    await assert.rejects(
      activateWebCommand({
        root: f.root,
        webCommandId: f.webCommandId,
        allowedWritePaths: ['docs/BUILDER-SMOKE-TEST.md'],
        workspace: 'C:/Users/othry/Projects/othrys-os',
        intentFile: f.intentFile,
        ledgerPath: f.ledgerPath,
        selection,
        activeMission: { mission_id: 'V2-011K', status: 'RUNNING' },
        nowIso: '2026-09-20T18:16:00.000Z',
      }),
      (error: unknown) => error instanceof WebCommandActivationError && error.code === 'ONE_MISSION_RULE' && error.status === 409,
    );
    assert.equal(existsSync(join(f.root, 'missions', 'web-plans', f.webCommandId + '.activation.json')), false);
    assert.equal(existsSync(join(f.root, 'missions', 'worker-requests')), false);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test('activation scope rejects traversal and absolute paths', async () => {
  const f = fixture(null);
  try {
    for (const unsafe of ['../oops.md', '/tmp/oops.md', 'C:/oops.md']) {
      await assert.rejects(
        activateWebCommand({
          root: f.root,
          webCommandId: f.webCommandId,
          allowedWritePaths: [unsafe],
          workspace: 'C:/Users/othry/Projects/othrys-os',
          intentFile: f.intentFile,
          ledgerPath: f.ledgerPath,
          selection,
          activeMission: null,
          nowIso: '2026-09-20T18:16:00.000Z',
        }),
        (error: unknown) => error instanceof WebCommandActivationError && error.code === 'ALLOWED_PATH_INVALID',
      );
    }
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
