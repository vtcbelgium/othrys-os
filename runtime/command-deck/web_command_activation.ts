import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { admitDeckIntent } from './intent_bridge.ts';
import { readWebCommandPlan } from './web_command_planner.ts';
import { decideMissionPreflight } from './preflight_decision.ts';
import { proposeBuildRoute } from './build_route.ts';
import { materializeBuildPackage } from './build_package.ts';
import { validateExecutionAuthCandidate } from './execution_auth.ts';
import { materializeExecutionLease } from './execution_lease.ts';
import { validateWorkerLaunchCandidate } from './worker_launch.ts';
import { materializeLaunchPermit } from './launch_permit.ts';
import { materializeWorkerRequest } from './worker_request.ts';
import { consumePermitForDispatch } from './dispatch_ticket.ts';
import { RemoteWorkerTransportError, transportWorkerJob } from './remote_worker_transport.mjs';

type ActiveMission = { mission_id?: string; status?: string } | null | undefined;

export class WebCommandActivationError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
    this.name = 'WebCommandActivationError';
  }
}

export type WebCommandActivationResult = {
  readonly schema: 'othrys.os.web-command-activation.v1';
  readonly webCommandId: string;
  readonly canonicalMissionId: string;
  readonly status: 'DISPATCH_READY' | 'WORKER_COMPLETED' | 'WORKER_FAILED';
  readonly stage: string;
  readonly progress: 70 | 82;
  readonly builderId: string;
  readonly jobId: string;
  readonly workspace: string;
  readonly allowedWritePaths: readonly string[];
  readonly dispatchTicketId: string;
  readonly evidence: readonly string[];
  readonly workerResultPath?: string;
  readonly changedFiles?: readonly string[];
  readonly authorityGranted: false;
  readonly dispatchAuthorityGranted: true;
  readonly executionStarted: boolean;
};

function safeRelativePath(value: string) {
  if (!value || value.startsWith('/') || /^[A-Za-z]:/.test(value)) return false;
  const parts = value.split(/[\\/]+/);
  return !parts.includes('..') && !parts.includes('') && !value.includes('\0');
}

function normalizedPaths(values: unknown): string[] {
  if (!Array.isArray(values) || values.length < 1 || values.length > 16) {
    throw new WebCommandActivationError('ALLOWED_PATHS_REQUIRED');
  }
  const paths = [...new Set(values.map(String).map((value) => value.trim().replaceAll('\\', '/')))].sort();
  if (paths.some((value) => !safeRelativePath(value))) {
    throw new WebCommandActivationError('ALLOWED_PATH_INVALID');
  }
  return paths;
}

function activationPath(root: string, webCommandId: string) {
  return join(root, 'missions', 'web-plans', webCommandId + '.activation.json');
}

function resultPath(root: string, webCommandId: string) {
  return join(root, 'missions', 'web-plans', webCommandId + '.dispatch.json');
}

function appendIntentOnce(path: string, intent: Record<string, unknown>) {
  mkdirSync(dirname(path), { recursive: true });
  const text = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const line = JSON.stringify(intent);
  if (text.split(/\r?\n/).includes(line)) return;
  appendFileSync(path, line + '\n', 'utf8');
}

function shiftedIso(base: string, milliseconds: number) {
  const parsed = Date.parse(base);
  if (!Number.isFinite(parsed)) throw new WebCommandActivationError('ACTIVATION_TIME_INVALID');
  return new Date(parsed + milliseconds).toISOString();
}

function sha(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex');
}

function readEnvelope(root: string, webCommandId: string) {
  const path = join(root, 'missions', 'web-commands', webCommandId + '.json');
  if (!existsSync(path)) throw new WebCommandActivationError('WEB_COMMAND_ENVELOPE_NOT_FOUND', 404);
  const value = JSON.parse(readFileSync(path, 'utf8'));
  if (
    value?.schema !== 'othrys.os.web-command.v1' ||
    value.missionId !== webCommandId ||
    typeof value.command !== 'string' ||
    value.authorityGranted !== false ||
    value.executionStarted !== false
  ) throw new WebCommandActivationError('WEB_COMMAND_ENVELOPE_INVALID');
  return value;
}

function writeActivationOnce(root: string, webCommandId: string, value: Record<string, unknown>) {
  const path = activationPath(root, webCommandId);
  mkdirSync(dirname(path), { recursive: true });
  const text = JSON.stringify(value, null, 2) + '\n';
  if (existsSync(path)) {
    const current = readFileSync(path, 'utf8');
    if (current !== text) throw new WebCommandActivationError('ACTIVATION_SCOPE_CONFLICT', 409);
    return path;
  }
  writeFileSync(path, text, { encoding: 'utf8', mode: 0o600 });
  return path;
}

