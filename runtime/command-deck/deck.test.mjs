import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir=import.meta.dirname;
const html=readFileSync(join(dir,'public/index.html'),'utf8');

test('Deck UI is local, touch-ready and read-only',()=>{
  assert.match(html,/viewport-fit=cover/);
  assert.doesNotMatch(html,/https?:\/\//);
  assert.doesNotMatch(html,/innerHTML/);
  assert.equal((html.match(/<button disabled/g)||[]).length,4);
  assert.match(html,/X-OTHRYS-DECK-TOKEN/);
  assert.match(html,/Legion builder node/);
});

test('Deck API refuses writes and requires token',async t=>{
  const env={...process.env,OTHRYS_DECK_TOKEN:'test-read-token',OTHRYS_DECK_BIND:'127.0.0.1',OTHRYS_DECK_PORT:'18780'};
  const child=spawn(process.execPath,[join(dir,'server.mjs')],{env,stdio:['ignore','pipe','pipe']});
  t.after(()=>child.kill());
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('server timeout')),4000);child.stdout.on('data',d=>{if(String(d).includes('"ready":true')){clearTimeout(timer);resolve();}});child.on('exit',c=>reject(new Error(`server exited ${c}`)));});
  const noAuth=await fetch('http://127.0.0.1:18780/api/status');
  assert.equal(noAuth.status,401);
  const write=await fetch('http://127.0.0.1:18780/api/status',{method:'POST',headers:{'X-OTHRYS-DECK-TOKEN':'test-read-token'}});
  assert.equal(write.status,405);
  assert.equal((await write.json()).error,'READ_ONLY');
  const ok=await fetch('http://127.0.0.1:18780/api/status',{headers:{'X-OTHRYS-DECK-TOKEN':'test-read-token'}});
  assert.equal(ok.status,200);
  const data=await ok.json();
  assert.equal(data.schema,'othrys.command-deck.status.v1');
  assert.equal(data.authorityGranted,false);
  assert.equal(data.controlsEnabled,false);
  assert.ok(data.activeMission?.mission_id);
  assert.ok(Array.isArray(data.recentMissions));
});


test('Legion telemetry is sanitized and stale-aware',async()=>{
  process.env.OTHRYS_DECK_NO_START='1';
  const {readLegionTelemetry}=await import('./server.mjs');
  const d=mkdtempSync(join(tmpdir(),'othrys-deck-')); const f=join(d,'legion.json');
  try{
    writeFileSync(f,JSON.stringify({nodeId:'legion',capturedAt:new Date().toISOString(),cpuPercent:7,ramAvailableMb:12000,gpuUtilPercent:0,vramUsedMb:345,vramTotalMb:8151,gpuTempC:42,qwenLoaded:false,token:'must-not-leak'}));
    const live=readLegionTelemetry(f); assert.equal(live.id,'legion'); assert.equal(live.stale,false); assert.equal(live.qwenLoaded,false); assert.equal('token' in live,false);
    writeFileSync(f,JSON.stringify({nodeId:'legion',capturedAt:new Date(Date.now()-60000).toISOString()}));
    assert.equal(readLegionTelemetry(f).stale,true);
  }finally{rmSync(d,{recursive:true,force:true});}
});
