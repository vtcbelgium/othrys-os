import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class NoChangeCloseoutError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='NoChangeCloseoutError';} }
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
function lines(path:string){if(!existsSync(path))return [];const t=readFileSync(path,'utf8');if(t&&!t.endsWith('\n'))throw new NoChangeCloseoutError('EVIDENCE_TORN_TAIL');return t.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));}

export function closeNoChangeMission(root:string,missionId:string,inboxPath:string,ledgerPath:string){
  if(!/^V2-\d{3}[A-Z]$/.test(missionId)) throw new NoChangeCloseoutError('MISSION_ID_INVALID');
  const missionPath=join(root,'missions',`${missionId}.json`),preflightPath=join(root,'missions',`${missionId}.preflight.json`),resultPath=join(root,'missions',`${missionId}.result.json`);
  if(!existsSync(missionPath)||!existsSync(preflightPath)) throw new NoChangeCloseoutError('EVIDENCE_MISSING');
  const mission=JSON.parse(readFileSync(missionPath,'utf8')),raw=readFileSync(preflightPath,'utf8'),preflight=JSON.parse(raw),preflightDigest=sha(raw);
  if(mission.status!=='CANONICAL_UNACTIVATED'||mission.authorityGranted!==false||mission.executionStarted!==false) throw new NoChangeCloseoutError('MISSION_STATE_INVALID');
  if(preflight.missionId!==missionId||preflight.verdict!=='NO_CHANGE_JUSTIFIED'||preflight.objectiveSatisfied!==true||preflight.mutationRequired!==false||preflight.builderRequired!==false||preflight.authorityGranted!==false||preflight.executionStarted!==false) throw new NoChangeCloseoutError('PREFLIGHT_INVALID');
  const intents=lines(inboxPath),ledger=lines(ledgerPath);
  const req=intents.find(x=>x.action==='MISSION_NO_CHANGE_CLOSE_REQUEST'&&x.missionId===missionId&&x.preflightDigest===preflightDigest);
  if(!req) throw new NoChangeCloseoutError('CLOSE_REQUEST_MISSING');
  const intentDigest=sha(JSON.stringify({action:req.action,missionId:req.missionId,preflightDigest:req.preflightDigest,receivedAt:req.receivedAt}));
  const closeRequestId=`DECK-NOCHANGE-${intentDigest.slice(0,24)}`;
  if(!ledger.some(x=>x.missionId===closeRequestId&&x.state==='ADMITTED')) throw new NoChangeCloseoutError('CLOSE_REQUEST_NOT_ADMITTED');
  const result={schema_version:'1.0.0',mission_id:missionId,verdict:'PASS',closeout:'NO_CHANGE_JUSTIFIED',objective:mission.objective,preflight_ref:`missions/${missionId}.preflight.json`,preflight_sha256:preflightDigest,close_request_id:closeRequestId,authorityGranted:false,executionStarted:false,mutations:0,builderInvoked:false,next_state:'WAIT_GPT'};
  const text=JSON.stringify(result,null,2)+'\n';
  if(existsSync(resultPath)){if(readFileSync(resultPath,'utf8')!==text)throw new NoChangeCloseoutError('RESULT_CONFLICT');return {result,resultPath,created:false};}
  writeFileSync(resultPath,text,'utf8'); return {result,resultPath,created:true};
}
