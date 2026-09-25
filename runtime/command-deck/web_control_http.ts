import type { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import {
  bearerAuthorized,
  WebControlBridge,
  WebControlBridgeError,
} from './web_control_bridge.ts';

type Options = {
  readonly token: string;
  readonly tokenSha256?: string;
  readonly ledgerPath: string;
  readonly systemProjection?: () => unknown | Promise<unknown>;
  readonly estateProjection?: () => unknown | Promise<unknown>;
  readonly estateRefresh?: () => unknown | Promise<unknown>;
  readonly commandEnvelopeDir?: string;
  readonly commandPlanner?: (missionId: string) => unknown | Promise<unknown>;
  readonly commandActivator?: (missionId: string, body: unknown) => unknown | Promise<unknown>;
};

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  response.end(payload);
}

function blocked(error: string, text = 'OTHRYS OS command boundary refused the request.') {
  return {
    text,
    status: 'blocked',
    stage: 'Command boundary',
    progress: 0,
    correlationId: 'none',
    canonical: false,
    error,
    simulated: false,
  };
}

function planningErrorCode(error: unknown): string {
  if (error && typeof error === 'object' && typeof (error as { code?: unknown }).code === 'string') {
    return String((error as { code: string }).code);
  }
  return 'PLANNING_FAILURE';
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  let raw = '';
  let bytes = 0;
  for await (const chunk of request) {
    const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
    bytes += Buffer.byteLength(text, 'utf8');
    if (bytes > 64 * 1024) throw new WebControlBridgeError('BODY_TOO_LARGE', 413);
    raw += text;
  }
  if (!raw) throw new WebControlBridgeError('BODY_REQUIRED', 400);
  try {
    return JSON.parse(raw);
  } catch {
    throw new WebControlBridgeError('BODY_JSON_INVALID', 400);
  }
}

function decodeMissionId(pathname: string): string | null {
  const prefix = '/v1/commands/';
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest.includes('/')) return null;
  try {
    return decodeURIComponent(rest);
  } catch {
    return null;
  }
}

function decodeMissionActivationId(pathname: string): string | null {
  const prefix = '/v1/commands/';
  const suffix = '/activate';
  if (!pathname.startsWith(prefix) || !pathname.endsWith(suffix)) return null;
  const rest = pathname.slice(prefix.length, -suffix.length);
  if (!rest || rest.includes('/')) return null;
  try {
    return decodeURIComponent(rest);
  } catch {
    return null;
  }
}
export async function handleWebControlRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: Options,
): Promise<boolean> {
  const url = new URL(request.url ?? '/', 'http://othrys.local');

  if (request.method === 'GET' && url.pathname === '/healthz') {
    sendJson(response, 200, { status: 'ok', service: 'othrys-os-gateway' });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/readyz') {
    if ((!options.token && !options.tokenSha256) || !options.ledgerPath) {
      sendJson(response, 503, { status: 'not_ready', error: 'CONTROL_BOUNDARY_NOT_CONFIGURED' });
      return true;
    }
    try {
      new WebControlBridge(options.ledgerPath);
      sendJson(response, 200, { status: 'ok' });
    } catch {
      sendJson(response, 503, { status: 'not_ready', error: 'ADMISSION_LEDGER_NOT_READY' });
    }
    return true;
  }

  const isSystemRead = request.method === 'GET' && url.pathname === '/v1/system';
  const isEstateRead = request.method === 'GET' && url.pathname === '/v1/estate';
  const isEstateRefresh = request.method === 'POST' && url.pathname === '/v1/estate/refresh';
  const isCollection = url.pathname === '/v1/commands';
  const missionId = decodeMissionId(url.pathname);
  const activationMissionId = request.method === 'POST' ? decodeMissionActivationId(url.pathname) : null;
  if (!isSystemRead && !isEstateRead && !isEstateRefresh && !isCollection && missionId === null && activationMissionId === null) return false;
  if (!bearerAuthorized(request.headers.authorization, options.token, options.tokenSha256 ?? '')) {
    sendJson(response, 401, blocked('AUTHENTICATION_REFUSED', 'Authentication refused.'));
    return true;
  }

  if (!options.ledgerPath) {
    sendJson(response, 503, blocked('ADMISSION_LEDGER_REQUIRED'));
    return true;
  }

  try {
    if (isSystemRead) {
      if (!options.systemProjection) {
        sendJson(response, 503, blocked('SYSTEM_PROJECTION_UNAVAILABLE'));
        return true;
      }
      sendJson(response, 200, await options.systemProjection());
      return true;
    }

    if (isEstateRead) {
      if (!options.estateProjection) {
        sendJson(response, 503, blocked('ESTATE_PROJECTION_UNAVAILABLE'));
        return true;
      }
      sendJson(response, 200, await options.estateProjection());
      return true;
    }

    if (isEstateRefresh) {
      if (!options.estateRefresh) {
        sendJson(response, 503, blocked('ESTATE_REFRESH_UNAVAILABLE'));
        return true;
      }
      sendJson(response, 200, await options.estateRefresh());
      return true;
    }

    if (request.method === 'POST' && activationMissionId !== null) {
      if (!options.commandActivator) {
        sendJson(response, 503, blocked('COMMAND_ACTIVATOR_UNAVAILABLE'));
        return true;
      }
      const result = await options.commandActivator(activationMissionId, await readJson(request));
      sendJson(response, 200, result);
      return true;
    }

    const bridge = new WebControlBridge(options.ledgerPath, options.commandEnvelopeDir ?? '');
    if (request.method === 'POST' && isCollection) {
      const contentType = request.headers['content-type'] ?? '';
      if (!/^application\/json(?:\s*;|$)/i.test(String(contentType))) {
        sendJson(response, 415, blocked('CONTENT_TYPE_INVALID'));
        return true;
      }
      const receipt = bridge.admit(await readJson(request));
      if (!options.commandPlanner) {
        sendJson(response, 202, receipt);
        return true;
      }
      try {
        const dispatch = await options.commandPlanner(receipt.correlationId);
        sendJson(response, 202, dispatch ? { ...receipt, dispatch } : receipt);
      } catch (error) {
        sendJson(response, 202, {
          ...receipt,
          planningDeferred: true,
          planningError: planningErrorCode(error),
        });
      }
      return true;
    }
    if (request.method === 'GET' && missionId !== null) {
      const receipt = bridge.status(missionId);
      if (!options.commandPlanner) {
        sendJson(response, 200, receipt);
        return true;
      }
      try {
        const dispatch = await options.commandPlanner(receipt.correlationId);
        sendJson(response, 200, dispatch ? { ...receipt, dispatch } : receipt);
      } catch (error) {
        sendJson(response, 200, {
          ...receipt,
          planningDeferred: true,
          planningError: planningErrorCode(error),
        });
      }
      return true;
    }
    sendJson(response, 405, blocked('METHOD_NOT_ALLOWED'));
    return true;
  } catch (error) {
    if (error instanceof WebControlBridgeError) {
      sendJson(response, error.status, blocked(error.code));
      return true;
    }
    if (
      error &&
      typeof error === 'object' &&
      typeof (error as { code?: unknown }).code === 'string' &&
      Number.isInteger((error as { status?: unknown }).status)
    ) {
      sendJson(
        response,
        Number((error as { status: number }).status),
        blocked(String((error as { code: string }).code)),
      );
      return true;
    }
    sendJson(response, 503, blocked('CONTROL_BOUNDARY_FAILURE'));
    return true;
  }
}
