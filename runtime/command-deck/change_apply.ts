import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { classifyChangeFreshness } from './change_freshness.ts';

export class ChangeApplyError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='ChangeApplyError';} }
export function prepareChangeApplyRequest(root:string,candidateId:string,targetSha:string){
  if(!/^CHANGE-[0-9a-f]{24}$/.test(candidateId)) throw new ChangeApplyError('CHANGE_CANDIDATE_ID_INVALID');
  const path=join(root,'missions','change-candidates',`${candidateId}.json`);if(!existsSync(path)) throw new ChangeApplyError('CHANGE_CANDIDATE_NOT_FOUND');
  let c:any;try{c=JSON.parse(readFileSync(path,'utf8'))}catch{throw new ChangeApplyError('CHANGE_CANDIDATE_INVALID')}
  const fresh=classifyChangeFreshness(path,targetSha);if(!fresh.fresh||!fresh.applyEligible) throw new ChangeApplyError('CHANGE_NOT_FRESH');
  if(!/^[0-9a-f]{64}$/.test(String(c.patchDigest??''))) throw new ChangeApplyError('PATCH_DIGEST_INVALID');
  return Object.freeze({schema:'othrys.os.change-apply-request-candidate.v1',candidateId:c.candidateId,missionId:c.missionId,patchDigest:c.patchDigest,targetSha:fresh.targetSha,status:'APPLY_REQUEST_ELIGIBLE',authorityGranted:false,applied:false});
}
