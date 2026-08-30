import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openCredentialUsageLedger } from './credential_usage_ledger.mjs';

test('usage ledger survives restart and is idempotent',()=>{const root=mkdtempSync(join(tmpdir(),'othrys-usage-')),path=join(root,'usage.jsonl');try{let l=openCredentialUsageLedger(path);const e={idempotencyKey:'k1',consumer:'prometheus',provider:'groq',grantId:'g1',cost:0,tokens:42,at:'2026-08-30T06:00:00Z'};assert.equal(l.append(e).status,'APPENDED');assert.equal(l.append(e).status,'EXISTS');l=openCredentialUsageLedger(path);assert.deepEqual(l.totals({consumer:'prometheus',provider:'groq',grantId:'g1'}),{requests:1,cost:0,tokens:42});assert.equal(l.read()[0].secretExposed,false);}finally{rmSync(root,{recursive:true,force:true});}});