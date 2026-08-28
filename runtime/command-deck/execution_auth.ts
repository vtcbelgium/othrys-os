import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { decideMissionPreflight } from './preflight_decision.ts';
import { proposeBuildRoute } from './build_route.ts';

export class ExecutionAuthError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='ExecutionAuthError';} }
const digest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');

export function validateExecutionAuthCandidate(root:string,packagePath:string,selection:any){
  if(!existsSync(packagePath)) throw new ExecutionAuthError('BUILD_PACKAGE_NOT_FOUND');
  let pkg:any;try{pkg=JSON.parse(readFileSync(packagePath,'utf8'));}catch{throw new ExecutionAuthError('BUILD_PACKAGE_INVALID');}
  if(pkg.schema!=='othrys.os.build-package.v1'||pkg.status!=='READY_NOT_EXECUTING'||pkg.authorityGranted!==false||pkg.executionStarted!==false) throw new ExecutionAuthError('BUILD_PACKAGE_STATE_INVALID');
  const preflight=decideMissionPreflight(root,String(pkg.missionId??''));
  if(preflight.class!=='MISSING_WORK') throw new ExecutionAuthError('BUILD_PACKAGE_STALE');
  const route=proposeBuildRoute(preflight,selection);
  if(route.status!=='ROUTE_PROPOSED'||!route.selected) throw new ExecutionAuthError('BUILD_ROUTE_BLOCKED');
  if(pkg.builderId!==route.selected.id||pkg.routeDigest!==digest(route)) throw new ExecutionAuthError('BUILD_PACKAGE_ROUTE_MISMATCH');
  const packageDigest=createHash('sha256').update(readFileSync(packagePath,'utf8'),'utf8').digest('hex');
  return Object.freeze({schema:'othrys.os.execution-auth-candidate.v1',missionId:pkg.missionId,buildRequestId:pkg.buildRequestId,builderId:pkg.builderId,routeDigest:pkg.routeDigest,packageDigest,status:'AUTH_REQUEST_ELIGIBLE',authorityGranted:false,executionStarted:false});
}
