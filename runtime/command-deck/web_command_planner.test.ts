import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planWebCommand } from './web_command_planner.ts';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'web-command-plan-'));
  mkdirSync(join(root, '.othrys'), { recursive: true });
  copyFileSync(join(process.cwd(), '.othrys', 'project.json'), join(root, '.othrys', 'project.json'));
  mkdirSync(join(root, 'missions', 'web-commands'), { recursive: true });
  writeFileSync(join(root, 'missions', 'V2-001A.json'), JSON.stringify({
    mission_id: 'V2-001A',
    title: 'Existing mission',
    objective: 'Keep the sequence non-empty.',
    status: 'CANONICAL_UNACTIVATED',
    authorityGranted: false,
    executionStarted: false,
  }) + '\n');
  const webCommandId = 'WEB-TEST-001';
  writeFileSync(join(root, 'missions', 'web-commands', webCommandId + '.json'), JSON.stringify({
    schema: 'othrys.os.web-command.v1',
    missionId: webCommandId,
    correlationId: webCommandId,
    command: 'Create docs/BUILDER-SMOKE-TEST.md as a bounded governed Builder smoke test.',
    context: 'System Manager test',
    actor: { role: 'ceo', channel: 'othrys-web' },
    promptDigest: 'a'.repeat(64),
    admittedAt: '2026-09-20T17:28:09.713Z',
    state: 'ADMITTED_AWAITING_PLANNING',
    authorityGranted: false,
    executionStarted: false,
  }, null, 2) + '\n');
  return {
    root,
    webCommandId,
    envelopeDir: join(root, 'missions', 'web-commands'),
    intentFile: join(root, 'control', 'intents.jsonl'),
    ledgerPath: join(root, 'control', 'admission.jsonl'),
  };
}

test('admitted Web build becomes a canonical Mission and durable Work record', () => {
  const f = fixture();
  try {
    const result = planWebCommand({
      ...f,
      activeMission: null,
    });
    assert.equal(result.status, 'PLANNED_AWAITING_ACTIVATION');
    assert.equal(result.intent, 'BUILD');
    assert.equal(result.canonicalMissionId, 'V2-001B');
    assert.equal(result.authorityGranted, false);
    assert.equal(result.executionStarted, false);
    assert.ok(existsSync(join(f.root, 'missions', 'V2-001B.json')));
    assert.ok(existsSync(join(f.root, '.othrys', 'work', 'V2-001B.work.json')));
    const mission = JSON.parse(readFileSync(join(f.root, 'missions', 'V2-001B.json'), 'utf8'));
    assert.equal(mission.status, 'CANONICAL_UNACTIVATED');
    assert.match(mission.objective, /WEB-TEST-001/);
    const replay = planWebCommand({ ...f, activeMission: null });
    assert.deepEqual(replay, result);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test('queued Web plan becomes activatable when the blocking Mission completes', () => {
  const f = fixture({ mission_id: 'V2-011K', status: 'RUNNING' });
  try {
    const queued = planWebCommand({
      root: f.root,
      webCommandId: f.webCommandId,
      envelopeDir: f.envelopeDir,
      intentFile: f.intentFile,
      ledgerPath: f.ledgerPath,
      activeMission: { mission_id: 'V2-011K', status: 'RUNNING' },
    });
    assert.equal(queued.status, 'QUEUED_ACTIVE_MISSION');
    assert.equal(queued.blocker, 'ONE_MISSION_RULE');

    const ready = planWebCommand({
      root: f.root,
      webCommandId: f.webCommandId,
      envelopeDir: f.envelopeDir,
      intentFile: f.intentFile,
      ledgerPath: f.ledgerPath,
      activeMission: { mission_id: 'V2-011K', status: 'COMPLETE' },
    });
    assert.equal(ready.status, 'PLANNED_AWAITING_ACTIVATION');
    assert.equal(ready.blocker, null);
    assert.equal(ready.activeMissionId, null);
    assert.equal(ready.progress, 50);
    assert.match(ready.stage, /awaiting explicit activation/);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test('One Mission Rule queues the planned Web Mission behind a running Mission', () => {
  const f = fixture();
  try {
    const result = planWebCommand({
      ...f,
      activeMission: { mission_id: 'V2-011K', status: 'RUNNING' },
    });
    assert.equal(result.status, 'QUEUED_ACTIVE_MISSION');
    assert.equal(result.canonicalMissionId, 'V2-001B');
    assert.equal(result.activeMissionId, 'V2-011K');
    assert.equal(result.blocker, 'ONE_MISSION_RULE');
    assert.equal(result.progress, 40);
    assert.match(result.stage, /V2-011K/);
    assert.ok(existsSync(join(f.root, 'missions', 'V2-001B.json')));
    assert.equal(existsSync(join(f.root, 'missions', 'V2-001B.result.json')), false);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
