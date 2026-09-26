import http from 'node:http';
import { readFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { decideMissionPreflight } from './preflight_decision.ts';
import { proposeBuildRoute } from './build_route.ts';
import { validateExecutionAuthCandidate } from './execution_auth.ts';
import { validateWorkerLaunchCandidate } from './worker_launch.ts';
import { prepareChangeApplyRequest } from './change_apply.ts';
import { acceptWorkerResult } from './worker_acceptance.ts';
import { projectMissionWork } from '../os/work_projection.mjs';
import { projectOsProjection } from '../os/os_projection.mjs';
import { readWorkRecord } from '../os/work_record.mjs';
import { loadProjectManifest } from '../os/project_manifest.mjs';
import { resolveOperatingMode, authorizeOperatingModeAction, operatingModeProjection } from '../os/operating_mode.mjs';
import { resolveInterventionPolicy } from '../os/intervention_policy.mjs';
import { reconcileActiveMission } from '../os/mission_state_reconcile.mjs';
import { assembleKnowledgeContext, exportKnowledge, searchKnowledge } from '../os/mnemosyne.mjs';
import { buildAtlasProjection } from '../os/atlas_projection.mjs';
import { MODEL_REQUEST_SCHEMA, selectSwitchyardRoute } from '../os/switchyard.mjs';
import { collectOperationalEvidence, buildTalosOperationalIntelligence } from '../os/talos_learning_core.mjs';
import { answerFrontDoor, classifyFrontDoorIntent } from '../os/front_door.mjs';
import { handleWebControlRequest } from './web_control_http.ts';
import { readEstateProjection, syncEstateToDisk } from '../estate/local_git_estate.mjs';
import { planWebCommand, readWebBrainDecision } from './web_command_planner.ts';
import { activateWebCommand } from './web_command_activation.ts';
import { evaluateJevViaLegionBridge } from '../os/jev_remote_router.mjs';
import { createBrainDecision, createFallbackBrainDecision } from '../os/brain_orchestrator.mjs';
import { loadTrainingLabRegistry } from '../os/training_lab.mjs';
import { createJevCortexStatus } from '../os/jev_cortex.mjs';
import { inspectHecatoncheiresPosture } from '../os/hecatoncheires_posture.mjs';
import { createNoMissionBrainResult } from '../os/brain_no_mission_result.mjs';
import { persistWebBrainResult, readWebBrainResult } from '../os/brain_result_store.mjs';
import { executeLightSpecialist, warmLocalAdvisory } from '../os/brain_light_executor.mjs';

export const DECK_SCHEMA='othrys.command-deck.status.v1';
const root=resolve(import.meta.dirname,'../..');
const token=process.env.OTHRYS_DECK_TOKEN ?? '';
const port=Number(process.env.OTHRYS_DECK_PORT ?? 8780);
const bind=process.env.OTHRYS_DECK_BIND ?? '127.0.0.1';
const controlToken=process.env.OTHRYS_DECK_CONTROL_TOKEN ?? '';
const controlTokenSha256=process.env.OTHRYS_DECK_CONTROL_TOKEN_SHA256 ?? '';
const intentFile=process.env.OTHRYS_DECK_INTENT_FILE ?? '';
const admissionLedger=process.env.OTHRYS_DECK_ADMISSION_LEDGER ?? '';
const webCommandEnvelopeDir=process.env.OTHRYS_WEB_COMMAND_DIR ?? join(root,'missions','web-commands');
const webStateRoot=process.env.OTHRYS_WEB_STATE_ROOT?resolve(process.env.OTHRYS_WEB_STATE_ROOT):root;
const legionWorkspace=process.env.OTHRYS_LEGION_WORKSPACE ?? '';
const legionWorkerBridgeUrl=process.env.OTHRYS_LEGION_WORKER_URL ?? '';
const legionWorkerBridgeToken=process.env.OTHRYS_ENGINEERING_TOKEN ?? '';
const projectManifest=loadProjectManifest(root);
function activeOperatingMode(){ return resolveOperatingMode(projectManifest,process.env.OTHRYS_OS_MODE??null); }


function json(path){ return JSON.parse(readFileSync(join(root,path),'utf8')); }
export function trainingLabProjection(){
  const registry=loadTrainingLabRegistry(root);
  const manifest=json('docs/training/TRAINING_MANIFEST.json');
  const runDir=join(root,'.othrys','knowledge','archive','training');
  const runs=[];
  if(existsSync(runDir)){
    for(const file of readdirSync(runDir).filter(x=>x.endsWith('.jsonl')).sort().reverse()){
      for(const line of readFileSync(join(runDir,file),'utf8').split(/\r?\n/).filter(Boolean).reverse()){
        try{runs.push(JSON.parse(line));}catch{}
        if(runs.length>=24) break;
      }
      if(runs.length>=24) break;
    }
  }
  return Object.freeze({
    schema:'othrys.os.training-lab-projection.v1',
    epoch:registry.epoch,
    title:registry.title,
    codeLaw:registry.codeLaw,
    domains:registry.domains,
    measurementContract:registry.measurementContract,
    registrations:registry.registrations,
    curriculum:{
      currentLevel:manifest.currentLevel,
      levels:manifest.levels.map(x=>({level:x.level,name:x.name,goal:x.goal,status:x.status,entryGate:x.entryGate,authorityGranted:x.authorityGranted}))
    },
    jev:createJevCortexStatus(),
    aegis:inspectHecatoncheiresPosture(root),
    recentRuns:Object.freeze(runs),
    legacyCorpus:{root:'docs/training',preserved:true},
    sourceCommit:gitHead(),
    authorityGranted:false,
    controlsEnabled:false
  });
}
function gitHead(){
  const p=spawnSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'});
  return p.status===0?p.stdout.trim():'UNKNOWN';
}
function recent(history,n=8){ return Array.isArray(history)?history.slice(-n).reverse():[]; }
export function canonicalMissionTrail(n=12){
  const dir=join(root,'missions'); if(!existsSync(dir)) return [];
  const out=[];
  for(const file of readdirSync(dir).filter(x=>x.startsWith('V2-')&&x.endsWith('.result.json'))){
    try{
      const result=JSON.parse(readFileSync(join(dir,file),'utf8')); const missionId=String(result.mission_id??file.replace('.result.json',''));
      if(missionId!==file.replace('.result.json','')) continue;
      let title=missionId; const envelope=join(dir,`${missionId}.json`); if(existsSync(envelope)){const m=JSON.parse(readFileSync(envelope,'utf8')); title=String(m.title??m.objective??missionId);}
      out.push({missionId,title,verdict:String(result.verdict??result.status??'RECORDED'),candidateSha:result.candidate_sha??result.candidate_commit??null,resultPresent:true});
    }catch{}
  }
  return out.sort((a,b)=>a.missionId.localeCompare(b.missionId,undefined,{numeric:true})).slice(-n).reverse();
}
export function readLegionTelemetry(path=process.env.OTHRYS_LEGION_TELEMETRY){
  if(!path||!existsSync(path)) return null;
  try{
    const raw=JSON.parse(readFileSync(path,'utf8'));
    if(raw.nodeId!=='legion'||typeof raw.capturedAt!=='string') return null;
    const freshnessAt=typeof raw.receivedAt==='string'?raw.receivedAt:raw.capturedAt;
    const ageMs=Date.now()-Date.parse(freshnessAt);
    return {id:'legion',capturedAt:raw.capturedAt,receivedAt:raw.receivedAt??null,ageMs:Number.isFinite(ageMs)?ageMs:null,stale:!Number.isFinite(ageMs)||ageMs<0||ageMs>30000,cpuPercent:raw.cpuPercent,ramAvailableMb:raw.ramAvailableMb,gpuUtilPercent:raw.gpuUtilPercent,vramUsedMb:raw.vramUsedMb,vramTotalMb:raw.vramTotalMb,gpuTempC:raw.gpuTempC,qwenLoaded:raw.qwenLoaded===true};
  }catch{return null;}
}
function deriveIntentState(intent,ledger=admissionLedger){
  if(!intent||typeof intent!=='object') return null;
  let body,missionId;
  if(intent.action==='REFINE_REQUEST'){
    body={action:intent.action,candidateCommit:intent.candidateCommit,feedback:intent.feedback,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-REFINE-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_PROPOSAL'){
    body={action:intent.action,projectContext:intent.projectContext,objective:intent.objective,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-MISSION-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_PROMOTION_REQUEST'){
    body={action:intent.action,proposalId:intent.proposalId,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-PROMOTE-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_ID_ALLOCATION_REQUEST'){
    body={action:intent.action,candidateId:intent.candidateId,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-ALLOCATE-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_ACTIVATION_REQUEST'){
    body={action:intent.action,missionId:intent.missionId,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-ACTIVATE-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_NO_CHANGE_CLOSE_REQUEST'){
    body={action:intent.action,missionId:intent.missionId,preflightDigest:intent.preflightDigest,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-NOCHANGE-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_BUILD_REQUEST'){
    body={action:intent.action,missionId:intent.missionId,builderId:intent.builderId,routeDigest:intent.routeDigest,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-BUILD-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_EXECUTION_AUTH_REQUEST'){
    body={action:intent.action,missionId:intent.missionId,buildRequestId:intent.buildRequestId,builderId:intent.builderId,packageDigest:intent.packageDigest,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-EXEC-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_WORKER_LAUNCH_REQUEST'){
    body={action:intent.action,missionId:intent.missionId,leaseId:intent.leaseId,builderId:intent.builderId,leaseDigest:intent.leaseDigest,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-LAUNCH-${digest.slice(0,24)}`;
  }else if(intent.action==='MISSION_CHANGE_APPLY_REQUEST'){
    body={action:intent.action,candidateId:intent.candidateId,missionId:intent.missionId,patchDigest:intent.patchDigest,targetSha:intent.targetSha,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex'); missionId=`DECK-APPLY-${digest.slice(0,24)}`;
  }else return null;
  let admitted=false;
  if(ledger&&existsSync(ledger)) admitted=readFileSync(ledger,'utf8').split(/\r?\n/).some(line=>line.includes(`"missionId":"${missionId}"`));
  return {action:intent.action,candidateCommit:intent.candidateCommit??null,projectContext:intent.projectContext??null,objective:intent.objective??null,proposalId:intent.proposalId??null,candidateId:intent.candidateId??null,canonicalTargetMissionId:intent.missionId??null,preflightDigest:intent.preflightDigest??null,builderId:intent.builderId??null,routeDigest:intent.routeDigest??null,buildRequestId:intent.buildRequestId??null,packageDigest:intent.packageDigest??null,leaseId:intent.leaseId??null,leaseDigest:intent.leaseDigest??null,patchDigest:intent.patchDigest??null,targetSha:intent.targetSha??null,receivedAt:intent.receivedAt,missionId,status:admitted?'ADMITTED':'PENDING_TRUST_CANAL',authorityGranted:false};
}
export function readControlIntentState(inbox=intentFile,ledger=admissionLedger){
  if(!inbox||!existsSync(inbox)) return null;
  try{const lines=readFileSync(inbox,'utf8').trim().split(/\r?\n/).filter(Boolean); if(!lines.length)return null; return deriveIntentState(JSON.parse(lines.at(-1)),ledger);}catch{return null;}
}
export function readLatestIntentState(action,inbox=intentFile,ledger=admissionLedger){
  if(!inbox||!existsSync(inbox)) return null;
  try{const lines=readFileSync(inbox,'utf8').trim().split(/\r?\n/).filter(Boolean).reverse();for(const line of lines){const intent=JSON.parse(line);if(intent.action===action)return deriveIntentState(intent,ledger);}return null;}catch{return null;}
}
export function missionEvidence(missionId){
  if(!missionId||!/^V2-[0-9]+[A-Z]$/.test(missionId)) return null;
  const envelope=join(root,'missions',`${missionId}.json`); if(!existsSync(envelope)) return null;
  try{
    const m=JSON.parse(readFileSync(envelope,'utf8')); const resultPath=join(root,'missions',`${missionId}.result.json`);
    let result=null; if(existsSync(resultPath)) result=JSON.parse(readFileSync(resultPath,'utf8'));
    return {missionId,title:String(m.title??m.objective??missionId),goal:String(m.goal??m.objective??''),laws:Array.isArray(m.laws)?m.laws:[],resultPresent:!!result,verdict:result?String(result.verdict??result.status??'RECORDED'):null,candidateSha:result?.candidate_sha??result?.candidate_commit??null};
  }catch{return null;}
}
function switchyardCandidates(){
  return projectManifest.modelPolicy.requests.map(({id,label,capabilities,tier,costClass,latencyClass,locality,providerHealth,certification,measuredTrust,paidApprovalRequired,legal})=>({id,label,capabilities,tier,costClass,latencyClass,locality,providerHealth,certification,measuredTrust,paidApprovalRequired,legal}));
}
export function switchyardPreviewFor(capability='engineering.build',minimumTier='STANDARD',preference='auto'){
  const pref=String(preference??'auto');
  const all=switchyardCandidates();
  const candidates=pref==='auto'?all:all.filter(x=>x.id===pref);
  if(!candidates.length) return {schema:'othrys.os.switchyard-selection.v1',outcome:'NO_LEGAL_CANDIDATE',request:null,selected:null,eligible:[],rejections:{[pref]:'UNKNOWN_PREFERENCE'},paidApprovalRequired:false,authorityGranted:false,executionStarted:false,policy:projectManifest.modelPolicy.policy,preference:pref,reason:'UNKNOWN_PREFERENCE'};
  const request={schema:MODEL_REQUEST_SCHEMA,capability,minimumTier,privacy:'PROJECT',locality:'PREFER_LOCAL',maxCostClass:'PAID',maxLatency:'BATCH'};
  const operational=collectOperationalEvidence(root,{limit:200}).filter(e=>e?.evidence?.routeEvidence?.id);
  const routeEvidence=operational.length?buildTalosOperationalIntelligence(operational,{level:3.5}).adaptations.SWITCHYARD.routeEvidence:{};
  const result=selectSwitchyardRoute(request,candidates,{evidence:routeEvidence});
  const reason=result.outcome==='SELECTED'?'NATIVE_SWITCHYARD_SELECTED':result.outcome;
  return {...result,policy:projectManifest.modelPolicy.policy,preference:pref,reason};
}
export function switchyardPreview(preference='auto'){return switchyardPreviewFor('engineering.build','STANDARD',preference);}

export async function brainDecisionForWebCommand(webCommandId){
  const existing=readWebBrainDecision(webStateRoot,webCommandId);
  if(existing) return existing;
  const envelopePath=join(webCommandEnvelopeDir,webCommandId+'.json');
  if(!existsSync(envelopePath)) throw new Error('WEB_COMMAND_ENVELOPE_NOT_FOUND');
  const envelope=JSON.parse(readFileSync(envelopePath,'utf8'));
  const command=String(envelope?.command??'').trim();
  if(!command) throw new Error('WEB_COMMAND_ENVELOPE_INVALID');
  const sharedStateRef='web:'+webCommandId;

  if(!legionWorkerBridgeUrl||!legionWorkerBridgeToken){
    return createFallbackBrainDecision({
      command,
      sharedStateRef,
      reason:'BRAIN_BRIDGE_NOT_CONFIGURED',
    });
  }

  try{
    const remote=await evaluateJevViaLegionBridge({
      baseUrl:legionWorkerBridgeUrl,
      token:legionWorkerBridgeToken,
      state:command,
      model:'jev-1.13.0',
    });
    return createBrainDecision({
      command,
      observation:remote.observation,
      sharedStateRef,
    });
  }catch(error){
    return createFallbackBrainDecision({
      command,
      sharedStateRef,
      reason:String(error?.code??error?.message??'BRAIN_UNAVAILABLE'),
    });
  }
}



function boundedLightRepoContext(command){
  const parts=[];
  const status=spawnSync('git',['-C',root,'status','--short','--branch'],{encoding:'utf8',timeout:3000});
  if(status.status===0&&status.stdout.trim()) parts.push('GIT STATUS\n'+status.stdout.trim().slice(0,3000));
  const log=spawnSync('git',['-C',root,'log','-5','--oneline','--decorate'],{encoding:'utf8',timeout:3000});
  if(log.status===0&&log.stdout.trim()) parts.push('RECENT COMMITS\n'+log.stdout.trim().slice(0,3000));
  try{
    const capsule=assembleKnowledgeContext(root,projectManifest,command,{limit:6,state:json('GPT_STATE.json')});
    const compact=(capsule.transportCapsule?.items??[]).slice(0,8).map(item=>({
      id:item.id,
      grounding:item.grounding,
      transport:item.transport,
      payload:item.payload??null,
      artifactRef:item.artifactRef??null,
    }));
    if(compact.length) parts.push('MNEMOSYNE CONTEXT\n'+JSON.stringify(compact).slice(0,7000));
  }catch{}
  return parts.join('\n\n').slice(0,13000);
}

export async function brainResultForWebCommand(webCommandId,plan,brainDecision){
  if(!plan||plan.status!=='NO_MISSION_REQUIRED'||!brainDecision) return null;
  const existing=readWebBrainResult(webStateRoot,webCommandId,{decision:brainDecision});
  if(existing) return existing;

  const envelopePath=join(webCommandEnvelopeDir,webCommandId+'.json');
  if(!existsSync(envelopePath)) throw new Error('WEB_COMMAND_ENVELOPE_NOT_FOUND');
  const envelope=JSON.parse(readFileSync(envelopePath,'utf8'));
  const command=String(envelope?.command??'').trim();
  if(!command) throw new Error('WEB_COMMAND_ENVELOPE_INVALID');

  let specialistRoute=null;
  if(brainDecision.lane==='LIGHT'){
    specialistRoute=switchyardPreviewFor('analysis.summarize','LIGHT','auto');
  }

  const result=await createNoMissionBrainResult({
    decision:brainDecision,
    command,
    statusProjection:buildStatus,
    directAnswer:async(input)=>{
      const status=await buildStatus();
      const quarry=json('docs/V2-011J/FINAL_QUARRY_CENSUS.json');
      const turn=answerFrontDoor(input,{
        status:{
          activeMission:status.activeMission,
          quarryClosed:quarry?.status==='CLOSED',
          bodyStatus:status.controlGate==='CLEAN_SYNCED'?'CONTROL_PLANE_HEALTHY':'ATTENTION',
          deepProof:'use Deep/Whole diagnostics for current proof',
        },
        modelSelection:null,
      });
      return turn.answer;
    },
    specialistRoute,
    specialistExecutor:({decision,command,specialistRoute})=>executeLightSpecialist({
      decision,
      command,
      specialistRoute,
      legionBridgeUrl:legionWorkerBridgeUrl,
      legionBridgeToken:legionWorkerBridgeToken,
      contextText:decision.needsRepo===true?boundedLightRepoContext(command):'',
    }),
  });
  return persistWebBrainResult(webStateRoot,webCommandId,result,{decision:brainDecision}).result;
}
export function builderInspector(missionId=null){
  const selection=switchyardPreview('auto');
  const workerTransport=latestWorkerTransport(missionId);
  const intervention=resolveInterventionPolicy(projectManifest.work?.interventionDefault??'CHECKPOINTS');
  const selected=selection.selected??selection.approvalCandidate??null;
  return Object.freeze({
    schema:'othrys.os.builder-inspector.v1',
    authority:'hephaestus',
    role:'Engineering authority',
    selection,
    selectedBuilder:selected,
    node:selected?.locality==='LOCAL'?'legion':selected?.locality==='REMOTE'?'remote':null,
    routingPolicy:projectManifest.modelPolicy.policy,
    operatingMode:operatingModeProjection(projectManifest,process.env.OTHRYS_OS_MODE??null),
    interventionPolicy:intervention,
    attemptBudget:Object.freeze({defaultAttempts:3,hardCeiling:5,source:'factory-plan + hephaestus-authority'}),
    contextPolicy:Object.freeze({
      externalChatUsageObservable:false,
      exactTokenPressureObservable:false,
      sessionTimeIsHeuristicOnly:true,
      contextTransport:'bounded evidence capsules',
      canonicalStateSurvivesChat:true,
      handoffSafe:true
    }),
    authorityGranted:false,
    executionStarted:workerTransport?.executionStarted===true
  });
}
export function missionProposalEnvelope(proposalIntent,promotionIntent=null){
  if(!proposalIntent||proposalIntent.action!=='MISSION_PROPOSAL'||!proposalIntent.missionId) return null;
  const projectContext=String(proposalIntent.projectContext??'').trim(),objective=String(proposalIntent.objective??'').trim();
  if(!projectContext||!objective) return null;
  const promotion=promotionIntent?.action==='MISSION_PROMOTION_REQUEST'&&promotionIntent.proposalId===proposalIntent.missionId?{requestId:promotionIntent.missionId,status:promotionIntent.status}:null;
  return Object.freeze({schema:'othrys.os.mission-proposal.v1',proposalId:proposalIntent.missionId,projectContext,objective,admissionStatus:proposalIntent.status,promotionRequest:promotion,promoted:false,canonicalMissionId:null,authorityGranted:false,executionStarted:false});
}
export function latestMissionCandidate(){
  const dir=join(root,'missions','candidates'); if(!existsSync(dir)) return null;
  const files=readdirSync(dir).filter(n=>/^CANDIDATE-[0-9a-f]{24}\.json$/.test(n)).sort(); if(!files.length) return null;
  try{
    const c=JSON.parse(readFileSync(join(dir,files.at(-1)),'utf8')); if(c.schema!=='othrys.os.mission-candidate.v1'||c.status!=='CANDIDATE') return null;
    const bp=join(dir,`${c.candidateId}.allocation.json`); if(!existsSync(bp)) return c;
    const b=JSON.parse(readFileSync(bp,'utf8')); if(b.schema!=='othrys.os.mission-allocation.v1'||b.candidateId!==c.candidateId) return c;
    return {...c,canonicalMissionId:b.missionId,allocationStatus:b.status,allocationId:b.allocationId};
  }catch{return null;}
}
export function readMissionPreflight(missionId){
  if(!/^V2-\d{3}[A-Z]$/.test(String(missionId??''))) return null;
  const path=join(root,'missions',`${missionId}.preflight.json`); if(!existsSync(path)) return null;
  try{const raw=readFileSync(path,'utf8'),p=JSON.parse(raw);if(p.schema!=='othrys.os.mission-preflight.v1'||p.missionId!==missionId)return null;return {...p,digest:createHash('sha256').update(raw,'utf8').digest('hex')};}catch{return null;}
}
export function latestBuildPackage(missionId=null){
  const dir=join(root,'missions','build-packages');if(!existsSync(dir))return null;
  const preferred=missionId?buildPackagePathForMission(missionId):null;
  if(preferred){try{const p=JSON.parse(readFileSync(preferred,'utf8'));if(p.schema==='othrys.os.build-package.v1'&&p.status==='READY_NOT_EXECUTING')return p;}catch{}}
  const files=readdirSync(dir).filter(n=>/^DECK-BUILD-[0-9a-f]{24}\.json$/.test(n)).sort();if(!files.length)return null;
  try{const p=JSON.parse(readFileSync(join(dir,files.at(-1)),'utf8'));if(p.schema!=='othrys.os.build-package.v1'||p.status!=='READY_NOT_EXECUTING')return null;return p;}catch{return null;}
}
export function latestWorkerAcceptance(){
  const dir=join(root,'missions');if(!existsSync(dir))return null;
  const files=readdirSync(dir).filter(n=>/^V2-\d{3}[A-Z]\.worker-result\.json$/.test(n)).sort().reverse();
  for(const name of files){try{const worker=JSON.parse(readFileSync(join(dir,name),'utf8')),missionId=name.replace('.worker-result.json',''),job=String(worker.job_id??'');if(!/^JOB-[0-9a-f]{24}$/.test(job))continue;const dispatch=join(dir,'dispatch-tickets',`DISPATCH-${job.slice(4)}.json`),verify=join(dir,`${missionId}.verification.json`);return acceptWorkerResult(dispatch,join(dir,name),verify);}catch{}}return null;
}
export function latestWorkerTransport(missionId=null){
  const dir=join(root,'missions');if(!existsSync(dir))return null;
  const files=missionId?[`${missionId}.worker-transport.json`]:readdirSync(dir).filter(n=>/^V2-\d{3}[A-Z]\.worker-transport\.json$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
  for(const name of files){
    const path=join(dir,name);if(!existsSync(path))continue;
    try{const value=JSON.parse(readFileSync(path,'utf8'));if(value.schema==='othrys.os.worker-transport.v1'&&value.executionStarted===true)return value;}catch{}
  }
  return null;
}
export function buildPackagePathForMission(missionId){
  const dir=join(root,'missions','build-packages');if(!existsSync(dir))return null;
  for(const name of readdirSync(dir).filter(n=>/^DECK-BUILD-[0-9a-f]{24}\.json$/.test(n)).sort().reverse()){try{const p=JSON.parse(readFileSync(join(dir,name),'utf8'));if(p.schema==='othrys.os.build-package.v1'&&p.missionId===missionId)return join(dir,name);}catch{}}return null;
}
export function executionLeasePathForMission(missionId){
  const dir=join(root,'missions','execution-leases');if(!existsSync(dir))return null;let best=null,bestAt=-1;
  for(const name of readdirSync(dir).filter(n=>/^LEASE-[0-9a-f]{24}\.json$/.test(n))){try{const p=JSON.parse(readFileSync(join(dir,name),'utf8'));const at=Date.parse(String(p.issuedAt??''));if(p.schema==='othrys.os.execution-lease.v1'&&p.missionId===missionId&&p.status==='LEASE_READY_NOT_STARTED'&&Number.isFinite(at)&&at>bestAt){best=join(dir,name);bestAt=at;}}catch{}}return best;
}
export function latestExecutionLease(missionId=null){
  const path=missionId?executionLeasePathForMission(missionId):null;if(path){try{return JSON.parse(readFileSync(path,'utf8'))}catch{}}
  const dir=join(root,'missions','execution-leases');if(!existsSync(dir))return null;let best=null,bestAt=-1;for(const name of readdirSync(dir).filter(n=>/^LEASE-[0-9a-f]{24}\.json$/.test(n))){try{const p=JSON.parse(readFileSync(join(dir,name),'utf8'));const at=Date.parse(String(p.issuedAt??''));if(p.schema==='othrys.os.execution-lease.v1'&&p.status==='LEASE_READY_NOT_STARTED'&&Number.isFinite(at)&&at>bestAt){best=p;bestAt=at;}}catch{}}return best;
}
export function latestGovernedApply(){
  const dir=join(root,'missions');
  const files=readdirSync(dir).filter(n=>/^V2-[0-9]+[A-Z]\.result\.json$/.test(n)).sort().reverse();
  for(const name of files){try{const r=JSON.parse(readFileSync(join(dir,name),'utf8'));if(r.verdict==='PASS'&&r.canonical_apply_commit&&Array.isArray(r.changed_files)&&r.changed_files.length){return {missionId:r.mission_id,builderId:r.builder_id??null,candidateId:r.candidate_id??null,applyRequestId:r.apply_request_id??null,canonicalCommit:r.canonical_apply_commit,changedFiles:r.changed_files,independentVerification:r.independent_verification??null,status:'CANONICAL_APPLY_VERIFIED'};}}catch{}}
  return null;
}

export function latestWebMissionId(){
  const dir=join(root,'missions','web-plans');
  if(!existsSync(dir)) return null;
  const ids=[];
  for(const name of readdirSync(dir).filter(n=>n.endsWith('.json')&&!n.endsWith('.activation.json'))){
    try{
      const plan=JSON.parse(readFileSync(join(dir,name),'utf8'));
      const id=String(plan.canonicalMissionId??'');
      if(/^V2-\d+[A-Z]$/.test(id)&&existsSync(join(root,'missions',id+'.json'))) ids.push(id);
    }catch{}
  }
  return ids.sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))[0]??null;
}

export async function buildStatus(){
  const state=json('GPT_STATE.json');
  const activeReconciliation=reconcileActiveMission(root,state.active_mission??null);
  let factory=null;
  if(existsSync(join(root,'missions','V2-005A.result.json'))){
    const f=json('missions/V2-005A.result.json');
    factory={orosId:f.oros_id,product:f.product,status:f.factory_status,candidateCommit:f.product_candidate_commit,released:f.released===true};
  }
  let node=null;
  try{ node=(await (await fetch('http://127.0.0.1:8765/health',{signal:AbortSignal.timeout(1200)})).json()).node; }catch{}
  const missionResults=existsSync(join(root,'missions'))?readFileSync(join(root,'V2_BUILD_BACKLOG.md'),'utf8').match(/\| COMPLETE \|/g)?.length??0:0;
  const nextMissionId=String(state.next_legal_action??'').match(/\bV2-\d+[A-Z]\b/)?.[0]??null;
  const activeEffectivelyComplete=state.active_mission?.status==='COMPLETE'||activeReconciliation.reconciliation?.toStatus==='COMPLETE';
  const latestWebMission=activeEffectivelyComplete?latestWebMissionId():null;
  const missionId=latestWebMission
    ??(state.active_mission?.status==='COMPLETE'&&nextMissionId&&existsSync(join(root,'missions',`${nextMissionId}.json`))?nextMissionId:null)
    ??state.active_mission?.mission_id;
  const workState=projectMissionWork(root,state,missionId);
  const osSurface=projectOsProjection(root,state,missionResults);
  const durableWork=missionId?readWorkRecord(root,missionId):null;
  const controlIntent=readControlIntentState();
  const proposalIntent=readLatestIntentState('MISSION_PROPOSAL');
  const promotionIntent=readLatestIntentState('MISSION_PROMOTION_REQUEST');
  const allocationIntent=readLatestIntentState('MISSION_ID_ALLOCATION_REQUEST');
  const activationIntent=readLatestIntentState('MISSION_ACTIVATION_REQUEST');
  const noChangeCloseIntent=readLatestIntentState('MISSION_NO_CHANGE_CLOSE_REQUEST');
  const buildIntent=readLatestIntentState('MISSION_BUILD_REQUEST');
  const executionAuthIntent=readLatestIntentState('MISSION_EXECUTION_AUTH_REQUEST');
  const launchIntent=readLatestIntentState('MISSION_WORKER_LAUNCH_REQUEST');
  const missionCandidate=latestMissionCandidate();
  const missionPreflight=readMissionPreflight(missionCandidate?.canonicalMissionId);
  return {
    schema:DECK_SCHEMA,generatedAt:new Date().toISOString(),head:gitHead(),controlGate:state.control_gate,
    activeMission:state.active_mission,activeMissionReconciliation:activeReconciliation.reconciliation,nextAction:state.next_legal_action,lastDecision:state.last_control_decision,
    recentMissions:recent(state.mission_history),canonicalMissions:canonicalMissionTrail(),factory,legionNode:readLegionTelemetry(),controlIntent,missionProposal:missionProposalEnvelope(proposalIntent,promotionIntent),missionCandidate,missionAllocationRequest:allocationIntent,missionActivationRequest:activationIntent,missionPreflight,missionNoChangeCloseRequest:noChangeCloseIntent,missionBuildRequest:buildIntent,buildPackage:latestBuildPackage(executionAuthIntent?.canonicalTargetMissionId??buildIntent?.canonicalTargetMissionId??null),missionExecutionAuthRequest:executionAuthIntent,workerTransport:latestWorkerTransport(missionId),workerAcceptance:latestWorkerAcceptance(),executionLease:latestExecutionLease(launchIntent?.canonicalTargetMissionId??executionAuthIntent?.canonicalTargetMissionId??null),missionWorkerLaunchRequest:launchIntent,latestGovernedApply:latestGovernedApply(),
    localNode:node?{id:node.node_id,health:node.health,advertised:node.advertised,capabilities:node.capabilities}:null,
    osSurface,operatingMode:operatingModeProjection(projectManifest,process.env.OTHRYS_OS_MODE??null),builderInspector:builderInspector(missionId),workState,durableWork,missionEvidence:missionEvidence(missionId),authorityGranted:false,controlsEnabled:false
  };
}

function currentCandidate(){
  if(!existsSync(join(root,'missions','V2-005A.result.json'))) return null;
  const f=json('missions/V2-005A.result.json'); return f.product_candidate_commit ?? null;
}
function controlAuthorized(req){ return !!controlToken && req.headers['x-othrys-control-token']===controlToken; }
function persistIntent(body){
  if(!intentFile) throw new Error('INTENT_STORE_REQUIRED');
  const action=body?.action;
  authorizeOperatingModeAction(activeOperatingMode(),action);
  let rec;
  if(action==='REFINE_REQUEST'){
    const candidateCommit=body?.candidateCommit,feedback=String(body?.feedback??'').trim();
    if(candidateCommit!==currentCandidate()) throw new Error('CANDIDATE_MISMATCH');
    if(!feedback||feedback.length>1200) throw new Error('INVALID_FEEDBACK');
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,candidateCommit,feedback,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_PROPOSAL'){
    const projectContext=String(body?.projectContext??'').trim(),objective=String(body?.objective??'').trim();
    if(!projectContext||projectContext.length>64) throw new Error('INVALID_PROJECT_CONTEXT');
    if(!objective||objective.length>1200) throw new Error('INVALID_OBJECTIVE');
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,projectContext,objective,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_PROMOTION_REQUEST'){
    const proposalId=String(body?.proposalId??'').trim();
    if(!/^DECK-MISSION-[0-9a-f]{24}$/.test(proposalId)) throw new Error('INVALID_PROPOSAL_ID');
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,proposalId,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_ID_ALLOCATION_REQUEST'){
    const candidateId=String(body?.candidateId??'').trim();
    if(!/^CANDIDATE-[0-9a-f]{24}$/.test(candidateId)) throw new Error('INVALID_CANDIDATE_ID');
    const candidatePath=join(root,'missions','candidates',`${candidateId}.json`);
    if(!existsSync(candidatePath)) throw new Error('CANDIDATE_NOT_FOUND');
    const candidate=JSON.parse(readFileSync(candidatePath,'utf8'));
    if(candidate.status!=='CANDIDATE'||candidate.canonicalMissionId!==null||candidate.executionStarted!==false) throw new Error('CANDIDATE_STATE_INVALID');
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,candidateId,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_ACTIVATION_REQUEST'){
    const missionId=String(body?.missionId??'').trim();
    if(!/^V2-\d{3}[A-Z]$/.test(missionId)) throw new Error('INVALID_MISSION_ID');
    const missionPath=join(root,'missions',`${missionId}.json`); if(!existsSync(missionPath)) throw new Error('MISSION_NOT_FOUND');
    const mission=JSON.parse(readFileSync(missionPath,'utf8'));
    if(mission.status!=='CANONICAL_UNACTIVATED'||mission.authorityGranted!==false||mission.executionStarted!==false) throw new Error('MISSION_NOT_ACTIVATABLE');
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,missionId,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_NO_CHANGE_CLOSE_REQUEST'){
    const missionId=String(body?.missionId??'').trim();
    if(!/^V2-\d{3}[A-Z]$/.test(missionId)) throw new Error('INVALID_MISSION_ID');
    const missionPath=join(root,'missions',`${missionId}.json`); if(!existsSync(missionPath)) throw new Error('MISSION_NOT_FOUND');
    const mission=JSON.parse(readFileSync(missionPath,'utf8')),preflightPath=join(root,'missions',`${missionId}.preflight.json`); if(!existsSync(preflightPath)) throw new Error('PREFLIGHT_NOT_FOUND');
    const raw=readFileSync(preflightPath,'utf8'),preflight=JSON.parse(raw);
    if(mission.status!=='CANONICAL_UNACTIVATED'||mission.authorityGranted!==false||mission.executionStarted!==false) throw new Error('MISSION_STATE_INVALID');
    if(preflight.verdict!=='NO_CHANGE_JUSTIFIED'||preflight.objectiveSatisfied!==true||preflight.mutationRequired!==false||preflight.builderRequired!==false||preflight.authorityGranted!==false||preflight.executionStarted!==false) throw new Error('PREFLIGHT_NOT_CLOSABLE');
    const preflightDigest=createHash('sha256').update(raw,'utf8').digest('hex');
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,missionId,preflightDigest,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_BUILD_REQUEST'){
    const missionId=String(body?.missionId??'').trim();
    if(!/^V2-\d{3}[A-Z]$/.test(missionId)) throw new Error('INVALID_MISSION_ID');
    const preflight=decideMissionPreflight(root,missionId),selection=switchyardPreview('auto'),route=proposeBuildRoute(preflight,selection);
    if(preflight.class!=='MISSING_WORK'||route.status!=='ROUTE_PROPOSED'||!route.selected) throw new Error('BUILD_ROUTE_NOT_AVAILABLE');
    const routeDigest=createHash('sha256').update(JSON.stringify(route),'utf8').digest('hex');
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,missionId,builderId:route.selected.id,routeDigest,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_EXECUTION_AUTH_REQUEST'){
    const missionId=String(body?.missionId??'').trim();if(!/^V2-\d{3}[A-Z]$/.test(missionId)) throw new Error('INVALID_MISSION_ID');
    const packagePath=buildPackagePathForMission(missionId);if(!packagePath) throw new Error('BUILD_PACKAGE_NOT_FOUND');
    const candidate=validateExecutionAuthCandidate(root,packagePath,switchyardPreview('auto'));
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,missionId,buildRequestId:candidate.buildRequestId,builderId:candidate.builderId,packageDigest:candidate.packageDigest,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_WORKER_LAUNCH_REQUEST'){
    const missionId=String(body?.missionId??'').trim();if(!/^V2-\d{3}[A-Z]$/.test(missionId)) throw new Error('INVALID_MISSION_ID');
    const leasePath=executionLeasePathForMission(missionId);if(!leasePath) throw new Error('EXECUTION_LEASE_NOT_FOUND');
    const candidate=validateWorkerLaunchCandidate(leasePath,new Date().toISOString());
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,missionId,leaseId:candidate.leaseId,builderId:candidate.builderId,leaseDigest:candidate.leaseDigest,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else if(action==='MISSION_CHANGE_APPLY_REQUEST'){
    const candidateId=String(body?.candidateId??'').trim();
    const candidate=prepareChangeApplyRequest(root,candidateId,gitHead());
    rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,candidateId:candidate.candidateId,missionId:candidate.missionId,patchDigest:candidate.patchDigest,targetSha:candidate.targetSha,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  }else throw new Error('ACTION_NOT_ALLOWED');
  mkdirSync(dirname(intentFile),{recursive:true}); appendFileSync(intentFile,JSON.stringify(rec)+'\n'); return rec;
}
export function authorized(req){
  if(!token) return false;
  return req.headers['x-othrys-deck-token']===token;
}
function send(res,code,body,type='application/json; charset=utf-8'){
  res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
  res.end(body);
}
export async function handle(req,res){
  if(await handleWebControlRequest(req,res,{
    token:controlToken,
    tokenSha256:controlTokenSha256,
    ledgerPath:admissionLedger,
    systemProjection:buildStatus,
    trainingProjection:trainingLabProjection,
    estateProjection:()=>readEstateProjection(),
    estateRefresh:()=>syncEstateToDisk(),
    commandEnvelopeDir:webCommandEnvelopeDir,
    commandPlanner:async(missionId)=>{
      const envelope=join(webCommandEnvelopeDir,missionId+'.json');
      if(!existsSync(envelope)) return null;
      const rawActive=json('GPT_STATE.json').active_mission??null;
      const active=reconcileActiveMission(root,rawActive).activeMission;
      const brainDecision=await brainDecisionForWebCommand(missionId);
      const plan=planWebCommand({
        root:webStateRoot,
        webCommandId:missionId,
        envelopeDir:webCommandEnvelopeDir,
        intentFile,
        ledgerPath:admissionLedger,
        activeMission:active,
        brainDecision,
      });
      let brainResult=null;
      let brainResultError=null;
      if(plan.status==='NO_MISSION_REQUIRED'){
        try{
          brainResult=await brainResultForWebCommand(missionId,plan,brainDecision);
        }catch(error){
          brainResultError=String(error?.code??error?.message??'BRAIN_RESULT_FAILURE');
        }
      }
      return {
        ...plan,
        brainResult,
        brainResultError,
      };
    },
    commandActivator:(missionId,body)=>{
      const rawActive=json('GPT_STATE.json').active_mission??null;
      const active=reconcileActiveMission(root,rawActive).activeMission;
      return activateWebCommand({
        root:webStateRoot,
        webCommandId:missionId,
        allowedWritePaths:body?.allowedWritePaths,
        timeoutSec:body?.timeoutSec,
        workspace:legionWorkspace,
        intentFile,
        ledgerPath:admissionLedger,
        selection:switchyardPreview('auto'),
        activeMission:active,
        workerBridgeUrl:legionWorkerBridgeUrl,
        workerBridgeToken:legionWorkerBridgeToken
      });
    }
  })) return;
  const url=new URL(req.url??'/',`http://${req.headers.host??'localhost'}`);
  if(req.method==='POST'&&url.pathname==='/api/chat'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    let raw=''; for await (const c of req) raw+=c; if(raw.length>4096) return send(res,413,JSON.stringify({ok:false,error:'TOO_LARGE'}));
    try{const body=JSON.parse(raw),input=String(body?.input??'');const status=await buildStatus();const quarry=json('docs/V2-011J/FINAL_QUARRY_CENSUS.json');const intent=classifyFrontDoorIntent(input);const routeInspection=/\b(builder|build model|engineering model)\b/i.test(input);const selection=intent==='RESEARCH'?switchyardPreviewFor('analysis.summarize','LIGHT',body?.preference??'auto'):['PLAN','BUILD'].includes(intent)||routeInspection?switchyardPreview(body?.preference??'auto'):null;const turn=answerFrontDoor(input,{status:{activeMission:status.activeMission,quarryClosed:quarry?.status==='CLOSED',bodyStatus:status.controlGate==='CLEAN_SYNCED'?'CONTROL_PLANE_HEALTHY':'ATTENTION',deepProof:'use Deep/Whole diagnostics for current proof'},modelSelection:selection});return send(res,200,JSON.stringify({ok:true,turn,controlsEnabled:false}));}catch(e){return send(res,400,JSON.stringify({ok:false,error:e.message}));}
  }
  if(req.method==='POST'&&url.pathname==='/api/intent'){
    if(!controlAuthorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    let raw=''; for await (const c of req) raw+=c; if(raw.length>4096) return send(res,413,JSON.stringify({ok:false,error:'TOO_LARGE'}));
    try{return send(res,202,JSON.stringify({ok:true,intent:persistIntent(JSON.parse(raw))}));}catch(e){return send(res,400,JSON.stringify({ok:false,error:e.message}));}
  }
  if(req.method!=='GET') return send(res,405,JSON.stringify({ok:false,error:'READ_ONLY'}));
  if(url.pathname==='/api/status'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    return send(res,200,JSON.stringify(await buildStatus()));
  }
  if(url.pathname==='/api/operating-mode'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    return send(res,200,JSON.stringify({ok:true,...operatingModeProjection(projectManifest,process.env.OTHRYS_OS_MODE??null),controlsEnabled:false}));
  }
  if(url.pathname==='/api/training-lab'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    return send(res,200,JSON.stringify({ok:true,training:trainingLabProjection(),controlsEnabled:false}));
  }
  if(url.pathname==='/api/atlas'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    const state=json('GPT_STATE.json');
    return send(res,200,JSON.stringify({ok:true,atlas:buildAtlasProjection(root,state),controlsEnabled:false}));
  }
  if(url.pathname==='/api/knowledge-search'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    return send(res,200,JSON.stringify({ok:true,search:searchKnowledge(root,projectManifest,url.searchParams.get('q')??''),controlsEnabled:false}));
  }
  if(url.pathname==='/api/knowledge-export'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    return send(res,200,JSON.stringify({ok:true,export:exportKnowledge(root,projectManifest),controlsEnabled:false}));
  }
  if(url.pathname==='/api/mission'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    const evidence=missionEvidence(url.searchParams.get('id'));
    if(!evidence) return send(res,404,JSON.stringify({ok:false,error:'MISSION_NOT_FOUND'}));
    return send(res,200,JSON.stringify({ok:true,evidence,authorityGranted:false,controlsEnabled:false}));
  }
  if(url.pathname==='/api/work'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    const workMissionId=url.searchParams.get('id')??'';
    if(!/^V2-\d+[A-Z]$/.test(workMissionId)) return send(res,404,JSON.stringify({ok:false,error:'WORK_NOT_FOUND'}));
    const work=readWorkRecord(root,workMissionId); if(!work) return send(res,404,JSON.stringify({ok:false,error:'WORK_NOT_FOUND'}));
    const state=json('GPT_STATE.json');
    return send(res,200,JSON.stringify({ok:true,work,projection:projectMissionWork(root,state,workMissionId),authorityGranted:false,controlsEnabled:false}));
  }  if(url.pathname==='/api/model-selection'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    return send(res,200,JSON.stringify({ok:true,selection:switchyardPreview(url.searchParams.get('preference')??'auto'),controlsEnabled:false}));
  }
  if(url.pathname==='/api/build-route'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    const missionId=url.searchParams.get('mission')??'';
    const preflight=decideMissionPreflight(root,missionId);
    const selection=switchyardPreview(url.searchParams.get('preference')??'auto');
    return send(res,200,JSON.stringify({ok:true,preflight,route:proposeBuildRoute(preflight,selection),controlsEnabled:false}));
  }
  return send(res,410,JSON.stringify({ok:false,error:'DECK_UI_RETIRED',canonicalInterface:'othrys-web'}));
}
export function startServer(){
  if(!token) throw new Error('OTHRYS_DECK_TOKEN_REQUIRED');
  const server=http.createServer((req,res)=>{handle(req,res).catch(()=>send(res,500,JSON.stringify({ok:false,error:'INTERNAL'})));});
  server.listen(port,bind,()=>{
    console.log(JSON.stringify({ready:true,bind,port,readOnly:true}));
    if(process.env.OTHRYS_LIGHT_WARMUP!=='0'){
      void warmLocalAdvisory().then(result=>{
        console.log(JSON.stringify({brainLightWarmup:result.ok,model:result.model,latencyMs:result.latencyMs}));
      }).catch(()=>{});
    }
  });
  return server;
}

if(process.env.OTHRYS_DECK_NO_START!=='1') startServer();


