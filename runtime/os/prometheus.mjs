import { createHash } from 'node:crypto';

export const PROMETHEUS_POLICY=Object.freeze({
  schema:'othrys.os.prometheus-intelligence.v1',
  id:'cap-score-v1',
  weights:Object.freeze({freeTier:0.28,quality:0.24,maintenance:0.18,licenseOpenness:0.12,integrationEase:0.10,latency:0.08}),
  minViableQuality:0.40,
  defaultStalenessHorizonDays:120,
  agingBelow:0.25
});

const OPEN_LICENSES=new Set(['mit','apache-2.0','bsd','mpl-2.0','gpl','agpl','open-weight']);
const LICENSE_OPENNESS={mit:1,'apache-2.0':1,bsd:1,'mpl-2.0':0.9,gpl:0.8,agpl:0.7,'open-weight':0.6,'source-available':0.45,bsl:0.45,'proprietary-free':0.4,sspl:0.35,proprietary:0.1,unknown:0.05};
const clamp=x=>Number.isFinite(Number(x))?Math.max(0,Math.min(1,Number(x))):0;
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const canonical=value=>JSON.stringify(stable(value));
const digest=value=>createHash('sha256').update(canonical(value)).digest('hex');

function assertPlain(value,code){
  if(!value||typeof value!=='object'||Array.isArray(value)) throw new Error(code);
  return value;
}
function assertString(value,code){
  if(typeof value!=='string'||!value.trim()) throw new Error(code);
  return value.trim();
}
export function validatePrometheusCapability(candidate){
  const c=assertPlain(candidate,'PROMETHEUS_CAPABILITY_REQUIRED');
  const ratings=assertPlain(c.ratings,'PROMETHEUS_RATINGS_REQUIRED');
  const out={
    id:assertString(c.id,'PROMETHEUS_CAPABILITY_ID_REQUIRED'),
    name:assertString(c.name??c.id,'PROMETHEUS_CAPABILITY_NAME_REQUIRED'),
    category:assertString(c.category,'PROMETHEUS_CAPABILITY_CATEGORY_REQUIRED'),
    license:String(c.license??'unknown').toLowerCase(),
    status:String(c.status??'active').toLowerCase(),
    ratings:Object.freeze({freeTier:clamp(ratings.freeTier),quality:clamp(ratings.quality),maintenance:clamp(ratings.maintenance),integrationEase:clamp(ratings.integrationEase),latency:clamp(ratings.latency)}),
    evidenceGrade:String(c.evidenceGrade??'editorial-prior'),
    asOf:assertString(c.asOf,'PROMETHEUS_CAPABILITY_ASOF_REQUIRED'),
    sources:Object.freeze(Array.isArray(c.sources)?c.sources.map(x=>assertString(x,'PROMETHEUS_SOURCE_INVALID')):[]),
    legal:c.legal!==false
  };
  return Object.freeze(out);
}

