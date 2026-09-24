import { createHash } from 'node:crypto';
import { verifyBrainDecision } from './brain_orchestrator.mjs';

export const BRAIN_RESULT_SCHEMA='othrys.os.brain-result.v1';

const sha=value=>createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');

function statusSnapshot(status){
  const mission=status?.activeMission??null;
  return Object.freeze({
    controlGate:status?.controlGate??null,
    activeMission:mission?Object.freeze({
      missionId:mission.mission_id??null,
      status:mission.status??null,
    }):null,
    operatingMode:status?.operatingMode?.mode??status?.operatingMode?.activeMode??null,
    legionNode:status?.legionNode?Object.freeze({
      id:status.legionNode.id??'legion',
      stale:status.legionNode.stale??null,
      gpuUtilPercent:status.legionNode.gpuUtilPercent??null,
      gpuTempC:status.legionNode.gpuTempC??null,
      qwenLoaded:status.legionNode.qwenLoaded??null,
    }):null,
    selectedBuilder:status?.builderInspector?.selectedBuilder?Object.freeze({
      id:status.builderInspector.selectedBuilder.id??null,
      locality:status.builderInspector.selectedBuilder.locality??null,
      providerHealth:status.builderInspector.selectedBuilder.providerHealth??null,
      certification:status.builderInspector.selectedBuilder.certification??null,
    }):null,
  });
}

export async function createNoMissionBrainResult({
  decision,
  command,
  statusProjection,
  directAnswer,
  specialistRoute=null,
  specialistExecutor=null,
}={}){
  const verified=verifyBrainDecision(decision,{command});
  if(verified.missionRequired!==false) throw new Error('BRAIN_RESULT_MISSION_REQUIRED');
  if(verified.authorization?.granted!==false||verified.authorityGranted!==false||verified.executionStarted!==false){
    throw new Error('BRAIN_RESULT_AUTHORITY_INVALID');
  }

  let status='HANDOFF_READY';
  let output=null;
  let verification='PENDING';
  let verificationIndependent=false;
  let readOnlyWorkPerformed=false;

  if(verified.executor?.id==='deterministic.status'){
    if(typeof statusProjection!=='function') throw new Error('BRAIN_STATUS_PROJECTION_REQUIRED');
    const snapshot=statusSnapshot(await statusProjection());
    output=Object.freeze({
      kind:'SYSTEM_STATUS',
      snapshot,
      text:[
        'OTHRYS status',
        snapshot.controlGate?('control='+snapshot.controlGate):null,
        snapshot.activeMission?.missionId?('mission='+snapshot.activeMission.missionId+':'+snapshot.activeMission.status):'mission=none',
        snapshot.legionNode?('legion='+(snapshot.legionNode.stale?'STALE':'LIVE')):null,
      ].filter(Boolean).join(' · '),
    });
    status='COMPLETED';
    verification='DETERMINISTIC_EVIDENCE_PASS';
    readOnlyWorkPerformed=true;
  }else if(verified.executor?.id==='mnemosyne.direct'){
    if(typeof directAnswer!=='function') throw new Error('BRAIN_DIRECT_ANSWER_REQUIRED');
    const answer=await directAnswer(command);
    output=Object.freeze({
      kind:'DIRECT_ANSWER',
      text:String(answer??'').trim(),
    });
    status=output.text?'COMPLETED':'HANDOFF_READY';
    verification=output.text?'BOUNDED_SOURCE_PASS':'PENDING';
    readOnlyWorkPerformed=Boolean(output.text);
  }else if(verified.lane==='LIGHT'){
    if(typeof specialistExecutor==='function'){
      const specialist=await specialistExecutor({
        decision:verified,
        command,
        specialistRoute,
      });
      if(
        !specialist||
        specialist.schema!=='othrys.os.brain-light-result.v1'||
        specialist.authorityGranted!==false||
        specialist.actionApplied!==false||
        specialist.executionStarted!==false||
        specialist.readOnlyWorkPerformed!==true||
        typeof specialist.text!=='string'||
        !specialist.text.trim()
      ) throw new Error('BRAIN_LIGHT_RESULT_INVALID');
      output=Object.freeze({
        kind:'SPECIALIST_RESULT',
        specialist:specialist.specialist??verified.executor?.id??null,
        resultKind:specialist.kind??null,
        text:specialist.text.trim(),
        sources:Array.isArray(specialist.sources)?Object.freeze([...specialist.sources]):Object.freeze([]),
        model:specialist.model??null,
        local:specialist.local===true,
        costClass:specialist.costClass??null,
      });
      status='COMPLETED';
      verification=String(specialist.verification?.status??'BOUNDED_READONLY_SPECIALIST_PASS');
      verificationIndependent=specialist.verification?.independent===true;
      readOnlyWorkPerformed=true;
    }else{
      output=Object.freeze({
        kind:'SPECIALIST_HANDOFF',
        specialist:verified.executor?.id??null,
        route:specialistRoute&&typeof specialistRoute==='object'
          ? Object.freeze({
              outcome:specialistRoute.outcome??null,
              selected:specialistRoute.selected?Object.freeze({
                id:specialistRoute.selected.id??null,
                label:specialistRoute.selected.label??null,
                locality:specialistRoute.selected.locality??null,
                costClass:specialistRoute.selected.costClass??null,
                certification:specialistRoute.selected.certification??null,
              }):null,
            })
          : null,
        instruction:'Specialist organ owns execution; brain grants no authority.',
      });
    }
  }else{
    throw new Error('BRAIN_RESULT_EXECUTOR_UNSUPPORTED');
  }

  const body={
    schema:BRAIN_RESULT_SCHEMA,
    mode:'TRAINING',
    decisionDigest:verified.decisionDigest,
    lane:verified.lane,
    executor:verified.executor?.id??null,
    status,
    output,
    verification:Object.freeze({
      status:verification,
      independent:verificationIndependent,
    }),
    readOnlyWorkPerformed,
    recommendationOnly:status!=='COMPLETED',
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  };
  return Object.freeze({...body,resultDigest:sha(body)});
}

export function verifyNoMissionBrainResult(result,{decision}={}){
  if(!result||result.schema!==BRAIN_RESULT_SCHEMA) throw new Error('BRAIN_RESULT_INVALID');
  if(result.authorityGranted!==false||result.actionApplied!==false||result.executionStarted!==false){
    throw new Error('BRAIN_RESULT_AUTHORITY_INVALID');
  }
  if(decision&&result.decisionDigest!==decision.decisionDigest) throw new Error('BRAIN_RESULT_DECISION_MISMATCH');
  const {resultDigest,...body}=result;
  if(!/^[0-9a-f]{64}$/.test(String(resultDigest??''))||sha(body)!==resultDigest){
    throw new Error('BRAIN_RESULT_DIGEST_INVALID');
  }
  return result;
}
