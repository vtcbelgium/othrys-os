import { createHash } from 'node:crypto';

export const JEV_CORTEX_SCHEMA='othrys.os.jev-cortex.v1';
export const JEV_TRAINING_RUN_SCHEMA='othrys.os.jev-training-run.v1';
export const JEV_OBSERVATION_SCHEMA='othrys.os.jev-observation.v1';

export const JEV_MODES=Object.freeze(['TRAINING','SHADOW','ADVISORY','LIMITED','TRUSTED']);
export const JEV_PROVIDERS=Object.freeze(['TYPESAFE_DIRECT','VERCEL_AI_GATEWAY','OPENROUTER']);
export const JEV_CIRCUITS=Object.freeze([
  Object.freeze({id:'router',label:'Router',purpose:'Classify intent and recommend a bounded execution path.',mode:'TRAINING',authorityGranted:false}),
  Object.freeze({id:'mission',label:'Mission',purpose:'Judge mission alignment, scope drift and stop/escalate signals.',mode:'TRAINING',authorityGranted:false}),
  Object.freeze({id:'risk',label:'Risk',purpose:'Estimate semantic risk before deterministic policy is applied.',mode:'TRAINING',authorityGranted:false}),
  Object.freeze({id:'context',label:'Context',purpose:'Score which repository, book, file or retrieved context is relevant.',mode:'TRAINING',authorityGranted:false}),
  Object.freeze({id:'verify',label:'Verify',purpose:'Assess claims of completion and whether stronger verification is required.',mode:'TRAINING',authorityGranted:false}),
  Object.freeze({id:'study',label:'Study',purpose:'Classify learning material before generative processing.',mode:'TRAINING',authorityGranted:false}),
]);

export const JEV_FOUNDATION_POLICY=Object.freeze({
  defaultMode:'TRAINING',
  stableModel:'jev-1.13.0',
  candidateModel:'jev-latest',
  newModelTrust:0,
  automaticPromotion:false,
  productionAuthority:false,
  permissionsRemainDeterministic:true,
  decisionMayTriggerExecution:false,
  logEveryEvaluation:true,
  questionLanguage:'en',
  candidateMustRequalify:true,
  compatibleQuestionsMayBatch:true,
});

const CIRCUIT_IDS=new Set(JEV_CIRCUITS.map(x=>x.id));
const PROVIDERS=new Set(JEV_PROVIDERS);
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

function requiredText(value,code){
  if(typeof value!=='string'||!value.trim()) throw new Error(code);
  return value.trim();
}
function finite01(value,code){
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1) throw new Error(code);
  return value;
}
function nonNegativeInteger(value,code){
  if(!Number.isInteger(value)||value<0) throw new Error(code);
  return value;
}

export function getJevCircuit(id){
  const key=requiredText(id,'JEV_CIRCUIT_REQUIRED');
  const circuit=JEV_CIRCUITS.find(x=>x.id===key);
  if(!circuit) throw new Error('JEV_CIRCUIT_UNKNOWN');
  return circuit;
}

export function createJevCortexStatus({
  stableModel=JEV_FOUNDATION_POLICY.stableModel,
  candidateModel=JEV_FOUNDATION_POLICY.candidateModel,
}={}){
  const stable=requiredText(stableModel,'JEV_STABLE_MODEL_REQUIRED');
  const candidate=requiredText(candidateModel,'JEV_CANDIDATE_MODEL_REQUIRED');
  return Object.freeze({
    schema:JEV_CORTEX_SCHEMA,
    mode:'TRAINING',
    authorityGranted:false,
    automaticPromotion:false,
    stable:Object.freeze({model:stable,trust:null,role:'CONTROL'}),
    candidate:Object.freeze({model:candidate,trust:0,role:'CANDIDATE'}),
    circuits:JEV_CIRCUITS,
    policy:JEV_FOUNDATION_POLICY,
  });
}

