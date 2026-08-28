import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class ChangeApplyPermitError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='ChangeApplyPermitError';} }
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const shaJson=(v:unknown)=>sha(JSON.stringify(v));
function load(path:string){if(!existsSync(path))throw new ChangeApplyPermitError('EVIDENCE_MISSING');try{return JSON.parse(readFileSync(path,'utf8'))}catch{throw new ChangeApplyPermitError('EVIDENCE_INVALID')}}
function lines(path:string){if(!existsSync(path))return [];const t=readFileSync(path,'utf8');if(t&&!t.endsWith('\n'))throw new ChangeApplyPermitError('EVIDENCE_TORN_TAIL');return t.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));}
function diffPaths(diff:string){return [...diff.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)].map(m=>m[2]).sort();}

export function materializeChangeApplyPermit(root:string,candidateId:string,targetSha:string,inboxPath:string,ledgerPath:string,outDir:string){
  if(!/^CHANGE-[0-9a-f]{24}$/.test(candidateId)||!/^[0-9a-f]{40}$/.test(targetSha)) throw new ChangeApplyPermitError('IDENTITY_INVALID');
  const c=load(join(root,'missions','change-candidates',`${candidateId}.json`));
  if(c.schema!=='othrys.os.change-candidate.v1'||c.status!=='VERIFIED_CHANGE_CANDIDATE'||c.applied!==false||c.authorityGranted!==false) throw new ChangeApplyPermitError('CANDIDATE_STATE_INVALID');
  if(c.baseSha!==targetSha) throw new ChangeApplyPermitError('TARGET_STALE');
  const patch=load(join(root,'missions',`${c.missionId}.patch.json`)),diff=String(patch.diff??'');
  if(patch.schema!=='othrys.os.worker-patch-evidence.v1'||patch.missionId!==c.missionId||sha(diff)!==c.patchDigest) throw new ChangeApplyPermitError('PATCH_EVIDENCE_INVALID');
  const changed=Array.isArray(c.changedFiles)?[...c.changedFiles].map(String).sort():[];
  if(!changed.length||JSON.stringify(diffPaths(diff))!==JSON.stringify(changed)) throw new ChangeApplyPermitError('PATCH_SCOPE_MISMATCH');
  const intents=lines(inboxPath),ledger=lines(ledgerPath);
  const req=[...intents].reverse().find(x=>x.action==='MISSION_CHANGE_APPLY_REQUEST'&&x.candidateId===candidateId&&x.missionId===c.missionId&&x.patchDigest===c.patchDigest&&x.targetSha===targetSha);
  if(!req) throw new ChangeApplyPermitError('APPLY_REQUEST_NOT_FOUND');
  const body={action:req.action,candidateId:req.candidateId,missionId:req.missionId,patchDigest:req.patchDigest,targetSha:req.targetSha,receivedAt:req.receivedAt};
  const requestId=`DECK-APPLY-${shaJson(body).slice(0,24)}`;
  if(!ledger.some(x=>x.missionId===requestId&&x.state==='ADMITTED')) throw new ChangeApplyPermitError('APPLY_REQUEST_NOT_ADMITTED');
  const permit={schema:'othrys.os.change-apply-permit.v1',permitId:`APPLY-PERMIT-${requestId.slice('DECK-APPLY-'.length)}`,candidateId,missionId:c.missionId,patchDigest:c.patchDigest,targetSha,changedFiles:changed,applyRequestId:requestId,oneShot:true,consumed:false,status:'APPLY_READY_NOT_STARTED',authorityGranted:true,applied:false};
  mkdirSync(outDir,{recursive:true});const path=join(outDir,`${permit.permitId}.json`),text=JSON.stringify(permit,null,2)+'\n';
  if(existsSync(path)){if(readFileSync(path,'utf8')!==text)throw new ChangeApplyPermitError('APPLY_PERMIT_CONFLICT');return {permit,path,created:false};}
  writeFileSync(path,text,'utf8');return {permit,path,created:true};
}