function freshness(cap,asOf,horizon=PROMETHEUS_POLICY.defaultStalenessHorizonDays){
  const now=Date.parse(asOf),then=Date.parse(cap.asOf);
  if(Number.isNaN(now)||Number.isNaN(then)) return {freshness:0,stale:true,caveat:'unparsed-date'};
  const days=(now-then)/86400000;
  if(days<0) return {freshness:0.3,stale:true,caveat:'future-dated'};
  const value=Math.max(0,1-days/horizon);
  if(value<=0) return {freshness:0,stale:true,caveat:'stale'};
  return value<PROMETHEUS_POLICY.agingBelow?{freshness:value,stale:false,caveat:'aging'}:{freshness:value,stale:false,caveat:null};
}
export function scorePrometheusCapability(candidate,{asOf}={}){
  const cap=validatePrometheusCapability(candidate);
  const checkedAt=assertString(asOf,'PROMETHEUS_SCORE_ASOF_REQUIRED');
  const b={
    freeTier:cap.ratings.freeTier,
    quality:cap.ratings.quality,
    maintenance:cap.ratings.maintenance,
    licenseOpenness:LICENSE_OPENNESS[cap.license]??LICENSE_OPENNESS.unknown,
    integrationEase:cap.ratings.integrationEase,
    latency:cap.ratings.latency
  };
  const w=PROMETHEUS_POLICY.weights;
  const contributions={freeTier:b.freeTier*w.freeTier,quality:b.quality*w.quality,maintenance:b.maintenance*w.maintenance,licenseOpenness:b.licenseOpenness*w.licenseOpenness,integrationEase:b.integrationEase*w.integrationEase,latency:b.latency*w.latency};
  const fitness=clamp(Object.values(contributions).reduce((a,x)=>a+x,0));
  const eligibilityFailures=[];
  if(!cap.legal) eligibilityFailures.push('legal=false');
  if(b.quality<PROMETHEUS_POLICY.minViableQuality) eligibilityFailures.push(`quality ${b.quality.toFixed(2)} < floor ${PROMETHEUS_POLICY.minViableQuality.toFixed(2)}`);
  if(['deprecated','superseded'].includes(cap.status)) eligibilityFailures.push(`status ${cap.status}`);
  const eligible=eligibilityFailures.length===0;
  const fresh=freshness(cap,checkedAt);
  const tier=!eligible?'avoid':fitness>=0.8?'recommended':fitness>=0.55?'viable':'avoid';
  return Object.freeze({schema:PROMETHEUS_POLICY.schema,policyId:PROMETHEUS_POLICY.id,capability:cap,fitness,tier,breakdown:Object.freeze(b),contributions:Object.freeze(contributions),eligible,eligibilityFailures:Object.freeze(eligibilityFailures),...fresh,authorityGranted:false});
}
export function recommendPrometheusCapabilities(needRaw,candidatesRaw,{asOf,limit=8}={}){
  const need=assertPlain(needRaw??{},'PROMETHEUS_NEED_REQUIRED');
  if(!Array.isArray(candidatesRaw)) throw new Error('PROMETHEUS_CANDIDATES_REQUIRED');
  const rejected=[];
  const scored=[];
  for(const raw of candidatesRaw){
    const cap=validatePrometheusCapability(raw),reasons=[];
    if(need.category&&cap.category!==need.category) reasons.push(`category ${cap.category} != ${need.category}`);
    if(need.mustBeFree&&cap.ratings.freeTier<0.5) reasons.push('mustBeFree');
    if(need.openSourceOnly&&!OPEN_LICENSES.has(cap.license)) reasons.push(`license ${cap.license} not open`);
    if(Number.isFinite(need.minQuality)&&cap.ratings.quality<Number(need.minQuality)) reasons.push(`minQuality ${cap.ratings.quality.toFixed(2)} < ${Number(need.minQuality).toFixed(2)}`);
    if(reasons.length){rejected.push({id:cap.id,reasons:Object.freeze(reasons)});continue;}
    scored.push(scorePrometheusCapability(cap,{asOf}));
  }
  scored.sort((a,b)=>a.capability.category.localeCompare(b.capability.category)||b.fitness-a.fitness||b.freshness-a.freshness||a.capability.id.localeCompare(b.capability.id));
  const ranked=scored.map((x,i,arr)=>Object.freeze({...x,categoryRank:1+arr.slice(0,i).filter(y=>y.capability.category===x.capability.category).length,rationale:`${x.capability.name}: ${x.tier}; fitness=${x.fitness.toFixed(3)}; evidence=${x.capability.evidenceGrade}; freshness=${x.freshness.toFixed(3)}.`,validationSteps:Object.freeze(['Verify current source evidence before commitment.','Treat recommendation as intelligence, never authority.'])}));
  return Object.freeze({schema:PROMETHEUS_POLICY.schema,policyId:PROMETHEUS_POLICY.id,need:Object.freeze({...need}),recommendations:Object.freeze(ranked.slice(0,Math.max(0,Math.trunc(limit)))),rejected:Object.freeze(rejected),considered:candidatesRaw.length,matched:ranked.length,authorityGranted:false,executionStarted:false,knowledgeAdmitted:false});
}

export function createPrometheusEvidenceArtifact(raw){
  const x=assertPlain(raw,'PROMETHEUS_EVIDENCE_REQUIRED');
  const body={schema:'othrys.os.prometheus-evidence.v1',sourceId:assertString(x.sourceId,'PROMETHEUS_EVIDENCE_SOURCE_REQUIRED'),sourceUrl:assertString(x.sourceUrl,'PROMETHEUS_EVIDENCE_URL_REQUIRED'),retrievedAt:assertString(x.retrievedAt,'PROMETHEUS_EVIDENCE_TIME_REQUIRED'),runId:assertString(x.runId,'PROMETHEUS_EVIDENCE_RUN_REQUIRED'),facts:stable(assertPlain(x.facts,'PROMETHEUS_EVIDENCE_FACTS_REQUIRED')),verificationStatus:String(x.verificationStatus??'OBSERVED'),evidenceGrade:String(x.evidenceGrade??'published-spec')};
  return Object.freeze({...body,contentDigest:digest(body),authorityGranted:false,knowledgeAdmitted:false,executionStarted:false});
}
