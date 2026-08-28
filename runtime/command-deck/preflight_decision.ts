import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type PreflightClass='NO_CHANGE'|'MISSING_WORK'|'BLOCKED';
export class PreflightDecisionError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='PreflightDecisionError';} }

export function decideMissionPreflight(root:string,missionId:string){
  if(!/^V2-\d{3}[A-Z]$/.test(missionId)) return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'BLOCKED' as PreflightClass,reason:'MISSION_ID_INVALID',evidence:[],authorityGranted:false,executionStarted:false});
  const missionPath=join(root,'missions',`${missionId}.json`);
  if(!existsSync(missionPath)) return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'BLOCKED' as PreflightClass,reason:'MISSION_NOT_FOUND',evidence:[],authorityGranted:false,executionStarted:false});
  let mission:any;try{mission=JSON.parse(readFileSync(missionPath,'utf8'));}catch{return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'BLOCKED' as PreflightClass,reason:'MISSION_ENVELOPE_INVALID',evidence:[`missions/${missionId}.json`],authorityGranted:false,executionStarted:false});}
  if(mission.mission_id!==missionId||mission.authorityGranted!==false||mission.executionStarted!==false) return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'BLOCKED' as PreflightClass,reason:'MISSION_STATE_CONFLICT',evidence:[`missions/${missionId}.json`],authorityGranted:false,executionStarted:false});
  const preflightPath=join(root,'missions',`${missionId}.preflight.json`);
  if(existsSync(preflightPath)){
    try{
      const p=JSON.parse(readFileSync(preflightPath,'utf8'));
      if(p.schema==='othrys.os.mission-preflight.v1'&&p.missionId===missionId&&p.verdict==='NO_CHANGE_JUSTIFIED'&&p.objectiveSatisfied===true&&p.mutationRequired===false&&p.builderRequired===false&&p.authorityGranted===false&&p.executionStarted===false){
        return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'NO_CHANGE' as PreflightClass,reason:'DURABLE_NO_CHANGE_EVIDENCE',evidence:[`missions/${missionId}.json`,`missions/${missionId}.preflight.json`],authorityGranted:false,executionStarted:false});
      }
      return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'BLOCKED' as PreflightClass,reason:'PREFLIGHT_EVIDENCE_CONFLICT',evidence:[`missions/${missionId}.json`,`missions/${missionId}.preflight.json`],authorityGranted:false,executionStarted:false});
    }catch{return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'BLOCKED' as PreflightClass,reason:'PREFLIGHT_EVIDENCE_INVALID',evidence:[`missions/${missionId}.json`,`missions/${missionId}.preflight.json`],authorityGranted:false,executionStarted:false});}
  }
  return Object.freeze({schema:'othrys.os.preflight-decision.v1',missionId,class:'MISSING_WORK' as PreflightClass,reason:'NO_SATISFACTION_EVIDENCE',evidence:[`missions/${missionId}.json`],authorityGranted:false,executionStarted:false});
}