function writeResultOnce(root: string, webCommandId: string, value: WebCommandActivationResult) {
  const path = resultPath(root, webCommandId);
  mkdirSync(dirname(path), { recursive: true });
  const text = JSON.stringify(value, null, 2) + '\n';
  if (existsSync(path)) {
    const current = JSON.parse(readFileSync(path, 'utf8'));
    return current as WebCommandActivationResult;
  }
  writeFileSync(path, text, { encoding: 'utf8', mode: 0o600 });
  return value;
}

export function readWebCommandActivation(root: string, webCommandId: string): WebCommandActivationResult | null {
  const path = resultPath(root, webCommandId);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as WebCommandActivationResult;
}

async function transportActivation(
  root: string,
  activation: WebCommandActivationResult,
  workerBridgeUrl?: string,
  workerBridgeToken?: string,
): Promise<WebCommandActivationResult> {
  if (!workerBridgeUrl || !workerBridgeToken || activation.executionStarted) return activation;
  try {
    const transport = await transportWorkerJob({
      root,
      requestPath: join(root, 'missions', 'worker-requests', activation.jobId + '.json'),
      dispatchPath: join(root, 'missions', 'dispatch-tickets', activation.dispatchTicketId + '.json'),
      baseUrl: workerBridgeUrl,
      token: workerBridgeToken,
    });
    return Object.freeze({
      ...activation,
      status: transport.status,
      stage: transport.status === 'WORKER_COMPLETED'
        ? 'Legion worker completed · awaiting independent verification'
        : 'Legion worker returned failure evidence',
      progress: 82,
      workerResultPath: transport.workerResultPath,
      changedFiles: Object.freeze(transport.changedFiles),
      executionStarted: true,
    });
  } catch (error) {
    if (error instanceof RemoteWorkerTransportError) {
      throw new WebCommandActivationError(error.code, 503);
    }
    throw error;
  }
}