export function createJevTrainingRun(input={}){
  const circuitId=requiredText(input.circuitId,'JEV_CIRCUIT_REQUIRED');
  if(!CIRCUIT_IDS.has(circuitId)) throw new Error('JEV_CIRCUIT_UNKNOWN');
  const provider=requiredText(input.provider,'JEV_PROVIDER_REQUIRED');
  if(!PROVIDERS.has(provider)) throw new Error('JEV_PROVIDER_UNKNOWN');
  const requestedModel=requiredText(input.requestedModel,'JEV_MODEL_REQUIRED');
  const questionSetId=requiredText(input.questionSetId,'JEV_QUESTION_SET_REQUIRED');
  const state=requiredText(input.state,'JEV_STATE_REQUIRED');
  if(state.length>200000) throw new Error('JEV_STATE_TOO_LARGE');
  const body={
    schema:JEV_TRAINING_RUN_SCHEMA,
    mode:'TRAINING',
    circuitId,
    provider,
    requestedModel,
    questionSetId,
    stateDigest:sha(state),
    stateLength:state.length,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
  return Object.freeze({...body,runDigest:sha(body)});
}

export function createJevObservation(input={}){
  const run=input.run;
  if(!run||run.schema!==JEV_TRAINING_RUN_SCHEMA) throw new Error('JEV_TRAINING_RUN_INVALID');
  const resolvedModel=requiredText(input.resolvedModel,'JEV_RESOLVED_MODEL_REQUIRED');
  const answers=input.answers;
  if(!answers||typeof answers!=='object'||Array.isArray(answers)) throw new Error('JEV_ANSWERS_REQUIRED');
  const usage=input.usage&&typeof input.usage==='object'?Object.freeze({...input.usage}):null;
  const body={
    schema:JEV_OBSERVATION_SCHEMA,
    mode:'TRAINING',
    runDigest:run.runDigest,
    circuitId:run.circuitId,
    provider:run.provider,
    requestedModel:run.requestedModel,
    resolvedModel,
    questionSetId:run.questionSetId,
    answers:Object.freeze({...answers}),
    usage,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
  return Object.freeze({...body,observationDigest:sha(body)});
}

const BASE_GATES=Object.freeze({
  router:{minimumSamples:100,minimumAccuracy:0.90,minimumOrderStability:0.95,maximumCriticalFalseNegativeRate:0},
  mission:{minimumSamples:150,minimumAccuracy:0.90,minimumOrderStability:0.95,maximumCriticalFalseNegativeRate:0},
  risk:{minimumSamples:250,minimumAccuracy:0.97,minimumOrderStability:0.98,maximumCriticalFalseNegativeRate:0},
  context:{minimumSamples:100,minimumAccuracy:0.88,minimumOrderStability:0.92,maximumCriticalFalseNegativeRate:0.01},
  verify:{minimumSamples:150,minimumAccuracy:0.93,minimumOrderStability:0.95,maximumCriticalFalseNegativeRate:0},
  study:{minimumSamples:100,minimumAccuracy:0.92,minimumOrderStability:0.94,maximumCriticalFalseNegativeRate:0.01},
});

export function assessJevShadowEligibility(circuitId,metrics={}){
  const circuit=getJevCircuit(circuitId);
  const gate=BASE_GATES[circuit.id];
  const sampleCount=nonNegativeInteger(metrics.sampleCount,'JEV_METRIC_SAMPLE_COUNT');
  const accuracy=finite01(metrics.accuracy,'JEV_METRIC_ACCURACY');
  const orderStability=finite01(metrics.orderStability,'JEV_METRIC_ORDER_STABILITY');
  const criticalFalseNegativeRate=finite01(metrics.criticalFalseNegativeRate,'JEV_METRIC_CRITICAL_FN');
  const failures=[];
  if(sampleCount<gate.minimumSamples) failures.push('INSUFFICIENT_SAMPLES');
  if(accuracy<gate.minimumAccuracy) failures.push('ACCURACY_BELOW_GATE');
  if(orderStability<gate.minimumOrderStability) failures.push('ORDER_STABILITY_BELOW_GATE');
  if(criticalFalseNegativeRate>gate.maximumCriticalFalseNegativeRate) failures.push('CRITICAL_FALSE_NEGATIVE_GATE');
  return Object.freeze({
    schema:'othrys.os.jev-shadow-eligibility.v1',
    circuitId:circuit.id,
    eligibleForHumanShadowReview:failures.length===0,
    failures:Object.freeze(failures),
    gate,
    metrics:Object.freeze({sampleCount,accuracy,orderStability,criticalFalseNegativeRate}),
    resultingMode:'TRAINING',
    automaticPromotion:false,
    authorityGranted:false,
  });
}
