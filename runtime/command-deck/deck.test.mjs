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
  assert.equal((html.match(/<button disabled/g)||[]).length,3);
  assert.match(html,/id="refineBtn"/);
  assert.match(html,/X-OTHRYS-CONTROL-TOKEN/);
  assert.match(html,/X-OTHRYS-DECK-TOKEN/);
  assert.match(html,/Legion builder node/);
  assert.match(html,/id="modelSelect"/);
  assert.match(html,/Auto · local first/);
  assert.match(html,/id="titansCard"/);
  assert.match(html,/data-page="models"/);
  assert.match(html,/function showSurface/);
  assert.match(html,/id="recentMissionsSide"/);
  assert.match(html,/data.canonicalMissions/);
  assert.match(html,/id="phaseRows"/);
  assert.match(html,/function renderPhases/);
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
  assert.equal(data.workState.schema,'othrys.os.work-state.v1');
  assert.match(data.workState.missionId,/^V2-/);
  assert.equal(data.workState.owner,'Legion');
  assert.equal(data.workState.verifier,'T590');
  assert.ok(['PLAN','BUILD','REVIEW','SHIP'].includes(data.workState.phase));
  assert.equal(data.workState.authorityGranted,false);
  if(data.workState.status==='COMPLETE'){ assert.equal(data.workState.phase,'SHIP'); assert.ok(data.workState.phases.every(p=>p.status==='COMPLETE')); } else { assert.ok(data.workState.phases.some(p=>p.status==='ACTIVE')||data.workState.phases.some(p=>p.status==='PENDING')); }
  assert.ok(Array.isArray(data.workState.laws));
  assert.ok(data.workState.laws.length>=7);
  assert.ok(data.workState.artifacts.some(a=>a.id==='surface-data'&&a.present===true));
  assert.equal(data.osSurface.titans.length,2);
  assert.deepEqual(data.osSurface.titans.map(t=>t.id),['hephaestus','talos']);
  assert.ok(Array.isArray(data.canonicalMissions));
  assert.ok(data.canonicalMissions.some(m=>m.missionId==='V2-007C'&&m.verdict==='PASS'));
  assert.ok(data.canonicalMissions.some(m=>m.missionId==='V2-007D'&&m.verdict==='PASS'));
  if(data.activeMission?.status==='COMPLETE') assert.ok(data.canonicalMissions.some(m=>m.missionId===data.activeMission.mission_id&&m.verdict==='PASS'));
  assert.equal(data.osSurface.models[0].id,'qwen3-builder');
  assert.equal(data.osSurface.models[0].available,true);
  assert.equal(data.osSurface.models[1].id,'llama3.2-advisory');
  assert.equal(data.osSurface.models[1].status,'ADVISORY ONLY');
  assert.equal(data.osSurface.models[2].available,false);
  assert.equal(data.missionEvidence.missionId,'V2-007F');
  assert.equal(data.missionEvidence.resultPresent,false);

});


test('Mission evidence endpoint is authenticated and read-only',async t=>{
  const env={...process.env,OTHRYS_DECK_TOKEN:'mission-token',OTHRYS_DECK_BIND:'127.0.0.1',OTHRYS_DECK_PORT:'18782'};
  const child=spawn(process.execPath,[join(dir,'server.mjs')],{env,stdio:['ignore','pipe','pipe']}); t.after(()=>child.kill());
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('server timeout')),4000);child.stdout.on('data',d=>{if(String(d).includes('"ready":true')){clearTimeout(timer);resolve();}});child.on('exit',c=>reject(new Error(`server exited ${c}`)));});
  let r=await fetch('http://127.0.0.1:18782/api/mission?id=V2-007E'); assert.equal(r.status,401);
  r=await fetch('http://127.0.0.1:18782/api/mission?id=V2-007E',{headers:{'X-OTHRYS-DECK-TOKEN':'mission-token'}}); assert.equal(r.status,200);
  const body=await r.json(); assert.equal(body.evidence.missionId,'V2-007E'); assert.equal(body.evidence.verdict,'PASS'); assert.equal(body.authorityGranted,false); assert.equal(body.controlsEnabled,false);
  r=await fetch('http://127.0.0.1:18782/api/mission?id=../../etc/passwd',{headers:{'X-OTHRYS-DECK-TOKEN':'mission-token'}}); assert.equal(r.status,404);
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

test('Refine intent ingress is separately authenticated and non-executing',async t=>{
  const d=mkdtempSync(join(tmpdir(),'othrys-intent-')); const f=join(d,'intents.jsonl');
  const candidate=JSON.parse(readFileSync(join(dir,'../../missions/V2-005A.result.json'),'utf8')).product_candidate_commit;
  const env={...process.env,OTHRYS_DECK_TOKEN:'read',OTHRYS_DECK_CONTROL_TOKEN:'control',OTHRYS_DECK_INTENT_FILE:f,OTHRYS_DECK_BIND:'127.0.0.1',OTHRYS_DECK_PORT:'18781',OTHRYS_DECK_NO_START:'0'};
  const child=spawn(process.execPath,[join(dir,'server.mjs')],{env,stdio:['ignore','pipe','pipe']});
  t.after(()=>{child.kill();rmSync(d,{recursive:true,force:true});});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('server timeout')),4000);child.stdout.on('data',d=>{if(String(d).includes('"ready":true')){clearTimeout(timer);resolve();}});});
  const url='http://127.0.0.1:18781/api/intent';
  const body={action:'REFINE_REQUEST',candidateCommit:candidate,feedback:'Make the output clearer for a touch-first user.'};
  const bad=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'wrong'},body:JSON.stringify(body)}); assert.equal(bad.status,401);
  const mismatch=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'control'},body:JSON.stringify({...body,candidateCommit:'bad'})}); assert.equal(mismatch.status,400);
  const forbidden=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'control'},body:JSON.stringify({...body,action:'ACCEPT'})}); assert.equal(forbidden.status,400);
  const ok=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'control'},body:JSON.stringify(body)}); assert.equal(ok.status,202);
  const data=await ok.json(); assert.equal(data.intent.status,'PENDING_TRUST_CANAL'); assert.equal(data.intent.authorityGranted,false);
  const lines=readFileSync(f,'utf8').trim().split(/\r?\n/); assert.equal(lines.length,1); assert.equal(JSON.parse(lines[0]).action,'REFINE_REQUEST');
});


test('Control intent status derives pending then admitted without execution',async()=>{
  process.env.OTHRYS_DECK_NO_START='1';
  const {readControlIntentState}=await import('./server.mjs');
  const d=mkdtempSync(join(tmpdir(),'othrys-control-state-')); const inbox=join(d,'intents.jsonl'),ledger=join(d,'admission.jsonl');
  try{
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-27T19:37:22.080Z',action:'REFINE_REQUEST',candidateCommit:'24b99ab9b9420c407d9eed01d23e0cf2f52a73d8',feedback:'Improve touch clarity.',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox,JSON.stringify(intent)+'\n');
    const pending=readControlIntentState(inbox,ledger); assert.equal(pending.status,'PENDING_TRUST_CANAL'); assert.equal(pending.authorityGranted,false);
    writeFileSync(ledger,JSON.stringify({missionId:pending.missionId})+'\n');
    const admitted=readControlIntentState(inbox,ledger); assert.equal(admitted.status,'ADMITTED'); assert.equal(admitted.missionId,pending.missionId);
  }finally{rmSync(d,{recursive:true,force:true});}
});
