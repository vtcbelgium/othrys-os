import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { nextPrimaryMissionId } from './mission_id_policy.ts';

export class CanonicalMissionMaterializerError extends Error {
  code:string;
  constructor(code:string){super(code);this.code=code;this.name='CanonicalMissionMaterializerError';}
}

function jsonLines(path:string):any[]{
  if(!existsSync(path)) return [];
  const text=readFileSync(path,'utf8');
  if(text && !text.endsWith('\n')) throw new CanonicalMissionMaterializerError('EVIDENCE_TORN_TAIL');
  return text.split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
}

function digest(value:unknown){return createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');}
export function materializeCanonicalMission(candidatePath:string,inboxPath:string,ledgerPath:string,missionsDir:string){
  if(!existsSync(candidatePath)) throw new CanonicalMissionMaterializerError('CANDIDATE_NOT_FOUND');
  const candidate=JSON.parse(readFileSync(candidatePath,'utf8'));
  const candidateId=String(candidate.candidateId??'');
  if(!/^CANDIDATE-[0-9a-f]{24}$/.test(candidateId)||candidate.status!=='CANDIDATE'||candidate.canonicalMissionId!==null) throw new CanonicalMissionMaterializerError('CANDIDATE_INVALID');
  if(candidate.authorityGranted!==false||candidate.executionStarted!==false) throw new CanonicalMissionMaterializerError('CANDIDATE_AUTHORITY_INVALID');
  const intents=jsonLines(inboxPath),ledger=jsonLines(ledgerPath);
  const allocation=intents.find(x=>x.action==='MISSION_ID_ALLOCATION_REQUEST'&&x.candidateId===candidateId&&(()=>{
    const body={action:x.action,candidateId:x.candidateId,receivedAt:x.receivedAt};
    const id=`DECK-ALLOCATE-${digest(body).slice(0,24)}`;
    return ledger.some(r=>r.missionId===id&&r.state==='ADMITTED');
  })());
  if(!allocation) throw new CanonicalMissionMaterializerError('ALLOCATION_NOT_ADMITTED');
  const allocationBody={action:allocation.action,candidateId:allocation.candidateId,receivedAt:allocation.receivedAt};
  const allocationId=`DECK-ALLOCATE-${digest(allocationBody).slice(0,24)}`;
  const bindingPath=join(missionsDir,'candidates',`${candidateId}.allocation.json`);
  if(existsSync(bindingPath)){
    const existingBinding=JSON.parse(readFileSync(bindingPath,'utf8'));
    if(existingBinding.candidateId!==candidateId||existingBinding.allocationId!==allocationId||!/^V2-\d{3}[A-Z]$/.test(String(existingBinding.missionId??''))) throw new CanonicalMissionMaterializerError('ALLOCATION_BINDING_CONFLICT');
    const existingMissionPath=join(missionsDir,`${existingBinding.missionId}.json`);
    if(!existsSync(existingMissionPath)) throw new CanonicalMissionMaterializerError('ALLOCATED_MISSION_MISSING');
    const existingMission=JSON.parse(readFileSync(existingMissionPath,'utf8'));
    if(existingMission.provenance?.candidateId!==candidateId||existingMission.provenance?.allocationId!==allocationId) throw new CanonicalMissionMaterializerError('ALLOCATED_MISSION_CONFLICT');
    return Object.freeze({mission:existingMission,binding:existingBinding,missionPath:existingMissionPath,bindingPath,created:false});
  }
  const missionId=nextPrimaryMissionId(missionsDir);
  const mission={
    mission_id:missionId,
    title:`Tablet mission: ${String(candidate.objective).slice(0,80)}`,
    objective:String(candidate.objective),
    non_goals:['No execution','No automatic activation','No mutation outside a later admitted mission'],
    actor:'UNASSIGNED',delegate:'UNASSIGNED',execution_environment:'UNASSIGNED',
    allowed_read_paths:[],allowed_write_paths:[],allowed_tools:[],network_policy:'DENY',secret_config_refs:[],
    budgets:{max_turns:0,max_time_seconds:0,max_mutations:0,max_retries:0},
    required_evidence:['Explicit activation admission','Independent verification'],
    terminal_success_condition:'Canonical mission envelope exists and remains non-executing.',
    terminal_failure_conditions:['Missing provenance','Authority ambiguity','Evidence mismatch','Target collision'],
    next_state:'WAIT_GPT',status:'CANONICAL_UNACTIVATED',
    provenance:{candidateId,proposalId:candidate.proposalId,promotionId:candidate.promotionId,allocationId,projectContext:candidate.projectContext},
    authorityGranted:false,executionStarted:false
  };
  const missionPath=join(missionsDir,`${missionId}.json`);
  const binding={schema:'othrys.os.mission-allocation.v1',candidateId,missionId,allocationId,status:'ALLOCATED_UNACTIVATED',authorityGranted:false,executionStarted:false};
  mkdirSync(join(missionsDir,'candidates'),{recursive:true});
  const missionText=JSON.stringify(mission,null,2)+'\n',bindingText=JSON.stringify(binding,null,2)+'\n';
  if(existsSync(missionPath)) throw new CanonicalMissionMaterializerError('MISSION_TARGET_COLLISION');
  writeFileSync(missionPath,missionText,'utf8');
  writeFileSync(bindingPath,bindingText,'utf8');
  return Object.freeze({mission,binding,missionPath,bindingPath,created:true});
}
