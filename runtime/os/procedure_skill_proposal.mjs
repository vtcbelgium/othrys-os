import { createHash } from 'node:crypto';
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0,20);
export function proposeSkillFromProcedure(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('PROCEDURE_REQUIRED');
  const count=Number(raw.repeatCount??0),success=Number(raw.successRate??0),evidence=[...(raw.evidenceRefs??[])].map(String).filter(Boolean);
  const eligible=count>=3&&success>=0.8&&evidence.length>=2;
  const body={schema:'othrys.os.procedure-skill-proposal.v1',proposalId:`SKP-${sha({name:raw.name,count,success,evidence})}`,name:String(raw.name??''),repeatCount:count,successRate:success,evidenceRefs:Object.freeze(evidence),eligible,disposition:eligible?'GARDEN_CANDIDATE':'OBSERVE_MORE',nextGate:eligible?'HEPHAESTUS_QUALIFICATION':'MORE_EVIDENCE',directBlockAdmission:false,authorityGranted:false,executionStarted:false};
  if(!body.name)throw new Error('PROCEDURE_NAME_REQUIRED');return Object.freeze(body);
}
