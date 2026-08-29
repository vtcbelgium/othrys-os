import { createKronosHeartbeat } from '../../runtime/os/kronos.mjs';
import { createPrometheusKronosBeat } from '../../runtime/os/kronos_prometheus_beat.mjs';
import { discoverKeymasterEnvSource, resolveSealedEnvCredential } from '../../runtime/os/keymaster_vault.mjs';
import { runPrometheusDailySearch } from '../../runtime/os/prometheus_news_search.mjs';
import { runPrometheusDailyLoop } from '../../runtime/os/prometheus_daily_loop.mjs';
const root=process.cwd(),now=new Date().toISOString(),lease=Date.now()+3600000;
const components=['prometheus','mnemosyne','hermes','keymaster'].map(componentId=>({componentId,mandatory:true,band:'ready',evidenceRef:`os:${componentId}`,leaseExpiresAt:lease}));
const heartbeat=createKronosHeartbeat({bootId:`prom-daily-${now.slice(0,10)}`,sequence:1,timestamp:now,uptimeMs:0,lifecycleState:'VERIFYING',components});
const beat=createPrometheusKronosBeat({heartbeat,now});
if(!beat.prometheusMayRun){console.log(JSON.stringify({schema:'othrys.os.prometheus-daily-pulse.v1',status:'NOT_DUE',beat,authorityGranted:false,executionStarted:false},null,2));process.exit(0);}
const source=discoverKeymasterEnvSource(),sealed=resolveSealedEnvCredential(source,'TAVILY_API_KEY',{consumer:'prometheus-daily-pulse',readOnly:true,authorityGranted:false});
if(!sealed.ok) throw new Error(`PROM_DAILY_SEARCH_CREDENTIAL:${sealed.reason}`);
const out=await runPrometheusDailyLoop(root,{heartbeat,now,scanRunner:async()=>{const search=await runPrometheusDailySearch({sealedCredential:sealed.value,maxItems:8});return [...search.findings];}});
console.log(JSON.stringify({schema:'othrys.os.prometheus-daily-pulse.v1',status:out.status,beatDigest:beat.beatDigest,runId:out.runId??null,reportDigest:out.reportDigest??null,mnemosyneInboxId:out.mnemosyneInboxId??null,harvestWake:out.harvestWake??null,messageIntent:out.messageIntent??null,authorityGranted:false,executionStarted:false},null,2)); if(out.status==='FAILED')process.exitCode=1;
