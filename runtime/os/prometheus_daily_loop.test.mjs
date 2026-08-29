import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,readFileSync,existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createKronosHeartbeat } from './kronos.mjs';
import { runPrometheusDailyLoop } from './prometheus_daily_loop.mjs';

const beat=createKronosHeartbeat({bootId:'boot-daily',sequence:1,timestamp:'2026-08-29T08:00:00Z',uptimeMs:1000,lifecycleState:'ALIVE',components:[{componentId:'prometheus',mandatory:true,band:'ready',evidenceRef:'test',leaseExpiresAt:null}]});

test('daily loop persists report, Mnem inbox and Hermes-bound message',async()=>{const root=mkdtempSync(join(tmpdir(),'othrys-prom-'));const out=await runPrometheusDailyLoop(root,{heartbeat:beat,now:'2026-08-29T08:00:00Z',scanRunner:async()=>[{title:'Free tool',source:'official',summary:'Useful free capability.',kind:'NEWS',score:.8},{title:'Old gem',source:'repo',summary:'Harvest candidate.',kind:'HARVEST',score:.95}]});assert.equal(out.status,'COMPLETE');assert.equal(out.messageIntent.requiresHermes,true);assert.equal(out.harvestWake.recommended,true);assert.ok(existsSync(out.reportPath));assert.ok(existsSync(join(root,'.othrys','knowledge','inbox',`${out.mnemosyneInboxId}.json`)));});
test('second beat inside interval performs no mutation',async()=>{const root=mkdtempSync(join(tmpdir(),'othrys-prom-'));await runPrometheusDailyLoop(root,{heartbeat:beat,now:'2026-08-29T08:00:00Z',scanRunner:async()=>[]});const out=await runPrometheusDailyLoop(root,{heartbeat:beat,now:'2026-08-29T09:00:00Z',scanRunner:async()=>{throw new Error('should not run')}});assert.equal(out.status,'NOT_DUE');assert.equal(out.mutationsPerformed,0);});