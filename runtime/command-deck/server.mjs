import http from 'node:http';
import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
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
export function readControlIntentState(inbox=intentFile,ledger=admissionLedger){
  if(!inbox||!existsSync(inbox)) return null;
  try{
    const lines=readFileSync(inbox,'utf8').trim().split(/\r?\n/).filter(Boolean); if(!lines.length)return null;
    const intent=JSON.parse(lines.at(-1));
    const body={action:intent.action,candidateCommit:intent.candidateCommit,feedback:intent.feedback,receivedAt:intent.receivedAt};
    const digest=createHash('sha256').update(JSON.stringify(body),'utf8').digest('hex');
    const missionId=`DECK-REFINE-${digest.slice(0,24)}`;
    let admitted=false;
    if(ledger&&existsSync(ledger)) admitted=readFileSync(ledger,'utf8').split(/\r?\n/).some(line=>line.includes(`"missionId":"${missionId}"`));
    return {action:intent.action,candidateCommit:intent.candidateCommit,receivedAt:intent.receivedAt,missionId,status:admitted?'ADMITTED':'PENDING_TRUST_CANAL',authorityGranted:false};
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
    const shellArtifacts=[{id:'os-shell',path:'runtime/command-deck/public/index.html',present:existsSync(join(root,'runtime','command-deck','public','index.html'))},{id:'work-state-api',path:'runtime/command-deck/server.mjs',present:existsSync(join(root,'runtime','command-deck','server.mjs'))},{id:'deck-tests',path:'runtime/command-deck/deck.test.mjs',present:existsSync(join(root,'runtime','command-deck','deck.test.mjs'))}];const artifacts=missionId==='V2-007A'?[...shellArtifacts,{id:'mission-result',path:`missions/${missionId}.result.json`,present:existsSync(join(root,'missions',`${missionId}.result.json`))}]:missionId==='V2-007B'?[...shellArtifacts,{id:'model-inventory',path:'runtime/command-deck/server.mjs',present:true},{id:'mission-result',path:`missions/${missionId}.result.json`,present:existsSync(join(root,'missions',`${missionId}.result.json`))}]:[{id:'watcher-source',path:'runtime/command-deck/admission_watcher.ts',present:existsSync(join(root,'runtime','command-deck','admission_watcher.ts'))},{id:'watcher-tests',path:'runtime/command-deck/admission_watcher.test.ts',present:existsSync(join(root,'runtime','command-deck','admission_watcher.test.ts'))},{id:'mission-result',path:`missions/${missionId}.result.json`,present:existsSync(join(root,'missions',`${missionId}.result.json`))}];workState={schema:'othrys.os.work-state.v1',missionId:m.mission_id,title:m.title??m.mission_id,goal:m.goal??'',laws:Array.isArray(m.laws)?m.laws:[],phase:'BUILD',owner:'Legion',verifier:'T590',approval:'NOT_REQUIRED',evidence:'REQUIRED',authorityGranted:false,status:missionId===state.active_mission?.mission_id?state.active_mission?.status:'BUILD',artifacts};
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
    ]
  };
  return {
    schema:DECK_SCHEMA,generatedAt:new Date().toISOString(),head:gitHead(),controlGate:state.control_gate,
    activeMission:state.active_mission,nextAction:state.next_legal_action,lastDecision:state.last_control_decision,
    recentMissions:recent(state.mission_history),factory,legionNode:readLegionTelemetry(),controlIntent:readControlIntentState(),
    localNode:node?{id:node.node_id,health:node.health,advertised:node.advertised,capabilities:node.capabilities}:null,
    osSurface,workState,authorityGranted:false,controlsEnabled:false
  };
}

function currentCandidate(){
  if(!existsSync(join(root,'missions','V2-005A.result.json'))) return null;
  const f=json('missions/V2-005A.result.json'); return f.product_candidate_commit ?? null;
}
function controlAuthorized(req){ return !!controlToken && req.headers['x-othrys-control-token']===controlToken; }
function persistIntent(body){
  if(!intentFile) throw new Error('INTENT_STORE_REQUIRED');
  const action=body?.action, candidateCommit=body?.candidateCommit, feedback=String(body?.feedback??'').trim();
  if(action!=='REFINE_REQUEST') throw new Error('ACTION_NOT_ALLOWED');
  if(candidateCommit!==currentCandidate()) throw new Error('CANDIDATE_MISMATCH');
  if(!feedback||feedback.length>1200) throw new Error('INVALID_FEEDBACK');
  mkdirSync(dirname(intentFile),{recursive:true});
  const rec={schema:'othrys.deck.intent.v1',receivedAt:new Date().toISOString(),action,candidateCommit,feedback,authorityGranted:false,status:'PENDING_TRUST_CANAL'};
  appendFileSync(intentFile,JSON.stringify(rec)+'\n'); return rec;
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
  return serveStatic(url.pathname,res);
}
export function startServer(){
  if(!token) throw new Error('OTHRYS_DECK_TOKEN_REQUIRED');
  const server=http.createServer((req,res)=>{handle(req,res).catch(()=>send(res,500,JSON.stringify({ok:false,error:'INTERNAL'})));});
  server.listen(port,bind,()=>console.log(JSON.stringify({ready:true,bind,port,readOnly:true})));
  return server;
}

if(process.env.OTHRYS_DECK_NO_START!=='1') startServer();


