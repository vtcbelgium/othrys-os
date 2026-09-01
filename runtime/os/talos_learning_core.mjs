import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const freeze=(v)=>{if(v&&typeof v==='object'){Object.freeze(v);for(const x of Object.values(v))freeze(x);}return v;};
const digest=(v)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const safeJson=(p)=>{try{return JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));}catch{return null;}};
const ratio=(a,b)=>b?Number((a/b).toFixed(4)):0;
const median=(xs)=>{const a=xs.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};

export function collectTrainingEvidence(root=process.cwd(),level=3){
  const dir=join(root,'training',`level-${level}`);
  const jobs=[];
  for(const name of readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort()){
    const base=join(dir,name), receipt=safeJson(join(base,'LEARNING_RECEIPT.json'));
    if(!receipt)continue;
    const attempts=readdirSync(base).filter(x=>/worker-result\.json$/i.test(x)).sort().map(x=>safeJson(join(base,x))).filter(Boolean);
    jobs.push({name,receipt,attempts});
  }
  return jobs;
}

export function synthesizeTalosLearning(jobs,{level=3}={}){
  if(!Array.isArray(jobs)||jobs.length===0)throw new Error('TALOS_LEARNING_EVIDENCE_REQUIRED');
  const builders=new Map(), checks=new Map(), families=new Map();
  let recoveries=0, finalPass=0, totalAttempts=0;
  for(const job of jobs){
    const r=job.receipt, family=r.family??r.key?.split('-').at(-1)??'unknown';
    const f=families.get(family)??{jobs:0,recoveries:0,finalPass:0}; f.jobs++;
    const recovery=r.operatorRecovery?.used===true; if(recovery){recoveries++;f.recoveries++;}
    const talosPass=r.talos?.status==='PASS'||r.talos?.result==='PASS'; if(talosPass){finalPass++;f.finalPass++;}
    families.set(family,f);
    for(const c of r.talos?.checks??[]){const x=checks.get(c.name)??{observed:0,finalPass:0};x.observed++;if(c.ok)x.finalPass++;checks.set(c.name,x);}
    const builder=r.builderAttempt?.builder??job.attempts[0]?.builder_id??'unknown';
    const b=builders.get(builder)??{jobs:0,firstPass:0,recovery:0,attempts:0,timeouts:0,noMutation:0,latencies:[]};
    b.jobs++; if(!recovery&&r.builderAttempt?.ok===true)b.firstPass++; if(recovery)b.recovery++;
    for(const a of job.attempts){if(a.builder_id!==builder)continue;b.attempts++;totalAttempts++;if(Number.isFinite(a.duration_sec))b.latencies.push(a.duration_sec*1000);if(/TIMEOUT/i.test(a.reason??''))b.timeouts++;if(/NO_ATTEMPT_MUTATION/i.test(a.reason??''))b.noMutation++;}
    builders.set(builder,b);
  }
  const builderEvidence={};
  for(const [id,b] of builders){builderEvidence[id]={jobs:b.jobs,firstPassRate:ratio(b.firstPass,b.jobs),recoveryRate:ratio(b.recovery,b.jobs),attemptFailureRate:ratio(b.timeouts+b.noMutation,b.attempts),timeoutRate:ratio(b.timeouts,b.attempts),noMutationRate:ratio(b.noMutation,b.attempts),medianLatencyMs:median(b.latencies)};}
  const checkEvidence=Object.fromEntries([...checks].map(([k,v])=>[k,{...v,finalPassRate:ratio(v.finalPass,v.observed)}]));
  const familyEvidence=Object.fromEntries([...families].map(([k,v])=>[k,{...v,recoveryRate:ratio(v.recoveries,v.jobs),finalPassRate:ratio(v.finalPass,v.jobs)}]));
  const body={schema:'othrys.talos.learning-core.v1',level,jobs:jobs.length,finalPassRate:ratio(finalPass,jobs.length),operatorRecoveryRate:ratio(recoveries,jobs.length),totalAttempts,builderEvidence,checkEvidence,familyEvidence};
  return freeze({...body,evidenceDigest:digest(body),authorityGranted:false,automaticAdmission:false,automaticLevelAdvance:false});
}
export function deriveTalosAdaptations(learning){
  if(learning?.schema!=='othrys.talos.learning-core.v1')throw new Error('TALOS_LEARNING_INVALID');
  const forgeEvidence={};
  const careSignals=[]; const researchQuestions=[]; const kronosHints={};
  for(const [id,b] of Object.entries(learning.builderEvidence)){
    forgeEvidence[id]={firstPassRate:b.firstPassRate,medianLatencyMs:b.medianLatencyMs,recoveryRate:b.recoveryRate,attemptFailureRate:b.attemptFailureRate};
    if(b.timeoutRate>=0.25)kronosHints[id]={timeoutClass:'SLOW_OR_UNSTABLE',suggestedBudgetMultiplier:1.5};
    if(b.noMutationRate>=0.25)careSignals.push({subject:id,severity:'DEGRADED',reason:'REPEATED_NO_MUTATION'});
    if(b.recoveryRate>=0.5)researchQuestions.push(`Why does ${id} require operator recovery on ${Math.round(b.recoveryRate*100)}% of observed jobs?`);
  }
  const weakChecks=Object.entries(learning.checkEvidence).filter(([,v])=>v.finalPassRate<1).map(([name,v])=>({name,rate:v.finalPassRate}));
  const body={schema:'othrys.talos.adaptation-plan.v1',sourceDigest:learning.evidenceDigest,
    HEPHAESTUS:{forgeEvidence,action:'USE_VERIFIED_FIRST_PASS_AND_LATENCY_EVIDENCE_IN_RANKING'},
    SWITCHYARD:{routeEvidence:forgeEvidence,action:'PREFER_PROVEN_LOW_RECOVERY_ROUTES_WITHIN_EXISTING_POLICY'},
    KRONOS:{builderTimingHints:kronosHints,action:'ADAPT_BOUNDED_TIMEOUT_RECOMMENDATIONS_ONLY'},
    RHEA:{careSignals,action:'OPEN_DIAGNOSTIC_SIGNAL_ONLY'},
    MNEMOSYNE:{lessonSummary:{jobs:learning.jobs,recoveryRate:learning.operatorRecoveryRate,weakChecks},action:'INDEX_VERIFIED_LESSONS_WITH_PROVENANCE'},
    PROMETHEUS:{researchQuestions,action:'RESEARCH_REPEATED_VERIFIED_GAPS'},
    MYCELIUM:{placementEvidence:forgeEvidence,action:'USE_LATENCY_AND_SUCCESS_TRAILS_AS_PLACEMENT_HINTS'},
    TALOS:{weakChecks,action:'EXPAND_ORACLE_COVERAGE_WHERE_FAILURES_ESCAPE_FIRST_PASS'},
    authorityGranted:false,executionAuthorityGranted:false,automaticAdmission:false};
  return freeze({...body,adaptationDigest:digest(body)});
}

export function buildTalosIntelligence(root=process.cwd(),level=3){
  const learning=synthesizeTalosLearning(collectTrainingEvidence(root,level),{level});
  const adaptations=deriveTalosAdaptations(learning);
  return freeze({schema:'othrys.talos.training-intelligence.v1',learning,adaptations,authorityGranted:false});
}
