export const SKILL_SCHEMA='othrys.os.skill-contract.v1';
const RISK=new Set(['LOW','MEDIUM','HIGH']);
const text=(v,c)=>{if(typeof v!=='string'||!v.trim())throw new Error(c);return v.trim();};
export function validateSkillContract(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('SKILL_REQUIRED');
  const risk=String(raw.risk??'LOW').toUpperCase();if(!RISK.has(risk))throw new Error('SKILL_RISK_INVALID');
  const out={schema:SKILL_SCHEMA,id:text(raw.id,'SKILL_ID_REQUIRED'),version:text(raw.version,'SKILL_VERSION_REQUIRED'),capability:text(raw.capability,'SKILL_CAPABILITY_REQUIRED'),inputs:Object.freeze([...(raw.inputs??[])].map(String).sort()),outputs:Object.freeze([...(raw.outputs??[])].map(String).sort()),tools:Object.freeze([...(raw.tools??[])].map(String).sort()),permissions:Object.freeze([...(raw.permissions??[])].map(String).sort()),risk,costClass:String(raw.costClass??'ZERO').toUpperCase(),evaluation:Object.freeze([...(raw.evaluation??[])].map(String).sort()),authorityGranted:false,executionStarted:false};
  if(!out.evaluation.length)throw new Error('SKILL_EVALUATION_REQUIRED');return Object.freeze(out);
}
export function routeSkill(request,skills){
  const rows=(skills??[]).map(validateSkillContract).filter(s=>s.capability===request.capability);
  const legal=rows.filter(s=>(request.allowedPermissions??[]).every(p=>s.permissions.includes(p))&&(!request.maxRisk||['LOW','MEDIUM','HIGH'].indexOf(s.risk)<=['LOW','MEDIUM','HIGH'].indexOf(request.maxRisk)));
  legal.sort((a,b)=>a.costClass.localeCompare(b.costClass)||a.risk.localeCompare(b.risk)||a.id.localeCompare(b.id));
  return Object.freeze({schema:'othrys.os.skill-route.v1',outcome:legal.length?'MATCHED':'NO_LEGAL_SKILL',selected:legal[0]??null,candidates:Object.freeze(legal.map(x=>x.id)),authorityGranted:false,executionStarted:false});
}
