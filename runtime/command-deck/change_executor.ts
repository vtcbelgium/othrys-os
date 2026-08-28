import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

export class ChangeExecutorError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='ChangeExecutorError';} }
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
function load(path:string){try{return JSON.parse(readFileSync(path,'utf8'))}catch{throw new ChangeExecutorError('EVIDENCE_INVALID')}}
function git(workspace:string,args:string[],input?:string){const r=spawnSync('git',['-C',workspace,...args],{encoding:'utf8',input});if(r.status!==0)throw new ChangeExecutorError(`GIT_${args[0].toUpperCase()}_FAILED`);return String(r.stdout??'').trimEnd();}
function statusPaths(raw:string){return raw.split(/\r?\n/).filter(Boolean).map(line=>{const p=line.slice(3).trim();return p.includes(' -> ')?p.split(' -> ').at(-1)!:p;}).sort();}
function diffPaths(diff:string){return [...diff.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)].map(m=>m[2]).sort();}

export function executeVerifiedChange(workspace:string,permitPath:string,candidatePath:string,patchPath:string,nowIso:string){
  const permit=load(permitPath),candidate=load(candidatePath),patch=load(patchPath);
  if(permit.schema!=='othrys.os.change-apply-permit.v1'||permit.status!=='APPLY_READY_NOT_STARTED'||permit.oneShot!==true||permit.consumed!==false||permit.authorityGranted!==true||permit.applied!==false) throw new ChangeExecutorError('PERMIT_STATE_INVALID');
  const head=git(workspace,['rev-parse','HEAD']);if(head!==permit.targetSha) throw new ChangeExecutorError('TARGET_STALE');
  const before=git(workspace,['status','--porcelain','--untracked-files=all']);if(before) throw new ChangeExecutorError('TARGET_DIRTY');
  const diff=String(patch.diff??''),changed=Array.isArray(permit.changedFiles)?[...permit.changedFiles].map(String).sort():[];
  if(candidate.schema!=='othrys.os.change-candidate.v1'||candidate.candidateId!==permit.candidateId||candidate.missionId!==permit.missionId||candidate.baseSha!==permit.targetSha||candidate.patchDigest!==permit.patchDigest) throw new ChangeExecutorError('CANDIDATE_PERMIT_MISMATCH');
  if(patch.schema!=='othrys.os.worker-patch-evidence.v1'||patch.missionId!==permit.missionId||sha(diff)!==permit.patchDigest||JSON.stringify(diffPaths(diff))!==JSON.stringify(changed)) throw new ChangeExecutorError('PATCH_PERMIT_MISMATCH');
  const check=spawnSync('git',['-C',workspace,'apply','--check','-'],{encoding:'utf8',input:diff});if(check.status!==0) throw new ChangeExecutorError('GIT_APPLY_CHECK_FAILED');
  const applied=spawnSync('git',['-C',workspace,'apply','-'],{encoding:'utf8',input:diff});if(applied.status!==0) throw new ChangeExecutorError('GIT_APPLY_FAILED');
  const afterRaw=git(workspace,['status','--porcelain','--untracked-files=all']),after=statusPaths(afterRaw);
  if(JSON.stringify(after)!==JSON.stringify(changed)){
    const rollback=spawnSync('git',['-C',workspace,'apply','-R','-'],{encoding:'utf8',input:diff});
    if(rollback.status!==0||git(workspace,['status','--porcelain','--untracked-files=all'])) throw new ChangeExecutorError('ROLLBACK_FAILED');
    throw new ChangeExecutorError('POST_APPLY_SCOPE_MISMATCH');
  }
  const at=new Date(nowIso);if(Number.isNaN(at.getTime())) throw new ChangeExecutorError('TIME_INVALID');
  const consumed={...permit,consumed:true,consumedAt:at.toISOString(),status:'APPLY_CONSUMED',applied:true,appliedAt:at.toISOString()};
  writeFileSync(permitPath,JSON.stringify(consumed,null,2)+'\n','utf8');
  return Object.freeze({schema:'othrys.os.change-apply-result.v1',permitId:permit.permitId,candidateId:permit.candidateId,missionId:permit.missionId,targetSha:head,patchDigest:permit.patchDigest,changedFiles:after,status:'APPLIED_NOT_COMMITTED',authorityGranted:true,applied:true,committed:false,appliedAt:at.toISOString()});
}
