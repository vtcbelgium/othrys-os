import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class WorkerRequestError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='WorkerRequestError';} }
const safe=(p:string)=>!!p&&!p.startsWith('/')&&!/^[A-Za-z]:/.test(p)&&!p.split(/[\\/]+/).includes('..');
export function materializeWorkerRequest(permitPath:string,spec:any,outDir:string){
  if(!existsSync(permitPath)) throw new WorkerRequestError('PERMIT_NOT_FOUND');const raw=readFileSync(permitPath,'utf8');let permit:any;try{permit=JSON.parse(raw)}catch{throw new WorkerRequestError('PERMIT_INVALID')}
  if(permit.schema!=='othrys.os.launch-permit.v1'||permit.status!=='PERMIT_READY_NOT_STARTED'||permit.oneShot!==true||permit.consumed!==false||permit.executionStarted!==false||permit.builderId!=='qwen3-builder') throw new WorkerRequestError('PERMIT_STATE_INVALID');
  const workspace=String(spec?.workspace??'').trim(),task=String(spec?.task??'').trim(),allowed=(spec?.allowed_paths??[]).map(String),deny=(spec?.deny_paths??[]).map(String),timeout=Number(spec?.timeout_sec??0);
  if(!workspace||!task||task.length>2000||!allowed.length||allowed.some((p:string)=>!safe(p))||deny.some((p:string)=>!safe(p))||!Number.isInteger(timeout)||timeout<10||timeout>300) throw new WorkerRequestError('WORKER_SPEC_INVALID');
  const permitDigest=createHash('sha256').update(raw,'utf8').digest('hex'),jobId=`JOB-${permit.permitId.slice('PERMIT-'.length)}`;
  const request={schema_version:'othrys.worker-request.v0.1',job_id:jobId,node_id:'legion',capability:'engineering.patch',workspace,task,allowed_paths:allowed,deny_paths:deny,timeout_sec:timeout,metadata:{mission_id:permit.missionId,builder_id:permit.builderId,permit_id:permit.permitId,permit_digest:permitDigest,launch_request_id:permit.launchRequestId,status:'READY_FOR_DISPATCH'}};
  mkdirSync(outDir,{recursive:true});const path=join(outDir,`${jobId}.json`),text=JSON.stringify(request,null,2)+'\n';
  if(existsSync(path)){if(readFileSync(path,'utf8')!==text)throw new WorkerRequestError('WORKER_REQUEST_CONFLICT');return {request,path,created:false};}
  writeFileSync(path,text,'utf8');return {request,path,created:true};
}
