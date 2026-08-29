import { existsSync,mkdirSync,readFileSync,unlinkSync,writeFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { createHash } from 'node:crypto';
import { evaluatePrometheusDailyBeat,createPrometheusDailyReport,createPrometheusMnemosyneCapture,createPrometheusDailyMessageIntent,createPrometheusHarvestWakeProposal } from './prometheus_daily.mjs';
import { captureKnowledgeInbox } from './mnemosyne.mjs';

const sha=v=>createHash('sha256').update(String(v),'utf8').digest('hex');
const statePath=root=>join(root,'.othrys','prometheus','daily-state.json');
const claimPath=root=>join(root,'.othrys','prometheus','daily-claim.json');
const reportDir=root=>join(root,'.othrys','prometheus','daily-reports');
function loadState(root){
  const p=statePath(root); if(!existsSync(p)) return {schema:'othrys.os.prometheus-daily-state.v1',enabled:true,lastCompletedAt:null,lastReportDigest:null};
  try{return JSON.parse(readFileSync(p,'utf8'));}catch{throw new Error('PROM_DAILY_STATE_INVALID');}
}
function save(path,value,options={}){mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(value,null,2)+'\n',{encoding:'utf8',...options});}
function claim(root,{runId,now,staleClaimMs}){
  const path=claimPath(root),body={schema:'othrys.os.prometheus-daily-claim.v1',runId,claimedAt:now,authorityGranted:false};
  try{save(path,body,{flag:'wx'});return {claimed:true,orphanRecovered:false,path};}catch(error){if(error?.code!=='EEXIST')throw error;}
  let old;try{old=JSON.parse(readFileSync(path,'utf8'));}catch{return {claimed:false,reason:'CLAIM_INVALID',path};}
  const age=Date.parse(now)-Date.parse(old.claimedAt??'');
  if(!Number.isFinite(age)||age<0||age<staleClaimMs)return {claimed:false,reason:'IN_FLIGHT',path,ageMs:Number.isFinite(age)?age:null};
  unlinkSync(path); save(path,body,{flag:'wx'}); return {claimed:true,orphanRecovered:true,path,orphanedRunId:old.runId??null,ageMs:age};
}
function release(path){try{unlinkSync(path);}catch(error){if(error?.code!=='ENOENT')throw error;}}
export async function runPrometheusDailyLoop(root,{heartbeat,now,scanRunner,intervalHours=24,staleClaimMs=1800000}={}){
  if(typeof scanRunner!=='function') throw new Error('PROM_DAILY_SCAN_RUNNER_REQUIRED');
  if(!Number.isSafeInteger(staleClaimMs)||staleClaimMs<60000) throw new Error('PROM_DAILY_STALE_CLAIM_INVALID');
  const state=loadState(root);
  const gate=evaluatePrometheusDailyBeat({heartbeat,enabled:state.enabled!==false,lastCompletedAt:state.lastCompletedAt??null,intervalHours,now});
  if(!gate.due) return Object.freeze({schema:'othrys.os.prometheus-daily-loop.v1',status:'NOT_DUE',gate,mutationsPerformed:0,authorityGranted:false,executionStarted:false});
  const runId=`prom-daily-${sha(`${now}:${heartbeat.heartbeatDigest}`).slice(0,20)}`;
  const lock=claim(root,{runId,now,staleClaimMs});
  if(!lock.claimed) return Object.freeze({schema:'othrys.os.prometheus-daily-loop.v1',status:lock.reason,runId,claimAgeMs:lock.ageMs??null,mutationsPerformed:0,authorityGranted:false,executionStarted:false});
  try{
    const findings=await scanRunner({runId,now,authorityGranted:false});
    if(!Array.isArray(findings)) throw new Error('PROM_DAILY_SCAN_RESULT_INVALID');
    const report=createPrometheusDailyReport({runId,completedAt:now,findings});
    const capture=createPrometheusMnemosyneCapture(report);
    const mnem=captureKnowledgeInbox(root,{title:capture.title,text:capture.text,source:capture.source,capturedAt:now});
    const message=createPrometheusDailyMessageIntent(report),harvest=createPrometheusHarvestWakeProposal(report);
    const reportPath=join(reportDir(root),`${now.slice(0,10)}-${report.reportDigest.slice(0,12)}.json`);
    save(reportPath,{...report,mnemosyneInboxId:mnem.item.id,messageIntent:message,harvestWake:harvest});
    save(statePath(root),{schema:'othrys.os.prometheus-daily-state.v1',enabled:state.enabled!==false,lastCompletedAt:now,lastReportDigest:report.reportDigest,lastRunId:runId,lastOutcome:'COMPLETE',orphanRecovered:lock.orphanRecovered,authorityGranted:false});
    return Object.freeze({schema:'othrys.os.prometheus-daily-loop.v1',status:'COMPLETE',runId,reportDigest:report.reportDigest,mnemosyneInboxId:mnem.item.id,messageIntent:message,harvestWake:harvest,reportPath,orphanRecovered:lock.orphanRecovered,mutationsPerformed:4,authorityGranted:false,executionStarted:false});
  }catch(error){
    save(statePath(root),{schema:'othrys.os.prometheus-daily-state.v1',enabled:state.enabled!==false,lastCompletedAt:state.lastCompletedAt??null,lastReportDigest:state.lastReportDigest??null,lastRunId:runId,lastOutcome:'FAILED',lastFailure:{at:now,code:error?.message??'PROM_DAILY_FAILED'},authorityGranted:false});
    return Object.freeze({schema:'othrys.os.prometheus-daily-loop.v1',status:'FAILED',runId,error:String(error?.message??error).slice(0,240),mutationsPerformed:2,authorityGranted:false,executionStarted:false});
  }finally{release(lock.path);}
}