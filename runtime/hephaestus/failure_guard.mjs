const FAILURE = Object.freeze({
  NO_ATTEMPT_MUTATION: 'NO_ATTEMPT_MUTATION',
  FALSE_SUCCESS: 'FALSE_SUCCESS',
  TIMEOUT_NO_ARTIFACT: 'TIMEOUT_NO_ARTIFACT',
  PATH_VIOLATION: 'PATH_VIOLATION',
  DEPENDENCY_UNAVAILABLE: 'DEPENDENCY_UNAVAILABLE',
  CONTRACT_FAILURE: 'CONTRACT_FAILURE',
  REPAIR_EXHAUSTED: 'REPAIR_EXHAUSTED',
  OK: 'OK',
});

function cleanPath(value='') {
  return String(value).replaceAll('\\','/').replace(/^\.\//,'');
}
function insideAllowed(path, allowed=[]) {
  const p=cleanPath(path);
  return allowed.some(x=>p===cleanPath(x)||p.startsWith(`${cleanPath(x).replace(/\/$/,'')}/`));
}

export function preflightEngineeringAttempt(input={}) {
  const allowed=(input.allowedPaths??[]).map(cleanPath).filter(Boolean);
  const requested=(input.requestedPaths??[]).map(cleanPath).filter(Boolean);
  if (!allowed.length) return Object.freeze({ok:false,failureClass:FAILURE.PATH_VIOLATION,reason:'NO_ALLOWED_PATHS'});
  const escaped=requested.filter(p=>!insideAllowed(p,allowed));
  if (escaped.length) return Object.freeze({ok:false,failureClass:FAILURE.PATH_VIOLATION,reason:'REQUESTED_PATH_OUTSIDE_SCOPE',escaped:Object.freeze(escaped)});
  const unavailable=(input.dependencies??[]).filter(d=>d?.required===true&&d?.available!==true).map(d=>String(d.id??d.name??'unknown'));
  if (unavailable.length) return Object.freeze({ok:false,failureClass:FAILURE.DEPENDENCY_UNAVAILABLE,reason:'REQUIRED_DEPENDENCY_UNAVAILABLE',unavailable:Object.freeze(unavailable)});
  return Object.freeze({ok:true,failureClass:null,reason:'PREFLIGHT_PASS'});
}
export function classifyEngineeringOutcome(input={}) {
  const changed=(input.changedFiles??[]).map(cleanPath).filter(Boolean);
  const artifactCount=Number(input.artifactCount??0);
  const contractPassed=input.contractPassed===true;
  const timedOut=input.timedOut===true;
  const claimedOk=input.claimedOk===true;
  if (input.pathViolation===true) return Object.freeze({ok:false,failureClass:FAILURE.PATH_VIOLATION,reason:'PATH_SCOPE_REJECTED'});
  if (input.dependencyUnavailable===true) return Object.freeze({ok:false,failureClass:FAILURE.DEPENDENCY_UNAVAILABLE,reason:'DEPENDENCY_UNAVAILABLE'});
  if (timedOut && changed.length===0 && artifactCount===0) return Object.freeze({ok:false,failureClass:FAILURE.TIMEOUT_NO_ARTIFACT,reason:'TIMEOUT_WITHOUT_MUTATION_OR_ARTIFACT'});
  if (changed.length===0 && artifactCount===0) return Object.freeze({ok:false,failureClass:FAILURE.NO_ATTEMPT_MUTATION,reason:'NO_USEFUL_MUTATION'});
  if (!contractPassed && claimedOk) return Object.freeze({ok:false,failureClass:FAILURE.FALSE_SUCCESS,reason:'BUILDER_CLAIM_NOT_CONFIRMED_BY_CONTRACT'});
  if (!contractPassed) return Object.freeze({ok:false,failureClass:FAILURE.CONTRACT_FAILURE,reason:'CONTRACT_NOT_PROVEN'});
  return Object.freeze({ok:true,failureClass:FAILURE.OK,reason:'MUTATION_AND_CONTRACT_PROVEN'});
}

export function classifyRepairCampaign(attempts=[], {maxAttempts=3}={}) {
  const rows=attempts.map(classifyEngineeringOutcome);
  const success=rows.find(x=>x.ok===true);
  if (success) return Object.freeze({ok:true,failureClass:FAILURE.OK,attempts:Object.freeze(rows),authorityGranted:false});
  if (rows.length>=maxAttempts) return Object.freeze({ok:false,failureClass:FAILURE.REPAIR_EXHAUSTED,attempts:Object.freeze(rows),authorityGranted:false});
  return Object.freeze({ok:false,failureClass:rows.at(-1)?.failureClass??FAILURE.NO_ATTEMPT_MUTATION,attempts:Object.freeze(rows),authorityGranted:false});
}

export { FAILURE as ENGINEERING_FAILURE_CLASS };
