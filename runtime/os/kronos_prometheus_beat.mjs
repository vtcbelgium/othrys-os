import { createHash } from 'node:crypto';
import { evaluatePrometheusDailyBeat } from './prometheus_daily.mjs';
const sha=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');

export function createPrometheusKronosBeat({heartbeat,lastCompletedAt=null,enabled=true,intervalHours=24,now}={}){
  const due=evaluatePrometheusDailyBeat({heartbeat,lastCompletedAt,enabled,intervalHours,now});
  const body={schema:'othrys.os.kronos-prometheus-beat.v1',kind:'PROMETHEUS_DAILY',heartbeatDigest:heartbeat.heartbeatDigest,observedAt:now,lastCompletedAt,due:due.due,intervalHours,nextEligibleAt:lastCompletedAt?new Date(Date.parse(lastCompletedAt)+intervalHours*3600000).toISOString():now,trigger:'KRONOS_HEARTBEAT',prometheusMayRun:due.due===true,schedulerInvented:false};
  return Object.freeze({...body,beatDigest:sha(body),authorityGranted:false,executionStarted:false});
}

export function verifyPrometheusKronosBeat(beat){
  if(!beat||beat.schema!=='othrys.os.kronos-prometheus-beat.v1'||beat.authorityGranted!==false||beat.executionStarted!==false) return false;
  const {beatDigest,authorityGranted,executionStarted,...rest}=beat; return authorityGranted===false&&executionStarted===false&&sha(rest)===beatDigest;
}

