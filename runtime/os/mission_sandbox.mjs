import { resolve, relative, isAbsolute } from 'node:path';

export const MISSION_SANDBOX_SCHEMA='othrys.os.mission-sandbox.v1';
const text=(v,c)=>{if(typeof v!=='string'||!v.trim())throw new Error(c);return v.trim();};
function safe(root,path){const target=resolve(root,path),rel=relative(resolve(root),target);if(rel.startsWith('..')||isAbsolute(rel))throw new Error('SANDBOX_PATH_ESCAPE');return rel.replaceAll('\\','/');}
export function createMissionSandbox(raw){
  const root=text(raw.root,'SANDBOX_ROOT_REQUIRED'), missionId=text(raw.missionId,'SANDBOX_MISSION_REQUIRED');
  const allowed=Object.freeze([...(raw.allowedPaths??[])].map(p=>safe(root,p)).sort());
  const denied=Object.freeze([...(raw.deniedPaths??[])].map(p=>safe(root,p)).sort());
  return Object.freeze({schema:MISSION_SANDBOX_SCHEMA,missionId,root,allowedPaths:allowed,deniedPaths:denied,network:String(raw.network??'DENY').toUpperCase(),secrets:String(raw.secrets??'DENY').toUpperCase(),checkpointRequired:raw.checkpointRequired!==false,rollbackRequired:raw.rollbackRequired!==false,killSwitchRequired:raw.killSwitchRequired!==false,authorityGranted:false,executionStarted:false});
}
export function sandboxDecision(sandbox,path,{network=false,secrets=false}={}){
  const rel=safe(sandbox.root,path);let allowed=sandbox.allowedPaths.some(p=>rel===p||rel.startsWith(`${p}/`));
  if(sandbox.deniedPaths.some(p=>rel===p||rel.startsWith(`${p}/`)))allowed=false;
  if(network&&sandbox.network!=='ALLOW')return Object.freeze({allowed:false,code:'NETWORK_DENIED'});
  if(secrets&&sandbox.secrets!=='ALLOW')return Object.freeze({allowed:false,code:'SECRETS_DENIED'});
  return Object.freeze({allowed,code:allowed?'PATH_ALLOWED':'PATH_DENIED',authorityGranted:false,executionStarted:false});
}
