import { assessPentarchy,assessSelfHosting } from '../../runtime/os/pentarchy.mjs';
import { classifyFrugalReserve } from '../../runtime/os/frugal_reserve.mjs';
import { createPrometheusDailyReport } from '../../runtime/os/prometheus_daily.mjs';
import { assessCareObservations } from '../../runtime/os/rhea.mjs';

const rounds=Math.max(1000,Math.min(200000,Number(process.argv[2]??20000)));
const benches=[];
function bench(id,fn){for(let i=0;i<200;i++)fn();const t=performance.now();for(let i=0;i<rounds;i++)fn();const ms=performance.now()-t;benches.push({id,rounds,durationMs:+ms.toFixed(3),opsPerSecond:Math.round(rounds/(ms/1000))});}
const penta={missionId:'bench',evidence:{KRONOS:{lifeEvidence:true,boundedWindow:true},TALOS:{flowEvidence:true,verificationEvidence:true,terminationEvidence:true},PROMETHEUS:{intelligenceEvidence:true},MNEMOSYNE:{lineageEvidence:true,lessonEvidence:true},HEPHAESTUS:{buildEvidence:true,independentVerification:true}},authorityGranted:false,executionStarted:false};
bench('pentarchy.readiness',()=>assessPentarchy(penta));
bench('pentarchy.self-hosting',()=>assessSelfHosting({missionId:'bench',stage:'LEARNED',totalSteps:10,othrysSteps:10,externalSteps:0,capabilityDebt:[]}));
bench('switchyard.frugal-reserve',()=>classifyFrugalReserve({id:'free',remainingFraction:.42}));
bench('prometheus.daily-report',()=>createPrometheusDailyReport({runId:'bench',completedAt:'2026-08-29T08:00:00Z',findings:[{title:'A',source:'official',summary:'signal',kind:'NEWS',score:.8}]}));
bench('rhea.observation',()=>assessCareObservations('bench',[{failed:false,observedAt:'2026-08-29T08:00:00Z',evidenceRef:'bench',availability:'READY'}]));
console.log(JSON.stringify({schema:'othrys.os.pentarchy-benchmark.v1',rounds,benchmarks:benches,authorityGranted:false,executionStarted:false},null,2));