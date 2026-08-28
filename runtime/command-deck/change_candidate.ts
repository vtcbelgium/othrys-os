import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class ChangeCandidateError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='ChangeCandidateError';} }
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
function load(path:string){if(!existsSync(path))throw new ChangeCandidateError('EVIDENCE_MISSING');try{return JSON.parse(readFileSync(path,'utf8'))}catch{throw new ChangeCandidateError('EVIDENCE_INVALID')}}

export function materializeChangeCandidate(acceptance:any,patchPath:string,outDir:string){
  if(!acceptance||acceptance.schema!=='othrys.os.worker-acceptance.v1'||acceptance.status!=='ACCEPTED_VERIFIED'||acceptance.accepted!==true) throw new ChangeCandidateError('ACCEPTANCE_INVALID');
  const p=load(patchPath),baseSha=String(p.baseSha??''),diff=String(p.diff??'');
  if(p.schema!=='othrys.os.worker-patch-evidence.v1'||p.missionId!==acceptance.missionId||p.jobId!==acceptance.jobId||p.builderId!==acceptance.builderId) throw new ChangeCandidateError('PATCH_IDENTITY_MISMATCH');
  if(!/^[0-9a-f]{40}$/.test(baseSha)||!diff) throw new ChangeCandidateError('PATCH_EVIDENCE_INVALID');
  const changed=Array.isArray(p.changedFiles)?p.changedFiles:[];if(JSON.stringify(changed)!==JSON.stringify(acceptance.changedFiles)) throw new ChangeCandidateError('PATCH_SCOPE_MISMATCH');
  const patchDigest=sha(diff),candidateId=`CHANGE-${patchDigest.slice(0,24)}`;
  const candidate={schema:'othrys.os.change-candidate.v1',candidateId,missionId:p.missionId,jobId:p.jobId,builderId:p.builderId,baseSha,changedFiles:changed,patchDigest,workspaceClass:String(p.workspaceClass??''),status:'VERIFIED_CHANGE_CANDIDATE',applyEligible:false,authorityGranted:false,applied:false};
  mkdirSync(outDir,{recursive:true});const path=join(outDir,`${candidateId}.json`),text=JSON.stringify(candidate,null,2)+'\n';
  if(existsSync(path)){if(readFileSync(path,'utf8')!==text)throw new ChangeCandidateError('CHANGE_CANDIDATE_CONFLICT');return {candidate,path,created:false};}
  writeFileSync(path,text,'utf8');return {candidate,path,created:true};
}
