import { createHash } from 'node:crypto';

export const PROMETHEUS_DAILY_SCHEMA='othrys.os.prometheus-daily.v1';
const sha=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const clean=v=>typeof v==='string'?v.trim():'';
const base=body=>Object.freeze({...body,authorityGranted:false,executionStarted:false});

export function evaluatePrometheusDailyBeat({heartbeat,enabled=true,lastCompletedAt=null,intervalHours=24,now}={}){
  if(!heartbeat||heartbeat.schema!=='othrys.os.kronos-heartbeat.v1') throw new Error('PROM_DAILY_KRONOS_HEARTBEAT_REQUIRED');
  if(heartbeat.authorityGranted!==false||heartbeat.executionStarted!==false) throw new Error('PROM_DAILY_HEARTBEAT_AUTHORITY_INVALID');
  if(!Number.isFinite(intervalHours)||intervalHours<1||intervalHours>168) throw new Error('PROM_DAILY_INTERVAL_INVALID');
  const t=Date.parse(clean(now)); if(!Number.isFinite(t)) throw new Error('PROM_DAILY_NOW_INVALID');
  const last=lastCompletedAt==null?null:Date.parse(clean(lastCompletedAt));
  if(lastCompletedAt!=null&&!Number.isFinite(last)) throw new Error('PROM_DAILY_LAST_INVALID');
  const due=enabled===true&&(last===null||t-last>=intervalHours*3600000);
  return base({schema:PROMETHEUS_DAILY_SCHEMA,enabled:enabled===true,due,intervalHours,beatDigest:heartbeat.heartbeatDigest,lastCompletedAt:lastCompletedAt??null,now:clean(now),schedulerInvented:false,triggerOwner:'KRONOS'});
}

function finding(raw,i){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) throw new Error(`PROM_DAILY_FINDING_INVALID:${i}`);
  const title=clean(raw.title),source=clean(raw.source),summary=clean(raw.summary),kind=clean(raw.kind).toUpperCase();
  if(!title||!source||!summary||summary.length>1800||!['NEWS','HARVEST','WATCH'].includes(kind)) throw new Error(`PROM_DAILY_FINDING_INVALID:${i}`);
  const score=Number(raw.score); if(!Number.isFinite(score)||score<0||score>1) throw new Error(`PROM_DAILY_SCORE_INVALID:${i}`);
  return Object.freeze({title,source,summary,kind,score,alreadyHarvested:raw.alreadyHarvested===true});
}
export function createPrometheusDailyReport({runId,completedAt,findings=[],maxMessageItems=6,harvestWakeThreshold=0.82}={}){
  runId=clean(runId); completedAt=clean(completedAt);
  if(!runId||!Number.isFinite(Date.parse(completedAt))||!Array.isArray(findings)) throw new Error('PROM_DAILY_REPORT_INVALID');
  const rows=findings.map(finding).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
  const news=rows.filter(x=>x.kind==='NEWS'), harvestable=rows.filter(x=>x.kind==='HARVEST'&&!x.alreadyHarvested);
  const wake=harvestable.some(x=>x.score>=harvestWakeThreshold);
  const messageItems=rows.slice(0,Math.max(1,Math.min(12,Math.trunc(maxMessageItems))));
  const message=messageItems.length?messageItems.map((x,i)=>`${i+1}. [${x.kind}] ${x.title} â€” ${x.summary}`).join('\n'):'No material findings today.';
  const body={schema:'othrys.os.prometheus-daily-report.v1',runId,completedAt,findings:Object.freeze(rows),newsCount:news.length,harvestableCount:harvestable.length,harvestWakeRecommended:wake,message,automaticHarvestStarted:false};
  return base({...body,reportDigest:sha(body)});
}

export function createPrometheusMnemosyneCapture(report){
  if(!report||report.schema!=='othrys.os.prometheus-daily-report.v1') throw new Error('PROM_DAILY_REPORT_REQUIRED');
  const text=[`Prometheus daily report ${report.completedAt}`,report.message,`Harvest wake recommended: ${report.harvestWakeRecommended}`].join('\n\n');
  return base({schema:'othrys.os.prometheus-mnemosyne-capture.v1',title:`Prometheus Daily ${report.completedAt.slice(0,10)}`,text,source:`prometheus-daily:${report.reportDigest}`,classification:'INBOX',promotionRequired:true});
}

export function createPrometheusHarvestWakeProposal(report){
  if(!report||report.schema!=='othrys.os.prometheus-daily-report.v1') throw new Error('PROM_DAILY_REPORT_REQUIRED');
  return base({schema:'othrys.os.prometheus-harvest-wake.v1',reportDigest:report.reportDigest,recommended:report.harvestWakeRecommended===true,reason:report.harvestWakeRecommended?'HIGH_VALUE_UNHARVESTED_SIGNAL':'NO_HIGH_VALUE_SIGNAL',target:'GREAT_HARVEST_PREFLIGHT',automaticPromotion:false,automaticHarvestStarted:false});
}

export function createPrometheusDailyMessageIntent(report,{recipient='operator',timestamp=report?.completedAt}={}){
  if(!report||report.schema!=='othrys.os.prometheus-daily-report.v1') throw new Error('PROM_DAILY_REPORT_REQUIRED');
  recipient=clean(recipient); timestamp=clean(timestamp);
  if(!recipient||!Number.isFinite(Date.parse(timestamp))) throw new Error('PROM_DAILY_MESSAGE_INVALID');
  const id=report.reportDigest.slice(0,24);
  return base({schema:'othrys.os.prometheus-daily-message-intent.v1',messageId:`prom-daily-${id}`,conversationId:'prometheus-daily',sender:'prometheus',recipient,channel:'operator.daily',timestamp,payload:Object.freeze({text:report.message,newsCount:report.newsCount,harvestableCount:report.harvestableCount,reportDigest:report.reportDigest}),requiresHermes:true,deliveryStarted:false});
}