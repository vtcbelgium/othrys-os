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
  if(intent.action!=='REFINE_REQUEST'||intent.authorityGranted!==false) throw new DeckIntentError('INTENT_AUTHORITY_INVALID');
  const candidateCommit=String(intent.candidateCommit??'').trim();
  const feedback=String(intent.feedback??'').trim();
  const receivedAt=String(intent.receivedAt??'').trim();
  if(!/^[0-9a-f]{40}$/.test(candidateCommit)||!feedback||feedback.length>1200||!Number.isFinite(Date.parse(receivedAt))) throw new DeckIntentError('INTENT_EVIDENCE_INVALID');
  const intentDigest=digest({action:intent.action,candidateCommit,feedback,receivedAt});
  const missionId=`DECK-REFINE-${intentDigest.slice(0,24)}`;
  const command=JSON.stringify({type:'REFINE_REQUEST',candidateCommit,feedback,intentDigest});
  const ledger=new AdmissionLedger({path:ledgerPath});
  const canal=new TrustCanalAdmission(ledger,[{role:'operator',channel:'command-deck'}]);
  const result=canal.admit({missionId,command,actor:{role:'operator',channel:'command-deck'},context:`tablet intent ${intentDigest}`});
  return Object.freeze({schema:'othrys.deck.intent-admission.v1',intentDigest,missionId,created:result.created,record:result.record,authorityGranted:false,executionStarted:false});
}