export async function activateWebCommand(options: {
  root: string;
  webCommandId: string;
  allowedWritePaths: unknown;
  workspace: string;
  intentFile: string;
  ledgerPath: string;
  selection: any;
  activeMission?: ActiveMission;
  nowIso?: string;
  timeoutSec?: number;
  workerBridgeUrl?: string;
  workerBridgeToken?: string;
}): Promise<WebCommandActivationResult> {
  const {
    root,
    webCommandId,
    allowedWritePaths,
    workspace,
    intentFile,
    ledgerPath,
    selection,
    activeMission,
    workerBridgeUrl,
    workerBridgeToken,
  } = options;

  const replay = readWebCommandActivation(root, webCommandId);
  if (replay) return transportActivation(root, replay, workerBridgeUrl, workerBridgeToken);

  if (!intentFile || !ledgerPath) throw new WebCommandActivationError('NATIVE_EVIDENCE_PATH_REQUIRED', 503);
  const normalizedWorkspace = String(workspace ?? '').trim();
  if (!normalizedWorkspace) throw new WebCommandActivationError('LEGION_WORKSPACE_REQUIRED', 503);

  const plan = readWebCommandPlan(root, webCommandId);
  if (!plan || !plan.canonicalMissionId) {
    throw new WebCommandActivationError('GOVERNED_PLAN_REQUIRED', 409);
  }
  if (!['PLANNED_AWAITING_ACTIVATION', 'QUEUED_ACTIVE_MISSION'].includes(plan.status)) {
    throw new WebCommandActivationError('PLAN_NOT_ACTIVATABLE', 409);
  }

  const activeMissionId =
    activeMission?.status && activeMission.status !== 'COMPLETE'
      ? String(activeMission.mission_id ?? '') || null
      : null;
  if (activeMissionId && activeMissionId !== plan.canonicalMissionId) {
    throw new WebCommandActivationError('ONE_MISSION_RULE', 409);
  }

  const paths = normalizedPaths(allowedWritePaths);
  const envelope = readEnvelope(root, webCommandId);
  const nowIso = String(options.nowIso ?? new Date().toISOString());
  if (!Number.isFinite(Date.parse(nowIso))) throw new WebCommandActivationError('ACTIVATION_TIME_INVALID');
  const timeoutSec = Number(options.timeoutSec ?? 180);
  if (!Number.isInteger(timeoutSec) || timeoutSec < 10 || timeoutSec > 300) {
    throw new WebCommandActivationError('WORKER_TIMEOUT_INVALID');
  }

  const activationRecord = Object.freeze({
    schema: 'othrys.os.web-command-activation-scope.v1',
    webCommandId,
    canonicalMissionId: plan.canonicalMissionId,
    allowedWritePaths: paths,
    workspace: normalizedWorkspace,
    authorizedAt: nowIso,
    actor: Object.freeze({ role: 'ceo', channel: 'othrys-web' }),
    authorityGranted: false,
    executionStarted: false,
  });
  const activationEvidencePath = writeActivationOnce(root, webCommandId, activationRecord);

  const activationIntent = {
    schema: 'othrys.deck.intent.v1',
    receivedAt: shiftedIso(nowIso, 1),
    action: 'MISSION_ACTIVATION_REQUEST',
    missionId: plan.canonicalMissionId,
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
  appendIntentOnce(intentFile, activationIntent);
  admitDeckIntent(activationIntent, ledgerPath);

  const preflight = decideMissionPreflight(root, plan.canonicalMissionId);
  if (preflight.class !== 'MISSING_WORK') {
    throw new WebCommandActivationError(
      preflight.class === 'NO_CHANGE' ? 'NO_CHANGE_REQUIRES_CLOSEOUT' : String(preflight.reason ?? 'PREFLIGHT_BLOCKED'),
      409,
    );
  }

  const route = proposeBuildRoute(preflight, selection);
  if (route.status !== 'ROUTE_PROPOSED' || !route.selected) {
    throw new WebCommandActivationError(String(route.reason ?? 'BUILD_ROUTE_BLOCKED'), 409);
  }
  const routeDigest = sha(route);

  const buildIntent = {
    schema: 'othrys.deck.intent.v1',
    receivedAt: shiftedIso(nowIso, 2),
    action: 'MISSION_BUILD_REQUEST',
    missionId: plan.canonicalMissionId,
    builderId: route.selected.id,
    routeDigest,
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
  appendIntentOnce(intentFile, buildIntent);
  admitDeckIntent(buildIntent, ledgerPath);

  const buildPackagesDir = join(root, 'missions', 'build-packages');
  const buildPackage = materializeBuildPackage(
    root,
    plan.canonicalMissionId,
    selection,
    intentFile,
    ledgerPath,
    buildPackagesDir,
  );

  const executionCandidate = validateExecutionAuthCandidate(root, buildPackage.path, selection);
  const executionIntent = {
    schema: 'othrys.deck.intent.v1',
    receivedAt: shiftedIso(nowIso, 3),
    action: 'MISSION_EXECUTION_AUTH_REQUEST',
    missionId: plan.canonicalMissionId,
    buildRequestId: executionCandidate.buildRequestId,
    builderId: executionCandidate.builderId,
    packageDigest: executionCandidate.packageDigest,
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
  appendIntentOnce(intentFile, executionIntent);
  admitDeckIntent(executionIntent, ledgerPath);

  const leasesDir = join(root, 'missions', 'execution-leases');
  const lease = materializeExecutionLease(
    buildPackage.path,
    intentFile,
    ledgerPath,
    leasesDir,
    shiftedIso(nowIso, 4),
  );

  const launchCandidate = validateWorkerLaunchCandidate(lease.path, shiftedIso(nowIso, 5));
  const launchIntent = {
    schema: 'othrys.deck.intent.v1',
    receivedAt: shiftedIso(nowIso, 5),
    action: 'MISSION_WORKER_LAUNCH_REQUEST',
    missionId: plan.canonicalMissionId,
    leaseId: launchCandidate.leaseId,
    builderId: launchCandidate.builderId,
    leaseDigest: launchCandidate.leaseDigest,
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
  appendIntentOnce(intentFile, launchIntent);
  admitDeckIntent(launchIntent, ledgerPath);

  const permitsDir = join(root, 'missions', 'launch-permits');
  const permit = materializeLaunchPermit(
    lease.path,
    intentFile,
    ledgerPath,
    permitsDir,
    shiftedIso(nowIso, 6),
  );

  const task = String(envelope.command).trim();
  if (!task || task.length > 2000) throw new WebCommandActivationError('WORKER_TASK_TOO_LARGE', 413);
  const workerRequestsDir = join(root, 'missions', 'worker-requests');
  const worker = materializeWorkerRequest(
    permit.path,
    {
      workspace: normalizedWorkspace,
      task,
      allowed_paths: paths,
      deny_paths: [],
      timeout_sec: timeoutSec,
    },
    workerRequestsDir,
  );

  const dispatchDir = join(root, 'missions', 'dispatch-tickets');
  const dispatch = consumePermitForDispatch(
    permit.path,
    worker.path,
    dispatchDir,
    shiftedIso(nowIso, 7),
  );

  const evidence = Object.freeze([
    activationEvidencePath.replace(root + '/', ''),
    buildPackage.path.replace(root + '/', ''),
    lease.path.replace(root + '/', ''),
    permit.path.replace(root + '/', ''),
    worker.path.replace(root + '/', ''),
    dispatch.ticketPath.replace(root + '/', ''),
  ]);

  const activation = writeResultOnce(root, webCommandId, Object.freeze({
    schema: 'othrys.os.web-command-activation.v1',
    webCommandId,
    canonicalMissionId: plan.canonicalMissionId,
    status: 'DISPATCH_READY',
    stage: 'Governed build dispatch is ready for Legion transport',
    progress: 70,
    builderId: route.selected.id,
    jobId: worker.request.job_id,
    workspace: normalizedWorkspace,
    allowedWritePaths: Object.freeze(paths),
    dispatchTicketId: dispatch.ticket.ticketId,
    evidence,
    authorityGranted: false,
    dispatchAuthorityGranted: true,
    executionStarted: false,
  }));
  return transportActivation(root, activation, workerBridgeUrl, workerBridgeToken);
}
