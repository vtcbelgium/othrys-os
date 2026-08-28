import { existsSync, readFileSync } from 'node:fs';

export class WorkerAcceptanceError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='WorkerAcceptanceError';} }
function load(path:string){if(!existsSync(path))throw new WorkerAcceptanceError('EVIDENCE_MISSING');try{return JSON.parse(readFileSync(path,'utf8'))}catch{throw new WorkerAcceptanceError('EVIDENCE_INVALID')}}

export function acceptWorkerResult(dispatchPath:string,workerResultPath:string,verificationPath:string){
  const dispatch=load(dispatchPath),worker=load(workerResultPath),verify=load(verificationPath);
  if(dispatch.schema!=='othrys.os.dispatch-ticket.v1'||dispatch.status!=='DISPATCH_AUTHORIZED'||dispatch.authorityGranted!==true) throw new WorkerAcceptanceError('DISPATCH_INVALID');
  if(worker.schema_version!=='othrys.worker-result.v0.1'||worker.ok!==true) throw new WorkerAcceptanceError('WORKER_RESULT_INVALID');
  if(dispatch.missionId!==worker.mission_id||dispatch.jobId!==worker.job_id||dispatch.builderId!==worker.builder_id) throw new WorkerAcceptanceError('WORKER_DISPATCH_MISMATCH');
  const allowed=Array.isArray(worker.allowed_paths)?worker.allowed_paths:[],changed=Array.isArray(worker.changed_files)?worker.changed_files:[],outside=Array.isArray(worker.out_of_scope_changes)?worker.out_of_scope_changes:[];
  if(!changed.length||outside.length||changed.some((p:string)=>!allowed.includes(p))) throw new WorkerAcceptanceError('WORKER_SCOPE_REJECTED');
  if(verify.schema!=='othrys.os.independent-verification.v1'||verify.missionId!==dispatch.missionId||verify.verdict!=='PASS') throw new WorkerAcceptanceError('VERIFICATION_INVALID');
  const checks=verify.checks&&typeof verify.checks==='object'?Object.values(verify.checks):[];
  if(!checks.length||checks.some(v=>v!==true)) throw new WorkerAcceptanceError('VERIFICATION_CHECK_FAILED');
  return Object.freeze({
    schema:'othrys.os.worker-acceptance.v1',missionId:dispatch.missionId,jobId:dispatch.jobId,builderId:dispatch.builderId,
    changedFiles:changed,verifier:String(verify.verifier??'UNKNOWN'),status:'ACCEPTED_VERIFIED',accepted:true,
    authorityGranted:false,executionStarted:true
  });
}
