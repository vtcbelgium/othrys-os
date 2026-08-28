import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function present(root,path){ return existsSync(join(root,path)); }
function artifact(root,id,path){ return {id,path,present:present(root,path)}; }

function artifactsFor(root,missionId,mission){
  const common=[
    artifact(root,'mission-envelope',`missions/${missionId}.json`),
    artifact(root,'surface-data','runtime/command-deck/server.mjs'),
    artifact(root,'mission-result',`missions/${missionId}.result.json`)
  ];
  if(mission.artifact_profile==='os-substrate') return [...common,
    artifact(root,'project-manifest','.othrys/project.json'),
    artifact(root,'project-loader','runtime/os/project_manifest.mjs'),
    artifact(root,'work-projector','runtime/os/work_projection.mjs'),
    artifact(root,'os-projector','runtime/os/os_projection.mjs'),
    artifact(root,'os-tests','runtime/os/os_projection.test.mjs')
  ];
  if(mission.artifact_profile==='os-work') return [...common,
    artifact(root,'work-record','.othrys/work/'+missionId+'.work.json'),
    artifact(root,'work-record-module','runtime/os/work_record.mjs'),
    artifact(root,'work-record-tests','runtime/os/work_record.test.mjs'),
    artifact(root,'work-ledger','.othrys/work/'+missionId+'.transitions.jsonl'),
    artifact(root,'project-template','runtime/os/templates/oros-software.json'),
    artifact(root,'project-materializer','runtime/os/project_materializer.mjs'),
    artifact(root,'project-materializer-tests','runtime/os/project_materializer.test.mjs')
  ];
  if(mission.artifact_profile==='os-mode') return [...common,
    artifact(root,'operating-mode','runtime/os/operating_mode.mjs'),
    artifact(root,'operating-mode-tests','runtime/os/operating_mode.test.mjs'),
    artifact(root,'project-mode-policy','.othrys/project.json'),
    artifact(root,'intent-mode-ingress','runtime/command-deck/server.mjs'),
    artifact(root,'intent-mode-admission','runtime/command-deck/intent_bridge.ts'),
    artifact(root,'deck-tests','runtime/command-deck/deck.test.mjs')
  ];
  if(mission.artifact_profile==='command-deck'||/^V2-00[78]/.test(missionId)) return [...common,
    artifact(root,'os-shell','runtime/command-deck/public/index.html'),
    artifact(root,'work-state-api','runtime/command-deck/server.mjs'),
    artifact(root,'deck-tests','runtime/command-deck/deck.test.mjs')
  ];
  return [...common,
    artifact(root,'watcher-source','runtime/command-deck/admission_watcher.ts'),
    artifact(root,'watcher-tests','runtime/command-deck/admission_watcher.test.ts')
  ];
}
function resultAt(root,missionId){
  const path=join(root,'missions',`${missionId}.result.json`);
  if(!existsSync(path)) return null;
  try{return JSON.parse(readFileSync(path,'utf8'));}catch{return null;}
}

export function projectMissionWork(root,state,missionId){
  if(!missionId) return null;
  const missionPath=join(root,'missions',`${missionId}.json`);
  if(!existsSync(missionPath)) return null;
  const mission=JSON.parse(readFileSync(missionPath,'utf8'));
  const result=resultAt(root,missionId),verdict=String(result?.verdict??result?.status??'');
  const unactivated=mission.status==='CANONICAL_UNACTIVATED';
  const noChange=unactivated&&verdict==='PASS'&&result?.closeout==='NO_CHANGE_JUSTIFIED';
  const phases=[
    {id:'PLAN',status:'COMPLETE',basis:unactivated?'canonical envelope allocated':'mission envelope exists'},
    {id:'BUILD',status:noChange?'COMPLETE':unactivated?'PENDING':result?'COMPLETE':'ACTIVE',basis:noChange?'no change required':unactivated?'activation required':result?'result recorded':'result absent'},
    {id:'REVIEW',status:verdict==='PASS'?'COMPLETE':'PENDING',basis:verdict==='PASS'?'PASS result':'independent evidence required'},
    {id:'SHIP',status:noChange||missionId===state.active_mission?.mission_id&&state.active_mission?.status==='COMPLETE'?'COMPLETE':'PENDING',basis:noChange?'governed no-change closeout':'closeout distinct from candidate PASS'}
  ];
  const artifacts=artifactsFor(root,missionId,mission);
  const slices=(Array.isArray(mission.slices)?mission.slices:[]).map(slice=>{
    const refs=Array.isArray(slice.artifacts)?slice.artifacts:[];
    const evidence=refs.map(id=>artifacts.find(a=>a.id===id)??{id,path:null,present:false});
    return {id:String(slice.id??''),title:String(slice.title??slice.id??''),owner:String(slice.owner??'UNASSIGNED'),artifacts:evidence,status:evidence.length&&evidence.every(a=>a.present)?'COMPLETE':'OPEN'};
  });
  const phase=phases.find(x=>x.status==='ACTIVE')?.id??(phases.every(x=>x.status==='COMPLETE')?'SHIP':phases.find(x=>x.status==='PENDING')?.id??'PLAN');
  return Object.freeze({
    schema:'othrys.os.work-state.v1',missionId:mission.mission_id,title:mission.title??mission.mission_id,
    goal:mission.goal??mission.objective??'',laws:Array.isArray(mission.laws)?mission.laws:[],slices,phase,phases,
    owner:'Legion',verifier:'T590',approval:unactivated?'ACTIVATION_REQUIRED':'NOT_REQUIRED',evidence:'REQUIRED',
    authorityGranted:false,status:noChange?'COMPLETE_NO_CHANGE':unactivated?'UNACTIVATED':missionId===state.active_mission?.mission_id?state.active_mission?.status:'BUILD',artifacts
  });
}
