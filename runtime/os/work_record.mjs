import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadProjectManifest } from './project_manifest.mjs';
import { projectMissionWork } from './work_projection.mjs';

export const WORK_SCHEMA='othrys.os.work.v1';
export const TRANSITION_SCHEMA='othrys.os.work-transition.v1';

function digest(value){
  return createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value),'utf8').digest('hex');
}
function missionPath(root,id,suffix='.json'){ return join(root,'missions',`${id}${suffix}`); }
function readJson(path){ return JSON.parse(readFileSync(path,'utf8')); }
function requiredId(value,name){
  if(typeof value!=='string'||!/^[a-z0-9][a-z0-9-]*$/i.test(value)) throw new Error(`INVALID_${name}`);
  return value;
}
function compileStages(slice){
  const stages=Array.isArray(slice.stages)?slice.stages:[];
  return stages.map(stage=>({
    id:requiredId(stage.id,'STAGE_ID'),owner:String(stage.owner??slice.owner??'UNASSIGNED'),
    tasks:(Array.isArray(stage.tasks)?stage.tasks:[]).map(task=>({id:requiredId(task.id,'TASK_ID'),title:String(task.title??task.id),status:'OPEN'}))
  }));
}
export function compileWorkRecord(root,missionId){
  if(!/^V2-\d+[A-Z]$/.test(String(missionId??''))) throw new Error('INVALID_MISSION_ID');
  const source=missionPath(root,missionId); if(!existsSync(source)) throw new Error('MISSION_NOT_FOUND');
  const mission=readJson(source),project=loadProjectManifest(root),meta=mission.work??{};
  const slices=(Array.isArray(mission.slices)?mission.slices:[]).map(slice=>({
    id:requiredId(slice.id,'SLICE_ID'),title:String(slice.title??slice.id),owner:String(slice.owner??'UNASSIGNED'),
    acceptance:String(slice.acceptance??''),stages:compileStages(slice),artifacts:Array.isArray(slice.artifacts)?slice.artifacts.map(String):[]
  }));
  const body={
    schema:WORK_SCHEMA,workId:`WORK-${missionId}`,projectId:project.projectId,sourceMissionId:missionId,
    title:String(mission.title??missionId),objective:String(mission.goal??mission.objective??''),scale:String(meta.scale??'STANDARD'),
    problem:String(meta.problem??''),outOfScope:Array.isArray(meta.out_of_scope)?meta.out_of_scope.map(String):[],
    risks:Array.isArray(meta.risks)?meta.risks.map(String):[],laws:Array.isArray(mission.laws)?mission.laws.map(String):[],slices,
    authorityGranted:false,executionStarted:false
  };
  return Object.freeze({...body,definitionDigest:digest(body)});
}

export function verifyWorkRecord(record){
  if(!record||record.schema!==WORK_SCHEMA) throw new Error('INVALID_WORK_SCHEMA');
  if(record.authorityGranted!==false||record.executionStarted!==false) throw new Error('WORK_CANNOT_GRANT_AUTHORITY');
  const {definitionDigest,...body}=record;
  if(!/^[0-9a-f]{64}$/.test(String(definitionDigest??''))||digest(body)!==definitionDigest) throw new Error('WORK_DIGEST_MISMATCH');
  return record;
}
export function workRecordPath(root,missionId,outDir='.othrys/work'){
  return join(root,outDir,`${missionId}.work.json`);
}

export function materializeWorkRecord(root,missionId,outDir='.othrys/work'){
  const path=workRecordPath(root,missionId,outDir),record=compileWorkRecord(root,missionId);
  mkdirSync(dirname(path),{recursive:true}); const bytes=JSON.stringify(record,null,2)+'\n';
  if(existsSync(path)){
    const current=readFileSync(path,'utf8');
    if(current!==bytes) throw new Error('WORK_RECORD_CONFLICT');
    verifyWorkRecord(JSON.parse(current)); return {status:'EXISTS',path,record};
  }
  writeFileSync(path,bytes,'utf8'); return {status:'MATERIALIZED',path,record};
}

export function readWorkRecord(root,missionId,outDir='.othrys/work'){
  const path=workRecordPath(root,missionId,outDir); if(!existsSync(path)) return null;
  const record=verifyWorkRecord(readJson(path));
  if(record.sourceMissionId!==missionId) throw new Error('WORK_MISSION_MISMATCH');
  return record;
}

function evidenceDigest(root,missionId,state){
  const envelope=readFileSync(missionPath(root,missionId),'utf8');
  const result=missionPath(root,missionId,'.result.json');
  return digest({envelope:digest(envelope),result:existsSync(result)?digest(readFileSync(result,'utf8')):null,active:state.active_mission??null});
}
export function observeWorkTransition(root,state,missionId){
  const record=readWorkRecord(root,missionId); if(!record) throw new Error('WORK_RECORD_NOT_FOUND');
  const projection=projectMissionWork(root,state,missionId); if(!projection) throw new Error('WORK_PROJECTION_NOT_FOUND');
  const basis={workId:record.workId,sourceMissionId:missionId,phase:projection.phase,status:projection.status,evidenceDigest:evidenceDigest(root,missionId,state)};
  const transitionId=`TRANSITION-${digest(basis).slice(0,24)}`;
  return Object.freeze({schema:TRANSITION_SCHEMA,transitionId,...basis,authorityGranted:false,executionStarted:false});
}

export function appendWorkTransition(root,state,missionId,outDir='.othrys/work'){
  const transition=observeWorkTransition(root,state,missionId),path=join(root,outDir,`${missionId}.transitions.jsonl`);
  mkdirSync(dirname(path),{recursive:true});
  const lines=existsSync(path)?readFileSync(path,'utf8').split(/\r?\n/).filter(Boolean):[];
  const history=lines.map(line=>JSON.parse(line));
  if(history.length){
    const prior=history.at(-1),order=['PLAN','DESIGN','BUILD','REVIEW','SHIP'];
    if(order.indexOf(transition.phase)<order.indexOf(prior.phase)) throw new Error('WORK_PHASE_REGRESSION');
  }
  const existing=history.find(prior=>prior.transitionId===transition.transitionId);
  if(existing) return {status:'EXISTS',path,transition:existing};
  const stored={...transition,observedAt:new Date().toISOString()};
  appendFileSync(path,JSON.stringify(stored)+'\n','utf8');
  return {status:'APPENDED',path,transition:stored};
}
