import { createHash } from 'node:crypto';
import { AdmissionLedger } from '../trust-canal/ledger.ts';
import { TrustCanalAdmission } from '../trust-canal/admission.ts';

export class DeckIntentError extends Error {
  code:string;
  constructor(code:string){super(code);this.code=code;this.name='DeckIntentError';}
}

function digest(value:unknown){return createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');}

export function admitDeckIntent(intent:any,ledgerPath:string){
  if(!intent||intent.schema!=='othrys.deck.intent.v1'||intent.status!=='PENDING_TRUST_CANAL') throw new DeckIntentError('INTENT_STATE_INVALID');
  if(intent.authorityGranted!==false) throw new DeckIntentError('INTENT_AUTHORITY_INVALID');
  const receivedAt=String(intent.receivedAt??'').trim();
  if(!Number.isFinite(Date.parse(receivedAt))) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
  let intentDigest:string, missionId:string, command:string;
  if(intent.action==='REFINE_REQUEST'){
    const candidateCommit=String(intent.candidateCommit??'').trim();
    const feedback=String(intent.feedback??'').trim();
    if(!/^[0-9a-f]{40}$/.test(candidateCommit)||!feedback||feedback.length>1200) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
    intentDigest=digest({action:intent.action,candidateCommit,feedback,receivedAt});
    missionId=`DECK-REFINE-${intentDigest.slice(0,24)}`;
    command=JSON.stringify({type:'REFINE_REQUEST',candidateCommit,feedback,intentDigest});
  }else if(intent.action==='MISSION_PROPOSAL'){
    const projectContext=String(intent.projectContext??'').trim();
    const objective=String(intent.objective??'').trim();
    if(!projectContext||projectContext.length>64||!objective||objective.length>1200) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
    intentDigest=digest({action:intent.action,projectContext,objective,receivedAt});
    missionId=`DECK-MISSION-${intentDigest.slice(0,24)}`;
    command=JSON.stringify({type:'MISSION_PROPOSAL',projectContext,objective,intentDigest});
  }else if(intent.action==='MISSION_PROMOTION_REQUEST'){
    const proposalId=String(intent.proposalId??'').trim();
    if(!/^DECK-MISSION-[0-9a-f]{24}$/.test(proposalId)) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
    intentDigest=digest({action:intent.action,proposalId,receivedAt});
    missionId=`DECK-PROMOTE-${intentDigest.slice(0,24)}`;
    command=JSON.stringify({type:'MISSION_PROMOTION_REQUEST',proposalId,intentDigest});
  }else if(intent.action==='MISSION_ID_ALLOCATION_REQUEST'){
    const candidateId=String(intent.candidateId??'').trim();
    if(!/^CANDIDATE-[0-9a-f]{24}$/.test(candidateId)) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
    intentDigest=digest({action:intent.action,candidateId,receivedAt});
    missionId=`DECK-ALLOCATE-${intentDigest.slice(0,24)}`;
    command=JSON.stringify({type:'MISSION_ID_ALLOCATION_REQUEST',candidateId,intentDigest});
  }else if(intent.action==='MISSION_ACTIVATION_REQUEST'){
    const canonicalMissionId=String(intent.missionId??'').trim();
    if(!/^V2-\d{3}[A-Z]$/.test(canonicalMissionId)) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
    intentDigest=digest({action:intent.action,missionId:canonicalMissionId,receivedAt});
    missionId=`DECK-ACTIVATE-${intentDigest.slice(0,24)}`;
    command=JSON.stringify({type:'MISSION_ACTIVATION_REQUEST',missionId:canonicalMissionId,intentDigest});
  }else if(intent.action==='MISSION_NO_CHANGE_CLOSE_REQUEST'){
    const canonicalMissionId=String(intent.missionId??'').trim(),preflightDigest=String(intent.preflightDigest??'').trim();
    if(!/^V2-\d{3}[A-Z]$/.test(canonicalMissionId)||!/^[0-9a-f]{64}$/.test(preflightDigest)) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
    intentDigest=digest({action:intent.action,missionId:canonicalMissionId,preflightDigest,receivedAt});
    missionId=`DECK-NOCHANGE-${intentDigest.slice(0,24)}`;
    command=JSON.stringify({type:'MISSION_NO_CHANGE_CLOSE_REQUEST',missionId:canonicalMissionId,preflightDigest,intentDigest});
  }else throw new DeckIntentError('INTENT_AUTHORITY_INVALID');
  const ledger=new AdmissionLedger({path:ledgerPath});
  const canal=new TrustCanalAdmission(ledger,[{role:'operator',channel:'command-deck'}]);
  const result=canal.admit({missionId,command,actor:{role:'operator',channel:'command-deck'},context:`tablet intent ${intentDigest}`});
  return Object.freeze({schema:'othrys.deck.intent-admission.v1',intentDigest,missionId,created:result.created,record:result.record,authorityGranted:false,executionStarted:false});
}
