import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export class MissionCandidateError extends Error {
  code:string;
  constructor(code:string){super(code);this.code=code;this.name='MissionCandidateError';}
}

function lines(path:string): any[] {
  if(!existsSync(path)) return [];
  const text=readFileSync(path,'utf8');
  if(text && !text.endsWith('\n')) throw new MissionCandidateError('EVIDENCE_TORN_TAIL');
  return text.split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
}

function digest(value:unknown){return createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');}

export function materializeMissionCandidate(inboxPath:string,ledgerPath:string,outDir:string,proposalId:string){
  if(!/^DECK-MISSION-[0-9a-f]{24}$/.test(proposalId)) throw new MissionCandidateError('PROPOSAL_ID_INVALID');
  const intents=lines(inboxPath), ledger=lines(ledgerPath);
  const proposal=intents.find(x=>x.action==='MISSION_PROPOSAL' && (()=>{
    const body={action:x.action,projectContext:x.projectContext,objective:x.objective,receivedAt:x.receivedAt};
    return `DECK-MISSION-${digest(body).slice(0,24)}`===proposalId;
  })());
  if(!proposal) throw new MissionCandidateError('PROPOSAL_NOT_FOUND');
  if(!ledger.some(x=>x.missionId===proposalId && x.state==='ADMITTED')) throw new MissionCandidateError('PROPOSAL_NOT_ADMITTED');
  const promotion=intents.find(x=>x.action==='MISSION_PROMOTION_REQUEST' && x.proposalId===proposalId && (()=>{
    const body={action:x.action,proposalId:x.proposalId,receivedAt:x.receivedAt};
    return ledger.some(r=>r.missionId===`DECK-PROMOTE-${digest(body).slice(0,24)}` && r.state==='ADMITTED');
  })());
  if(!promotion) throw new MissionCandidateError('PROMOTION_NOT_ADMITTED');
  const promotionBody={action:promotion.action,proposalId:promotion.proposalId,receivedAt:promotion.receivedAt};
  const promotionId=`DECK-PROMOTE-${digest(promotionBody).slice(0,24)}`;
  const candidateId=`CANDIDATE-${proposalId.slice('DECK-MISSION-'.length)}`;
  const candidate=Object.freeze({
    schema:'othrys.os.mission-candidate.v1',candidateId,proposalId,promotionId,
    projectContext:String(proposal.projectContext),objective:String(proposal.objective),
    proposalReceivedAt:String(proposal.receivedAt),promotionReceivedAt:String(promotion.receivedAt),
    proposalAdmission:'ADMITTED',promotionAdmission:'ADMITTED',canonicalMissionId:null,
    authorityGranted:false,executionStarted:false,status:'CANDIDATE'
  });
  mkdirSync(outDir,{recursive:true});
  const path=join(outDir,`${candidateId}.json`);
  const serialized=JSON.stringify(candidate,null,2)+'\n';
  const existed=existsSync(path);
  if(existed && readFileSync(path,'utf8')!==serialized) throw new MissionCandidateError('CANDIDATE_CONFLICT');
  if(!existed) writeFileSync(path,serialized,'utf8');
  return Object.freeze({candidate,path,created:!existed});
}
