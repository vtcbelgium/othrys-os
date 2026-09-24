import { createHash } from 'node:crypto';

export const JEV_EXECUTION_PLAN_SCHEMA='othrys.os.jev-execution-plan.v1';
export const JEV_BRIDGE_RECEIPT_SCHEMA='othrys.os.jev-bridge-receipt.v1';

export const JEV_EXECUTION_LANES=Object.freeze({
  FAST:Object.freeze({
    id:'FAST',
    purpose:'Deterministic or near-zero-intelligence handling with bounded code/rules.',
    executorClass:'DETERMINISTIC',
  }),
  LIGHT:Object.freeze({
    id:'LIGHT',
    purpose:'Small-model or narrow-skill handling for bounded interpretation/transformation.',
    executorClass:'SMALL_MODEL_OR_SKILL',
  }),
  DEEP:Object.freeze({
    id:'DEEP',
    purpose:'Frontier reasoning, coding agent or complex multi-step planning.',
    executorClass:'FRONTIER_AGENT',
  }),
});

const sha=value=>createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');

function requiredText(value,code){
  if(typeof value!=='string'||!value.trim()) throw new Error(code);
  return value.trim();
}

function answerValue(answer){
  if(!answer||typeof answer!=='object') return undefined;
  if(answer.type==='choice') return answer.choice;
  if(answer.type==='score') return answer.score;
  if(answer.type==='noul') return answer.noul;
  if(typeof answer.choice==='string') return answer.choice;
  if(typeof answer.score==='number') return answer.score;
  if(typeof answer.noul==='number') return answer.noul;
  return undefined;
}

function booleanish(value){
  if(typeof value==='boolean') return value;
  if(typeof value==='number') return value>=0.5;
  return false;
}

export function recommendExecutionLane({
  taskType,
  needsExecution,
  riskScore,
}={}){
  const type=requiredText(taskType,'JEV_PLAN_TASK_TYPE_REQUIRED');
  const risk=Number.isFinite(riskScore)?Number(riskScore):0;
  const executes=Boolean(needsExecution);

  if(['build','admin'].includes(type)||risk>=2) return JEV_EXECUTION_LANES.DEEP;
  if(!executes&&['discussion','status'].includes(type)) return JEV_EXECUTION_LANES.FAST;
  if(type==='study'&&risk<2) return JEV_EXECUTION_LANES.LIGHT;
  if(type==='research'&&!executes&&risk<2) return JEV_EXECUTION_LANES.LIGHT;
  return executes?JEV_EXECUTION_LANES.LIGHT:JEV_EXECUTION_LANES.FAST;
}

export function planFromJevRouterObservation({
  observation,
  interfaceId='unknown-interface',
  bridgeId='othrys-bridge',
}={}){
  if(!observation||observation.schema!=='othrys.os.jev-observation.v1'){
    throw new Error('JEV_ROUTER_OBSERVATION_REQUIRED');
  }
  if(observation.circuitId!=='router') throw new Error('JEV_ROUTER_OBSERVATION_REQUIRED');

  const answers=observation.answers??{};
  const taskType=answerValue(answers.task_type);
  const needsExecution=booleanish(answerValue(answers.needs_execution));
  const needsRepo=booleanish(answerValue(answers.needs_repo));
  const needsWeb=booleanish(answerValue(answers.needs_web));
  const riskScore=Number(answerValue(answers.risk)??0);

  const lane=recommendExecutionLane({taskType,needsExecution,riskScore});
  const authorizationRequired=needsExecution||lane.id!=='FAST';
  const verificationRequired=needsExecution||lane.id==='DEEP';

  const body={
    schema:JEV_EXECUTION_PLAN_SCHEMA,
    mode:'TRAINING',
    interfaceId:requiredText(interfaceId,'JEV_INTERFACE_REQUIRED'),
    bridgeId:requiredText(bridgeId,'JEV_BRIDGE_REQUIRED'),
    routerObservationDigest:observation.observationDigest,
    taskType,
    needsExecution,
    needsRepo,
    needsWeb,
    riskScore,
    lane:Object.freeze({...lane}),
    authorization:Object.freeze({
      required:authorizationRequired,
      authorityOwner:authorizationRequired?'THEMIS_KEYMASTER_TRUST_CANAL':null,
      granted:false,
    }),
    verification:Object.freeze({
      required:verificationRequired,
      verifier:'TALOS_OR_STRONGER_VERIFIER',
      completed:false,
    }),
    recommendationOnly:true,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };

  return Object.freeze({...body,planDigest:sha(body)});
}

export function createJevBridgeReceipt({
  plan,
  sharedStateRef,
}={}){
  if(!plan||plan.schema!==JEV_EXECUTION_PLAN_SCHEMA) throw new Error('JEV_EXECUTION_PLAN_REQUIRED');
  const stateRef=requiredText(sharedStateRef,'JEV_SHARED_STATE_REQUIRED');
  const body={
    schema:JEV_BRIDGE_RECEIPT_SCHEMA,
    mode:'TRAINING',
    bridgeId:plan.bridgeId,
    interfaceId:plan.interfaceId,
    sharedStateRef:stateRef,
    planDigest:plan.planDigest,
    lane:plan.lane.id,
    authorizationRequired:plan.authorization.required,
    authorizationGranted:false,
    verificationRequired:plan.verification.required,
    verificationCompleted:false,
    authorityGranted:false,
    executionStarted:false,
    actionApplied:false,
  };
  return Object.freeze({...body,receiptDigest:sha(body)});
}
