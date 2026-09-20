import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export class RemoteWorkerTransportError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
    this.name = 'RemoteWorkerTransportError';
  }
}

const sha = (raw) => createHash('sha256').update(raw, 'utf8').digest('hex');

function load(raw, code) {
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(code);
    return value;
  } catch {
    throw new RemoteWorkerTransportError(code);
  }
}

function writeOnce(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const text = JSON.stringify(value, null, 2) + '\n';
  if (existsSync(path)) {
    const current = readFileSync(path, 'utf8');
    if (current !== text) throw new RemoteWorkerTransportError('WORKER_RESULT_CONFLICT');
    return false;
  }
  const temp = path + '.tmp-' + process.pid;
  writeFileSync(temp, text, 'utf8');
  renameSync(temp, path);
  return true;
}

function validateEvidence(dispatchRaw, requestRaw) {
  const dispatch = load(dispatchRaw, 'DISPATCH_INVALID');
  const request = load(requestRaw, 'REQUEST_INVALID');
  if (
    dispatch.schema !== 'othrys.os.dispatch-ticket.v1' ||
    dispatch.status !== 'DISPATCH_AUTHORIZED' ||
    dispatch.authorityGranted !== true ||
    dispatch.executionStarted !== false
  ) throw new RemoteWorkerTransportError('DISPATCH_INVALID');
  if (
    request.schema_version !== 'othrys.worker-request.v0.1' ||
    request.node_id !== 'legion' ||
    request.capability !== 'engineering.patch'
  ) throw new RemoteWorkerTransportError('REQUEST_INVALID');
  if (
    dispatch.jobId !== request.job_id ||
    dispatch.missionId !== request.metadata?.mission_id ||
    dispatch.builderId !== request.metadata?.builder_id ||
    dispatch.requestDigest !== sha(requestRaw)
  ) throw new RemoteWorkerTransportError('REQUEST_DISPATCH_MISMATCH');
  return { dispatch, request };
}
export async function transportWorkerJob({
  root,
  requestPath,
  dispatchPath,
  baseUrl,
  token,
  fetchImpl = fetch,
}) {
  if (!baseUrl || !token) throw new RemoteWorkerTransportError('WORKER_BRIDGE_NOT_CONFIGURED');
  if (!existsSync(requestPath) || !existsSync(dispatchPath)) {
    throw new RemoteWorkerTransportError('WORKER_EVIDENCE_MISSING');
  }
  const requestRaw = readFileSync(requestPath, 'utf8');
  const dispatchRaw = readFileSync(dispatchPath, 'utf8');
  const { dispatch, request } = validateEvidence(dispatchRaw, requestRaw);
  const timeoutSec = Number(request.timeout_sec ?? 180);
  const signal = AbortSignal.timeout((Math.max(10, Math.min(timeoutSec, 300)) + 25) * 1000);

  let response;
  try {
    response = await fetchImpl(String(baseUrl).replace(/\/$/, '') + '/jobs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, dispatchRaw, requestRaw }),
      signal,
    });
  } catch (error) {
    throw new RemoteWorkerTransportError(
      error?.name === 'TimeoutError' ? 'WORKER_BRIDGE_TIMEOUT' : 'WORKER_BRIDGE_UNREACHABLE',
    );
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw new RemoteWorkerTransportError('WORKER_BRIDGE_RESPONSE_INVALID');
  }
  if (!response.ok || !body || typeof body !== 'object' || !body.workerResult) {
    throw new RemoteWorkerTransportError(String(body?.error ?? 'WORKER_BRIDGE_REFUSED'));
  }

  const worker = body.workerResult;
  if (
    worker.schema_version !== 'othrys.worker-result.v0.1' ||
    worker.job_id !== dispatch.jobId ||
    worker.mission_id !== dispatch.missionId ||
    worker.builder_id !== dispatch.builderId
  ) throw new RemoteWorkerTransportError('WORKER_RESULT_IDENTITY_MISMATCH');

  const resultPath = join(root, 'missions', dispatch.missionId + '.worker-result.json');
  writeOnce(resultPath, worker);
  const receipt = Object.freeze({
    schema: 'othrys.os.worker-transport.v1',
    missionId: dispatch.missionId,
    jobId: dispatch.jobId,
    builderId: dispatch.builderId,
    nodeId: String(worker.node_id ?? 'legion'),
    status: worker.ok === true ? 'WORKER_COMPLETED' : 'WORKER_FAILED',
    changedFiles: Array.isArray(worker.changed_files) ? worker.changed_files.map(String) : [],
    workerResultPath: 'missions/' + dispatch.missionId + '.worker-result.json',
    authorityGranted: false,
    executionStarted: true,
  });
  const receiptPath = join(root, 'missions', dispatch.missionId + '.worker-transport.json');
  writeOnce(receiptPath, receipt);
  return Object.freeze({ ...receipt, workerResult: worker, receiptPath });
}
