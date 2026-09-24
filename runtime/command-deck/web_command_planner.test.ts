import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planWebCommand } from './web_command_planner.ts';
import { createBrainDecision } from '../os/brain_orchestrator.mjs';

function fixture(command = 'Create docs/BUILDER-SMOKE-TEST.md as a bounded governed Builder smoke test.') {
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
    command,
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


function routerObservation(taskType: string, options: any = {}) {
  return {
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
      task_type: { type: 'choice', choice: taskType },
      needs_repo: { type: 'noul', noul: options.needsRepo ?? 0 },
      needs_web: { type: 'noul', noul: options.needsWeb ?? 0 },
      needs_execution: { type: 'noul', noul: options.needsExecution ?? 0 },
      risk: { type: 'score', score: options.risk ?? 0 },
    },
    usage: null,
    authorityGranted: false,
    actionApplied: false,
    executionStarted: false,
  };
}

test('brain FAST route persists evidence without creating a Mission', () => {
  const command = 'Inspect the repository status. Read only.';
  const f = fixture(command);
  try {
    const brainDecision = createBrainDecision({
      command,
      observation: routerObservation('status', { needsRepo: 0.9, needsExecution: 0.05 }),
      sharedStateRef: 'web:' + f.webCommandId,
    });
    const result = planWebCommand({ ...f, activeMission: null, brainDecision });
    assert.equal(result.status, 'NO_MISSION_REQUIRED');
    assert.equal(result.brainLane, 'FAST');
    assert.equal(result.brainExecutor, 'deterministic.status');
    assert.equal(result.canonicalMissionId, null);
    assert.ok(existsSync(join(f.root, 'missions', 'web-plans', f.webCommandId + '.brain.json')));
    assert.equal(existsSync(join(f.root, 'missions', 'V2-001B.json')), false);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test('brain DEEP route remains inside canonical Mission lifecycle', () => {
  const command = 'Fix the TypeScript bug and run focused tests.';
  const f = fixture(command);
  try {
    const brainDecision = createBrainDecision({
      command,
      observation: routerObservation('build', { needsRepo: 0.95, needsExecution: 0.95, risk: 1.2 }),
      sharedStateRef: 'web:' + f.webCommandId,
    });
    const result = planWebCommand({ ...f, activeMission: null, brainDecision });
    assert.equal(result.status, 'PLANNED_AWAITING_ACTIVATION');
    assert.equal(result.brainLane, 'DEEP');
    assert.equal(result.brainExecutor, 'hephaestus.switchyard');
    assert.equal(result.canonicalMissionId, 'V2-001B');
    assert.ok(result.evidence.includes('missions/web-plans/' + f.webCommandId + '.brain.json'));
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
