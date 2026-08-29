import { appendFileSync, existsSync, mkdirSync, openSync, closeSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectHousekeepingPulse } from './housekeeping_pulse.mjs';
import { inspectMnemosyneQuality } from './mnemosyne_quality.mjs';

const root=process.cwd();
const stateDir=join(root,'.othrys','runtime','housekeeper');
const logDir=join(root,'.othrys','logs');
const lockPath=join(stateDir,'housekeeper.lock');
const statePath=join(stateDir,'state.json');
const journalPath=join(logDir,'housekeeper.jsonl');
const findingsPath=join(stateDir,'findings.json');
mkdirSync(stateDir,{recursive:true}); mkdirSync(logDir,{recursive:true});

function append(entry){appendFileSync(journalPath,`${JSON.stringify(entry)}\n`,'utf8');}
function now(){return new Date().toISOString();}
function writeJson(path,value){writeFileSync(path,`${JSON.stringify(value,null,2)}\n`,'utf8');}
function readState(){try{return JSON.parse(readFileSync(statePath,'utf8'));}catch{return {cycle:0};}}
function acquire(){
  try{const fd=openSync(lockPath,'wx');writeFileSync(fd,`${process.pid}\n`);closeSync(fd);return true;}
  catch{return false;}
}
function release(){try{unlinkSync(lockPath);}catch{}}
function verifyFast(){
  const files=['runtime/os/housekeeping_pulse.test.mjs','runtime/os/mnemosyne_estate.test.mjs','runtime/os/house_books.test.mjs'];
  const r=spawnSync(process.execPath,['--test',...files],{cwd:root,encoding:'utf8',timeout:120000});
  return {ok:r.status===0,status:r.status,signal:r.signal,tail:(r.stdout+r.stderr).trim().split(/\r?\n/).slice(-20)};
}
function verifyFull(){
  const ps=`$t=(Get-ChildItem runtime -Recurse -File | Where-Object { $_.Name -match '\\.test\\.(mjs|ts)$' }).FullName; node --test $t`;
  const r=spawnSync('powershell',['-NoProfile','-Command',ps],{cwd:root,encoding:'utf8',timeout:600000});
  return {ok:r.status===0,status:r.status,signal:r.signal,tail:(r.stdout+r.stderr).trim().split(/\r?\n/).slice(-30)};
}
function cycle(){
  const state=readState(); const cycleNo=(state.cycle??0)+1;
  const pulse=inspectHousekeepingPulse(root);
  const quality=inspectMnemosyneQuality(root);
  const fast=verifyFast();
  const full=cycleNo%12===0?verifyFull():null;
  const defects=[];
  if(!quality.ok) defects.push({kind:'mnemosyne-quality',detail:quality.findings.filter(x=>x.severity!=='info')});
  if(!fast.ok) defects.push({kind:'fast-verification',detail:fast});
  if(full && !full.ok) defects.push({kind:'full-verification',detail:full});
  const record={schema:'othrys.os.housekeeper-cycle.v1',at:now(),cycle:cycleNo,pulse,quality:{ok:quality.ok,defectCount:quality.defectCount,infoCount:quality.infoCount},fast,full,defects,authorityGranted:false,mutationsPerformed:0};
  append(record); writeJson(findingsPath,{schema:'othrys.os.housekeeper-findings.v1',updatedAt:record.at,cycle:cycleNo,defects,authorityGranted:false});
  writeJson(statePath,{cycle:cycleNo,lastAt:record.at,lastOk:defects.length===0,pid:process.pid});
  return record;
}
async function main(){
  if(!acquire()){console.error('HOUSEKEEPER_ALREADY_RUNNING');process.exit(2);}
  const intervalMs=Math.max(60_000,Number(process.env.OTHRYS_HOUSEKEEPER_INTERVAL_MS)||300_000);
  append({schema:'othrys.os.housekeeper-start.v1',at:now(),pid:process.pid,intervalMs,authorityGranted:false});
  const stop=()=>{append({schema:'othrys.os.housekeeper-stop.v1',at:now(),pid:process.pid});release();process.exit(0);};
  process.on('SIGINT',stop); process.on('SIGTERM',stop); process.on('exit',release);
  for(;;){
    try{cycle();}
    catch(error){append({schema:'othrys.os.housekeeper-error.v1',at:now(),error:String(error?.stack??error),authorityGranted:false});}
    await new Promise(resolve=>setTimeout(resolve,intervalMs));
  }
}

if(import.meta.url===`file:///${process.argv[1]?.replace(/\\/g,'/')}` || process.argv[1]?.endsWith('housekeeper_daemon.mjs')) main();
