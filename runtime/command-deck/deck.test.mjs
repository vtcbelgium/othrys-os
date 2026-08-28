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
  assert.match(html,/id="proposalBtn"/);
  assert.match(html,/MISSION_PROPOSAL/);
  assert.match(html,/Mission proposal queued for Trust Canal admission/);
  assert.match(html,/id="proposalCard"/);
  assert.match(html,/NOT PROMOTED/);
  assert.match(html,/id="promotionBtn"/);
  assert.match(html,/MISSION_PROMOTION_REQUEST/);
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
  assert.match(html,/id="workStatusLabel"/);
  assert.match(html,/currentWork\?\.missionId/);
  assert.match(html,/>Work<\/span>/);
  assert.match(html,/function renderPhases/);
  assert.match(html,/id="interventionPolicy"/);
  assert.match(html,/Only ask at design and checkpoints/);
  assert.match(html,/Preference only · never grants authority/);
  assert.match(html,/id="sliceRows"/);
  assert.match(html,/function renderSlices/);
  assert.match(html,/Mission slices/);
  assert.match(html,/id="modelRoutePreview"/);
  assert.match(html,/api\/model-selection/);
  assert.match(html,/id="newChatBtn"/);
  assert.match(html,/id="promptInput"/);
  assert.match(html,/id="chatMessages"/);
  assert.match(html,/othrys\.os\.local\.chat/);
  assert.doesNotMatch(html,/\/api\/chat/);
  assert.match(html,/id="newProjectBtn"/);
  assert.match(html,/id="localProjects"/);
  assert.match(html,/id="contextProject"/);
  assert.match(html,/id="workStateBadge"/);
  assert.match(html,/w\?\.status==='COMPLETE'\?'Complete':'Working…'/);
  assert.match(html,/#recentMissionsSide\{max-height:240px;overflow:auto/);
  assert.match(html,/id="connection"/);
  assert.match(html,/id="contextKind"/);
  assert.match(html,/CONNECTING/);
  assert.doesNotMatch(html,/\/api\/connection-action/);
  assert.match(html,/data-page="apps"/);
  assert.match(html,/id="appsCard"/);
  assert.match(html,/id="appsList"/);
  assert.match(html,/data-page="knowledge"/);
  assert.match(html,/id="knowledgeCard"/);
  assert.match(html,/id="knowledgeList"/);
  assert.doesNotMatch(html,/\/api\/knowledge-write/);
  assert.doesNotMatch(html,/\/api\/integration-action/);
  assert.match(html,/function selectProjectContext/);
  assert.match(html,/mission truth unchanged/);
  assert.doesNotMatch(html,/\/api\/project-context/);
  assert.match(html,/function chatKey/);
  assert.match(html,/othrys\.os\.local\.chat\./);
  assert.doesNotMatch(html,/\/api\/chat/);
  assert.match(html,/othrys\.os\.local\.projects/);
  assert.match(html,/Controller-local project draft/);
  assert.doesNotMatch(html,/\/api\/project/);
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
  assert.ok(data.canonicalMissions.length>0);
  assert.ok(data.canonicalMissions.every(m=>/^V2-/.test(m.missionId)&&typeof m.verdict==='string'));
  if(data.activeMission?.status==='COMPLETE') assert.ok(data.canonicalMissions.some(m=>m.missionId===data.activeMission.mission_id&&m.verdict==='PASS'));
  assert.equal(data.osSurface.models[0].id,'qwen3-builder');
  assert.equal(data.osSurface.models[0].available,true);
  assert.equal(data.osSurface.models[1].id,'llama3.2-advisory');
  assert.equal(data.osSurface.models[1].status,'ADVISORY ONLY');
  assert.equal(data.osSurface.models[2].available,false);
  assert.equal(data.osSurface.apps.length,4);
  assert.ok(data.osSurface.apps.every(a=>a.actionable===false));
  assert.ok(data.osSurface.apps.some(a=>a.id==='ollama-legion'&&a.status==='PROVEN'));
  assert.equal(data.osSurface.knowledge.length,5);
  assert.ok(data.osSurface.knowledge.some(k=>k.id==='north-star'&&k.present===true));
  assert.ok(data.osSurface.knowledge.every(k=>typeof k.path==='string'));
  assert.equal(data.missionEvidence.missionId,data.workState.missionId);
  assert.deepEqual(data.workState.slices.map(x=>[x.id,x.owner,x.status]),[['S1','Legion','COMPLETE'],['S2','Legion','COMPLETE'],['S3','T590',data.missionEvidence.resultPresent?'COMPLETE':'OPEN']]);
  assert.ok(data.workState.slices[2].artifacts.some(a=>a.id==='mission-result'&&a.present===data.missionEvidence.resultPresent));
  assert.equal(data.missionEvidence.resultPresent,data.missionEvidence.missionId===data.activeMission?.mission_id&&data.activeMission?.status==='COMPLETE');

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

test('Switchyard selection preview is authenticated and never executes',async t=>{
  const env={...process.env,OTHRYS_DECK_TOKEN:'switch-token',OTHRYS_DECK_BIND:'127.0.0.1',OTHRYS_DECK_PORT:'18783'};
  const child=spawn(process.execPath,[join(dir,'server.mjs')],{env,stdio:['ignore','pipe','pipe']}); t.after(()=>child.kill());
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('server timeout')),4000);child.stdout.on('data',d=>{if(String(d).includes('"ready":true')){clearTimeout(timer);resolve();}});});
  let r=await fetch('http://127.0.0.1:18783/api/model-selection?preference=auto'); assert.equal(r.status,401);
  r=await fetch('http://127.0.0.1:18783/api/model-selection?preference=auto',{headers:{'X-OTHRYS-DECK-TOKEN':'switch-token'}}); let b=await r.json(); assert.equal(b.selection.selected.id,'qwen3-builder'); assert.equal(b.selection.reason,'PRIMARY_LOCAL_AVAILABLE'); assert.equal(b.selection.executionStarted,false); assert.equal(b.selection.authorityGranted,false);
  r=await fetch('http://127.0.0.1:18783/api/model-selection?preference=remote-escalation',{headers:{'X-OTHRYS-DECK-TOKEN':'switch-token'}}); b=await r.json(); assert.equal(b.selection.selected,null); assert.equal(b.selection.reason,'PREFERENCE_UNAVAILABLE');
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
  let lines=readFileSync(f,'utf8').trim().split(/\r?\n/); assert.equal(lines.length,1); assert.equal(JSON.parse(lines[0]).action,'REFINE_REQUEST');
  const proposal={action:'MISSION_PROPOSAL',projectContext:'othrys-v2',objective:'Create a bounded mission proposal from tablet context.'};
  const pbad=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'control'},body:JSON.stringify({...proposal,projectContext:''})}); assert.equal(pbad.status,400);
  const pok=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'control'},body:JSON.stringify(proposal)}); assert.equal(pok.status,202);
  const pdata=await pok.json(); assert.equal(pdata.intent.action,'MISSION_PROPOSAL'); assert.equal(pdata.intent.status,'PENDING_TRUST_CANAL'); assert.equal(pdata.intent.authorityGranted,false);
  lines=readFileSync(f,'utf8').trim().split(/\r?\n/); assert.equal(lines.length,2); assert.equal(JSON.parse(lines[1]).projectContext,'othrys-v2');
  const promotion={action:'MISSION_PROMOTION_REQUEST',proposalId:'DECK-MISSION-0123456789abcdef01234567'};
  const xbad=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'control'},body:JSON.stringify({...promotion,proposalId:'bad'})}); assert.equal(xbad.status,400);
  const xok=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-CONTROL-TOKEN':'control'},body:JSON.stringify(promotion)}); assert.equal(xok.status,202); const xdata=await xok.json(); assert.equal(xdata.intent.action,'MISSION_PROMOTION_REQUEST'); assert.equal(xdata.intent.authorityGranted,false);
});


