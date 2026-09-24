import { createHash } from 'node:crypto';
import { classifyFrontDoorIntent } from './front_door.mjs';
import {
  createJevBridgeReceipt,
  planFromJevRouterObservation,
  recommendExecutionLane,
} from './jev_execution_planner.mjs';

export const BRAIN_DECISION_SCHEMA='othrys.os.brain-decision.v1';

const sha=value=>createHash('sha256').update(
  typeof value==='string'?value:JSON.stringify(value),
  'utf8',
).digest('hex');

function requiredText(value,code){
  if(typeof value!=='string'||!value.trim()) throw new Error(code);
  return value.trim();
}

function executorFor(plan){
  if(plan.lane.id==='FAST'){
    if(plan.taskType==='status') return Object.freeze({id:'deterministic.status',class:'DETERMINISTIC',owner:'KRONOS_RHEA_MNEMOSYNE'});
    if(plan.taskType==='discussion') return Object.freeze({id:'mnemosyne.direct',class:'DETERMINISTIC_OR_DIRECT',owner:'MNEMOSYNE'});
    return Object.freeze({id:'deterministic.front-door',class:'DETERMINISTIC',owner:'GPT_CONTROL'});
  }
  if(plan.lane.id==='LIGHT'){
    if(plan.taskType==='research') return Object.freeze({id:'prometheus.research',class:'SPECIALIST',owner:'PROMETHEUS'});
    if(plan.taskType==='study') return Object.freeze({id:'study.pipeline',class:'SPECIALIST',owner:'STUDY'});
    return Object.freeze({id:'specialist.light',class:'SMALL_MODEL_OR_SKILL',owner:'GPT_CONTROL'});
  }
  return Object.freeze({
    id:plan.taskType==='admin'?'governed.admin':'hephaestus.switchyard',
    class:'GOVERNED_DEEP',
    owner:plan.taskType==='admin'?'GPT_CONTROL':'HEPHAESTUS',
  });
}

function verificationFor(plan){
  if(plan.lane.id==='FAST') return Object.freeze({required:plan.verification.required,profile:'BOUNDED_EVIDENCE'});
  if(plan.lane.id==='LIGHT') return Object.freeze({required:true,profile:'TALOS_REVIEW'});
  return Object.freeze({required:true,profile:'TALOS_INDEPENDENT'});
}

