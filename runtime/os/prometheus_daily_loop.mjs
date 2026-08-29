import { existsSync,mkdirSync,readFileSync,writeFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { createHash } from 'node:crypto';
import { evaluatePrometheusDailyBeat,createPrometheusDailyReport,createPrometheusMnemosyneCapture,createPrometheusDailyMessageIntent,createPrometheusHarvestWakeProposal } from './prometheus_daily.mjs';
import { captureKnowledgeInbox } from './mnemosyne.mjs';

const sha=v=>createHash('sha256').update(String(v),'utf8').digest('hex');
const statePath=root=>join(root,'.othrys','prometheus','daily-state.json');
const reportDir=root=>join(root,'.othrys','prometheus','daily-reports');
function loadState(root){
  const p=statePath(root); if(!existsSync(p)) return {schema:'othrys.os.prometheus-daily-state.v1',enabled:true,lastCompletedAt:null,lastReportDigest:null};
  try{return JSON.parse(readFileSync(p,'utf8'));}catch{throw new Error('PROM_DAILY_STATE_INVALID');}
}
function save(root,path,value){mkdirSync(join(path,'..'),{recursive:true});writeFileSync(path,JSON.stringify(value,null,2)+'\n','utf8');}

export async function runPrometheusDailyLoop(root,{heartbeat,now,scanRunner,intervalHours=24}={}){
  if(typeof scanRunner!=='function') throw new Error('PROM_DAILY_SCAN_RUNNER_REQUIRED');
  const state=loadState(root);
  const gate=evaluatePrometheusDailyBeat({heartbeat,enabled:state.enabled!==false,lastCompletedAt:state.lastCompletedAt??null,intervalHours,now});
  if(!gate.due) return Object.freeze({schema:'othrys.os.prometheus-daily-loop.v1',status:'NOT_DUE',gate,mutationsPerformed:0,authorityGranted:false,executionStarted:false});
  const runId=`prom-daily-${sha(`${now}:${heartbeat.heartbeatDigest}`).slice(0,20)}`;
  const findings=await scanRunner({runId,now,authorityGranted:false});
  if(!Array.isArray(findings)) throw new Error('PROM_DAILY_SCAN_RESULT_INVALID');
  const report=createPrometheusDailyReport({runId,completedAt:now,findings});
  const capture=createPrometheusMnemosyneCapture(report);
  const mnem=captureKnowledgeInbox(root,{title:capture.title,text:capture.text,source:capture.source,capturedAt:now});
  const message=createPrometheusDailyMessageIntent(report);
  const harvest=createPrometheusHarvestWakeProposal(report);
  const reportPath=join(reportDir(root),`${now.slice(0,10)}-${report.reportDigest.slice(0,12)}.json`);
  save(root,reportPath,{...report,mnemosyneInboxId:mnem.item.id,messageIntent:message,harvestWake:harvest});
  save(root,statePath(root),{schema:'othrys.os.prometheus-daily-state.v1',enabled:state.enabled!==false,lastCompletedAt:now,lastReportDigest:report.reportDigest,lastRunId:runId,authorityGranted:false});
  return Object.freeze({schema:'othrys.os.prometheus-daily-loop.v1',status:'COMPLETE',runId,reportDigest:report.reportDigest,mnemosyneInboxId:mnem.item.id,messageIntent:message,harvestWake:harvest,reportPath,mutationsPerformed:3,authorityGranted:false,executionStarted:false});
}
