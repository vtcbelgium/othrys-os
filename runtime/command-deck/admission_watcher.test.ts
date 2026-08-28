import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

function validIntent() {
  return {
    schema: 'othrys.deck.intent.v1',
    receivedAt: '2026-08-27T19:37:22.080Z',
    action: 'REFINE_REQUEST',
    candidateCommit: '24b99ab9b9420c407d9eed01d23e0cf2f52a73d8',
    feedback: 'Make the candidate clearer.',
    authorityGranted: false,
    status: 'PENDING_TRUST_CANAL',
  };
}

function validMissionProposal() {
  return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T12:30:00.000Z',action:'MISSION_PROPOSAL',projectContext:'othrys-v2',objective:'Create a bounded project mission proposal.',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
}

function validPromotionRequest() {
  return {schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:00:00.000Z',action:'MISSION_PROMOTION_REQUEST',proposalId:'DECK-MISSION-0123456789abcdef01234567',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
}

function tmp() {
  const d = mkdtempSync(join(tmpdir(), 'admission-watcher-'));
  return { d, inbox: join(d, 'intents.jsonl'), ledger: join(d, 'admission.jsonl') };
}

function ledgerLines(ledger) {
  if (!existsSync(ledger)) return [];
  const content = readFileSync(ledger, 'utf8');
  if (!content) return [];
  return content.trim().split(/\r?\n/).filter(Boolean);
}

// Import the module with env set so import-time side effects are controlled.
// OTHRYS_ADMISSION_NO_START=1 prevents the poll loop from starting; the
// required inbox/ledger env vars are set so the module loads without throwing.
process.env.OTHRYS_ADMISSION_NO_START = '1';
process.env.OTHRYS_DECK_INTENT_FILE = join(tmpdir(), 'admission-watcher-import-intents.jsonl');
process.env.OTHRYS_DECK_ADMISSION_LEDGER = join(tmpdir(), 'admission-watcher-import-ledger.jsonl');
process.env.OTHRYS_ADMISSION_POLL_MS = '5000';
const { admitCompleteIntents } = await import('./admission_watcher.ts');

test('complete valid pending REFINE_REQUEST is admitted through admitDeckIntent', () => {
  const { d, inbox, ledger } = tmp();
  try {
    writeFileSync(inbox, JSON.stringify(validIntent()) + '\n');
    const result = admitCompleteIntents(inbox, ledger);
    assert.equal(result.admitted, 1);
    assert.equal(result.replayed, 0);
    assert.equal(result.failed, false);
    const lines = ledgerLines(ledger);
    assert.equal(lines.length, 1);
    const record = JSON.parse(lines[0]);
    assert.equal(record.state, 'ADMITTED');
    assert.match(record.missionId, /^DECK-REFINE-/);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('complete valid pending MISSION_PROPOSAL is admitted without execution', () => {
  const { d, inbox, ledger } = tmp();
  try {
    writeFileSync(inbox, JSON.stringify(validMissionProposal()) + '\n');
    const result = admitCompleteIntents(inbox, ledger);
    assert.equal(result.admitted, 1); assert.equal(result.replayed, 0);
    const record = JSON.parse(ledgerLines(ledger)[0]); assert.equal(record.state,'ADMITTED'); assert.match(record.missionId,/^DECK-MISSION-/); assert.equal('authorityGranted' in record,false); assert.equal('executionStarted' in record,false);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('complete valid pending MISSION_PROMOTION_REQUEST is admitted without execution', () => {
  const { d, inbox, ledger } = tmp();
  try {writeFileSync(inbox,JSON.stringify(validPromotionRequest())+'\n');const result=admitCompleteIntents(inbox,ledger);assert.equal(result.admitted,1);const record=JSON.parse(ledgerLines(ledger)[0]);assert.match(record.missionId,/^DECK-PROMOTE-/);assert.equal(record.state,'ADMITTED');assert.equal('authorityGranted' in record,false);assert.equal('executionStarted' in record,false);} finally {rmSync(d,{recursive:true,force:true});}
});

test('authorityGranted and executionStarted remain false in the admission path', () => {
  const { d, inbox, ledger } = tmp();
  try {
    writeFileSync(inbox, JSON.stringify(validIntent()) + '\n');
    admitCompleteIntents(inbox, ledger);
    const record = JSON.parse(ledgerLines(ledger)[0]);
    assert.equal(record.actor.role, 'operator');
    assert.equal(record.actor.channel, 'command-deck');
    assert.equal(record.state, 'ADMITTED');
    // The admission record carries no authority or execution fields; the
    // watcher itself never grants authority or starts execution.
    assert.equal('authorityGranted' in record, false);
    assert.equal('executionStarted' in record, false);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('replay is idempotent and does not duplicate ledger records', () => {
  const { d, inbox, ledger } = tmp();
  try {
    writeFileSync(inbox, JSON.stringify(validIntent()) + '\n');
    const first = admitCompleteIntents(inbox, ledger);
    const second = admitCompleteIntents(inbox, ledger);
    assert.equal(first.admitted, 1);
    assert.equal(second.admitted, 0);
    assert.equal(second.replayed, 1);
    assert.equal(ledgerLines(ledger).length, 1);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('torn-tail inbox with no trailing newline admits nothing', () => {
  const { d, inbox, ledger } = tmp();
  try {
    writeFileSync(inbox, JSON.stringify(validIntent())); // no trailing newline
    assert.throws(() => admitCompleteIntents(inbox, ledger), /INBOX_TORN_TAIL/);
    assert.equal(ledgerLines(ledger).length, 0);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('malformed JSON anywhere admits nothing, including after a valid line', () => {
  const { d, inbox, ledger } = tmp();
  try {
    writeFileSync(inbox, JSON.stringify(validIntent()) + '\n' + '{not-json}\n');
    assert.throws(() => admitCompleteIntents(inbox, ledger), /INBOX_MALFORMED_LINE/);
    assert.equal(ledgerLines(ledger).length, 0);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('empty and missing inbox are harmless', () => {
  const { d, inbox, ledger } = tmp();
  try {
    writeFileSync(inbox, '');
    assert.deepEqual(admitCompleteIntents(inbox, ledger), { admitted: 0, replayed: 0, failed: false });
    rmSync(inbox, { force: true });
    assert.deepEqual(admitCompleteIntents(inbox, ledger), { admitted: 0, replayed: 0, failed: false });
    assert.equal(ledgerLines(ledger).length, 0);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('invalid OTHRYS_ADMISSION_POLL_MS fails closed', async () => {
  const mod = join(dir, 'admission_watcher.ts');
  const cases = ['abc', '0', '999', 'Infinity', 'NaN', ''];
  const original = {
    OTHRYS_ADMISSION_NO_START: process.env.OTHRYS_ADMISSION_NO_START,
    OTHRYS_DECK_INTENT_FILE: process.env.OTHRYS_DECK_INTENT_FILE,
    OTHRYS_DECK_ADMISSION_LEDGER: process.env.OTHRYS_DECK_ADMISSION_LEDGER,
    OTHRYS_ADMISSION_POLL_MS: process.env.OTHRYS_ADMISSION_POLL_MS,
  };
  try {
    for (const bad of cases) {
      process.env.OTHRYS_ADMISSION_NO_START = '1';
      process.env.OTHRYS_DECK_INTENT_FILE = join(tmpdir(), 'x-intents.jsonl');
      process.env.OTHRYS_DECK_ADMISSION_LEDGER = join(tmpdir(), 'x-ledger.jsonl');
      process.env.OTHRYS_ADMISSION_POLL_MS = bad;
      const url = new URL(`file://${mod.replace(/\\/g, '/')}?poll=${encodeURIComponent(bad)}`);
      await assert.rejects(() => import(url), /OTHRYS_ADMISSION_POLL_MS_INVALID/);
    }
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});

test('no shell/child_process/Hephaestus/Talos/Worker/accept/reject/release execution path', () => {
  const src = readFileSync(join(dir, 'admission_watcher.ts'), 'utf8');
  assert.ok(!src.includes('child_process'));
  assert.ok(!src.includes('spawn'));
  assert.ok(!src.includes('execSync'));
  assert.ok(!src.includes('spawnSync'));
  assert.ok(!/Hephaestus|Talos|Worker/i.test(src));
  assert.ok(!/\baccept\b|\breject\b|\brelease\b/i.test(src));
  assert.ok(!src.includes("require('child_process'"));
});

test('module import side effects are controlled by OTHRYS_ADMISSION_NO_START and required env', async () => {
  // With NO_START=1 and required env set, import succeeds and does not start the loop.
  const mod = join(dir, 'admission_watcher.ts');
  const url = new URL(`file://${mod.replace(/\\/g, '/')}?sideeffects=1`);
  const m = await import(url);
  assert.equal(typeof m.admitCompleteIntents, 'function');
  // Without the required inbox/ledger env, import fails closed.
  const original = {
    OTHRYS_DECK_INTENT_FILE: process.env.OTHRYS_DECK_INTENT_FILE,
    OTHRYS_DECK_ADMISSION_LEDGER: process.env.OTHRYS_DECK_ADMISSION_LEDGER,
  };
  try {
    process.env.OTHRYS_DECK_INTENT_FILE = '';
    process.env.OTHRYS_DECK_ADMISSION_LEDGER = '';
    const url2 = new URL(`file://${mod.replace(/\\/g, '/')}?sideeffects=2`);
    await assert.rejects(() => import(url2), /OTHRYS_DECK_INTENT_FILE_AND_LEDGER_REQUIRED/);
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});

test('later line parses but is rejected by the strict 006D bridge — observed behavior made explicit', () => {
  const { d, inbox, ledger } = tmp();
  try {
    // First line is valid; second line parses as JSON but fails the strict
    // 006D bridge (status EXECUTING is not PENDING_TRUST_CANAL).
    const rejected = { ...validIntent(), status: 'EXECUTING' };
    writeFileSync(inbox, JSON.stringify(validIntent()) + '\n' + JSON.stringify(rejected) + '\n');
    // OBSERVED BEHAVIOR: the whole file passes structural JSON validation, so
    // the admit loop runs. The first (valid) intent is admitted, then the
    // second line throws DeckIntentError(INTENT_STATE_INVALID) from the bridge.
    // This means the valid line IS admitted before the bridge-rejected line
    // throws — a partial admission for bridge-rejection (not malformed JSON).
    // External review must decide whether this satisfies the mission law.
    assert.throws(() => admitCompleteIntents(inbox, ledger), /INTENT_STATE_INVALID/);
    const lines = ledgerLines(ledger);
    assert.equal(lines.length, 1, 'the valid first intent was admitted before the bridge-rejected line threw');
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('complete valid pending MISSION_ID_ALLOCATION_REQUEST is admitted without allocation or execution', () => {
  const { d, inbox, ledger } = tmp();
  try {
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:10:00.000Z',action:'MISSION_ID_ALLOCATION_REQUEST',candidateId:'CANDIDATE-0123456789abcdef01234567',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox, JSON.stringify(intent) + '\n');
    const result=admitCompleteIntents(inbox,ledger); assert.equal(result.admitted,1);
    const record=JSON.parse(ledgerLines(ledger)[0]); assert.match(record.missionId,/^DECK-ALLOCATE-/); assert.equal(record.state,'ADMITTED');
    assert.equal('authorityGranted' in record,false); assert.equal('executionStarted' in record,false);
  } finally { rmSync(d,{recursive:true,force:true}); }
});

test('complete valid pending MISSION_ACTIVATION_REQUEST is admitted without activation or execution', () => {
  const { d, inbox, ledger } = tmp();
  try {
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:55:00.000Z',action:'MISSION_ACTIVATION_REQUEST',missionId:'V2-008D',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox, JSON.stringify(intent) + '\n');
    const result=admitCompleteIntents(inbox,ledger); assert.equal(result.admitted,1);
    const record=JSON.parse(ledgerLines(ledger)[0]); assert.match(record.missionId,/^DECK-ACTIVATE-/); assert.equal(record.state,'ADMITTED');
    assert.equal('authorityGranted' in record,false); assert.equal('executionStarted' in record,false);
  } finally { rmSync(d,{recursive:true,force:true}); }
});

test('complete valid pending MISSION_NO_CHANGE_CLOSE_REQUEST is admitted without closeout or execution', () => {
  const d=mkdtempSync(join(tmpdir(),'admission-watch-nochange-')); const inbox=join(d,'inbox.jsonl'),ledger=join(d,'ledger.jsonl');
  try{
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T14:10:00.000Z',action:'MISSION_NO_CHANGE_CLOSE_REQUEST',missionId:'V2-008D',preflightDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox,JSON.stringify(intent)+'\n','utf8');
    const r=admitCompleteIntents(inbox,ledger); assert.equal(r.admitted,1); assert.equal(r.failed,false);
    const line=readFileSync(ledger,'utf8').trim(); assert.match(line,/DECK-NOCHANGE-/); assert.doesNotMatch(line,/executionStarted":true/);
  } finally { rmSync(d,{recursive:true,force:true}); }
});

test('complete valid pending MISSION_BUILD_REQUEST is admitted without builder execution', () => {
  const d=mkdtempSync(join(tmpdir(),'admission-watch-build-')); const inbox=join(d,'inbox.jsonl'),ledger=join(d,'ledger.jsonl');
  try{
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T15:20:00.000Z',action:'MISSION_BUILD_REQUEST',missionId:'V2-008G',builderId:'qwen3-builder',routeDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox,JSON.stringify(intent)+'\n','utf8'); const r=admitCompleteIntents(inbox,ledger); assert.equal(r.admitted,1); assert.match(readFileSync(ledger,'utf8'),/DECK-BUILD-/);
  } finally { rmSync(d,{recursive:true,force:true}); }
});

test('complete valid pending MISSION_EXECUTION_AUTH_REQUEST is admitted without worker launch', () => {
  const d=mkdtempSync(join(tmpdir(),'admission-watch-exec-')); const inbox=join(d,'inbox.jsonl'),ledger=join(d,'ledger.jsonl');
  try{const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T15:40:00.000Z',action:'MISSION_EXECUTION_AUTH_REQUEST',missionId:'V2-009A',buildRequestId:'DECK-BUILD-0123456789abcdef01234567',builderId:'qwen3-builder',packageDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};writeFileSync(inbox,JSON.stringify(intent)+'\n');const r=admitCompleteIntents(inbox,ledger);assert.equal(r.admitted,1);assert.match(readFileSync(ledger,'utf8'),/DECK-EXEC-/);}finally{rmSync(d,{recursive:true,force:true});}
});

test('complete valid pending MISSION_WORKER_LAUNCH_REQUEST is admitted without worker launch',()=>{const d=mkdtempSync(join(tmpdir(),'watch-launch-')),inbox=join(d,'inbox.jsonl'),ledger=join(d,'ledger.jsonl');try{const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T16:20:00.000Z',action:'MISSION_WORKER_LAUNCH_REQUEST',missionId:'V2-009A',leaseId:'LEASE-0123456789abcdef01234567',builderId:'qwen3-builder',leaseDigest:'a'.repeat(64),authorityGranted:false,status:'PENDING_TRUST_CANAL'};writeFileSync(inbox,JSON.stringify(intent)+'\n');const r=admitCompleteIntents(inbox,ledger);assert.equal(r.admitted,1);assert.match(readFileSync(ledger,'utf8'),/DECK-LAUNCH-/);}finally{rmSync(d,{recursive:true,force:true});}});
