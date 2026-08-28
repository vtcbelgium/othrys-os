import http from 'node:http';
import { readFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, extname, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

export const DECK_SCHEMA='othrys.command-deck.status.v1';
const root=resolve(import.meta.dirname,'../..');
const publicDir=join(import.meta.dirname,'public');
const token=process.env.OTHRYS_DECK_TOKEN ?? '';
const port=Number(process.env.OTHRYS_DECK_PORT ?? 8780);
const bind=process.env.OTHRYS_DECK_BIND ?? '127.0.0.1';
const controlToken=process.env.OTHRYS_DECK_CONTROL_TOKEN ?? '';
const intentFile=process.env.OTHRYS_DECK_INTENT_FILE ?? '';
const admissionLedger=process.env.OTHRYS_DECK_ADMISSION_LEDGER ?? '';


function json(path){ return JSON.parse(readFileSync(join(root,path),'utf8')); }
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
  }else return null;
  let admitted=false;
  if(ledger&&existsSync(ledger)) admitted=readFileSync(ledger,'utf8').split(/\r?\n/).some(line=>line.includes(`"missionId":"${missionId}"`));
  return {action:intent.action,candidateCommit:intent.candidateCommit??null,projectContext:intent.projectContext??null,objective:intent.objective??null,proposalId:intent.proposalId??null,candidateId:intent.candidateId??null,canonicalTargetMissionId:intent.missionId??null,receivedAt:intent.receivedAt,missionId,status:admitted?'ADMITTED':'PENDING_TRUST_CANAL',authorityGranted:false};
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
export function switchyardPreview(preference='auto'){
  const models=[{id:'qwen3-builder',label:'Qwen3 8B · Legion',class:'LOCAL ENGINEERING',status:'PRIMARY',available:true,evidence:'V2-002C'},{id:'llama3.2-advisory',label:'Llama 3.2 · T590',class:'LOCAL ADVISORY',status:'ADVISORY ONLY',available:true,evidence:'V2-004D'},{id:'remote-escalation',label:'Remote escalation',class:'REMOTE',status:'GATED',available:false,evidence:null}];
  const pref=String(preference??'auto');
  if(pref==='auto'){const selected=models.find(m=>m.available&&m.status==='PRIMARY');return {policy:'LOCAL_FIRST',preference:'auto',selected:selected??null,reason:selected?'PRIMARY_LOCAL_AVAILABLE':'NO_PRIMARY_LOCAL_AVAILABLE',executionStarted:false,authorityGranted:false};}
  const selected=models.find(m=>m.id===pref); if(!selected) return {policy:'LOCAL_FIRST',preference:pref,selected:null,reason:'UNKNOWN_PREFERENCE',executionStarted:false,authorityGranted:false};
  if(!selected.available) return {policy:'LOCAL_FIRST',preference:pref,selected:null,reason:'PREFERENCE_UNAVAILABLE',executionStarted:false,authorityGranted:false};
  return {policy:'LOCAL_FIRST',preference:pref,selected,reason:'EXPLICIT_AVAILABLE_PREFERENCE',executionStarted:false,authorityGranted:false};
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
export async function buildStatus(){
  const state=json('GPT_STATE.json');
  let factory=null;
  if(existsSync(join(root,'missions','V2-005A.result.json'))){
    const f=json('missions/V2-005A.result.json');
    factory={orosId:f.oros_id,product:f.product,status:f.factory_status,candidateCommit:f.product_candidate_commit,released:f.released===true};
  }
  let node=null;
  try{ node=(await (await fetch('http://127.0.0.1:8765/health',{signal:AbortSignal.timeout(1200)})).json()).node; }catch{}
  const missionResults=existsSync(join(root,'missions'))?readFileSync(join(root,'V2_BUILD_BACKLOG.md'),'utf8').match(/\| COMPLETE \|/g)?.length??0:0;
  const nextMissionId=String(state.next_legal_action??'').match(/\bV2-\d+[A-Z]\b/)?.[0]??null;
  const missionId=state.active_mission?.status==='COMPLETE'&&nextMissionId&&existsSync(join(root,'missions',`${nextMissionId}.json`))?nextMissionId:state.active_mission?.mission_id;
  let workState=null;
  if(missionId&&existsSync(join(root,'missions',`${missionId}.json`))){
    const m=json(`missions/${missionId}.json`);
    const shellArtifacts=[{id:'mission-envelope',path:`missions/${missionId}.json`,present:existsSync(join(root,'missions',`${missionId}.json`))},{id:'os-shell',path:'runtime/command-deck/public/index.html',present:existsSync(join(root,'runtime','command-deck','public','index.html'))},{id:'work-state-api',path:'runtime/command-deck/server.mjs',present:existsSync(join(root,'runtime','command-deck','server.mjs'))},{id:'deck-tests',path:'runtime/command-deck/deck.test.mjs',present:existsSync(join(root,'runtime','command-deck','deck.test.mjs'))},{id:'intent-bridge',path:'runtime/command-deck/intent_bridge.ts',present:existsSync(join(root,'runtime','command-deck','intent_bridge.ts'))},{id:'bridge-tests',path:'runtime/command-deck/intent_bridge.test.ts',present:existsSync(join(root,'runtime','command-deck','intent_bridge.test.ts'))},{id:'candidate-materializer',path:'runtime/command-deck/mission_candidate.ts',present:existsSync(join(root,'runtime','command-deck','mission_candidate.ts'))},{id:'candidate-tests',path:'runtime/command-deck/mission_candidate.test.ts',present:existsSync(join(root,'runtime','command-deck','mission_candidate.test.ts'))},{id:'id-policy',path:'runtime/command-deck/mission_id_policy.ts',present:existsSync(join(root,'runtime','command-deck','mission_id_policy.ts'))},{id:'id-policy-tests',path:'runtime/command-deck/mission_id_policy.test.ts',present:existsSync(join(root,'runtime','command-deck','mission_id_policy.test.ts'))}];const artifacts=(missionId?.startsWith('V2-007')||missionId?.startsWith('V2-008'))?[...shellArtifacts,{id:'surface-data',path:'runtime/command-deck/server.mjs',present:true},{id:'mission-result',path:`missions/${missionId}.result.json`,present:existsSync(join(root,'missions',`${missionId}.result.json`))}]:[{id:'watcher-source',path:'runtime/command-deck/admission_watcher.ts',present:existsSync(join(root,'runtime','command-deck','admission_watcher.ts'))},{id:'watcher-tests',path:'runtime/command-deck/admission_watcher.test.ts',present:existsSync(join(root,'runtime','command-deck','admission_watcher.test.ts'))},{id:'mission-result',path:`missions/${missionId}.result.json`,present:existsSync(join(root,'missions',`${missionId}.result.json`))}];const resultPath=join(root,'missions',`${missionId}.result.json`);let resultVerdict=null;if(existsSync(resultPath)){try{resultVerdict=String(JSON.parse(readFileSync(resultPath,'utf8')).verdict??'RECORDED')}catch{}}const unactivated=m.status==='CANONICAL_UNACTIVATED';const phases=[{id:'PLAN',status:'COMPLETE',basis:unactivated?'canonical envelope allocated':'mission envelope exists'},{id:'BUILD',status:unactivated?'PENDING':(resultVerdict?'COMPLETE':'ACTIVE'),basis:unactivated?'activation required':(resultVerdict?'result recorded':'result absent')},{id:'REVIEW',status:resultVerdict==='PASS'?'COMPLETE':'PENDING',basis:resultVerdict==='PASS'?'PASS result':'independent evidence required'},{id:'SHIP',status:missionId===state.active_mission?.mission_id&&state.active_mission?.status==='COMPLETE'?'COMPLETE':'PENDING',basis:'closeout distinct from candidate PASS'}];workState={schema:'othrys.os.work-state.v1',missionId:m.mission_id,title:m.title??m.mission_id,goal:m.goal??'',laws:Array.isArray(m.laws)?m.laws:[],slices:(Array.isArray(m.slices)?m.slices:[]).map(slice=>{const refs=Array.isArray(slice.artifacts)?slice.artifacts:[];const evidence=refs.map(id=>artifacts.find(a=>a.id===id)??{id,path:null,present:false});return {id:String(slice.id??''),title:String(slice.title??slice.id??''),owner:String(slice.owner??'UNASSIGNED'),artifacts:evidence,status:evidence.length&&evidence.every(a=>a.present)?'COMPLETE':'OPEN'};}),phase:phases.find(x=>x.status==='ACTIVE')?.id??(phases.every(x=>x.status==='COMPLETE')?'SHIP':phases.find(x=>x.status==='PENDING')?.id??'PLAN'),phases,owner:'Legion',verifier:'T590',approval:unactivated?'ACTIVATION_REQUIRED':'NOT_REQUIRED',evidence:'REQUIRED',authorityGranted:false,status:unactivated?'UNACTIVATED':(missionId===state.active_mission?.mission_id?state.active_mission?.status:'BUILD'),artifacts};
  }
  const proven=(id)=>existsSync(join(root,'missions',`${id}.result.json`));
  const osSurface={
    name:'OTHRYS OS Alpha',engine:'V2',missionResults,
    systems:[
      {id:'talos',label:'Talos',role:'Independent verification',status:'PROVEN'},
      {id:'trust-canal',label:'Trust Canal',role:'Authority / admission',status:'PROVEN'},
      {id:'hephaestus',label:'Hephaestus',role:'Engineering authority',status:'PROVEN'},
      {id:'factory',label:'Factory',role:'Oros build + refine',status:proven('V2-005D')?'PROVEN':'AVAILABLE'},
      {id:'mycelium',label:'Mycelium',role:'Colony routing',status:proven('V2-004D')?'PROVEN':'AVAILABLE'},
      {id:'command-deck',label:'Command Deck',role:'Tablet operator surface',status:proven('V2-006E')?'PROVEN':'AVAILABLE'}
    ],
    titans:[
      {id:'hephaestus',label:'Hephaestus',role:'Engineering authority',status:'PROVEN'},
      {id:'talos',label:'Talos',role:'Verification / evidence authority',status:'PROVEN'}
    ],
    blocks:[
      {id:'analytics.visit-tracking',status:'STOCK'},
      {id:'control-feedback',status:'PROVEN'},
      {id:'media.image-prep',status:'PROVEN'},
      {id:'monetization.affiliate-offer',status:'STOCK'}
    ],
    models:[
      {id:'qwen3-builder',label:'Qwen3 8B · Legion',class:'LOCAL ENGINEERING',status:'PRIMARY',available:true,evidence:'V2-002C'},
      {id:'llama3.2-advisory',label:'Llama 3.2 · T590',class:'LOCAL ADVISORY',status:'ADVISORY ONLY',available:true,evidence:'V2-004D'},
      {id:'remote-escalation',label:'Remote escalation',class:'REMOTE',status:'GATED',available:false,evidence:null}
    ],
    apps:[
      {id:'ollama-legion',label:'Ollama · Legion',class:'LOCAL MODEL RUNTIME',status:proven('V2-002C')?'PROVEN':'AVAILABLE',actionable:false,evidence:'V2-002C'},
      {id:'ollama-t590',label:'Ollama · T590',class:'LOCAL ADVISORY RUNTIME',status:proven('V2-004D')?'PROVEN':'AVAILABLE',actionable:false,evidence:'V2-004D'},
      {id:'github-relay',label:'GitHub relay',class:'REMOTE FALLBACK TRANSPORT',status:String(state.control_lifeline?.fallback_a?.status??'GATED'),actionable:false,evidence:'GPT_STATE.control_lifeline'},
      {id:'command-deck-lan',label:'Command Deck · LAN',class:'LOCAL CONTROLLER SURFACE',status:proven('V2-006A')?'PROVEN':'AVAILABLE',actionable:false,evidence:'V2-006A'}
    ],
    knowledge:[
      {id:'north-star',label:'OTHRYS OS North Star',class:'CANONICAL DIRECTION',path:'OTHRYS_OS_NORTH_STAR.md',present:existsSync(join(root,'OTHRYS_OS_NORTH_STAR.md'))},
      {id:'build-backlog',label:'V2 Build Backlog',class:'CONTROL / ROADMAP',path:'V2_BUILD_BACKLOG.md',present:existsSync(join(root,'V2_BUILD_BACKLOG.md'))},
      {id:'panda-harvest',label:'PandaOS Harvest',class:'RESEARCH / GATED',path:'docs/PANDAOS-HARVEST/PANDAOS_V2_HARVEST_REPORT_2026-08-27.md',present:existsSync(join(root,'docs','PANDAOS-HARVEST','PANDAOS_V2_HARVEST_REPORT_2026-08-27.md'))},
      {id:'visual-control',label:'Visual Control Concept',class:'DOCUMENTED / GATED',path:'docs/V2-VISUAL-CONTROL/CONCEPT.md',present:existsSync(join(root,'docs','V2-VISUAL-CONTROL','CONCEPT.md'))},
      {id:'temp-library',label:'Temporary Library',class:'UNPROMOTED KNOWLEDGE',path:'TEMP_LIBRARY.md',present:existsSync(join(root,'TEMP_LIBRARY.md'))}
    ]
  };
  const controlIntent=readControlIntentState();
  const proposalIntent=readLatestIntentState('MISSION_PROPOSAL');
  const promotionIntent=readLatestIntentState('MISSION_PROMOTION_REQUEST');
  const allocationIntent=readLatestIntentState('MISSION_ID_ALLOCATION_REQUEST');
  const activationIntent=readLatestIntentState('MISSION_ACTIVATION_REQUEST');
  return {
    schema:DECK_SCHEMA,generatedAt:new Date().toISOString(),head:gitHead(),controlGate:state.control_gate,
    activeMission:state.active_mission,nextAction:state.next_legal_action,lastDecision:state.last_control_decision,
    recentMissions:recent(state.mission_history),canonicalMissions:canonicalMissionTrail(),factory,legionNode:readLegionTelemetry(),controlIntent,missionProposal:missionProposalEnvelope(proposalIntent,promotionIntent),missionCandidate:latestMissionCandidate(),missionAllocationRequest:allocationIntent,missionActivationRequest:activationIntent,
    localNode:node?{id:node.node_id,health:node.health,advertised:node.advertised,capabilities:node.capabilities}:null,
    osSurface,workState,missionEvidence:missionEvidence(missionId),authorityGranted:false,controlsEnabled:false
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
function serveStatic(pathname,res){
  const rel=pathname==='/'?'index.html':pathname.slice(1);
  if(rel.includes('..')) return send(res,404,'not found','text/plain');
  const file=join(publicDir,rel);
  if(!existsSync(file)) return send(res,404,'not found','text/plain');
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
  send(res,200,readFileSync(file),types[extname(file)]??'application/octet-stream');
}
export async function handle(req,res){
  const url=new URL(req.url??'/',`http://${req.headers.host??'localhost'}`);
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
  if(url.pathname==='/api/mission'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    const evidence=missionEvidence(url.searchParams.get('id'));
    if(!evidence) return send(res,404,JSON.stringify({ok:false,error:'MISSION_NOT_FOUND'}));
    return send(res,200,JSON.stringify({ok:true,evidence,authorityGranted:false,controlsEnabled:false}));
  }
  if(url.pathname==='/api/model-selection'){
    if(!authorized(req)) return send(res,401,JSON.stringify({ok:false,error:'UNAUTHORIZED'}));
    return send(res,200,JSON.stringify({ok:true,selection:switchyardPreview(url.searchParams.get('preference')??'auto'),controlsEnabled:false}));
  }
  return serveStatic(url.pathname,res);
}
export function startServer(){
  if(!token) throw new Error('OTHRYS_DECK_TOKEN_REQUIRED');
  const server=http.createServer((req,res)=>{handle(req,res).catch(()=>send(res,500,JSON.stringify({ok:false,error:'INTERNAL'})));});
  server.listen(port,bind,()=>console.log(JSON.stringify({ready:true,bind,port,readOnly:true})));
  return server;
}

if(process.env.OTHRYS_DECK_NO_START!=='1') startServer();


