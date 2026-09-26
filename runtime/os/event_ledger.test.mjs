import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendEvent, EVENT_SCHEMA } from './event_ledger.mjs';

test('canonical event ledger writes append-only JSONL under .othrys/logs',()=>{
  const root=mkdtempSync(join(tmpdir(),'othrys-ledger-'));
  const out=appendEvent(root,{occurredAt:'2026-09-26T10:00:00Z',source:'kronos',type:'TASK_COMPLETED',status:'PASS',job:'estate-sync',evidenceRef:'receipt:abc'});
  assert.equal(out.event.schema,EVENT_SCHEMA);
  assert.equal(out.event.source,'kronos');
  assert.equal(out.event.authorityGranted,false);
  assert.equal(out.path,join(root,'.othrys','logs','system','kronos.jsonl'));
  assert.ok(existsSync(out.path));
  const rows=readFileSync(out.path,'utf8').trim().split(/\r?\n/).map(JSON.parse);
  assert.equal(rows.length,1);
  assert.equal(rows[0].type,'TASK_COMPLETED');
});

test('event channel and stream are bounded',()=>{
  const root=mkdtempSync(join(tmpdir(),'othrys-ledger-'));
  assert.throws(()=>appendEvent(root,{source:'aegis',type:'ALERT',status:'INFO',channel:'unknown'}),/EVENT_CHANNEL_INVALID/);
  const out=appendEvent(root,{source:'Training Lab',type:'RUN',status:'INFO',channel:'training'});
  assert.equal(out.path,join(root,'.othrys','logs','training','training-lab.jsonl'));
});
