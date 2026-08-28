import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

export class WorkerLaunchError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='WorkerLaunchError';} }

export function validateWorkerLaunchCandidate(leasePath:string,nowIso:string){
  if(!existsSync(leasePath)) throw new WorkerLaunchError('LEASE_NOT_FOUND');
  const raw=readFileSync(leasePath,'utf8');let lease:any;try{lease=JSON.parse(raw)}catch{throw new WorkerLaunchError('LEASE_INVALID')}
  if(lease.schema!=='othrys.os.execution-lease.v1'||lease.status!=='LEASE_READY_NOT_STARTED'||lease.launchEligible!==true||lease.authorityGranted!==false||lease.executionStarted!==false) throw new WorkerLaunchError('LEASE_STATE_INVALID');
  if(!/^LEASE-[0-9a-f]{24}$/.test(String(lease.leaseId??''))||!/^V2-\d{3}[A-Z]$/.test(String(lease.missionId??''))||String(lease.builderId??'')!=='qwen3-builder') throw new WorkerLaunchError('LEASE_BINDING_INVALID');
  const now=Date.parse(nowIso),issued=Date.parse(String(lease.issuedAt)),expires=Date.parse(String(lease.expiresAt));
  if(!Number.isFinite(now)||!Number.isFinite(issued)||!Number.isFinite(expires)||now<issued||now>expires) throw new WorkerLaunchError('LEASE_EXPIRED');
  const leaseDigest=createHash('sha256').update(raw,'utf8').digest('hex');
  return Object.freeze({schema:'othrys.os.worker-launch-candidate.v1',missionId:lease.missionId,builderId:lease.builderId,leaseId:lease.leaseId,leaseDigest,status:'LAUNCH_REQUEST_ELIGIBLE',authorityGranted:false,executionStarted:false});
}
