export const INTERVENTION_POLICIES=Object.freeze({RUN_BOUNDED:Object.freeze({askAt:Object.freeze(['POLICY_CONFLICT','AUTHORITY_CHANGE'])}),CHECKPOINTS:Object.freeze({askAt:Object.freeze(['DESIGN_GATE','CHECKPOINT','POLICY_CONFLICT','AUTHORITY_CHANGE'])}),EACH_SLICE:Object.freeze({askAt:Object.freeze(['SLICE_START','SLICE_END','DESIGN_GATE','CHECKPOINT','POLICY_CONFLICT','AUTHORITY_CHANGE'])})});
export function resolveInterventionPolicy(id='CHECKPOINTS'){
  const key=String(id??'').trim().toUpperCase(),policy=INTERVENTION_POLICIES[key];if(!policy)throw new Error('INTERVENTION_POLICY_INVALID');
  return Object.freeze({schema:'othrys.os.intervention-policy.v1',id:key,askAt:policy.askAt,trustCanalStillEnforced:true,talosEvidenceStillRequired:true,declarativeGrant:false,authorityGranted:false,executionStarted:false});
}
export function shouldInterrupt(policy,transitionClass){
  if(!policy||policy.schema!=='othrys.os.intervention-policy.v1')throw new Error('INTERVENTION_RECORD_INVALID');
  const hard=['POLICY_CONFLICT','AUTHORITY_CHANGE'];return Object.freeze({interrupt:hard.includes(transitionClass)||policy.askAt.includes(transitionClass),transitionClass,authorityGranted:false,executionStarted:false});
}
