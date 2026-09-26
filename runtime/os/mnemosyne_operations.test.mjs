import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recordOperationalEvent, recordTroubleshootingFailure } from './mnemosyne_operations.mjs';

test('operational events go to the canonical event ledger without authority',()=>{
  const root=mkdtempSync(join(tmpdir(),'mnem-op-'));
  const out=recordOperationalEvent(root,{at:'2026-08-29T22:00:00Z',actor:'talos',job:'verify',status:'PASS',evidence:{tests:12},lesson:'green'});
  assert.equal(out.event.schema,'othrys.os.event.v1');
  assert.equal(out.event.authorityGranted,false);
  assert.equal(out.path,join(root,'.othrys','logs','system','talos.jsonl'));
  assert.ok(existsSync(out.path));
  assert.equal(readFileSync(out.path,'utf8').includes('green'),true);
});

test('failures remain reviewable without becoming Mnemosyne knowledge',()=>{
  const root=mkdtempSync(join(tmpdir(),'mnem-op-'));
  const out=recordTroubleshootingFailure(root,{at:'2026-08-29T22:00:00Z',actor:'rhea',job:'care-check',evidence:{failed:1},lesson:'repair required'});
  assert.equal(out.reviewRecommended,true);
  assert.equal(out.retainedIn,'OTHRYS_EVENT_LEDGER');
  assert.equal(out.operation.path,join(root,'.othrys','logs','system','rhea.jsonl'));
  assert.ok(existsSync(out.operation.path));
});
