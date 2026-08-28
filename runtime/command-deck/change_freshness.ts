import { existsSync, readFileSync } from 'node:fs';

export class ChangeFreshnessError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='ChangeFreshnessError';} }
export function classifyChangeFreshness(candidatePath:string,targetSha:string){
  if(!existsSync(candidatePath)) throw new ChangeFreshnessError('CHANGE_CANDIDATE_MISSING');
  let c:any;try{c=JSON.parse(readFileSync(candidatePath,'utf8'))}catch{throw new ChangeFreshnessError('CHANGE_CANDIDATE_INVALID')}
  if(c.schema!=='othrys.os.change-candidate.v1'||c.status!=='VERIFIED_CHANGE_CANDIDATE'||c.applied!==false) throw new ChangeFreshnessError('CHANGE_CANDIDATE_STATE_INVALID');
  const baseSha=String(c.baseSha??''),target=String(targetSha??'').trim();
  if(!/^[0-9a-f]{40}$/.test(baseSha)||!/^[0-9a-f]{40}$/.test(target)) throw new ChangeFreshnessError('GIT_IDENTITY_INVALID');
  const fresh=baseSha===target;
  return Object.freeze({schema:'othrys.os.change-freshness.v1',candidateId:c.candidateId,missionId:c.missionId,baseSha,targetSha:target,status:fresh?'FRESH':'STALE_BASE',fresh,applyEligible:fresh,authorityGranted:false,applied:false,reason:fresh?'EXACT_BASE_MATCH':'BASE_SHA_MISMATCH'});
}
