import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const EVENT_SCHEMA='othrys.os.event.v1';
export const EVENT_CHANNELS=Object.freeze(['system','agents','security','recovery','training']);

const sha=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const clean=(v,n=240)=>String(v??'').trim().slice(0,n);
const segment=v=>{
  const value=clean(v,80).toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
  if(!value) throw new Error('EVENT_STREAM_INVALID');
  return value;
};
const severityFor=status=>status==='FAIL'?'ERROR':status==='DEGRADED'?'WARN':'INFO';

export function appendEvent(root,input={}){
  const occurredAt=clean(input.occurredAt||input.at||new Date().toISOString(),64);
  if(!Number.isFinite(Date.parse(occurredAt))) throw new Error('EVENT_TIME_INVALID');

  const source=clean(input.source||input.actor,80);
  const type=clean(input.type||'OPERATION_RECORDED',96).toUpperCase();
  const status=clean(input.status||'INFO',24).toUpperCase();
  if(!source||!type||!['PASS','FAIL','INFO','SKIP','DEGRADED'].includes(status)) throw new Error('EVENT_INVALID');

  const channel=clean(input.channel||'system',32).toLowerCase();
  if(!EVENT_CHANNELS.includes(channel)) throw new Error('EVENT_CHANNEL_INVALID');
  const stream=segment(input.stream||source);
  const severity=clean(input.severity||severityFor(status),24).toUpperCase();
  if(!['DEBUG','INFO','WARN','ERROR','CRITICAL'].includes(severity)) throw new Error('EVENT_SEVERITY_INVALID');

  const body={
    schema:EVENT_SCHEMA,
    occurredAt,
    source,
    type,
    severity,
    status,
    missionId:clean(input.missionId,96)||null,
    workId:clean(input.workId,96)||null,
    correlationId:clean(input.correlationId,128)||null,
    evidenceRef:clean(input.evidenceRef,500)||null,
    job:clean(input.job,120)||null,
    evidence:input.evidence??null,
    lesson:clean(input.lesson,1200)||null,
    data:input.data&&typeof input.data==='object'?input.data:{},
    authorityGranted:false,
    executionStarted:false
  };
  const event=Object.freeze({...body,eventDigest:sha(body)});
  const path=join(root,'.othrys','logs',channel,stream+'.jsonl');
  mkdirSync(dirname(path),{recursive:true});
  appendFileSync(path,JSON.stringify(event)+'\n','utf8');
  return Object.freeze({event,path});
}
