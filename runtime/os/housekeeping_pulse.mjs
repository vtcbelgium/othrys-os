import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inspectMnemosyneQuality } from './mnemosyne_quality.mjs';

export const HOUSEKEEPING_PULSE_SCHEMA='othrys.os.housekeeping-pulse.v1';

function head(root){
  try{return execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();}
  catch{return 'UNKNOWN';}
}

export function inspectHousekeepingPulse(root,{now=()=>new Date().toISOString()}={}){
  const quality=inspectMnemosyneQuality(root);
  const project=JSON.parse(readFileSync(join(root,'.othrys','project.json'),'utf8'));
  return Object.freeze({
    schema:HOUSEKEEPING_PULSE_SCHEMA,
    at:now(),
    head:head(root),
    projectId:project.projectId,
    quality:{ok:quality.ok,defectCount:quality.defectCount,infoCount:quality.infoCount},
    authorityGranted:false,
    executionStarted:false,
    mutationsPerformed:0
  });
}
export function appendHousekeepingPulse(root,pulse){
  const path=join(root,'.othrys','logs','housekeeping-pulse.jsonl');
  mkdirSync(dirname(path),{recursive:true});
  appendFileSync(path,`${JSON.stringify(pulse)}\n`,'utf8');
  return path;
}

export async function runHousekeepingLoop(root,{cycles=1,intervalMs=60_000,now}={}){
  const out=[];
  const count=Math.max(1,Number(cycles)||1);
  for(let i=0;i<count;i++){
    const pulse=inspectHousekeepingPulse(root,{now});
    appendHousekeepingPulse(root,pulse);
    out.push(pulse);
    if(i<count-1) await new Promise(resolve=>setTimeout(resolve,intervalMs));
  }
  return Object.freeze(out);
}