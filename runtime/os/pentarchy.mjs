const SEATS = Object.freeze(['KRONOS','TALOS','PROMETHEUS','MNEMOSYNE','HEPHAESTUS']);
const REQUIRED = Object.freeze({
  KRONOS:['lifeEvidence','boundedWindow'],
  TALOS:['flowEvidence','verificationEvidence','terminationEvidence'],
  PROMETHEUS:['intelligenceEvidence'],
  MNEMOSYNE:['lineageEvidence','lessonEvidence'],
  HEPHAESTUS:['buildEvidence','independentVerification'],
});
const STAGES = Object.freeze(['BOOTSTRAP','ASSISTED','EXECUTED','REPEATED','RECOVERED','LEARNED']);
function text(v,n){if(typeof v!=='string'||!v.trim()||v.length>n)throw new Error('PENTA_TEXT_INVALID');return v.trim()}
function finite(v){return Number.isFinite(v)&&v>=0}
export { SEATS as PENTARCHY_SEATS, STAGES as PENTARCHY_SELF_HOST_STAGES };
export function assessPentarchy(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('PENTA_INPUT_INVALID');
  const missionId=text(input.missionId,96), evidence=input.evidence;
  if(!evidence||typeof evidence!=='object'||Array.isArray(evidence))throw new Error('PENTA_EVIDENCE_REQUIRED');
  const seats={}; let ready=true;
  for(const seat of SEATS){const facts=evidence[seat];if(!facts||typeof facts!=='object'||Array.isArray(facts))throw new Error(`PENTA_${seat}_EVIDENCE_REQUIRED`);
    const missing=REQUIRED[seat].filter(k=>facts[k]!==true); if(missing.length)ready=false;
    seats[seat]=Object.freeze({ready:missing.length===0,missing:Object.freeze(missing)});
  }
  const authorityInvariant=input.authorityGranted===false&&input.executionStarted===false;
  if(!authorityInvariant)throw new Error('PENTA_AUTHORITY_CLAIM_FORBIDDEN');
  return Object.freeze({schema:'othrys.os.pentarchy-readiness.v1',missionId,seats:Object.freeze(seats),ready,authorityGranted:false,executionStarted:false});
}export function assessSelfHosting(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('SELF_HOST_INPUT_INVALID');
  const missionId=text(input.missionId,96),stage=text(input.stage,24);
  if(!STAGES.includes(stage))throw new Error('SELF_HOST_STAGE_INVALID');
  const total=input.totalSteps,internal=input.othrysSteps,external=input.externalSteps;
  if(!Number.isInteger(total)||total<1||!Number.isInteger(internal)||internal<0||!Number.isInteger(external)||external<0||internal+external!==total)throw new Error('SELF_HOST_COUNTS_INVALID');
  const debts=Array.isArray(input.capabilityDebt)?input.capabilityDebt:[];
  const clean=debts.map((d)=>Object.freeze({capability:text(d.capability,80),reason:text(d.reason,180),retirementGate:text(d.retirementGate,180)}));
  const ratio=internal/total;
  return Object.freeze({schema:'othrys.os.self-hosting.v1',missionId,stage,totalSteps:total,othrysSteps:internal,externalSteps:external,selfWorkRatio:ratio,capabilityDebt:Object.freeze(clean),normalPathExternalDependency:external>0,authorityGranted:false,executionStarted:false});
}
export function evaluateAutonomyGate(input){
  const penta=assessPentarchy(input.pentarchy), self=assessSelfHosting(input.selfHosting);
  const runs=input.runs;
  if(!runs||!Number.isInteger(runs.completed)||runs.completed<0||!Number.isInteger(runs.expected)||runs.expected<1||!finite(runs.replayEquality))throw new Error('AUTONOMY_RUNS_INVALID');
  const bounded=runs.completed===runs.expected&&runs.duplicateSideEffects===0&&runs.unexplainedStates===0&&runs.authorityDrift===0;
  const autonomyL1=penta.ready&&bounded&&runs.faultRecoveryProven===true&&runs.learningImprovementProven===true&&self.stage==='LEARNED'&&self.normalPathExternalDependency===false;
  return Object.freeze({schema:'othrys.os.autonomy-gate.v1',pentarchyReady:penta.ready,boundedRuns:bounded,selfWorkRatio:self.selfWorkRatio,faultRecoveryProven:runs.faultRecoveryProven===true,learningImprovementProven:runs.learningImprovementProven===true,autonomyL1,authorityGranted:false,executionStarted:false});
}