function finalize({command,plan,source,sharedStateRef,degradedReason=null}){
  const deterministicIntent=classifyFrontDoorIntent(command);
  const deterministicMissionFloor=['PLAN','BUILD'].includes(deterministicIntent);
  const semanticMissionFloor=
    plan.lane.id==='DEEP'||
    plan.needsExecution===true||
    ['admin','build'].includes(plan.taskType)||
    plan.riskScore>=2;
  const missionRequired=deterministicMissionFloor||semanticMissionFloor;
  const executor=executorFor(plan);
  const verification=verificationFor(plan);
  const bridgeReceipt=createJevBridgeReceipt({plan,sharedStateRef});
  const body={
    schema:BRAIN_DECISION_SCHEMA,
    mode:'TRAINING',
    source,
    degraded:source!=='JEV_CORTEX',
    degradedReason,
    commandDigest:sha(command),
    deterministicIntent,
    lane:plan.lane.id,
    taskType:plan.taskType,
    needsRepo:plan.needsRepo,
    needsWeb:plan.needsWeb,
    needsExecution:plan.needsExecution,
    riskScore:plan.riskScore,
    executor,
    missionRequired,
    deterministicMissionFloor,
    semanticMissionFloor,
    authorization:Object.freeze({
      required:plan.authorization.required||missionRequired,
      owner:missionRequired?'THEMIS_KEYMASTER_TRUST_CANAL':plan.authorization.authorityOwner,
      granted:false,
    }),
    verification,
    routerObservationDigest:plan.routerObservationDigest,
    plannerDigest:plan.planDigest,
    bridgeReceiptDigest:bridgeReceipt.receiptDigest,
    recommendationOnly:true,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
  return Object.freeze({...body,decisionDigest:sha(body)});
}

export function createBrainDecision({
  command,
  observation,
  interfaceId='othrys-web',
  bridgeId='othrys-bridge',
  sharedStateRef,
}={}){
  const text=requiredText(command,'BRAIN_COMMAND_REQUIRED');
  const stateRef=requiredText(sharedStateRef,'BRAIN_SHARED_STATE_REQUIRED');
  const plan=planFromJevRouterObservation({observation,interfaceId,bridgeId});
  return finalize({command:text,plan,source:'JEV_CORTEX',sharedStateRef:stateRef});
}

export function createFallbackBrainDecision({
  command,
  interfaceId='othrys-web',
  bridgeId='othrys-bridge',
  sharedStateRef,
  reason='JEV_UNAVAILABLE',
}={}){
  const text=requiredText(command,'BRAIN_COMMAND_REQUIRED');
  const stateRef=requiredText(sharedStateRef,'BRAIN_SHARED_STATE_REQUIRED');
  const intent=classifyFrontDoorIntent(text);
  const mapping={
    QUESTION:{taskType:'discussion',needsExecution:false,riskScore:0,needsRepo:false,needsWeb:false},
    OPERATION:{taskType:'status',needsExecution:false,riskScore:0,needsRepo:false,needsWeb:false},
    RESEARCH:{taskType:'research',needsExecution:false,riskScore:0,needsRepo:false,needsWeb:true},
    PLAN:{taskType:'build',needsExecution:false,riskScore:2,needsRepo:true,needsWeb:false},
    BUILD:{taskType:'build',needsExecution:true,riskScore:2,needsRepo:true,needsWeb:false},
  };
  const x=mapping[intent];
  const lane=recommendExecutionLane(x);
  const observationDigest=sha({fallback:true,intent,commandDigest:sha(text)});
  const planBody={
    schema:'othrys.os.jev-execution-plan.v1',
    mode:'TRAINING',
    interfaceId,
    bridgeId,
    routerObservationDigest:observationDigest,
    taskType:x.taskType,
    needsExecution:x.needsExecution,
    needsRepo:x.needsRepo,
    needsWeb:x.needsWeb,
    riskScore:x.riskScore,
    lane,
    authorization:Object.freeze({
      required:x.needsExecution||lane.id!=='FAST',
      authorityOwner:x.needsExecution||lane.id!=='FAST'?'THEMIS_KEYMASTER_TRUST_CANAL':null,
      granted:false,
    }),
    verification:Object.freeze({
      required:x.needsExecution||lane.id==='DEEP',
      verifier:'TALOS_OR_STRONGER_VERIFIER',
      completed:false,
    }),
    recommendationOnly:true,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
  const plan=Object.freeze({...planBody,planDigest:sha(planBody)});
  return finalize({
    command:text,
    plan,
    source:'DETERMINISTIC_FALLBACK',
    sharedStateRef:stateRef,
    degradedReason:String(reason||'JEV_UNAVAILABLE'),
  });
}

export function verifyBrainDecision(decision,{command}={}){
  if(!decision||decision.schema!==BRAIN_DECISION_SCHEMA) throw new Error('BRAIN_DECISION_INVALID');
  if(decision.mode!=='TRAINING'||decision.authorityGranted!==false||decision.actionApplied!==false||decision.executionStarted!==false){
    throw new Error('BRAIN_DECISION_AUTHORITY_INVALID');
  }
  if(command!==undefined&&decision.commandDigest!==sha(requiredText(command,'BRAIN_COMMAND_REQUIRED'))){
    throw new Error('BRAIN_DECISION_COMMAND_MISMATCH');
  }
  const {decisionDigest,...body}=decision;
  if(!/^[0-9a-f]{64}$/.test(String(decisionDigest??''))||sha(body)!==decisionDigest){
    throw new Error('BRAIN_DECISION_DIGEST_INVALID');
  }
  if(['admin','build'].includes(decision.taskType)||Number(decision.riskScore)>=2){
    if(decision.lane!=='DEEP'||decision.missionRequired!==true) throw new Error('BRAIN_DANGER_FLOOR_VIOLATION');
  }
  return decision;
}