test('Control intent status derives pending then admitted without execution',async()=>{
  process.env.OTHRYS_DECK_NO_START='1';
  const {readControlIntentState,readLatestIntentState,missionProposalEnvelope}=await import('./server.mjs');
  const d=mkdtempSync(join(tmpdir(),'othrys-control-state-')); const inbox=join(d,'intents.jsonl'),ledger=join(d,'admission.jsonl');
  try{
    const intent={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-27T19:37:22.080Z',action:'REFINE_REQUEST',candidateCommit:'24b99ab9b9420c407d9eed01d23e0cf2f52a73d8',feedback:'Improve touch clarity.',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox,JSON.stringify(intent)+'\n');
    const pending=readControlIntentState(inbox,ledger); assert.equal(pending.status,'PENDING_TRUST_CANAL'); assert.equal(pending.authorityGranted,false);
    writeFileSync(ledger,JSON.stringify({missionId:pending.missionId})+'\n');
    const admitted=readControlIntentState(inbox,ledger); assert.equal(admitted.status,'ADMITTED'); assert.equal(admitted.missionId,pending.missionId);
    const proposal={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T12:30:00.000Z',action:'MISSION_PROPOSAL',projectContext:'othrys-v2',objective:'Create a bounded tablet mission proposal.',authorityGranted:false,status:'PENDING_TRUST_CANAL'};
    writeFileSync(inbox,JSON.stringify(proposal)+'\n');
    const pp=readControlIntentState(inbox,ledger); assert.match(pp.missionId,/^DECK-MISSION-/); assert.equal(pp.projectContext,'othrys-v2'); assert.equal(pp.status,'PENDING_TRUST_CANAL'); assert.equal(pp.authorityGranted,false); const envp=missionProposalEnvelope(pp); assert.equal(envp.schema,'othrys.os.mission-proposal.v1'); assert.equal(envp.proposalId,pp.missionId); assert.equal(envp.promoted,false); assert.equal(envp.canonicalMissionId,null); assert.equal(envp.executionStarted,false); assert.equal(missionProposalEnvelope({...pp,action:'REFINE_REQUEST'}),null); const promotion={schema:'othrys.deck.intent.v1',receivedAt:'2026-08-28T13:00:00.000Z',action:'MISSION_PROMOTION_REQUEST',proposalId:pp.missionId,authorityGranted:false,status:'PENDING_TRUST_CANAL'}; writeFileSync(inbox,JSON.stringify(proposal)+'\n'+JSON.stringify(promotion)+'\n'); const xp=readControlIntentState(inbox,ledger); assert.match(xp.missionId,/^DECK-PROMOTE-/); assert.equal(xp.proposalId,pp.missionId); const latestProposal=readLatestIntentState('MISSION_PROPOSAL',inbox,ledger); const latestPromotion=readLatestIntentState('MISSION_PROMOTION_REQUEST',inbox,ledger); const wrapped=missionProposalEnvelope(latestProposal,latestPromotion); assert.equal(wrapped.proposalId,pp.missionId); assert.equal(wrapped.promotionRequest.requestId,xp.missionId); assert.equal(wrapped.promotionRequest.status,'PENDING_TRUST_CANAL'); assert.equal(wrapped.promoted,false);
  }finally{rmSync(d,{recursive:true,force:true});}
});
