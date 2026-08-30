import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
export const WORK_RECOVERY_SCHEMA='othrys.os.work-recovery.v1';
export function assessWorkRecovery(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('WORK_RECOVERY_REQUIRED');
  const checkpoint=raw.checkpoint??null,approval=raw.approval??null,partial=raw.partialArtifact??null,reasons=[];
  if(!checkpoint?.digest)reasons.push('CHECKPOINT_MISSING');
  if(approval?.required===true&&approval?.fresh!==true)reasons.push('APPROVAL_STALE_OR_MISSING');
  if(partial?.present===true&&partial?.verified!==true)reasons.push('PARTIAL_ARTIFACT_UNVERIFIED');
  if(raw.cancelled===true)reasons.push('WORK_CANCELLED');
  if(raw.definitionDigest&&checkpoint?.definitionDigest&&raw.definitionDigest!==checkpoint.definitionDigest)reasons.push('DEFINITION_DRIFT');
  const resumable=reasons.length===0;
  return Object.freeze({schema:WORK_RECOVERY_SCHEMA,workId:String(raw.workId??''),resumable,reasons:Object.freeze(reasons),resumeFrom:resumable?String(checkpoint.stage??'UNKNOWN'):null,replayRequired:raw.interrupted===true,staleApprovalDenied:reasons.includes('APPROVAL_STALE_OR_MISSING'),partialArtifactDenied:reasons.includes('PARTIAL_ARTIFACT_UNVERIFIED'),authorityGranted:false,executionStarted:false});
}
export function createWorkCheckpoint(raw){
  if(!raw?.workId||!raw?.stage||!/^[0-9a-f]{64}$/.test(String(raw.digest??'')))throw new Error('WORK_CHECKPOINT_INVALID');
  return Object.freeze({schema:'othrys.os.work-checkpoint.v1',workId:String(raw.workId),stage:String(raw.stage),digest:String(raw.digest),definitionDigest:raw.definitionDigest??null,criticalTransition:raw.criticalTransition===true,authorityGranted:false,executionStarted:false});
}
export function workCheckpointPath(root,workId){return join(root,'.othrys','work',`${String(workId).replace(/[^a-z0-9._-]/gi,'_')}.checkpoint.json`);}
export function persistWorkCheckpoint(root,checkpoint){
  if(checkpoint?.schema!=='othrys.os.work-checkpoint.v1')throw new Error('WORK_CHECKPOINT_SCHEMA_INVALID');
  const path=workCheckpointPath(root,checkpoint.workId),tmp=`${path}.tmp-${process.pid}`;mkdirSync(dirname(path),{recursive:true});writeFileSync(tmp,JSON.stringify(checkpoint,null,2)+'\n','utf8');renameSync(tmp,path);return Object.freeze({status:'STORED',path,digest:checkpoint.digest});
}
export function readWorkCheckpoint(root,workId){const path=workCheckpointPath(root,workId);if(!existsSync(path))return null;const x=JSON.parse(readFileSync(path,'utf8'));if(x.schema!=='othrys.os.work-checkpoint.v1'||x.workId!==workId)throw new Error('WORK_CHECKPOINT_CORRUPT');return Object.freeze(x);}
