import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export class ExecutionLeaseError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='ExecutionLeaseError';} }
const shaText=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const shaJson=(v:unknown)=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
function jsonLines(path:string){if(!existsSync(path))return [];const t=readFileSync(path,'utf8');if(t&&!t.endsWith('\n'))throw new ExecutionLeaseError('EVIDENCE_TORN_TAIL');return t.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));}

export function materializeExecutionLease(packagePath:string,inboxPath:string,ledgerPath:string,outDir:string,nowIso:string){
  if(!existsSync(packagePath)) throw new ExecutionLeaseError('BUILD_PACKAGE_NOT_FOUND');
  const raw=readFileSync(packagePath,'utf8');let pkg:any;try{pkg=JSON.parse(raw)}catch{throw new ExecutionLeaseError('BUILD_PACKAGE_INVALID')}
  if(pkg.schema!=='othrys.os.build-package.v1'||pkg.status!=='READY_NOT_EXECUTING'||pkg.authorityGranted!==false||pkg.executionStarted!==false) throw new ExecutionLeaseError('BUILD_PACKAGE_STATE_INVALID');
  const packageDigest=shaText(raw),intents=jsonLines(inboxPath),ledger=jsonLines(ledgerPath);
  const auth=intents.find(x=>x.action==='MISSION_EXECUTION_AUTH_REQUEST'&&x.missionId===pkg.missionId&&x.buildRequestId===pkg.buildRequestId&&x.builderId===pkg.builderId&&x.packageDigest===packageDigest);
  if(!auth) throw new ExecutionLeaseError('EXECUTION_AUTH_NOT_FOUND');
  const body={action:auth.action,missionId:auth.missionId,buildRequestId:auth.buildRequestId,builderId:auth.builderId,packageDigest:auth.packageDigest,receivedAt:auth.receivedAt};
  const authId=`DECK-EXEC-${shaJson(body).slice(0,24)}`;
  if(!ledger.some(x=>x.missionId===authId&&x.state==='ADMITTED')) throw new ExecutionLeaseError('EXECUTION_AUTH_NOT_ADMITTED');
  const issued=Date.parse(String(auth.receivedAt)),now=Date.parse(nowIso);if(!Number.isFinite(issued)||!Number.isFinite(now))throw new ExecutionLeaseError('TIME_INVALID');
  const expires=issued+10*60*1000;if(now<issued||now>expires) throw new ExecutionLeaseError('EXECUTION_AUTH_EXPIRED');
  const lease={schema:'othrys.os.execution-lease.v1',leaseId:`LEASE-${authId.slice('DECK-EXEC-'.length)}`,missionId:pkg.missionId,builderId:pkg.builderId,buildRequestId:pkg.buildRequestId,executionAuthId:authId,packageDigest,issuedAt:new Date(issued).toISOString(),expiresAt:new Date(expires).toISOString(),status:'LEASE_READY_NOT_STARTED',launchEligible:true,authorityGranted:false,executionStarted:false};
  const path=join(outDir,`${lease.leaseId}.json`),text=JSON.stringify(lease,null,2)+'\n';mkdirSync(dirname(path),{recursive:true});
  if(existsSync(path)){if(readFileSync(path,'utf8')!==text)throw new ExecutionLeaseError('LEASE_CONFLICT');return {lease,path,created:false};}
  writeFileSync(path,text,'utf8');return {lease,path,created:true};
}
