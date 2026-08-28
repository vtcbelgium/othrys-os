import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decideMissionPreflight } from './preflight_decision.ts';
import { proposeBuildRoute } from './build_route.ts';

export class BuildPackageError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='BuildPackageError';} }
const sha=(v:unknown)=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
function lines(path:string){if(!existsSync(path))return [];const t=readFileSync(path,'utf8');if(t&&!t.endsWith('\n'))throw new BuildPackageError('EVIDENCE_TORN_TAIL');return t.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));}

export function materializeBuildPackage(root:string,missionId:string,selection:any,inboxPath:string,ledgerPath:string,outDir:string){
  const preflight=decideMissionPreflight(root,missionId);
  if(preflight.class!=='MISSING_WORK') throw new BuildPackageError('BUILD_REQUEST_STALE');
  const route=proposeBuildRoute(preflight,selection);
  if(route.status!=='ROUTE_PROPOSED'||!route.selected) throw new BuildPackageError('BUILD_ROUTE_BLOCKED');
  const routeDigest=sha(route),intents=lines(inboxPath),ledger=lines(ledgerPath);
  const req=intents.find(x=>x.action==='MISSION_BUILD_REQUEST'&&x.missionId===missionId&&x.builderId===route.selected.id&&x.routeDigest===routeDigest);
  if(!req) throw new BuildPackageError('BUILD_REQUEST_MISSING');
  const intentDigest=sha({action:req.action,missionId:req.missionId,builderId:req.builderId,routeDigest:req.routeDigest,receivedAt:req.receivedAt});
  const requestId=`DECK-BUILD-${intentDigest.slice(0,24)}`;
  if(!ledger.some(x=>x.missionId===requestId&&x.state==='ADMITTED')) throw new BuildPackageError('BUILD_REQUEST_NOT_ADMITTED');
  const missionPath=join(root,'missions',`${missionId}.json`); const mission=JSON.parse(readFileSync(missionPath,'utf8'));
  const pkg={schema:'othrys.os.build-package.v1',missionId,objective:String(mission.objective??mission.goal??''),builderId:route.selected.id,routeDigest,buildRequestId:requestId,preflightClass:preflight.class,status:'READY_NOT_EXECUTING',authorityGranted:false,executionStarted:false};
  mkdirSync(outDir,{recursive:true}); const path=join(outDir,`${requestId}.json`),text=JSON.stringify(pkg,null,2)+'\n';
  if(existsSync(path)){if(readFileSync(path,'utf8')!==text)throw new BuildPackageError('BUILD_PACKAGE_CONFLICT');return {package:pkg,path,created:false};}
  writeFileSync(path,text,'utf8'); return {package:pkg,path,created:true};
}
