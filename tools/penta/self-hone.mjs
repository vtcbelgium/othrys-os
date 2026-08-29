import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createKronosHeartbeat } from '../../runtime/os/kronos.mjs';
import { assessCareObservations,createCareCase } from '../../runtime/os/rhea.mjs';
import { recordOperationalEvent,recordTroubleshootingFailure } from '../../runtime/os/mnemosyne_operations.mjs';

const root=new URL('../../',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1');
export const SELF_HONE_JOBS=Object.freeze([
  {id:'care',owner:'RHEA',command:['node','tools/penta/run-diagnostics.mjs','care']},
  {id:'intelligence',owner:'PROMETHEUS+MNEMOSYNE',command:['node','tools/penta/run-diagnostics.mjs','intelligence']},
  {id:'execution',owner:'TALOS+HEPHAESTUS',command:['node','tools/penta/run-diagnostics.mjs','execution']},
  {id:'communications',owner:'HERMES+KEYMASTER',command:['node','tools/penta/run-diagnostics.mjs','communications']},
  {id:'blood',owner:'PROMETHEUS+KEYMASTER+KRONOS',command:['node','tools/penta/run-diagnostics.mjs','blood']}
]);
const VERIFY_JOBS=Object.freeze([
  {id:'whole-body',owner:'TALOS',command:['node','tools/penta/whole-body.mjs']},
  {id:'penta-status',owner:'KRONOS+TALOS',command:['node','tools/penta/status.mjs']},
  {id:'fault-matrix',owner:'TALOS',command:['node','tools/penta/fault-matrix.mjs']},
  {id:'prometheus-pulse',owner:'KRONOS+PROMETHEUS',command:['node','tools/penta/prometheus-daily-pulse.mjs']},
  {id:'keymaster-health',owner:'KEYMASTER',command:['node','tools/penta/keymaster-live-health.mjs']}
]);
function run(job){return new Promise(resolve=>{const t=performance.now(),p=spawn(job.command[0],job.command.slice(1),{cwd:root,shell:false});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('close',code=>{let status=code===0?'PASS':'FAIL';if(job.id==='keymaster-health'){try{const x=JSON.parse(out);if(code===0&&x.degraded>0)status='DEGRADED';}catch{}}resolve({id:job.id,owner:job.owner,status,code,durationMs:+(performance.now()-t).toFixed(2),stdout:out.slice(-5000),stderr:err.slice(-5000)});});});}
export function selfHonePlan(){return Object.freeze({schema:'othrys.os.self-hone-plan.v1',parallel:Object.freeze(SELF_HONE_JOBS.map(x=>({id:x.id,owner:x.owner}))),verification:Object.freeze(VERIFY_JOBS.map(x=>({id:x.id,owner:x.owner}))),mnemosyneLogging:'AUTOMATIC',authorityGranted:false,executionStarted:false});}
const isCli=Boolean(process.argv[1])&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href;
if(isCli&&process.argv.includes('--plan')){console.log(JSON.stringify(selfHonePlan(),null,2));process.exit(0);}
if(isCli){
const now=new Date().toISOString(), lease=Date.now()+3600000;
const heartbeat=createKronosHeartbeat({bootId:`self-hone-${now.slice(0,10)}`,sequence:1,timestamp:now,uptimeMs:0,lifecycleState:'VERIFYING',components:SELF_HONE_JOBS.map(x=>({componentId:x.id,mandatory:true,band:'ready',evidenceRef:`self-hone:${x.id}`,leaseExpiresAt:lease}))});
recordOperationalEvent(root,{at:now,actor:'kronos',job:'self-hone:start',status:'INFO',evidence:{heartbeatDigest:heartbeat.heartbeatDigest,jobs:SELF_HONE_JOBS.length},lesson:'Pentarchy self-honing cycle opened'});
const parallel=await Promise.all(SELF_HONE_JOBS.map(run));
const observations=parallel.map(x=>({observedAt:new Date().toISOString(),failed:x.status!=='PASS',evidenceRef:`self-hone:${x.id}`,availability:x.status==='PASS'?'READY':'UNAVAILABLE'}));
const care=assessCareObservations('othrys-self-hone',observations);
const verification=[];for(const job of VERIFY_JOBS) verification.push(await run(job));
const rows=[...parallel,...verification], failed=rows.filter(x=>x.status==='FAIL'), degraded=rows.filter(x=>x.status==='DEGRADED');
const evidence={heartbeatDigest:heartbeat.heartbeatDigest,care,rows:rows.map(({id,owner,status,code,durationMs})=>({id,owner,status,code,durationMs}))};
if(failed.length){const c=createCareCase({subject:'othrys-self-hone',observedAt:new Date().toISOString(),state:'DEGRADED',severity:'ACTION',symptoms:failed.map(x=>`${x.id}:${x.code}`),evidenceRefs:failed.map(x=>`self-hone:${x.id}`)});recordTroubleshootingFailure(root,{actor:'rhea+mnemosyne',job:'self-hone',evidence:{...evidence,careCase:c},lesson:`Self-hone exposed ${failed.length} failing jobs; retained for troubleshooting.`});}
else recordOperationalEvent(root,{actor:'mnemosyne',job:'self-hone',status:degraded.length?'DEGRADED':'PASS',evidence:{...evidence,degraded:degraded.map(x=>x.id)},lesson:degraded.length?'Core verification passed; non-mandatory resource degradation remains under watch.':'All delegated organ jobs and independent verification passed.'});
const result={schema:'othrys.os.self-hone-run.v1',status:failed.length?'FAIL':degraded.length?'DEGRADED':'PASS',heartbeatDigest:heartbeat.heartbeatDigest,parallelJobs:parallel.length,verificationJobs:verification.length,failedJobs:failed.map(x=>x.id),degradedJobs:degraded.map(x=>x.id),care,rows:evidence.rows,mnemosyneLogged:true,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(result,null,2));if(failed.length)process.exit(1);
}
