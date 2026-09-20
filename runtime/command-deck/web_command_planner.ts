import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { classifyFrontDoorIntent } from '../os/front_door.mjs';
import { materializeWorkRecord } from '../os/work_record.mjs';
import { admitDeckIntent } from './intent_bridge.ts';
import { materializeMissionCandidate } from './mission_candidate.ts';
import { materializeCanonicalMission } from './canonical_mission_materializer.ts';

type ActiveMission = { mission_id?: string; status?: string } | null | undefined;

export type WebPlanningResult = {
  readonly schema: 'othrys.os.web-command-plan.v1';
  readonly webCommandId: string;
  readonly intent: string;
  readonly status: 'NO_MISSION_REQUIRED' | 'PLANNED_AWAITING_ACTIVATION' | 'QUEUED_ACTIVE_MISSION';
  readonly stage: string;
  readonly progress: number;
  readonly canonicalMissionId: string | null;
  readonly activeMissionId: string | null;
  readonly blocker: string | null;
  readonly evidence: readonly string[];
  readonly authorityGranted: false;
  readonly executionStarted: false;
};

function readEnvelope(path: string) {
  if (!existsSync(path)) throw new Error('WEB_COMMAND_ENVELOPE_NOT_FOUND');
  const value = JSON.parse(readFileSync(path, 'utf8'));
  if (
    value?.schema !== 'othrys.os.web-command.v1' ||
    !/^WEB-[A-Z0-9-]+$/.test(String(value.missionId ?? '')) ||
    typeof value.command !== 'string' ||
    value.command.trim().length === 0 ||
    value.authorityGranted !== false ||
    value.executionStarted !== false
  ) throw new Error('WEB_COMMAND_ENVELOPE_INVALID');
  return value;
}

function shiftedIso(base: string, milliseconds: number) {
  const value = Date.parse(base);
  if (!Number.isFinite(value)) throw new Error('WEB_COMMAND_TIME_INVALID');
  return new Date(value + milliseconds).toISOString();
}

function appendIntentOnce(path: string, intent: Record<string, unknown>) {
  mkdirSync(dirname(path), { recursive: true });
  const text = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const line = JSON.stringify(intent);
  if (text.split(/\r?\n/).includes(line)) return;
  appendFileSync(path, line + '\n', 'utf8');
}

function planPath(root: string, webCommandId: string) {
  return join(root, 'missions', 'web-plans', webCommandId + '.json');
}

function writePlan(root: string, result: WebPlanningResult) {
  const path = planPath(root, result.webCommandId);
  mkdirSync(join(root, 'missions', 'web-plans'), { recursive: true });
  const text = JSON.stringify(result, null, 2) + '\n';
  if (existsSync(path)) {
    const current = readFileSync(path, 'utf8');
    if (current !== text) throw new Error('WEB_COMMAND_PLAN_CONFLICT');
    return { path, created: false };
  }
  writeFileSync(path, text, { encoding: 'utf8', mode: 0o600 });
  return { path, created: true };
}

export function readWebCommandPlan(root: string, webCommandId: string): WebPlanningResult | null {
  const path = planPath(root, webCommandId);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as WebPlanningResult;
}

