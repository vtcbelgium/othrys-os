import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { recordOperationalEvent } from './mnemosyne_operations.mjs';

export const TRAINING_LAB_REGISTRY_SCHEMA='othrys.os.training-lab-registry.v1';
export const TRAINING_LAB_RUN_SCHEMA='othrys.os.training-lab-run.v1';
const sha=value=>createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');
const CODE=/^[1-9]\d*\.[1-9]\d*\.[1-9]\d*$/;
const clean=(value,max=240)=>String(value??'').trim().slice(0,max);
const n=value=>Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;

export function loadTrainingLabRegistry(root){
  const path=join(root,'docs','training','lab','TRAINING_LAB_REGISTRY.json');
  if(!existsSync(path)) throw new Error('TRAINING_LAB_REGISTRY_MISSING');
  const registry=JSON.parse(readFileSync(path,'utf8'));
  if(registry.schema!==TRAINING_LAB_REGISTRY_SCHEMA||!Array.isArray(registry.registrations)) throw new Error('TRAINING_LAB_REGISTRY_INVALID');
  const seen=new Set();
  for(const row of registry.registrations){
    if(!CODE.test(String(row.code??''))||seen.has(row.code)) throw new Error('TRAINING_LAB_CODE_INVALID');
    if(!clean(row.definitionVersion)||!clean(row.domain)||!clean(row.name)) throw new Error('TRAINING_LAB_DEFINITION_INVALID');
    seen.add(row.code);
  }
  return registry;
}

export function createTrainingLabRun(root,input={}){
  const registry=loadTrainingLabRegistry(root);
  const code=clean(input.code,32);
  const definition=registry.registrations.find(row=>row.code===code);
  if(!definition) throw new Error('TRAINING_LAB_TEST_UNKNOWN');
  const startedAt=clean(input.startedAt||new Date().toISOString(),64);
  const completedAt=clean(input.completedAt||startedAt,64);
  if(!Number.isFinite(Date.parse(startedAt))||!Number.isFinite(Date.parse(completedAt))) throw new Error('TRAINING_LAB_TIME_INVALID');
  const status=clean(input.status,24).toUpperCase();
  if(!['PASS','FAIL','INFO','SKIP','DEGRADED'].includes(status)) throw new Error('TRAINING_LAB_STATUS_INVALID');
  const usage=input.usage&&typeof input.usage==='object'?input.usage:{};
  const subject=input.subject&&typeof input.subject==='object'?input.subject:{};
  const body={
    schema:TRAINING_LAB_RUN_SCHEMA,
    epoch:registry.epoch,
    code,
    definitionVersion:definition.definitionVersion,
    definitionDigest:sha(definition),
    startedAt,
    completedAt,
    status,
    subject:{
      kind:clean(subject.kind,48)||null,
      id:clean(subject.id,120)||null,
      provider:clean(subject.provider,80)||null,
      model:clean(subject.model,120)||null,
      resolvedModel:clean(subject.resolvedModel,120)||null
    },
    usage:{
      inputTokens:n(usage.inputTokens),
      cachedInputTokens:n(usage.cachedInputTokens),
      outputTokens:n(usage.outputTokens),
      reasoningTokens:n(usage.reasoningTokens),
      totalTokens:n(usage.totalTokens),
      judgeTokens:n(usage.judgeTokens),
      attackerTokens:n(usage.attackerTokens),
      costUsd:n(usage.costUsd)
    },
    metrics:input.metrics&&typeof input.metrics==='object'?{...input.metrics}:{},
    environment:input.environment&&typeof input.environment==='object'?{...input.environment}:{},
    artifacts:Array.isArray(input.artifacts)?input.artifacts.map(x=>clean(x,300)).filter(Boolean):[],
    lesson:clean(input.lesson,1200),
    authorityGranted:false,
    automaticPromotion:false,
    automaticLevelAdvance:false,
    productionActionApplied:false
  };
  return Object.freeze({...body,runDigest:sha(body)});
}

export function recordTrainingLabRun(root,input={}){
  const run=createTrainingLabRun(root,input);
  const path=join(root,'.othrys','knowledge','archive','training',run.startedAt.slice(0,10)+'.jsonl');
  mkdirSync(dirname(path),{recursive:true});
  appendFileSync(path,JSON.stringify(run)+'\n','utf8');
  const op=recordOperationalEvent(root,{
    at:run.completedAt,
    actor:'training-lab',
    job:'training:'+run.code,
    status:run.status,
    evidence:{epoch:run.epoch,code:run.code,runDigest:run.runDigest,subject:run.subject,usage:run.usage,metrics:run.metrics,artifacts:run.artifacts},
    lesson:run.lesson||('Training run '+run.code+' '+run.status)
  });
  return Object.freeze({run,path,operationalEvent:op.event});
}
