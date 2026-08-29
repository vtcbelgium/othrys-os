import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const sha=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const clean=(v,n=240)=>String(v??'').trim().slice(0,n);

export function recordOperationalEvent(root,input={}){
  const at=clean(input.at||new Date().toISOString(),64);
  if(!Number.isFinite(Date.parse(at))) throw new Error('MNEM_OP_TIME_INVALID');
  const actor=clean(input.actor,48),job=clean(input.job,96),status=clean(input.status,24).toUpperCase();
  if(!actor||!job||!['PASS','FAIL','INFO','SKIP','DEGRADED'].includes(status)) throw new Error('MNEM_OP_EVENT_INVALID');
  const body={schema:'othrys.os.mnemosyne-operational-event.v1',at,actor,job,status,evidence:input.evidence??null,lesson:clean(input.lesson,1200),authorityGranted:false,executionStarted:false};
  const event=Object.freeze({...body,eventDigest:sha(body)});
  const path=join(root,'.othrys','knowledge','archive','operations',`${at.slice(0,10)}.jsonl`);
  mkdirSync(dirname(path),{recursive:true}); appendFileSync(path,JSON.stringify(event)+'\n','utf8');
  return Object.freeze({event,path});
}
export function recordTroubleshootingFailure(root,input={}){
  const op=recordOperationalEvent(root,{...input,status:'FAIL'});
  return Object.freeze({operation:op,reviewRecommended:true,retainedIn:'MNEMOSYNE_OPERATIONAL_ARCHIVE'});
}
