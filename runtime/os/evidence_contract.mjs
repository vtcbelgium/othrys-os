import { createHash } from 'node:crypto';
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function freezeEvidenceContract(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('EVIDENCE_CONTRACT_REQUIRED');
  const artifacts=[...(raw.artifacts??[])].map(x=>Object.freeze({id:String(x.id),kind:String(x.kind??'FILE'),required:x.required!==false,verifier:String(x.verifier??'TALOS')}));
  if(!raw.missionId||!artifacts.length||artifacts.some(x=>!x.id||x.verifier!=='TALOS'))throw new Error('EVIDENCE_CONTRACT_INVALID');
  const body={schema:'othrys.os.evidence-contract.v1',missionId:String(raw.missionId),artifacts:Object.freeze(artifacts),frozenBeforeExecution:true,authorityGranted:false,executionStarted:false};return Object.freeze({...body,contractDigest:sha(body)});
}
export function evaluateEvidenceContract(contract,observed=[]){
  const ids=new Set(observed.map(x=>String(x.id))),missing=contract.artifacts.filter(x=>x.required&&!ids.has(x.id)).map(x=>x.id);
  return Object.freeze({schema:'othrys.os.evidence-contract-result.v1',missionId:contract.missionId,complete:missing.length===0,missing:Object.freeze(missing),observed:Object.freeze([...ids].sort()),talosVerificationRequired:true,authorityGranted:false,executionStarted:false});
}
