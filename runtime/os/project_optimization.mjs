export const PROJECT_OPTIMIZATION_SCHEMA='othrys.os.project-optimization.v1';

const PROFILES=Object.freeze({
  MINIMAL:{latencyClass:'INTERACTIVE',placementHint:'PACK',maxChannels:1,maxHephaestusHands:1,verificationFanout:1,reusePreference:'SAFE_DETERMINISTIC'},
  INTERACTIVE:{latencyClass:'INTERACTIVE',placementHint:'PACK',maxChannels:2,maxHephaestusHands:1,verificationFanout:2,reusePreference:'SAFE_DETERMINISTIC'},
  BALANCED:{latencyClass:'BALANCED',placementHint:'AUTO',maxChannels:4,maxHephaestusHands:2,verificationFanout:2,reusePreference:'SAFE_DETERMINISTIC'},
  BATCH:{latencyClass:'BATCH',placementHint:'PACK',maxChannels:8,maxHephaestusHands:3,verificationFanout:2,reusePreference:'AGGRESSIVE_SAFE'},
  VERIFICATION_HEAVY:{latencyClass:'BALANCED',placementHint:'SPREAD',maxChannels:4,maxHephaestusHands:1,verificationFanout:2,reusePreference:'SAFE_DETERMINISTIC'},
  GPU_HEAVY:{latencyClass:'BALANCED',placementHint:'PACK',maxChannels:2,maxHephaestusHands:1,verificationFanout:2,reusePreference:'SAFE_DETERMINISTIC'},
});

export const PROJECT_OPTIMIZATION_PROFILES=Object.freeze(Object.keys(PROFILES));

export function optimizationPolicyFor(profile='BALANCED'){
  const key=String(profile??'').trim().toUpperCase(),base=PROFILES[key];
  if(!base) throw new Error('INVALID_OPTIMIZATION_PROFILE');
  return Object.freeze({schema:PROJECT_OPTIMIZATION_SCHEMA,profile:key,
    objective:'VERIFIED_USEFUL_WORK_PER_METABOLIC_COST',...base,
    sharedMutation:false,claimsMerge:false,declarativeGrant:false});
}
export function validateOptimizationPolicy(policy){
  if(!policy||policy.schema!==PROJECT_OPTIMIZATION_SCHEMA) throw new Error('INVALID_OPTIMIZATION_POLICY');
  const expected=optimizationPolicyFor(policy.profile);
  for(const [key,value] of Object.entries(expected)){
    if(policy[key]!==value) throw new Error(`OPTIMIZATION_POLICY_DRIFT:${key}`);
  }
  if(policy.maxChannels<1||policy.maxChannels>8) throw new Error('OPTIMIZATION_CHANNEL_BUDGET_INVALID');
  if(policy.maxHephaestusHands<1||policy.maxHephaestusHands>3) throw new Error('OPTIMIZATION_HAND_BUDGET_INVALID');
  if(policy.verificationFanout<1||policy.verificationFanout>2) throw new Error('OPTIMIZATION_VERIFY_BUDGET_INVALID');
  if(policy.sharedMutation!==false||policy.claimsMerge!==false||policy.declarativeGrant!==false) throw new Error('OPTIMIZATION_POLICY_CANNOT_GRANT_AUTHORITY');
  return Object.freeze(policy);
}
