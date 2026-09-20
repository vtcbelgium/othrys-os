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
export async function handleWebControlRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: Options,
): Promise<boolean> {
  const url = new URL(request.url ?? '/', 'http://othrys.local');

  if (request.method === 'GET' && url.pathname === '/healthz') {
    sendJson(response, 200, { status: 'ok', service: 'othrys-os-command-deck' });
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
  const isCollection = url.pathname === '/v1/commands';
  const missionId = decodeMissionId(url.pathname);
  if (!isSystemRead && !isCollection && missionId === null) return false;
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

    const bridge = new WebControlBridge(options.ledgerPath);
    if (request.method === 'POST' && isCollection) {
      const contentType = request.headers['content-type'] ?? '';
      if (!/^application\/json(?:\s*;|$)/i.test(String(contentType))) {
        sendJson(response, 415, blocked('CONTENT_TYPE_INVALID'));
        return true;
      }
      const receipt = bridge.admit(await readJson(request));
      sendJson(response, 202, receipt);
      return true;
    }
    if (request.method === 'GET' && missionId !== null) {
      sendJson(response, 200, bridge.status(missionId));
      return true;
    }
    sendJson(response, 405, blocked('METHOD_NOT_ALLOWED'));
    return true;
  } catch (error) {
    if (error instanceof WebControlBridgeError) {
      sendJson(response, error.status, blocked(error.code));
      return true;
    }
    sendJson(response, 503, blocked('CONTROL_BOUNDARY_FAILURE'));
    return true;
  }
}
