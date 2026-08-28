import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class LaunchPermitError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='LaunchPermitError';} }
const sj=(v:unknown)=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const st=(v:string)=>createHash('sha256').update(v,'utf8').digest('hex');
function lines(path:string){if(!existsSync(path))return [];const t=readFileSync(path,'utf8');if(t&&!t.endsWith('\n'))throw new LaunchPermitError('EVIDENCE_TORN_TAIL');return t.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));}

export function materializeLaunchPermit(leasePath:string,inboxPath:string,ledgerPath:string,outDir:string,nowIso:string){
  if(!existsSync(leasePath)) throw new LaunchPermitError('LEASE_NOT_FOUND');const raw=readFileSync(leasePath,'utf8');let lease:any;try{lease=JSON.parse(raw)}catch{throw new LaunchPermitError('LEASE_INVALID')}
  if(lease.schema!=='othrys.os.execution-lease.v1'||lease.status!=='LEASE_READY_NOT_STARTED'||lease.launchEligible!==true||lease.authorityGranted!==false||lease.executionStarted!==false) throw new LaunchPermitError('LEASE_STATE_INVALID');
  const leaseDigest=st(raw),intents=lines(inboxPath),ledger=lines(ledgerPath);
  const launch=[...intents].reverse().find(x=>x.action==='MISSION_WORKER_LAUNCH_REQUEST'&&x.missionId===lease.missionId&&x.leaseId===lease.leaseId&&x.builderId===lease.builderId&&x.leaseDigest===leaseDigest);
  if(!launch) throw new LaunchPermitError('LAUNCH_REQUEST_NOT_FOUND');
  const body={action:launch.action,missionId:launch.missionId,leaseId:launch.leaseId,builderId:launch.builderId,leaseDigest:launch.leaseDigest,receivedAt:launch.receivedAt};const launchId=`DECK-LAUNCH-${sj(body).slice(0,24)}`;
  if(!ledger.some(x=>x.missionId===launchId&&x.state==='ADMITTED')) throw new LaunchPermitError('LAUNCH_REQUEST_NOT_ADMITTED');
  const issued=Date.parse(String(launch.receivedAt)),leaseExpires=Date.parse(String(lease.expiresAt)),now=Date.parse(nowIso);if(![issued,leaseExpires,now].every(Number.isFinite))throw new LaunchPermitError('TIME_INVALID');
  const expires=Math.min(issued+2*60*1000,leaseExpires);if(now<issued||now>expires)throw new LaunchPermitError('LAUNCH_REQUEST_EXPIRED');
  const permit={schema:'othrys.os.launch-permit.v1',permitId:`PERMIT-${launchId.slice('DECK-LAUNCH-'.length)}`,missionId:lease.missionId,builderId:lease.builderId,leaseId:lease.leaseId,leaseDigest,launchRequestId:launchId,issuedAt:new Date(issued).toISOString(),expiresAt:new Date(expires).toISOString(),oneShot:true,consumed:false,status:'PERMIT_READY_NOT_STARTED',authorityGranted:false,executionStarted:false};
  mkdirSync(outDir,{recursive:true});const path=join(outDir,`${permit.permitId}.json`),text=JSON.stringify(permit,null,2)+'\n';
  if(existsSync(path)){if(readFileSync(path,'utf8')!==text)throw new LaunchPermitError('PERMIT_CONFLICT');return {permit,path,created:false};}
  writeFileSync(path,text,'utf8');return {permit,path,created:true};
}