export function planWebCommand(options: {
  root: string;
  webCommandId: string;
  envelopeDir: string;
  intentFile: string;
  ledgerPath: string;
  activeMission?: ActiveMission;
}): WebPlanningResult {
  const { root, webCommandId, envelopeDir, intentFile, ledgerPath, activeMission } = options;
  const existing = readWebCommandPlan(root, webCommandId);
  if (existing) {
    if (existing.status === 'NO_MISSION_REQUIRED' || !existing.canonicalMissionId) return existing;
    const activeMissionId =
      activeMission?.status && activeMission.status !== 'COMPLETE'
        ? String(activeMission.mission_id ?? '') || null
        : null;
    const blocked = activeMissionId !== null && activeMissionId !== existing.canonicalMissionId;
    return Object.freeze({
      ...existing,
      status: blocked ? 'QUEUED_ACTIVE_MISSION' : 'PLANNED_AWAITING_ACTIVATION',
      stage: blocked
        ? 'Governed planning complete · queued behind active Mission ' + activeMissionId
        : 'Governed planning complete · awaiting explicit activation',
      progress: blocked ? 40 : 50,
      activeMissionId,
      blocker: blocked ? 'ONE_MISSION_RULE' : null,
    });
  }

  const envelope = readEnvelope(join(envelopeDir, webCommandId + '.json'));
  const intent = classifyFrontDoorIntent(envelope.command);

  if (!['PLAN', 'BUILD'].includes(intent)) {
    const result: WebPlanningResult = Object.freeze({
      schema: 'othrys.os.web-command-plan.v1',
      webCommandId,
      intent,
      status: 'NO_MISSION_REQUIRED',
      stage: 'No governed Mission required for this request',
      progress: 100,
      canonicalMissionId: null,
      activeMissionId: activeMission?.mission_id ?? null,
      blocker: null,
      evidence: Object.freeze([
        'missions/web-commands/' + webCommandId + '.json',
        'runtime/os/front_door.mjs',
      ]),
      authorityGranted: false,
      executionStarted: false,
    });
    writePlan(root, result);
    return result;
  }

  if (!intentFile || !ledgerPath) throw new Error('WEB_PLANNER_NATIVE_EVIDENCE_PATH_REQUIRED');

  const shortObjective =
    'Govern admitted OTHRYS Web Builder request ' + webCommandId +
    '. Full operator objective and context are preserved in missions/web-commands/' +
    webCommandId + '.json.';

  const proposal = {
    schema: 'othrys.deck.intent.v1',
    receivedAt: shiftedIso(envelope.admittedAt, 1),
    action: 'MISSION_PROPOSAL',
    projectContext: 'othrys-web',
    objective: shortObjective,
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
  appendIntentOnce(intentFile, proposal);
  const proposalAdmission = admitDeckIntent(proposal, ledgerPath);

  const promotion = {
    schema: 'othrys.deck.intent.v1',
    receivedAt: shiftedIso(envelope.admittedAt, 2),
    action: 'MISSION_PROMOTION_REQUEST',
    proposalId: proposalAdmission.missionId,
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
  appendIntentOnce(intentFile, promotion);
  admitDeckIntent(promotion, ledgerPath);

  const candidatesDir = join(root, 'missions', 'candidates');
  const candidate = materializeMissionCandidate(
    intentFile,
    ledgerPath,
    candidatesDir,
    proposalAdmission.missionId,
  );

  const allocation = {
    schema: 'othrys.deck.intent.v1',
    receivedAt: shiftedIso(envelope.admittedAt, 3),
    action: 'MISSION_ID_ALLOCATION_REQUEST',
    candidateId: candidate.candidate.candidateId,
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
  appendIntentOnce(intentFile, allocation);
  admitDeckIntent(allocation, ledgerPath);

  const canonical = materializeCanonicalMission(
    candidate.path,
    intentFile,
    ledgerPath,
    join(root, 'missions'),
  );
  materializeWorkRecord(root, canonical.mission.mission_id);

  const activeMissionId =
    activeMission?.status && activeMission.status !== 'COMPLETE'
      ? String(activeMission.mission_id ?? '') || null
      : null;
  const blocked = activeMissionId !== null && activeMissionId !== canonical.mission.mission_id;
  const result: WebPlanningResult = Object.freeze({
    schema: 'othrys.os.web-command-plan.v1',
    webCommandId,
    intent,
    status: blocked ? 'QUEUED_ACTIVE_MISSION' : 'PLANNED_AWAITING_ACTIVATION',
    stage: blocked
      ? 'Governed planning complete · queued behind active Mission ' + activeMissionId
      : 'Governed planning complete · awaiting explicit activation',
    progress: blocked ? 40 : 50,
    canonicalMissionId: canonical.mission.mission_id,
    activeMissionId,
    blocker: blocked ? 'ONE_MISSION_RULE' : null,
    evidence: Object.freeze([
      'missions/web-commands/' + webCommandId + '.json',
      'missions/web-plans/' + webCommandId + '.json',
      'missions/candidates/' + candidate.candidate.candidateId + '.json',
      'missions/candidates/' + candidate.candidate.candidateId + '.allocation.json',
      'missions/' + canonical.mission.mission_id + '.json',
      '.othrys/work/' + canonical.mission.mission_id + '.work.json',
    ]),
    authorityGranted: false,
    executionStarted: false,
  });
  writePlan(root, result);
  return result;
}
