import { readFileSync, existsSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { admitDeckIntent } from './intent_bridge.ts';

const once = process.argv.includes('--once');
const rawPollMs = process.env.OTHRYS_ADMISSION_POLL_MS ?? '5000';
const parsedPollMs = Number(rawPollMs);
if (!Number.isFinite(parsedPollMs) || parsedPollMs < 1000) throw new Error('OTHRYS_ADMISSION_POLL_MS_INVALID');
const pollMs = parsedPollMs;
const inboxPath = process.env.OTHRYS_DECK_INTENT_FILE ?? '';
const ledgerPath = process.env.OTHRYS_DECK_ADMISSION_LEDGER ?? '';
const errorPath = process.env.OTHRYS_ADMISSION_ERROR_FILE ?? join(process.env.LOCALAPPDATA ?? '.', 'OTHRYS', 'admission-watcher-last-error.txt');

if (!inboxPath || !ledgerPath) throw new Error('OTHRYS_DECK_INTENT_FILE_AND_LEDGER_REQUIRED');

function recordError(message: string): void {
  try {
    mkdirSync(dirname(errorPath), { recursive: true });
    writeFileSync(errorPath, `${new Date().toISOString()} ${message}\n`, 'utf8');
  } catch { /* error file is best-effort only */ }
}

function clearError(): void {
  try { if (existsSync(errorPath)) rmSync(errorPath, { force: true }); } catch { /* best-effort */ }
}

export function admitCompleteIntents(inbox: string, ledger: string): { admitted: number; replayed: number; failed: boolean } {
  if (!existsSync(inbox)) return { admitted: 0, replayed: 0, failed: false };
  const content = readFileSync(inbox, 'utf8');
  if (content.length === 0) return { admitted: 0, replayed: 0, failed: false };
  if (!content.endsWith('\n')) throw new Error('INBOX_TORN_TAIL');
  const lines = content.slice(0, -1).split('\n');
  const intents: unknown[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    let intent: unknown;
    try { intent = JSON.parse(line); }
    catch { throw new Error('INBOX_MALFORMED_LINE'); }
    intents.push(intent);
  }
  let admitted = 0;
  let replayed = 0;
  for (const intent of intents) {
    const result = admitDeckIntent(intent, ledger);
    if (result.created) admitted += 1;
    else replayed += 1;
  }
  return { admitted, replayed, failed: false };
}

async function cycle(): Promise<void> {
  try {
    admitCompleteIntents(inboxPath, ledgerPath);
    clearError();
  } catch (error) {
    recordError(error instanceof Error ? error.message : String(error));
  }
}

async function run(): Promise<void> {
  do {
    try { await cycle(); }
    catch { /* fail closed: error recorded, nothing admitted, continue polling */ }
    if (once) break;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  } while (true);
}

if (process.env.OTHRYS_ADMISSION_NO_START !== '1') run();
