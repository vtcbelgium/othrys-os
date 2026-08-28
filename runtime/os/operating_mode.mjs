const ACTION_CLASS=Object.freeze({
  MISSION_PROPOSAL:'PLAN',
  MISSION_PROMOTION_REQUEST:'PLAN',
  MISSION_ID_ALLOCATION_REQUEST:'PLAN',
  REFINE_REQUEST:'MUTATE',
  MISSION_ACTIVATION_REQUEST:'EXECUTE',
  MISSION_NO_CHANGE_CLOSE_REQUEST:'EXECUTE',
  MISSION_BUILD_REQUEST:'EXECUTE',
  MISSION_EXECUTION_AUTH_REQUEST:'EXECUTE',
  MISSION_WORKER_LAUNCH_REQUEST:'EXECUTE',
  MISSION_CHANGE_APPLY_REQUEST:'MUTATE'
});

export const OPERATING_MODES=Object.freeze({
  OBSERVE:Object.freeze({observe:true,plan:false,mutate:false,execute:false,operatorGate:'ALL_WRITES'}),
  PLAN:Object.freeze({observe:true,plan:true,mutate:false,execute:false,operatorGate:'EXECUTION_AND_MUTATION'}),
  SUPERVISED_EXECUTE:Object.freeze({observe:true,plan:true,mutate:true,execute:true,operatorGate:'EVERY_CONSEQUENTIAL_STEP'}),
  AUTONOMOUS_EXECUTE:Object.freeze({observe:true,plan:true,mutate:true,execute:true,operatorGate:'TRUST_CANAL_POLICY'})
});

export class OperatingModeError extends Error{
  constructor(code){super(code);this.code=code;this.name='OperatingModeError';}
}
export function resolveOperatingMode(manifest,requested=null){
  const declared=manifest?.operatingModes;
  if(!declared||declared.enforcedBy!=='trust-canal'||declared.declarativeGrant!==false) throw new OperatingModeError('MODE_POLICY_INVALID');
  const supported=Array.isArray(declared.modes)?declared.modes:[];
  const mode=String(requested??declared.default??'').trim();
  if(!supported.includes(mode)||!OPERATING_MODES[mode]) throw new OperatingModeError('MODE_NOT_ALLOWED');
  return Object.freeze({
    schema:'othrys.os.operating-mode.v1',mode,
    policy:OPERATING_MODES[mode],enforcedBy:'trust-canal',
    authorityGranted:false,executionStarted:false
  });
}

export function authorizeOperatingModeAction(modeRecord,action){
  if(!modeRecord||modeRecord.authorityGranted!==false||modeRecord.enforcedBy!=='trust-canal') throw new OperatingModeError('MODE_RECORD_INVALID');
  const actionClass=ACTION_CLASS[String(action??'')];
  if(!actionClass) throw new OperatingModeError('ACTION_UNKNOWN');
  const policy=modeRecord.policy??{};
  const allowed=actionClass==='PLAN'?policy.plan===true:actionClass==='MUTATE'?policy.mutate===true:policy.execute===true;
  if(!allowed) throw new OperatingModeError(`MODE_DENIES_${actionClass}`);
  return Object.freeze({schema:'othrys.os.mode-decision.v1',mode:modeRecord.mode,action,actionClass,allowed:true,authorityGranted:false,executionStarted:false});
}

export function operatingModeProjection(manifest,requested=null){
  const active=resolveOperatingMode(manifest,requested);
  return Object.freeze({active,available:Object.keys(OPERATING_MODES).map(id=>({id,...OPERATING_MODES[id]})),authorityGranted:false});
}
